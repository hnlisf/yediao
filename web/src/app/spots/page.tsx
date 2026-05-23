'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { MapPin, Navigation, ChevronLeft, ChevronRight, Fish, Thermometer } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function SpotsPage() {
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'time' | 'nearby'>('time');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchSpots();
  }, [sortBy, userLocation]);

  const fetchSpots = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let url = `${API}/api/v1/spots?page=1&limit=50`;
      if (sortBy === 'nearby' && userLocation) {
        url = `${API}/api/v1/spots/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=5000&page=1&limit=50`;
      }
      const res = await axios.get(url, { headers });
      setSpots(res.data.items || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => alert('无法获取位置')
      );
    }
  };

  const formatDistance = (meters: number) => {
    if (!meters && meters !== 0) return '';
    return meters > 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
  };

  const nextImage = (spotId: string, total: number) => {
    setCarouselIndex(prev => ({ ...prev, [spotId]: ((prev[spotId] || 0) + 1) % total }));
  };
  const prevImage = (spotId: string, total: number) => {
    setCarouselIndex(prev => ({ ...prev, [spotId]: ((prev[spotId] || 0) - 1 + total) % total }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-bold">钓点</h1>
          <div className="ml-auto flex gap-2">
            <button onClick={() => { setSortBy('time'); setUserLocation(null); }} className={`px-3 py-1 rounded-full text-sm ${sortBy==='time'?'bg-blue-100 text-blue-600':'bg-gray-100 text-gray-600'}`}>最新</button>
            <button onClick={() => { requestLocation(); setSortBy('nearby'); }} className={`px-3 py-1 rounded-full text-sm ${sortBy==='nearby'?'bg-blue-100 text-blue-600':'bg-gray-100 text-gray-600'}`}>附近</button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">加载中...</div>
        ) : spots.length === 0 ? (
          <div className="text-center py-10 text-gray-500">暂无钓点</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spots.map(spot => (
              <div key={spot.id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  {spot.photos && spot.photos.length > 0 ? (
                    <>
                      <img src={spot.photos[carouselIndex[spot.id] || 0]} alt={spot.name} className="w-full h-full object-cover" />
                      {spot.photos.length > 1 && (
                        <>
                          <button onClick={() => prevImage(spot.id, spot.photos.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"><ChevronLeft className="w-4 h-4" /></button>
                          <button onClick={() => nextImage(spot.id, spot.photos.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"><ChevronRight className="w-4 h-4" /></button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {spot.photos.map((_: any, i: number) => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === (carouselIndex[spot.id]||0) ? 'bg-white' : 'bg-white/50'}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">暂无图片</div>
                  )}
                  {spot.distance !== undefined && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Navigation className="w-3 h-3" />{formatDistance(spot.distance)}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{spot.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{spot.address || spot.description || '地址未知'}</p>
                  {spot.fishSpecies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {spot.fishSpecies.slice(0, 3).map((f: string) => (
                        <span key={f} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                    </div>
                  )}
                  {spot.baits?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {spot.baits.slice(0, 3).map((b: string) => (
                        <span key={b} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{b}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {spot.depth && <span className="flex items-center gap-1"><Fish className="w-3 h-3" />水深{spot.depth}m</span>}
                    {spot.waterTemp && <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" />{spot.waterTemp}°C</span>}
                    <span>收藏 {spot.favoriteCount || 0}</span>
                    <span>评论 {spot.commentCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
