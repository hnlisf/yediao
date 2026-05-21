'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [token, setToken] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem('token') || '');
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🎣 野钓App</h1>
          <div className="space-x-4">
            {token ? (
              <Link href="/profile" className="hover:underline">我的</Link>
            ) : (
              <Link href="/login" className="hover:underline">登录</Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary to-secondary py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">发现身边的野钓好去处</h2>
          <p className="text-lg mb-8">AI识鱼、钓点分享、约钓交友，一站式野钓服务平台</p>
          <div className="flex justify-center gap-4">
            <Link href="/spots" className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100">
              探索钓点
            </Link>
            <Link href="/social" className="bg-accent text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700">
              社区动态
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            onClick={() => window.location.href = '/spots'}
            className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && (window.location.href = '/spots')}
          >
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold mb-2">钓点地图</h3>
            <p className="text-gray-600">基于高德地图，发现附近的野钓好去处</p>
          </div>
          <div
            onClick={() => window.location.href = '/fish'}
            className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && (window.location.href = '/fish')}
          >
            <div className="text-4xl mb-4">🐟</div>
            <h3 className="text-xl font-bold mb-2">AI识鱼</h3>
            <p className="text-gray-600">拍照识别鱼种，了解习性与保护级别</p>
          </div>
          <div
            onClick={() => window.location.href = '/social'}
            className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && (window.location.href = '/social')}
          >
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">约钓交友</h3>
            <p className="text-gray-600">发起约钓活动，结识志同道合的钓友</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <p>© 2026 野钓App - 6智能体研发公司</p>
      </footer>
    </div>
  );
}
