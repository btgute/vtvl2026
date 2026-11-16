'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import {
  getCurrentOperatorSession,
  saveCurrentOperatorSession
} from '@/services/telemetry/operator-session';

function NextAuthOperatorBridge() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return;

    const u = session.user;
    const email = u.email!.trim().toLowerCase();
    const cur = getCurrentOperatorSession();

    const unitCode = u.unitCode || cur?.unitCode || 'FIT';
    const title = u.title || cur?.title || 'Chuyên viên';
    const displayName = u.name || cur?.displayName || email.split('@')[0];
    const avatarUrl = u.image || cur?.avatarUrl || '';
    const role = u.role || cur?.role || 'editor';
    const hasSelectedUnit = u.hasSelectedUnit ?? (role === 'admin' ? true : Boolean(cur?.hasSelectedUnit));

    const needsSync =
      !cur ||
      cur.email !== email ||
      cur.authProvider !== 'google' ||
      cur.role !== role ||
      cur.unitCode !== unitCode ||
      cur.hasSelectedUnit !== hasSelectedUnit ||
      cur.displayName !== displayName;

    if (needsSync) {
      saveCurrentOperatorSession(email, unitCode, title, {
        displayName,
        avatarUrl,
        authProvider: 'google',
        role,
        hasSelectedUnit
      });
    }
  }, [session, status]);

  return null;
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <NextAuthOperatorBridge />
      {children}
    </SessionProvider>
  );
}
