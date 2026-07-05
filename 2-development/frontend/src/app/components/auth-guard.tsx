'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const AUTH_STORAGE_KEY = 'vertical-auth';

function isAuthenticated() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

function isAuthRoute(pathname: string) {
  return pathname === '/auth/login' || pathname === '/auth/register';
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const authenticated = isAuthenticated();

    if (!authenticated && !isAuthRoute(pathname)) {
      router.replace('/auth/login');
      return;
    }

    if (authenticated && isAuthRoute(pathname)) {
      router.replace('/schedule');
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
