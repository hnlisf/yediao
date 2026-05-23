'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { MapPin, Thermometer, Fish, Star, Heart, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Spot {
  id: string;
  name: string;
  address: string;
  type: string;
  depth: number;
  water_temp: number;
  baits: string[];
  fishing_methods: string[];
  rating: number;
  photos: string[];
  fish_species: string[];
  favorite_count: number;
  comment_count: number;
  is_favorited?: boolean;
}

interface Comment {
  id: string;
  user: { nickname: string; avatar_url?: string };
  content: string;
  created_at: string;
}

export default function SpotDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [spot, setSpot] = useState<Spot | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchSpot();
      fetchComments();
    }
  }, [id]);

  const fetchSpot = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API}/api/v1/spots/${id}`, { headers });
      const data = res.data;
      setSpot(data);
      setIsFavorited(data.is_favorited || false);
      setFavoriteCount(data.favorite_count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/spots/${id}/comments`);
      setComments(res.data.items || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('请先登录');
      return;
    }
    const wasFavorited = isFavorited;
    setIsFavorited(!wasFavorited);
    setFavoriteCount(prev => prev + (wasFavorited ? -1 : 1));
    try {
      await axios.post(`${API}/api/v1/spots/${id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      setIsFavorited(wasFavorited);
      setFavoriteCount(prev => prev + (wasFavorited ? 1 : -1));
      console.error(e);
    }
  };

  const submitComment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('请先登录');
      return;
    }
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`${API}/api/v1/spots/${id}/comments`, { content: newComment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      if (spot) setSpot({ ...spot, comment_count: spot.comment_count + 1 });
    } catch (e) {
      console.error(e);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) return `http://14.103.72.155:3000${url}`;
    return url;
  };

  const nextImage = () => {
    if (spot?.photos?.length) {
      setCarouselIndex(prev => (prev + 1) % spot.photos.length);
    }
  };

  const prevImage = () => {
    if (spot?.photos?.length) {
      setCarouselIndex(prev => (prev - 1 + spot.photos.length) % spot.photos.length);
    }
  };

  const formatTime = (t: string) => {
    const d = new Date(t);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return d.toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">加载中...</span>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500">钓点不存在</p>
        <Link href="/spots" className="text-blue-600">返回钓点列表</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/spots" className="text-gray-600"><ChevronLeft className="w-5 h-5" /></Link>
          <h1 className="text-lg font-bold truncate">{spot.name}</h1>
          <button onClick={toggleFavorite} className="ml-auto flex items-center gap-1">
            <Heart className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            <span className="text-sm">{favoriteCount}</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="relative h-64 bg-gray-200">
          {spot.photos?.length > 0 ? (
            <>
              <img
                src={getImageUrl(spot.photos[carouselIndex])}
                alt={spot.name}
                className="w-full h-full object-cover"
              />
              {spot.photos.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {spot.photos.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i === carouselIndex ? 'bg-white' : 'bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">暂无图片</div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-xl font-bold mb-2">{spot.name}</h2>
            <div className="flex items-start gap-2 text-gray-600 mb-3">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{spot.address || '地址未知'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {spot.type && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">钓点类型</p>
                  <p className="text-sm font-medium">{spot.type}</p>
                </div>
              )}
              {spot.depth > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">水深</p>
                  <p className="text-sm font-medium">{spot.depth}m</p>
                </div>
              )}
              {spot.water_temp > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Thermometer className="w-3 h-3" />水温</p>
                  <p className="text-sm font-medium">{spot.water_temp}°C</p>
                </div>
              )}
              {spot.rating > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Star className="w-3 h-3" />评分</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    {spot.rating}
                    <span className="text-amber-400">★</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {spot.baits?.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-semibold mb-2">常用饵料</h3>
              <div className="flex flex-wrap gap-2">
                {spot.baits.map((b) => (
                  <span key={b} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">{b}</span>
                ))}
              </div>
            </div>
          )}

          {spot.fishing_methods?.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-semibold mb-2">钓鱼方式</h3>
              <div className="flex flex-wrap gap-2">
                {spot.fishing_methods.map((m) => (
                  <span key={m} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{m}</span>
                ))}
              </div>
            </div>
          )}

          {spot.fish_species?.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-1"><Fish className="w-4 h-4" />鱼种</h3>
              <div className="flex flex-wrap gap-2">
                {spot.fish_species.map((f) => (
                  <span key={f} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{f}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />评论 ({spot.comment_count || 0})
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={submitComment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                发送
              </button>
            </div>
            {comments.length === 0 ? (
              <p className="text-center text-gray-400 py-4">暂无评论</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                        {c.user?.nickname?.[0] || '?'}
                      </div>
                      <span className="font-medium text-sm">{c.user?.nickname || '匿名'}</span>
                      <span className="text-xs text-gray-400">{formatTime(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-9">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}