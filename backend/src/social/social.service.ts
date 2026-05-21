import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SocialService {
  async getPosts(page = 1, limit = 10) {
    return {
      items: [
        { id: 1, user: { nickname: '钓鱼老王' }, content: '今天在后湖钓了条大鲤鱼！', images: ['https://example.com/p1.jpg'], likes_count: 5, comments_count: 2, created_at: new Date().toISOString() },
        { id: 2, user: { nickname: '野钓小李' }, content: '潮白河的鲫鱼口很好', images: ['https://example.com/p2.jpg'], likes_count: 3, comments_count: 1, created_at: new Date().toISOString() },
      ],
      total: 2,
      page,
      limit,
    };
  }

  async createPost(dto: any, userId: number) {
    if (!dto.content?.trim() && (!dto.images || dto.images.length === 0)) {
      throw new BadRequestException('内容或图片不能为空');
    }
    return { id: Date.now(), ...dto, userId, created_at: new Date().toISOString() };
  }

  async likePost(postId: number, userId: number) {
    return { message: '点赞成功', postId, userId };
  }

  async getComments(postId: number) {
    return [
      { id: 1, user: { nickname: '用户A' }, content: '真不错！', created_at: new Date().toISOString() },
    ];
  }

  async addComment(postId: number, userId: number, dto: any) {
    return { id: Date.now(), postId, userId, ...dto, created_at: new Date().toISOString() };
  }

  async getEvents() {
    return [
      { id: 1, title: '周末后湖约钓', creator: { nickname: '钓鱼老王' }, start_time: '2026-05-17T06:00:00Z', max_participants: 5, current_participants: 2, status: 'open' },
      { id: 2, title: '潮白河早口局', creator: { nickname: '野钓小李' }, start_time: '2026-05-18T05:30:00Z', max_participants: 4, current_participants: 1, status: 'open' },
    ];
  }

  async createEvent(dto: any, userId: number) {
    return { id: Date.now(), ...dto, creator_id: userId, current_participants: 1, status: 'open' };
  }

  async getEventDetail(id: number) {
    return { id, title: '周末后湖约钓', description: '周六早上6点集合', participants: [] };
  }

  async joinEvent(eventId: number, userId: number) {
    return { message: '报名成功', eventId, userId };
  }

  async cancelEvent(eventId: number, userId: number) {
    return { message: '取消报名成功', eventId, userId };
  }
}
