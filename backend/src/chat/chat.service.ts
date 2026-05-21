import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  async getToken(userId: number) {
    // MVP阶段：返回模拟Token，实际应调用融云API
    return {
      token: `mock-rongcloud-token-${userId}-${Date.now()}`,
      app_key: 'mock-app-key',
    };
  }

  async getConversations(userId: number) {
    return [
      { id: 'conv_1', type: 'private', target: { id: 2, nickname: '野钓小李' }, last_message: '周末去钓鱼吗？', unread: 1 },
      { id: 'conv_2', type: 'group', target: { id: 'group_1', name: '后湖钓友群' }, last_message: '明天早上6点集合', unread: 3 },
    ];
  }

  async sendMessage(dto: any, userId: number) {
    return { id: `msg_${Date.now()}`, ...dto, sender_id: userId, created_at: new Date().toISOString() };
  }
}
