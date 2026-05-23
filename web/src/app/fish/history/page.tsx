'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface HistoryItem {
  id: string;
  fish_name: string;
  scientific_name: string;
  image_url: string;
  confidence: number;
  protection_level: string;
  is_protected: boolean;
  created_at: string;
}

export default function FishHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/v1/ai/history?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = res.data.items || res.data || [];
      if (page === 1) {
        setHistory(items);
      } else {
        setHistory(prev => [...prev, ...items]);
      }
      setHasMore(items.length === 20);
    } catch (e) {
      console.error(e);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/fish" className="text-gray-600"><ChevronLeft className="w-5 h-5" /></Link>
          <h1 className="text-lg font-bold">识别历史</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {loading && page === 1 ? (
          <div className="text-center py-10 text-gray-500">加载中...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>暂无识别记录</p>
            <Link href="/fish" className="text-blue-600 text-sm mt-2 inline-block">去识别 →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md p-4 flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.fish_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🐟</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.fish_name}</h3>
                  <p className="text-xs text-gray-500 italic">{item.scientific_name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_protected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.protection_level}
                    </span>
                    <span className="text-xs text-gray-500">{(item.confidence * 100).toFixed(1)}% 置信度</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-4">
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
