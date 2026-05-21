import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { PostLike } from '../../entities/post-like.entity';
import { PostComment } from '../../entities/post-comment.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private likeRepository: Repository<PostLike>,
    @InjectRepository(PostComment)
    private commentRepository: Repository<PostComment>,
  ) {}

  async createPost(userId: string, dto: {
    content: string;
    images?: string[];
    taggedSpecies?: string[];
    taggedSpots?: string[];
    videoUrl?: string;
    contentType?: string;
  }) {
    const post = this.postRepository.create({
      userId,
      content: dto.content,
      images: dto.images || [],
      taggedSpecies: dto.taggedSpecies,
      taggedSpots: dto.taggedSpots,
      videoUrl: dto.videoUrl,
      contentType: dto.contentType || 'text',
      isPublic: true,
    });
    return this.postRepository.save(post);
  }

  /**
   * 社区动态推荐算法
   * 综合评分 = 时间衰减分 * 互动权重分
   * 时间衰减：每24小时降权一半 (halfLife=24h)
   * 互动分数：点赞*1 + 评论*2 + 分享*3，归一化到[0,1]
   * 最终分 = exp(-decay) * (1 + engagementNorm * 4)
   */
  private calculateFeedScore(post: Post): number {
    const now = Date.now();
    const created = new Date(post.createdAt).getTime();
    const hoursOld = (now - created) / (1000 * 60 * 60);
    const halfLifeHours = 24;
    // 时间衰减：e^(-ln2 * hours/24) = 0.5^(hours/24)
    const decayFactor = Math.exp((-Math.LN2 * hoursOld) / halfLifeHours);

    const engagement = post.likeCount * 1 + post.commentCount * 2 + post.shareCount * 3;
    // 归一化：假设最高engagement为100，超过按100算
    const maxEngagement = 100;
    const engagementNorm = Math.min(engagement / maxEngagement, 1);

    return decayFactor * (1 + engagementNorm * 4);
  }

  async getPosts(page = 1, limit = 20, userId?: string) {
    // MVP：返回时间+互动综合排序
    const [items, total] = await this.postRepository.findAndCount({
      where: { isPublic: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (userId) {
      const postIds = items.map(p => p.id);
      const likes = await this.likeRepository
        .createQueryBuilder('like')
        .where('like.postId IN (:...postIds)', { postIds })
        .andWhere('like.userId = :userId', { userId })
        .getMany();
      const likedMap = new Set(likes.map(l => l.postId));
      items.forEach(post => {
        (post as any).isLiked = likedMap.has(post.id);
      });
    }

    // 计算推荐分并排序
    const scored = items.map(p => ({
      ...p,
      feedScore: this.calculateFeedScore(p),
    }));
    scored.sort((a, b) => b.feedScore - a.feedScore);

    return { items: scored, total, page, limit };
  }

  /**
   * 个性化推荐 — 获取用户专属信息流（基于用户标签匹配）
   */
  async getPersonalizedFeed(userId: string, userTags: { taggedSpecies?: string[]; taggedSpots?: string[] }, page = 1, limit = 20) {
    const { taggedSpecies = [], taggedSpots = [] } = userTags;
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.isPublic = :isPublic', { isPublic: true });

    if (taggedSpecies.length > 0 || taggedSpots.length > 0) {
      const orConditions: string[] = [];
      const params: any = {};
      if (taggedSpecies.length > 0) {
        orConditions.push(`JSON_CONTAINS(post.taggedSpecies, :species)`);
        params.species = JSON.stringify(taggedSpecies[0]);
      }
      if (taggedSpots.length > 0) {
        orConditions.push(`JSON_CONTAINS(post.taggedSpots, :spots)`);
        params.spots = JSON.stringify(taggedSpots[0]);
      }
      if (orConditions.length > 0) {
        qb.andWhere(`(${orConditions.join(' OR ')})`, params);
      }
    }

    const items = await qb
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const total = await qb.getCount();
    return { items, total, page, limit };
  }

  async getPostById(id: string, userId?: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!post) throw new NotFoundException('动态不存在');
    if (userId) {
      const like = await this.likeRepository.findOne({ where: { postId: id, userId } });
      (post as any).isLiked = !!like;
    }
    return post;
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('动态不存在');

    const existing = await this.likeRepository.findOne({ where: { userId, postId } });
    if (existing) {
      await this.likeRepository.remove(existing);
      await this.postRepository.decrement({ id: postId }, 'likeCount', 1);
      return { liked: false };
    }
    const like = this.likeRepository.create({ userId, postId });
    await this.likeRepository.save(like);
    await this.postRepository.increment({ id: postId }, 'likeCount', 1);
    return { liked: true };
  }

  async addComment(userId: string, postId: string, content: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('动态不存在');

    const comment = this.commentRepository.create({ userId, postId, content });
    await this.commentRepository.save(comment);
    await this.postRepository.increment({ id: postId }, 'commentCount', 1);
    return comment;
  }

  async getComments(postId: string, page = 1, limit = 20) {
    const [items, total] = await this.commentRepository.findAndCount({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async sharePost(userId: string, postId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('动态不存在');
    await this.postRepository.increment({ id: postId }, 'shareCount', 1);
    return { message: '分享成功' };
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('动态不存在');
    if (post.userId !== userId) throw new ForbiddenException('无权删除');
    await this.postRepository.remove(post);
    return { message: '删除成功' };
  }

  async getUserPosts(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.postRepository.findAndCount({
      where: { userId, isPublic: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }
}