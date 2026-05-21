'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Send, ChevronLeft, Users, MoreHorizontal } from 'lucide-react';

interface Message {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  time: string;
  isSelf: boolean;
}

export default function GroupChat() {
  const params = useParams();
  const groupId = params.groupId as string;
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', userId: 'u1', nickname: '老钓手', content: '大家好，明天的约钓活动几点集合？', time: '10:30', isSelf: false },
    { id: '2', userId: 'u2', nickname: '小鱼儿', content: '我建议早上6点，趁着凉快', time: '10:32', isSelf: false },
    { id: '3', userId: 'self', nickname: '我', content: '好的，那我5点半出发', time: '10:35', isSelf: true },
    { id: '4', userId: 'u3', nickname: '夜猫子', content: '记得带防晒！最近太阳很毒', time: '10:38', isSelf: false },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      userId: 'self',
      nickname: '我',
      content: input.trim(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/im" className="text-gray-600"><ChevronLeft className="w-5 h-5" /></Link>
          <h1 className="text-lg font-bold flex-1">{groupId === '1' ? '周末野钓聚会' : groupId === '2' ? '夜钓小分队' : '群聊'}</h1>
          <Link href={`/gatherings/${groupId}`} className="text-gray-500 flex items-center gap-1 text-sm">
            <Users className="w-4 h-4" />
            成员
          </Link>
          <button className="text-gray-500"><MoreHorizontal className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${msg.isSelf ? 'order-2' : ''}`}>
                {!msg.isSelf && <p className="text-xs text-gray-500 mb-1">{msg.nickname}</p>}
                <div className={`rounded-2xl px-4 py-2 ${msg.isSelf ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white shadow-sm rounded-bl-sm'}`}>
                  <p>{msg.content}</p>
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${msg.isSelf ? 'text-right' : ''}`}>{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-green-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
