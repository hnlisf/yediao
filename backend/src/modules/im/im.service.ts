import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ImService {
  private appKey: string;
  private appSecret: string;

  constructor() {
    this.appKey = process.env.RONGCLOUD_APP_KEY || '';
    this.appSecret = process.env.RONGCLOUD_APP_SECRET || '';
  }

  async getToken(userId: string, name: string, portraitUri?: string) {
    // TODO: 接入融云IM Server API获取token
    // const nonce = Math.random().toString(36).substring(2);
    // const timestamp = Date.now().toString();
    // const signature = sha1(this.appSecret + nonce + timestamp);
    // const response = await axios.post('https://api-cn.ronghub.com/user/getToken.json', ...);

    // MVP: 返回模拟token
    return {
      token: `mock-im-token-${userId}-${Date.now()}`,
      appKey: this.appKey || 'mock-app-key',
    };
  }

  async createGroup(creatorId: string, groupName: string, memberIds: string[]) {
    // TODO: 调用融云创建群组API
    const groupId = `group-${Date.now()}`;
    return { groupId, groupName, memberCount: memberIds.length + 1 };
  }

  async sendPushNotification(userId: string, title: string, content: string, extras?: Record<string, any>): Promise<{ message: string }> {
    const appKey = process.env.JPUSH_APP_KEY;
    const masterSecret = process.env.JPUSH_MASTER_SECRET;

    if (!appKey || !masterSecret) {
      return { message: '推送已发送(MVP模拟)' };
    }

    const auth = Buffer.from(`${appKey}:${masterSecret}`).toString('base64');

    try {
      await axios.post('https://api.jpush.cn/v3/push', {
        platform: 'all',
        audience: { tag: [userId] },
        notification: {
          android: { title, alert: content, extras },
          ios: { title, alert: content, extras },
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
      });
      return { message: '推送已发送' };
    } catch {
      return { message: '推送发送失败' };
    }
  }

  async notifyGathering(gatheringId: string, title: string, content: string): Promise<void> {
    // MVP: fetch all participants and send push to each
    return;
  }
}
