import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private dataSource: DataSource,
  ) {}

  async getPosts(page = 1, limit = 20, userId?: string) {
    const offset = (page - 1) * limit;
    const items = await this.dataSource.query(
      `SELECT p.id, p.user_id, p.content, p.images, p.likes_count, p.comments_count, p.created_at, p.updated_at,
              u.nickname, u.avatar_url
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    const countResult = await this.dataSource.query(`SELECT COUNT(*) as total FROM posts`);
    const total = parseInt(countResult[0].total);
    return {
      items: items.map(r => ({
        id: r.id,
        userId: r.user_id,
        content: r.content,
        images: r.images || [],
        likesCount: r.likes_count || 0,
        commentCount: r.comments_count || 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        user: r.nickname ? { id: r.user_id, username: r.nickname, avatar: r.avatar_url } : null,
      })),
      total,
      page,
      limit,
    };
  }

  async getUserPosts(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const items = await this.dataSource.query(
      `SELECT p.id, p.user_id, p.content, p.images, p.likes_count, p.comments_count, p.created_at, p.updated_at,
              u.nickname, u.avatar_url
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    const countResult = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM posts WHERE user_id = $1`,
      [userId],
    );
    const total = parseInt(countResult[0].total);
    return {
      items: items.map(r => ({
        id: r.id,
        userId: r.user_id,
        content: r.content,
        images: r.images || [],
        likesCount: r.likes_count || 0,
        commentCount: r.comments_count || 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        user: r.nickname ? { id: r.user_id, username: r.nickname, avatar: r.avatar_url } : null,
      })),
      total,
      page,
      limit,
    };
  }

  async getPostById(id: string, userId?: string) {
    const result = await this.dataSource.query(
      `SELECT p.id, p.user_id, p.content, p.images, p.likes_count, p.comments_count, p.created_at, p.updated_at,
              u.nickname, u.avatar_url
       FROM posts p LEFT JOIN users u ON u.id = p.user_id WHERE p.id = $1`,
      [id],
    );
    if (!result[0]) throw new NotFoundException('动态不存在');
    const r = result[0];
    return {
      id: r.id,
      userId: r.user_id,
      content: r.content,
      images: r.images || [],
      likesCount: r.likes_count || 0,
      commentCount: r.comments_count || 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      user: r.nickname ? { id: r.user_id, username: r.nickname, avatar: r.avatar_url } : null,
    };
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.dataSource.query(`SELECT id FROM posts WHERE id = $1`, [postId]);
    if (!post[0]) throw new NotFoundException('动态不存在');
    const existing = await this.dataSource.query(
      `SELECT id FROM post_likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId],
    );
    if (existing[0]) {
      await this.dataSource.query(`DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2`, [userId, postId]);
      await this.dataSource.query(`UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1`, [postId]);
      return { liked: false };
    }
    await this.dataSource.query(`INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)`, [userId, postId]);
    await this.dataSource.query(`UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`, [postId]);
    return { liked: true };
  }

  async sharePost(userId: string, postId: string) {
    const post = await this.dataSource.query(`SELECT id FROM posts WHERE id = $1`, [postId]);
    if (!post[0]) throw new NotFoundException('动态不存在');
    return { message: '分享成功' };
  }

  async addComment(userId: string, postId: string, content: string) {
    const post = await this.dataSource.query(`SELECT id FROM posts WHERE id = $1`, [postId]);
    if (!post[0]) throw new NotFoundException('动态不存在');
    const result = await this.dataSource.query(
      `INSERT INTO post_comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [userId, postId, content],
    );
    await this.dataSource.query(`UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1`, [postId]);
    return result[0];
  }

  async getComments(postId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const items = await this.dataSource.query(
      `SELECT c.id, c.user_id, c.post_id, c.content, c.created_at,
              u.nickname, u.avatar_url
       FROM post_comments c LEFT JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [postId, limit, offset],
    );
    const countResult = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM post_comments WHERE post_id = $1`,
      [postId],
    );
    return {
      items: items.map(r => ({
        id: r.id,
        userId: r.user_id,
        postId: r.post_id,
        content: r.content,
        createdAt: r.created_at,
        user: r.nickname ? { id: r.user_id, username: r.nickname, avatar: r.avatar_url } : null,
      })),
      total: parseInt(countResult[0].total),
      page,
      limit,
    };
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.dataSource.query(`SELECT user_id FROM posts WHERE id = $1`, [postId]);
    if (!post[0]) throw new NotFoundException('动态不存在');
    if (post[0].user_id !== parseInt(userId)) throw new ForbiddenException('无权删除');
    await this.dataSource.query(`DELETE FROM posts WHERE id = $1`, [postId]);
    return { message: '删除成功' };
  }

  async createPost(userId: string, dto: {
    content: string;
    images?: string[];
    taggedSpecies?: string[];
    taggedSpots?: string[];
    videoUrl?: string;
    contentType?: string;
  }) {
    const result = await this.dataSource.query(
      `INSERT INTO posts (user_id, content, images) VALUES ($1, $2, $3) RETURNING *`,
      [userId, dto.content, dto.images || []],
    );
    return result[0];
  }
}
