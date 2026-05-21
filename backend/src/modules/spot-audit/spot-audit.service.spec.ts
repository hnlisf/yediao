import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpotAuditService } from './spot-audit.service';
import { Spot, SpotStatus } from '../../entities/spot.entity';
import { SpotReview, ReviewAction } from '../../entities/spot-review.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SpotAuditService', () => {
  let service: SpotAuditService;
  let spotRepo: Repository<Spot>;
  let reviewRepo: Repository<SpotReview>;

  const mockSpotRepo = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockReviewRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotAuditService,
        { provide: getRepositoryToken(Spot), useValue: mockSpotRepo },
        { provide: getRepositoryToken(SpotReview), useValue: mockReviewRepo },
      ],
    }).compile();

    service = module.get<SpotAuditService>(SpotAuditService);
    spotRepo = module.get<Repository<Spot>>(getRepositoryToken(Spot));
    reviewRepo = module.get<Repository<SpotReview>>(getRepositoryToken(SpotReview));

    jest.clearAllMocks();
  });

  describe('findPending', () => {
    it('should return paginated pending spots', async () => {
      const mockSpots = [
        { id: '1', name: 'Spot A', status: SpotStatus.PENDING },
        { id: '2', name: 'Spot B', status: SpotStatus.PENDING },
      ] as Spot[];
      mockSpotRepo.findAndCount.mockResolvedValue([mockSpots, 2]);

      const result = await service.findPending(1, 10);

      expect(result.items).toEqual(mockSpots);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(mockSpotRepo.findAndCount).toHaveBeenCalledWith({
        where: { status: SpotStatus.PENDING },
        relations: ['creator'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should use default pagination when page and limit not provided', async () => {
      mockSpotRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findPending();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockSpotRepo.findAndCount).toHaveBeenCalledWith({
        where: { status: SpotStatus.PENDING },
        relations: ['creator'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('review', () => {
    const reviewerId = 'reviewer-123';
    const spotId = 'spot-456';

    it('should approve a pending spot', async () => {
      const mockSpot = { id: spotId, status: SpotStatus.PENDING, name: 'Test Spot' } as Spot;
      mockSpotRepo.findOne.mockResolvedValue(mockSpot);
      const mockReview = { id: 'review-1', spotId, reviewerId, action: ReviewAction.APPROVE, note: 'Looks good!' } as SpotReview;
      mockReviewRepo.create.mockReturnValue(mockReview);
      mockReviewRepo.save.mockResolvedValue(mockReview);

      const result = await service.approve(reviewerId, spotId, 'Looks good!');

      expect(result.message).toBe('已通过');
      expect(mockSpotRepo.update).toHaveBeenCalledWith(spotId, {
        status: SpotStatus.APPROVED,
        reviewerId,
        reviewNote: 'Looks good!',
      });
    });

    it('should reject a pending spot', async () => {
      const mockSpot = { id: spotId, status: SpotStatus.PENDING, name: 'Test Spot' } as Spot;
      mockSpotRepo.findOne.mockResolvedValue(mockSpot);
      const mockReview = { id: 'review-2', spotId, reviewerId, action: ReviewAction.REJECT, note: 'Invalid location' } as SpotReview;
      mockReviewRepo.create.mockReturnValue(mockReview);
      mockReviewRepo.save.mockResolvedValue(mockReview);

      const result = await service.reject(reviewerId, spotId, 'Invalid location');

      expect(result.message).toBe('已拒绝');
      expect(mockSpotRepo.update).toHaveBeenCalledWith(spotId, {
        status: SpotStatus.REJECTED,
        reviewerId,
        reviewNote: 'Invalid location',
      });
    });

    it('should throw NotFoundException when spot does not exist', async () => {
      mockSpotRepo.findOne.mockResolvedValue(null);

      await expect(service.approve(reviewerId, spotId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when spot is not pending', async () => {
      mockSpotRepo.findOne.mockResolvedValue({ id: spotId, status: SpotStatus.APPROVED } as Spot);

      await expect(service.approve(reviewerId, spotId)).rejects.toThrow(BadRequestException);
    });
  });



  describe('getReviewHistory', () => {
    it('should return paginated review history for a spot', async () => {
      const spotId = 'spot-123';
      const mockReviews = [
        { id: 'review-1', spotId, action: ReviewAction.APPROVE } as SpotReview,
        { id: 'review-2', spotId, action: ReviewAction.REJECT } as SpotReview,
      ];
      mockReviewRepo.findAndCount.mockResolvedValue([mockReviews, 2]);

      const result = await service.getReviewHistory(spotId, 1, 10);

      expect(result.items).toEqual(mockReviews);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
