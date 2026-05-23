'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { MapPin, Thermometer, Fish, Camera, Plus } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface SpotFormData {
  name: string;
  address: string;
  type: string;
  lat: number;
  lng: number;
  depth: number;
  water_temp: number;
  baits: string;
  fishing_methods: string;
}

export default function CreateSpotPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<SpotFormData>({
    name: '',
    address: '',
    type: '',
    lat: 0,
    lng: 0,
    depth: 0,
    water_temp: 0,
    baits: '',
    fishing_methods: '',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...files]);
      const urls = files.map(f => URL.createObjectURL(f));
      setPreviewUrls(prev => [...prev, ...urls]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address) {
      alert('请填写必填项');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('address', form.address);
      formData.append('type', form.type);
      formData.append('lat', String(form.lat));
      formData.append('lng', String(form.lng));
      formData.append('depth', String(form.depth));
      formData.append('water_temp', String(form.water_temp));
      formData.append('baits', form.baits);
      formData.append('fishing_methods', form.fishing_methods);
      formData.append('status', 'pending');
      photos.forEach(p => formData.append('photos', p));
      await axios.post(`${API}/api/v1/spots`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      alert('钓点发布成功，等待审核');
      router.push('/spots');
    } catch (e) {
      console.error(e);
      alert('发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-600">←</button>
          <h1 className="text-lg font-bold">发布钓点</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">钓点名称 *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="输入钓点名称" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />地址 *
            </label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="输入详细地址" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">经度</label>
              <input type="number" step="any" value={form.lat || ''} onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })} placeholder=" latitude" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">纬度</label>
              <input type="number" step="any" value={form.lng || ''} onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })} placeholder=" longitude" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">钓点类型</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">请选择</option>
              <option value="野坑">野坑</option>
              <option value="河流">河流</option>
              <option value="水库">水库</option>
              <option value="湖泊">湖泊</option>
              <option value="池塘">池塘</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Fish className="w-4 h-4" />水深 (m)
              </label>
              <input type="number" step="0.1" value={form.depth || ''} onChange={(e) => setForm({ ...form, depth: parseFloat(e.target.value) || 0 })} placeholder="0" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Thermometer className="w-4 h-4" />水温 (°C)
              </label>
              <input type="number" step="0.1" value={form.water_temp || ''} onChange={(e) => setForm({ ...form, water_temp: parseFloat(e.target.value) || 0 })} placeholder="0" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">常用饵料</label>
            <input type="text" value={form.baits} onChange={(e) => setForm({ ...form, baits: e.target.value })} placeholder="逗号分隔，如：红虫,玉米,商品饵" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">钓鱼方式</label>
            <input type="text" value={form.fishing_methods} onChange={(e) => setForm({ ...form, fishing_methods: e.target.value })} placeholder="逗号分隔，如：台钓,传统钓,路亚" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Camera className="w-4 h-4" />钓点照片
            </label>
            <div className="flex flex-wrap gap-2">
              {previewUrls.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded overflow-hidden border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-0 right-0 bg-black/60 text-white w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed rounded flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500">
                <Plus className="w-6 h-6" />
                <span className="text-xs mt-1">添加</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              {loading ? '发布中...' : '提交钓点'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">发布后需审核才能展示</p>
          </div>
        </form>
      </div>
    </div>
  );
}