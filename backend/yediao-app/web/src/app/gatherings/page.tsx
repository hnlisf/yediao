'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, MapPin, Clock, Plus } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Gathering {
  id: string;
  title: string;
  location_name: string;
  start_time: string;
  max_participants: number;
  current_participants: number;
  status: string;
  creator: { id: string; nickname: string };
  has_joined?: boolean;
}

interface CreateGatheringData {
  title: string;
  locationName: string;
  startTime: string;
  maxParticipants: number;
  description: string;
}

export default function GatheringsPage() {
  const router = useRouter();
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateGatheringData>({
    title: '',
    locationName: '',
    startTime: '',
    maxParticipants: 8,
    description: '',
  });

  useEffect(() => {
    fetchGatherings();
  }, [activeTab]);

  const fetchGatherings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const params = activeTab !== 'all' ? `?status=${activeTab}` : '';
      const res = await fetch(`${API}/api/fishing-dates${params}`, { headers });
      const data = await res.json();
      setGatherings(data.items || data.data?.items || []);
    } catch (e) {
      console.error(e);
      setGatherings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('请先登录');
      return;
    }
    try {
      await fetch(`${API}/api/fishing-dates/${id}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setGatherings(prev => prev.map(g => g.id === id ? { ...g, has_joined: true, current_participants: g.current_participants + 1 } : g));
      alert('报名成功');
    } catch (e) {
      console.error(e);
      alert('报名失败');
    }
  };

  const handleCancel = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API}/api/fishing-dates/${id}/join`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setGatherings(prev => prev.map(g => g.id === id ? { ...g, has_joined: false, current_participants: g.current_participants - 1 } : g));
      alert('已取消报名');
    } catch (e) {
      console.error(e);
      alert('取消失败');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title || !createForm.locationName || !createForm.startTime) {
      alert('请填写必填项');
      return;
    }
    try {
      const token = localStorage.getItem('token') || '';
      await fetch(`${API}/api/fishing-dates`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      alert('发起成功');
      setShowCreate(false);
      setCreateForm({ title: '', locationName: '', startTime: '', maxParticipants: 8, description: '' });
      fetchGatherings();
    } catch (e) {
      console.error(e);
      alert('发起失败');
    }
  };

  const formatTime = (t: string) => {
    const d = new Date(t);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'open', label: '可报名' },
    { key: 'full', label: '已满' },
    { key: 'ended', label: '已结束' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-gray-600">←</button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />约钓活动
          </h1>
          <button onClick={() => setShowCreate(true)} className="ml-auto bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" />发起
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === t.key ? 'bg-green-600 text-white' : 'bg-white text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">加载中...</div>
        ) : gatherings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">暂无约钓活动</div>
        ) : (
          <div className="space-y-4">
            {gatherings.map((g) => (
              <div key={g.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{g.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{g.location_name}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatTime(g.start_time)}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    g.status === 'open' ? 'bg-green-100 text-green-700' :
                    g.status === 'full' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {g.status === 'open' ? '报名中' : g.status === 'full' ? '已满' : '已结束'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{g.current_participants}/{g.max_participants} 人</span>
                    <span className="text-gray-400">发起人: {g.creator?.nickname || '未知'}</span>
                  </div>
                  {g.status === 'open' && (
                    g.has_joined ? (
                      <button
                        onClick={() => handleCancel(g.id)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-600 hover:bg-gray-300"
                      >
                        取消报名
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(g.id)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                      >
                        立即报名
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">发起约钓</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">活动标题 *</label>
                <input type="text" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} placeholder="如：周末野钓聚会" className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">钓点位置 *</label>
                <input type="text" value={createForm.locationName} onChange={(e) => setCreateForm({ ...createForm, locationName: e.target.value })} placeholder="输入钓点名称" className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间 *</label>
                <input type="datetime-local" value={createForm.startTime} onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最大人数</label>
                <input type="number" min="2" max="50" value={createForm.maxParticipants} onChange={(e) => setCreateForm({ ...createForm, maxParticipants: parseInt(e.target.value) || 8 })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">活动说明</label>
                <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} placeholder="活动详情..." rows={3} className="w-full px-4 py-2 border rounded-lg resize-none" />
              </div>
              <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold">发布约钓</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}