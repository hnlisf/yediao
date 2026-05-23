'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const router = useRouter();

  const sendCode = async () => {
    try {
      await axios.post(`${API}/api/v1/auth/send-code`, { phone });
      setStep(2);
      alert('验证码已发送: 123456 (MVP测试)');
    } catch (e) {
      alert('发送失败');
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API}/api/v1/auth/login`, { phone, code });
      localStorage.setItem('token', res.data.token);
      router.push('/');
    } catch (e) {
      alert('登录失败，验证码: 123456');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">🎣 野钓App登录</h2>
        
        {step === 1 ? (
          <div className="space-y-4">
            <input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={sendCode}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-800"
            >
              获取验证码
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-600">验证码已发送至 {phone}</p>
            <input
              type="text"
              placeholder="请输入验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={login}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-800"
            >
              登录
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full text-gray-500 py-2"
            >
              返回
            </button>
          </div>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">或其他登录方式</span>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href={`${API}/auth/oauth/wechat`}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-600" fill="currentColor">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
            </svg>
            <span className="text-gray-700 font-medium">微信</span>
          </a>
          <a
            href={`${API}/auth/oauth/alipay`}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600" fill="currentColor">
              <path d="M17.924 6.603a4.299 4.299 0 0 0-2.352-1.034l-.35-.054-.38.188a5.1 5.1 0 0 0-2.825 3.69l-.053.33.287.177a3.013 3.013 0 0 0 .998.404l.24.05.145.16a2.93 2.93 0 0 0 2.127.75c.298.003.594-.045.88-.142l.252-.09.165-.175a2.93 2.93 0 0 0 .5-.84l.063-.22-.013-.26a4.362 4.362 0 0 0-.684-1.934zM5.282 10.248a4.299 4.299 0 0 0-1.034-2.352l-.054-.35.188-.38a5.1 5.1 0 0 0 3.69-2.825l.33-.053.177.287c.168.272.303.565.404.998l.05.24.16.145a2.93 2.93 0 0 0 .75 2.127c.106.286.16.585.159.883l-.002.252a2.925 2.925 0 0 0-.193.6l-.058.24a4.362 4.362 0 0 0-1.935-.682l-.26-.013-.22.063a2.925 2.925 0 0 0-.84.5l-.175.165zM14.5 16.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0zm-7.5-5.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
            </svg>
            <span className="text-gray-700 font-medium">支付宝</span>
          </a>
        </div>
      </div>
    </div>
  );
}
