import dns from 'node:dns';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/services/storage/prisma';
import { findHcmuteUnit } from '@/configs/hcmute-units';
import { upsertUserAccount } from '@/services/storage/server-account-store';
import { appendAuditLog } from '@/services/storage/server-audit-store';
import { VtvlUserRole } from '@/types/next-auth';

dns.setDefaultResultOrder('ipv4first');

const DEFAULT_ADMIN_EMAILS = new Set([
  'tcns@hcmute.edu.vn',
  'tctoan1024@gmail.com',
  'admin@hcmute.edu.vn',
  'website@hcmute.edu.vn',
  'bmc@hcmute.edu.vn'
]);

const useSecureCookies = Boolean(
  (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '').startsWith('https://')
);
const cookiePrefix = useSecureCookies ? '__Secure-' : '';
const hostCookiePrefix = useSecureCookies ? '__Host-' : '';

function resolveAllowedDomains(): string[] {
  const raw = (process.env.GOOGLE_ALLOWED_HD ?? 'hcmute.edu.vn,student.hcmute.edu.vn').trim();
  return raw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

function createSanitizedAdapter() {
  const base = PrismaAdapter(prisma);
  return {
    ...base,
    getUser: async () => null,
    getUserByEmail: async (email: string) => {
      if (!email) return null;
      const found = await prisma.user.findFirst({
        where: { email: { equals: email.trim(), mode: 'insensitive' } }
      });
      return found ?? null;
    },
    createUser: async (data: { name?: string | null; email?: string | null; image?: string | null; emailVerified?: Date | null }) => {
      const email = data.email ? data.email.trim().toLowerCase() : null;
      const role = email && DEFAULT_ADMIN_EMAILS.has(email) ? 'admin' : 'editor';
      if (email) {
        const existing = await prisma.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } }
        });
        if (existing) {
          return prisma.user.update({
            where: { id: existing.id },
            data: {
              name: data.name || existing.name,
              image: data.image || existing.image
            }
          });
        }
      }
      return prisma.user.create({
        data: {
          name: data.name ?? email ?? 'Cán bộ HCM-UTE',
          email,
          image: data.image ?? null,
          emailVerified: data.emailVerified ?? new Date(),
          role,
          unitCode: email === 'tcns@hcmute.edu.vn' ? 'TCNS' : 'FIT'
        }
      });
    }
  };
}

const allowedDomains = resolveAllowedDomains();
const primaryHd = allowedDomains.length === 1 && allowedDomains[0] !== '*' ? allowedDomains[0] : undefined;

export const authOptions: AuthOptions = {
  adapter: createSanitizedAdapter() as AuthOptions['adapter'],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'online',
          scope: 'openid email profile',
          ...(primaryHd ? { hd: primaryHd } : {})
        }
      },
      httpOptions: {
        timeout: 15000
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}utevtvl.session-token`,
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: useSecureCookies }
    },
    callbackUrl: {
      name: `${cookiePrefix}utevtvl.callback-url`,
      options: { sameSite: 'lax', path: '/', secure: useSecureCookies }
    },
    csrfToken: {
      name: `${hostCookiePrefix}utevtvl.csrf-token`,
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: useSecureCookies }
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}utevtvl.pkce.code_verifier`,
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: useSecureCookies, maxAge: 900 }
    },
    state: {
      name: `${cookiePrefix}utevtvl.state`,
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: useSecureCookies, maxAge: 900 }
    }
  },
  callbacks: {
    async signIn({ user, profile }) {
      const p = profile as { email?: string; email_verified?: boolean; name?: string; picture?: string } | undefined;
      if (p?.email_verified === false) return false;

      const rawEmail = String(p?.email || user?.email || '').trim().toLowerCase();
      if (!rawEmail || !rawEmail.includes('@')) return false;

      try {
        const existingAcc = await prisma.userAccount.findUnique({ where: { email: rawEmail } });
        if (existingAcc?.status === 'suspended') return false;

        const domain = rawEmail.split('@')[1] || '';
        const allowed =
          DEFAULT_ADMIN_EMAILS.has(rawEmail) ||
          Boolean(existingAcc) ||
          allowedDomains.length === 0 ||
          allowedDomains.includes('*') ||
          allowedDomains.includes(domain);

        if (!allowed) return false;

        const isDefaultAdmin = DEFAULT_ADMIN_EMAILS.has(rawEmail);
        const unit = findHcmuteUnit(existingAcc?.unitCode || (rawEmail === 'tcns@hcmute.edu.vn' ? 'TCNS' : 'FIT'));
        const resolvedRole: VtvlUserRole =
          (existingAcc?.role as VtvlUserRole) || (isDefaultAdmin ? 'admin' : 'editor');
        const hasSelectedUnit = existingAcc ? existingAcc.hasSelectedUnit : isDefaultAdmin;

        const synced = upsertUserAccount(
          {
            email: rawEmail,
            displayName: p?.name || user?.name || existingAcc?.displayName || rawEmail.split('@')[0],
            avatarUrl: p?.picture || user?.image || existingAcc?.avatarUrl || undefined,
            unitCode: unit.code,
            title: existingAcc?.title || (isDefaultAdmin ? 'Quản trị viên' : 'Chuyên viên'),
            role: resolvedRole,
            authProvider: 'google',
            hasSelectedUnit
          },
          isDefaultAdmin && !existingAcc
        );

        appendAuditLog({
          unitCode: synced.unitCode,
          unitName: synced.unitNameVi,
          action: 'NEXTAUTH_GOOGLE_LOGIN',
          details: `Đăng nhập Google OAuth qua NextAuth (${synced.role})`,
          actorEmail: synced.email,
          actorRole: synced.title
        });

        user.email = synced.email;
        user.name = synced.displayName;
        user.image = synced.avatarUrl;
        user.role = synced.role;
        user.unitCode = synced.unitCode;
        user.unitNameVi = synced.unitNameVi;
        user.title = synced.title;
        user.hasSelectedUnit = synced.hasSelectedUnit;
      } catch (err) {
        console.error('[NextAuth signIn sync error]', err);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = user.role;
        token.unitCode = user.unitCode;
        token.unitNameVi = user.unitNameVi;
        token.title = user.title;
        token.hasSelectedUnit = user.hasSelectedUnit;
      }

      if (token.email) {
        try {
          const acc = await prisma.userAccount.findUnique({
            where: { email: String(token.email).trim().toLowerCase() }
          });
          if (acc) {
            token.role = (acc.role as VtvlUserRole) || 'editor';
            token.unitCode = acc.unitCode;
            token.unitNameVi = acc.unitNameVi;
            token.title = acc.title;
            token.hasSelectedUnit = acc.hasSelectedUnit;
            token.name = acc.displayName || token.name;
            if (acc.avatarUrl) token.picture = acc.avatarUrl;
          }
        } catch { /* ignore transient DB error */ }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.role = token.role || 'editor';
        session.user.unitCode = token.unitCode || 'FIT';
        session.user.unitNameVi = token.unitNameVi || 'Khoa Công nghệ Thông tin';
        session.user.title = token.title || 'Chuyên viên';
        session.user.hasSelectedUnit = Boolean(token.hasSelectedUnit);
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.ADMIN_SERVER_SECRET || 'hcmute_vtvl_nextauth_secret_2026'
};

