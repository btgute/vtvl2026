import 'next-auth';
import 'next-auth/jwt';

export type VtvlUserRole = 'admin' | 'unit_leader' | 'editor' | 'viewer';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: VtvlUserRole;
      unitCode?: string;
      unitNameVi?: string;
      title?: string;
      hasSelectedUnit?: boolean;
    };
  }

  interface User {
    role?: VtvlUserRole;
    unitCode?: string;
    unitNameVi?: string;
    title?: string;
    hasSelectedUnit?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: VtvlUserRole;
    unitCode?: string;
    unitNameVi?: string;
    title?: string;
    hasSelectedUnit?: boolean;
  }
}
