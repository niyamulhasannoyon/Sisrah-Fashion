'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#F9F9F9]">
      <div className="animate-pulse text-small font-bold uppercase tracking-widest text-loomra-muted">
        Redirecting to login...
      </div>
    </div>
  );
}