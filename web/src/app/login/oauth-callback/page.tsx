'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const error = searchParams.get('error');

    if (error || !token) {
      router.replace('/login?error=oauth_failed');
      return;
    }

    localStorage.setItem('token', token);
    if (userId) {
      localStorage.setItem('userId', userId);
    }
    router.replace('/');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-4xl mb-4">🔄</div>
        <p className="text-gray-600">正在处理登录...</p>
      </div>
    </div>
  );
}

export default function OAuthCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>加载中...</p></div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}