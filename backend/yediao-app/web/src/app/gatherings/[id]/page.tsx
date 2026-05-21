'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { MapPin, Clock, Users, ChevronLeft, CheckCircle, X } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Gathering {
  id: string;
  title: string;
  description?: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  startTime: string;
  endTime?: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'open' | 'full' | 'closed' | 'cancelled';
  creator: { id: string; nickname: string; avatar_url?: string };
  participants?: { id: string; nickname: string; avatar_url?: string; status: string }[];
}

export default function GatheringDetail() {
  const params = useParams();
  const gatheringId = params.id as string;
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetchGathering();
  }, [gatheringId]);

  const fetchGathering = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API}/api/v1/gatherings/${gatheringId}`, { headers });
      setGathering(res.data.data || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('请先登录'); return; }
    try {
      await axios.post(`${API}/api/v1/gatherings/${gatheringId}/join`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setJoined(true);
      fetchGathering();
      alert('报名成功');
    } catch (e) {
      alert('报名失败');
    }
  };

  const handleLeave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(`${API}/api/v1/gatherings/${gatheringId}/leave`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setJoined(false);
      fetchGathering();
    } catch (e) {
      alert('退出失败');
    }
  };

  const formatTime = (t: string) => {
    if (!t) return '';
    return new Date(t).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">报名中</span>;
      case 'full': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">已满</span>;
      case 'closed': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">已结束</span>;
      case 'cancelled': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">已取消</span>;
      default: return null;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">加载中...</div></div>;
  }

  if (!gathering) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">活动不存在</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/gatherings" className="text-gray-600"><ChevronLeft className="w-5 h-5" /></Link>
          <h1 className="text-lg font-bold">活动详情</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold">{gathering.title}</h2>
            {getStatusBadge(gathering.status)}
          </div>

          {gathering.description && (
            <p className="text-gray-600 mb-4">{gathering.description}</p>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-green-600" />
              <span>{gathering.locationName}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="w-5 h-5 text-green-600" />
              <span>{formatTime(gathering.startTime)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Users className="w-5 h-5 text-green-600" />
              <span>{gathering.currentParticipants} / {gathering.maxParticipants} 人</span>
            </div>
          </div>

          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold mb-2">发起人</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                {gathering.creator?.nickname?.[0] || '?'}
              </div>
              <span className="font-medium">{gathering.creator?.nickname || '匿名'}</span>
            </div>
          </div>

          {gathering.participants && gathering.participants.length > 0 && (
            <div className="border-t pt-4 mb-4">
              <h3 className="font-semibold mb-2">参与者 ({gathering.participants.length})</h3>
              <div className="flex flex-wrap gap-2">
                {gathering.participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                      {p.nickname?.[0] || '?'}
                    </div>
                    <span className="text-sm">{p.nickname}</span>
                    {p.status === 'approved' && <CheckCircle className="w-3 h-3 text-green-600" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {gathering.status === 'open' && !joined ? (
              <button onClick={handleJoin} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
                立即报名
              </button>
            ) : gathering.status === 'open' && joined ? (
              <button onClick={handleLeave} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">
                退出活动
              </button>
            ) : (
              <button disabled className="flex-1 bg-gray-200 text-gray-400 py-3 rounded-lg font-semibold cursor-not-allowed">
                {gathering.status === 'full' ? '已满' : '不可报名'}
              </button>
            )}
            <Link href={`/im/group/${gatheringId}`} className="px-6 py-3 border border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50">
              进入群聊
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
