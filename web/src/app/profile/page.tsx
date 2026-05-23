'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { LogOut, MapPin, Fish, Star, Lock, Unlock, Users, ChevronLeft, History } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface UserProfile {
  id: number;
  phone: string;
  nickname: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  fishing_age: number;
  frequent_spots: string[];
  skilled_fish: string[];
  privacy_level: 'public' | 'friends' | 'private';
  points: number;
  showFishingAge: boolean;
  showFrequentSpot: boolean;
  showLocation: boolean;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'friends' | 'private'>('public');
  const [showFishingAge, setShowFishingAge] = useState(true);
  const [showFrequentSpot, setShowFrequentSpot] = useState(true);
  const [showLocation, setShowLocation] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get(`${API}/api/v1/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setProfile(data);
        setPrivacyLevel(data.privacy_level || 'public');
        setShowFishingAge(data.showFishingAge !== false);
        setShowFrequentSpot(data.showFrequentSpot !== false);
        setShowLocation(data.showLocation !== false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacy = async (key: string, value: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.patch(`${API}/api/v1/users/profile`, { [key]: value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrivacyChange = async (level: 'public' | 'friends' | 'private') => {
    setPrivacyLevel(level);
    await updatePrivacy('privacy_level', level);
  };

  const handleToggle = async (key: string, value: boolean) => {
    if (key === 'showFishingAge') setShowFishingAge(value);
    if (key === 'showFrequentSpot') setShowFrequentSpot(value);
    if (key === 'showLocation') setShowLocation(value);
    await updatePrivacy(key, value);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">加载中...</div></div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link href="/login" className="text-green-600">请先登录 →</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-gray-600"><ChevronLeft className="w-5 h-5" /></Link>
          <h1 className="text-lg font-bold">个人中心</h1>
          <button onClick={logout} className="ml-auto text-sm text-gray-500 flex items-center gap-1">
            <LogOut className="w-4 h-4" />
            退出
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profile.nickname?.[0] || profile.phone?.slice(-1) || '?'}
            </div>
            <div className="ml-4 flex-1">
              <h2 className="text-xl font-bold">{profile.nickname || '未设置昵称'}</h2>
              <p className="text-gray-500">{profile.phone}</p>
              {profile.bio && <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm flex items-center gap-1"><Star className="w-4 h-4" />钓龄</p>
              <p className="text-xl font-bold">{showFishingAge ? `${profile.fishing_age || 0} 年` : '***'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-sm flex items-center gap-1"><Fish className="w-4 h-4" />积分</p>
              <p className="text-xl font-bold text-green-600">{profile.points || 0}</p>
            </div>
          </div>

          {profile.skilled_fish?.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-500 text-sm mb-2 flex items-center gap-1"><Fish className="w-4 h-4" />擅长鱼种</p>
              <div className="flex flex-wrap gap-1">
                {profile.skilled_fish.map((fish, i) => (
                  <span key={i} className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{fish}</span>
                ))}
              </div>
            </div>
          )}

          {showFrequentSpot && profile.frequent_spots?.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-500 text-sm mb-2 flex items-center gap-1"><MapPin className="w-4 h-4" />常驻钓点</p>
              <div className="flex flex-wrap gap-1">
                {profile.frequent_spots.map((spot, i) => (
                  <span key={i} className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{spot}</span>
                ))}
              </div>
            </div>
          )}

          {showLocation && profile.location && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-500 text-sm mb-1 flex items-center gap-1"><MapPin className="w-4 h-4" />所在地</p>
              <p className="font-semibold">{profile.location}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            {privacyLevel === 'public' ? <Unlock className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-600" />}
            隐私设置
          </h3>

          <div className="mb-4">
            <p className="text-gray-500 text-sm mb-2">资料可见性</p>
            <div className="flex gap-2">
              {[
                ['public', '公开'],
                ['friends', '好友'],
                ['private', '私密']
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => handlePrivacyChange(val as any)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${privacyLevel === val ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">显示钓龄</span>
              <button
                onClick={() => handleToggle('showFishingAge', !showFishingAge)}
                className={`w-12 h-6 rounded-full transition-colors ${showFishingAge ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${showFishingAge ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">显示常驻钓点</span>
              <button
                onClick={() => handleToggle('showFrequentSpot', !showFrequentSpot)}
                className={`w-12 h-6 rounded-full transition-colors ${showFrequentSpot ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${showFrequentSpot ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">显示位置</span>
              <button
                onClick={() => handleToggle('showLocation', !showLocation)}
                className={`w-12 h-6 rounded-full transition-colors ${showLocation ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${showLocation ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        <Link href="/profile/points-history" className="block bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-green-600" />
              <span className="font-medium">积分记录</span>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
