import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityService } from './community.service';
import { Post } from '../../entities/post.entity';
import { PostLike } from '../../entities/post-like.entity';
import { PostComment } from '../../entities/post-comment.entity';

describe('CommunityService', () => {
  let service: CommunityService;
  let postRepo: jest.Mocked<Repository<Post>>;
  let likeRepo: jest.Mocked<Repository<PostLike>>;
  let commentRepo: jest.Mocked<Repository<PostComment>>;

  const mockPostRepo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockLikeRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCommentRepo = {
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        { provide: getRepositoryToken(Post), useValue: mockPostRepo },
        { provide: getRepositoryToken(PostLike), useValue: mockLikeRepo },
        { provide: getRepositoryToken(PostComment), useValue: mockCommentRepo },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
    postRepo = module.get(getRepositoryToken(Post));
    likeRepo = module.get(getRepositoryToken(PostLike));
    commentRepo = module.get(getRepositoryToken(PostComment));

    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post with default values', async () => {
      const dto = { content: '今天钓到大鱼！', images: ['img1.jpg'] };
      const userId = 'user-1';
      const savedPost = { id: 'post-1', userId, ...dto, isPublic: true, likeCount: 0, commentCount: 0, shareCount: 0 };

      mockPostRepo.create.mockReturnValue(savedPost as any);
      mockPostRepo.save.mockResolvedValue(savedPost as any);

      const result = await service.createPost(userId, dto);

      expect(mockPostRepo.create).toHaveBeenCalledWith({
        userId,
        content: '今天钓到大鱼！',
        images: ['img1.jpg'],
        taggedSpecies: undefined,
        taggedSpots: undefined,
        videoUrl: undefined,
        contentType: 'text',
        isPublic: true,
      });
      expect(mockPostRepo.save).toHaveBeenCalledWith(savedPost);
      expect(result).toEqual(savedPost);
    });

    it('should create a post with video content type', async () => {
      const dto = { content: '视频分享', videoUrl: 'https://cdn.com/v.mp4', contentType: 'video' };
      const savedPost = { id: 'post-2', userId: 'user-1', ...dto, isPublic: true };

      mockPostRepo.create.mockReturnValue(savedPost as any);
      mockPostRepo.save.mockResolvedValue(savedPost as any);

      const result = await service.createPost('user-1', dto);

      expect(mockPostRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ contentType: 'video', videoUrl: 'https://cdn.com/v.mp4' }),
      );
      expect(result.contentType).toBe('video');
    });
  });

  describe('toggleLike', () => {
    it('should unlike a post when already liked', async () => {
      const post = { id: 'post-1', likeCount: 5 } as Post;
      const existingLike = { id: 'like-1', userId: 'user-1', postId: 'post-1' };

      mockPostRepo.findOne.mockResolvedValue(post);
      mockLikeRepo.findOne.mockResolvedValue(existingLike as any);
      mockLikeRepo.remove.mockResolvedValue(existingLike as any);
      mockPostRepo.decrement.mockResolvedValue({ affected: 1 } as any);

      const result = await service.toggleLike('user-1', 'post-1');

      expect(result).toEqual({ liked: false });
      expect(mockLikeRepo.remove).toHaveBeenCalledWith(existingLike);
      expect(mockPostRepo.decrement).toHaveBeenCalledWith({ id: 'post-1' }, 'likeCount', 1);
    });

    it('should like a post when not liked', async () => {
      const post = { id: 'post-1', likeCount: 5 } as Post;
      const newLike = { id: 'like-2', userId: 'user-1', postId: 'post-1' };

      mockPostRepo.findOne.mockResolvedValue(post);
      mockLikeRepo.findOne.mockResolvedValue(null);
      mockLikeRepo.create.mockReturnValue(newLike as any);
      mockLikeRepo.save.mockResolvedValue(newLike as any);
      mockPostRepo.increment.mockResolvedValue({ affected: 1 } as any);

      const result = await service.toggleLike('user-1', 'post-1');

      expect(result).toEqual({ liked: true });
      expect(mockLikeRepo.create).toHaveBeenCalledWith({ userId: 'user-1', postId: 'post-1' });
      expect(mockPostRepo.increment).toHaveBeenCalledWith({ id: 'post-1' }, 'likeCount', 1);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      mockPostRepo.findOne.mockResolvedValue(null);

      await expect(service.toggleLike('user-1', 'nonexistent')).rejects.toThrow('动态不存在');
    });
  });

  describe('feed score algorithm', () => {
    it('should sort posts by feed score (engagement boost)', () => {
      // 新帖子，无互动
      const freshPost = { id: 'p1', createdAt: new Date(), likeCount: 0, commentCount: 0, shareCount: 0 } as Post;
      // 旧帖子，高互动
      const hotPost = { id: 'p2', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), likeCount: 50, commentCount: 20, shareCount: 5 } as Post;

      const freshScore = (service as any).calculateFeedScore(freshPost);
      const hotScore = (service as any).calculateFeedScore(hotPost);

      // 高互动帖子即使较旧，得分也应该更高
      expect(hotScore).toBeGreaterThan(freshScore);
    });

    it('should apply time decay to older posts', () => {
      // 1小时前
      const oneHourAgo = { id: 'p1', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), likeCount: 10, commentCount: 5, shareCount: 2 } as Post;
      // 48小时前（2天）
      const twoDaysAgo = { id: 'p2', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), likeCount: 10, commentCount: 5, shareCount: 2 } as Post;

      const oneHourScore = (service as any).calculateFeedScore(oneHourAgo);
      const twoDaysScore = (service as any).calculateFeedScore(twoDaysAgo);

      // 同样的互动，1小时前的得分更高（时间衰减更少）
      expect(oneHourScore).toBeGreaterThan(twoDaysScore);
    });
  });

  describe('addComment', () => {
    it('should add comment and increment count', async () => {
      const post = { id: 'post-1', commentCount: 3 } as Post;
      const comment = { id: 'comment-1', userId: 'user-1', postId: 'post-1', content: '真棒！' };

      mockPostRepo.findOne.mockResolvedValue(post);
      mockCommentRepo.create.mockReturnValue(comment as any);
      mockCommentRepo.save.mockResolvedValue(comment as any);
      mockPostRepo.increment.mockResolvedValue({ affected: 1 } as any);

      const result = await service.addComment('user-1', 'post-1', '真棒！');

      expect(mockCommentRepo.create).toHaveBeenCalledWith({ userId: 'user-1', postId: 'post-1', content: '真棒！' });
      expect(mockPostRepo.increment).toHaveBeenCalledWith({ id: 'post-1' }, 'commentCount', 1);
      expect(result).toEqual(comment);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      mockPostRepo.findOne.mockResolvedValue(null);

      await expect(service.addComment('user-1', 'nonexistent', 'comment')).rejects.toThrow('动态不存在');
    });
  });

  describe('deletePost', () => {
    it('should throw ForbiddenException when user is not the owner', async () => {
      const post = { id: 'post-1', userId: 'owner-user' } as Post;
      mockPostRepo.findOne.mockResolvedValue(post);

      await expect(service.deletePost('other-user', 'post-1')).rejects.toThrow('无权删除');
    });

    it('should delete post when user is the owner', async () => {
      const post = { id: 'post-1', userId: 'user-1' } as Post;
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.remove.mockResolvedValue(post as any);

      const result = await service.deletePost('user-1', 'post-1');

      expect(mockPostRepo.remove).toHaveBeenCalledWith(post);
      expect(result).toEqual({ message: '删除成功' });
    });
  });
});
