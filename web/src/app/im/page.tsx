'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Search, ChevronLeft } from 'lucide-react';

interface Conversation {
  id: string;
  type: 'private' | 'group';
  name: string;
  avatar?: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

const mockConversations: Conversation[] = [
  { id: '1', type: 'group', name: '周末野钓聚会', lastMessage: '老王: 明天几点出发？', lastTime: '10分钟前', unread: 2 },
  { id: '2', type: 'group', name: '夜钓小分队', lastMessage: '夜猫子: 今晚有空的举手', lastTime: '1小时前', unread: 0 },
  { id: '3', type: 'private', name: '小鱼儿', lastMessage: '好的，明天见！', lastTime: '昨天', unread: 0 },
  { id: '4', type: 'private', name: '钓圣', lastMessage: '那个钓点确实不错', lastTime: '3天前', unread: 0 },
];

export default function IMPage() {
  const [conversations] = useState<Conversation[]>(mockConversations);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-gray-600"><ChevronLeft className="w-5 h-5" /></Link>
          <h1 className="text-lg font-bold">消息</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-md p-3 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input placeholder="搜索聊天记录..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>

        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link key={conv.id} href={conv.type === 'group' ? `/im/group/${conv.id}` : `/im/private/${conv.id}`}>
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 hover:bg-gray-50">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${conv.type === 'group' ? 'bg-green-600' : 'bg-blue-600'}`}>
                  {conv.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate">{conv.name}</p>
                    <p className="text-xs text-gray-400">{conv.lastTime}</p>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{conv.unread}</div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {conversations.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>暂无消息</p>
          </div>
        )}
      </div>
    </div>
  );
}
