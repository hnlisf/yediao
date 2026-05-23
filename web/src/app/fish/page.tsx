'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Search, Shield, Droplets, Home, AlertTriangle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FishSpecies {
  id: string;
  name: string;
  image_url: string;
  family: string;
  habitat: string;
  protection_level: string;
  description?: string;
}

export default function FishPage() {
  const router = useRouter();
  const [fishList, setFishList] = useState<FishSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFishSpecies();
  }, []);

  const fetchFishSpecies = async (q?: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = q ? `${API}/api/v1/fish-species/search?q=${encodeURIComponent(q)}` : `${API}/api/v1/fish-species`;
      const res = await axios.get(url, { headers });
      setFishList(res.data.items || res.data || []);
    } catch (e) {
      console.error(e);
      setFishList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFishSpecies(searchQuery.trim());
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) return `http://14.103.72.155:3000${url}`;
    return url;
  };

  const getProtectionBadge = (level: string) => {
    const l = level?.toLowerCase() || '';
    if (l.includes('一级') || l.includes('重点') || l.includes('濒危')) {
      return { bg: 'bg-red-100', text: 'text-red-700', label: level, icon: <AlertTriangle className="w-3 h-3" /> };
    }
    if (l.includes('二级') || l.includes('易危')) {
      return { bg: 'bg-orange-100', text: 'text-orange-700', label: level, icon: <Shield className="w-3 h-3" /> };
    }
    return { bg: 'bg-green-100', text: 'text-green-700', label: level || '普通', icon: null };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-gray-600">←</button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            🐟 鱼类百科
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索鱼种名称..."
                className="w-full pl-10 pr-4 py-2 border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700"
            >
              搜索
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-10 text-gray-500">加载中...</div>
        ) : fishList.length === 0 ? (
          <div className="text-center py-10 text-gray-500">暂无鱼类数据</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fishList.map((fish) => {
              const badge = getProtectionBadge(fish.protection_level);
              return (
                <div key={fish.id} className="bg-white rounded-xl shadow-md overflow-hidden flex">
                  <div className="w-28 h-28 flex-shrink-0 bg-gray-100">
                    {fish.image_url ? (
                      <img src={getImageUrl(fish.image_url)} alt={fish.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">🐟</div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base">{fish.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5 ${badge.bg} ${badge.text}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </div>
                      {fish.family && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="text-gray-400">科:</span> {fish.family}
                        </p>
                      )}
                      {fish.habitat && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-400" /> {fish.habitat}
                        </p>
                      )}
                    </div>
                    {fish.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{fish.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}