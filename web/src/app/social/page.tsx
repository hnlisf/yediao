'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, ChevronLeft, ChevronRight, Video, X } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Post {
  id: string;
  user: { id: string; nickname: string; avatar_url?: string };
  content: string;
  images: string[];
  videoUrl?: string;
  taggedSpecies?: string[];
  taggedSpots?: string[];
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  created_at: string;
}

interface Comment {
  id: string;
  user: { nickname: string };
  content: string;
  created_at: string;
}

export default function Social() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [taggedSpecies, setTaggedSpecies] = useState('');
  const [taggedSpots, setTaggedSpots] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'hot'>('time');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [carouselIndex, setCarouselIndex] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API}/api/v1/community/posts?sort=${sortBy}&page=1&limit=50`, { headers });
      setPosts(res.data.items || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API}/api/v1/community/posts/${postId}/comments`, { headers });
      setComments(prev => ({ ...prev, [postId]: res.data.items || res.data || [] }));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePost = async () => {
    if (!token) {
      alert('请先登录');
      return;
    }
    if (!newPost.trim() && selectedImages.length === 0 && !videoUrl) {
      alert('请输入内容或选择图片');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('content', newPost);
      formData.append('videoUrl', videoUrl);
      formData.append('taggedSpecies', taggedSpecies);
      formData.append('taggedSpots', taggedSpots);
      selectedImages.forEach((img) => formData.append('images', img));
      await axios.post(`${API}/api/v1/community/posts`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setNewPost('');
      setSelectedImages([]);
      setVideoUrl('');
      setTaggedSpecies('');
      setTaggedSpots('');
      fetchPosts();
      alert('发布成功');
    } catch (e: any) {
      alert('发布失败');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const toggleLike = async (postId: string) => {
    if (!token) return;
    const isLiked = likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p));
    try {
      if (isLiked) {
        await axios.delete(`${API}/api/v1/community/posts/${postId}/like`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API}/api/v1/community/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (e) {
      setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? 1 : -1) } : p));
    }
  };

  const handleShare = async (postId: string) => {
    if (!token) return;
    try {
      await axios.post(`${API}/api/v1/community/posts/${postId}/share`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('分享成功');
    } catch (e) {
      console.error(e);
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = !expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: newExpanded }));
    if (newExpanded && !comments[postId]) {
      fetchComments(postId);
    }
  };

  const submitComment = async (postId: string) => {
    if (!token || !newComments[postId]?.trim()) return;
    try {
      const res = await axios.post(`${API}/api/v1/community/posts/${postId}/comments`, 
        { content: newComments[postId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }));
      setNewComments(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
    } catch (e) {
      console.error(e);
    }
  };

  const nextImage = (postId: string, total: number) => {
    setCarouselIndex(prev => ({ ...prev, [postId]: ((prev[postId] || 0) + 1) % total }));
  };
  const prevImage = (postId: string, total: number) => {
    setCarouselIndex(prev => ({ ...prev, [postId]: ((prev[postId] || 0) - 1 + total) % total }));
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-gray-600"><ChevronLeft className="w-5 h-5" /></Link>
          <h1 className="text-lg font-bold">社区动态</h1>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setSortBy('time')} className={`px-3 py-1 rounded-full text-sm ${sortBy==='time'?'bg-blue-100 text-blue-600':'bg-gray-100 text-gray-600'}`}>最新</button>
            <button onClick={() => setSortBy('hot')} className={`px-3 py-1 rounded-full text-sm ${sortBy==='hot'?'bg-blue-100 text-blue-600':'bg-gray-100 text-gray-600'}`}>热门</button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="分享你的钓鱼故事..."
            className="w-full p-3 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <input
              value={taggedSpecies}
              onChange={(e) => setTaggedSpecies(e.target.value)}
              placeholder="鱼种标签"
              className="px-3 py-1 border rounded-full text-sm focus:outline-none"
            />
            <input
              value={taggedSpots}
              onChange={(e) => setTaggedSpots(e.target.value)}
              placeholder="钓点标签"
              className="px-3 py-1 border rounded-full text-sm focus:outline-none"
            />
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="视频链接"
              className="w-full px-3 py-1 border rounded text-sm focus:outline-none mt-1"
            />
          </div>
          <div className="flex justify-between items-center mt-3">
            <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 flex items-center gap-1 text-sm">
              📷 添加图片{selectedImages.length > 0 && ` (${selectedImages.length})`}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
            <button onClick={handlePost} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              发布
            </button>
          </div>
          {selectedImages.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {selectedImages.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded overflow-hidden border">
                  <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setSelectedImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-black/50 text-white text-xs w-5 h-5 flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {post.user?.nickname?.[0] || '?'}
                </div>
                <div className="ml-3">
                  <p className="font-semibold">{post.user?.nickname || '匿名用户'}</p>
                  <p className="text-xs text-gray-500">{formatTime(post.created_at)}</p>
                </div>
              </div>
              <p className="mb-3">{post.content}</p>

              {(post.taggedSpecies?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {(post.taggedSpecies ?? []).map((s: string, i: number) => (
                    <Link key={i} href={`/spots?search=${s}`} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">#{s}</Link>
                  ))}
                </div>
              )}
              {(post.taggedSpots?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {(post.taggedSpots ?? []).map((s: string, i: number) => (
                    <Link key={i} href={`/spots?search=${s}`} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">@{s}</Link>
                  ))}
                </div>
              )}

              {post.images?.length > 0 && (
                <div className="relative mb-3">
                  <img src={post.images[carouselIndex[post.id] || 0]} alt="" className="rounded-lg w-full max-h-80 object-cover" />
                  {post.images.length > 1 && (
                    <>
                      <button onClick={() => prevImage(post.id, post.images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={() => nextImage(post.id, post.images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"><ChevronRight className="w-4 h-4" /></button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {post.images.map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === (carouselIndex[post.id]||0) ? 'bg-white' : 'bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {post.videoUrl && (
                <div className="mb-3">
                  <video src={post.videoUrl} controls className="rounded-lg w-full max-h-64" />
                </div>
              )}

              <div className="flex gap-6 text-gray-500 text-sm border-t pt-3">
                <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1 ${likedPosts[post.id] ? 'text-red-500' : ''}`}>
                  <Heart className={`w-4 h-4 ${likedPosts[post.id] ? 'fill-current' : ''}`} />
                  {post.likes_count}
                </button>
                <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments_count}
                </button>
                <button onClick={() => handleShare(post.id)} className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  分享
                </button>
              </div>

              {expandedComments[post.id] && (
                <div className="mt-3 border-t pt-3">
                  {comments[post.id]?.map((c) => (
                    <div key={c.id} className="mb-2 text-sm">
                      <span className="font-semibold">{c.user.nickname}: </span>
                      <span className="text-gray-700">{c.content}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input
                      value={newComments[post.id] || ''}
                      onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="写评论..."
                      className="flex-1 px-3 py-1 border rounded-full text-sm focus:outline-none"
                    />
                    <button onClick={() => submitComment(post.id)} className="text-blue-600 text-sm font-medium">发送</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
