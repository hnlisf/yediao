'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ChevronLeft, Send, MessageCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Conversation {
  id: string;
  user: { id: string; nickname: string; avatar_url?: string };
  last_message: string;
  last_time: string;
  unread_count: number;
}

interface Message {
  id: string;
  from_id: string;
  to_id: string;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      alert('请先登录');
      router.push('/login');
      return;
    }
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API}/api/im/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data.items || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chat: Conversation) => {
    try {
      const res = await axios.get(`${API}/api/im/conversations/${chat.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.items || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectChat = (chat: Conversation) => {
    setCurrentChat(chat);
    fetchMessages(chat);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !currentChat) return;
    try {
      const res = await axios.post(`${API}/api/im/messages`, {
        to_id: currentChat.user.id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (t: string) => {
    const d = new Date(t);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000 && d.getDate() === now.getDate()) {
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) return `http://localhost:3000${url}`;
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">加载中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          {currentChat ? (
            <>
              <button onClick={() => setCurrentChat(null)} className="text-gray-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm overflow-hidden">
                {currentChat.user.avatar_url ? (
                  <img src={getImageUrl(currentChat.user.avatar_url)} alt="" className="w-full h-full object-cover" />
                ) : (
                  currentChat.user.nickname?.[0] || '?'
                )}
              </div>
              <span className="font-medium">{currentChat.user.nickname}</span>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/')} className="text-gray-600">←</button>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />消息
              </h1>
            </>
          )}
        </div>
      </header>

      {currentChat ? (
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-10">暂无消息</div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.from_id === token;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMe ? 'bg-green-600 text-white' : 'bg-white shadow'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-green-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="p-3 bg-white border-t flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入消息..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-400 py-20">暂无会话</div>
          ) : (
            <div className="divide-y">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                    {chat.user.avatar_url ? (
                      <img src={getImageUrl(chat.user.avatar_url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      chat.user.nickname?.[0] || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{chat.user.nickname}</span>
                      <span className="text-xs text-gray-400">{formatTime(chat.last_time)}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.last_message}</p>
                  </div>
                  {chat.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{chat.unread_count}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}