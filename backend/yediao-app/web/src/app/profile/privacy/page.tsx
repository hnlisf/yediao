'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type PrivacyLevel = 'public' | 'friends' | 'private';

export default function PrivacyPage() {
  const router = useRouter();
  const [privacy, setPrivacy] = useState<PrivacyLevel>('public');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      await axios.patch(`${API}/api/users/privacy`, { privacy }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('隐私设置已保存');
      router.back();
    } catch (e) {
      console.error(e);
      alert('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const options: { value: PrivacyLevel; label: string; desc: string }[] = [
    { value: 'public', label: '公开', desc: '所有用户可见' },
    { value: 'friends', label: '好友', desc: '仅好友可见' },
    { value: 'private', label: '私密', desc: '仅自己可见' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">隐私设置</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <p className="text-sm text-gray-500">设置你的个人资料可见范围</p>
          </div>
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center justify-between px-4 py-4 border-b last:border-0 hover:bg-gray-50 cursor-pointer"
            >
              <div>
                <p className="font-medium">{opt.label}</p>
                <p className="text-sm text-gray-500">{opt.desc}</p>
              </div>
              <input
                type="radio"
                name="privacy"
                value={opt.value}
                checked={privacy === opt.value}
                onChange={() => setPrivacy(opt.value)}
                className="accent-green-600 w-5 h-5"
              />
            </label>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
}