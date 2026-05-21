import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from './ai.service';
import { AiRecognition, ProtectionLevel } from '../../entities/ai-recognition.entity';
import { FishSpecies, ProtectionLevelEnum } from '../../entities/fish-species.entity';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
import axios from 'axios';

jest.mock('axios');

describe('AiService', () => {
  let service: AiService;
  let recognitionRepo: jest.Mocked<Repository<AiRecognition>>;
  let fishSpeciesRepo: jest.Mocked<Repository<FishSpecies>>;
  let auditLogRepo: jest.Mocked<Repository<AuditLog>>;

  const mockRecognition: Partial<AiRecognition> = {
    id: 'rec-123',
    userId: 'user-456',
    imageUrl: 'https://example.com/fish.jpg',
    fishName: '鲫鱼',
    scientificName: 'Carassius auratus',
    habits: '底层鱼类，杂食性',
    protectionLevel: ProtectionLevel.NONE,
    confidence: 0.96,
    fishSpeciesId: 'species-789',
    fullDetails: null,
    wasReleased: false,
    wasReported: false,
    createdAt: new Date(),
  };

  const mockFishSpecies: Partial<FishSpecies> = {
    id: 'species-789',
    chineseName: '鲫鱼',
    scientificName: 'Carassius auratus',
    family: '鲤科',
    genus: '鲫属',
    habitat: '广泛分布于全国各地的淡水水域',
    diet: '杂食性',
    waterLayer: '底层',
    bestSeason: '春季、秋季',
    protectionLevel: ProtectionLevelEnum.NONE,
    edibleRating: '一般',
    cookingMethods: ['红烧', '清蒸'],
    baitRecommendation: '蚯蚓、面包屑',
    rigSuggestion: '传统沉底钓法',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: getRepositoryToken(AiRecognition),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FishSpecies),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    recognitionRepo = module.get(getRepositoryToken(AiRecognition));
    fishSpeciesRepo = module.get(getRepositoryToken(FishSpecies));
    auditLogRepo = module.get(getRepositoryToken(AuditLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recognize', () => {
    it('should return mock result when no API keys configured', async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error('No API keys'));

      recognitionRepo.create.mockReturnValue(mockRecognition as AiRecognition);
      recognitionRepo.save.mockResolvedValue(mockRecognition as AiRecognition);
      fishSpeciesRepo.findOne.mockResolvedValue(mockFishSpecies as FishSpecies);

      const result = await service.recognize('https://example.com/fish.jpg', 'user-456');

      expect(result).toBeDefined();
      expect(result.fishName).toBeDefined();
      expect(result.actionButtons).toBeDefined();
      expect(result.actionButtons.release.label).toBe('立即放生');
      expect(result.actionButtons.report.label).toBe('上报记录');
    });

    it('should include warning for protected species', async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error('No API keys'));

      const protectedRecognition = {
        ...mockRecognition,
        fishName: '中华鲟',
        protectionLevel: ProtectionLevel.LEVEL_1,
      };
      const protectedSpecies = {
        ...mockFishSpecies,
        chineseName: '中华鲟',
        protectionLevel: ProtectionLevelEnum.LEVEL_1,
      };

      recognitionRepo.create.mockReturnValue(protectedRecognition as AiRecognition);
      recognitionRepo.save.mockResolvedValue(protectedRecognition as AiRecognition);
      fishSpeciesRepo.findOne.mockResolvedValue(protectedSpecies as FishSpecies);

      const result = await service.recognize('https://example.com/fish.jpg', 'user-456');

      expect(result.warning).toBeDefined();
      expect(result.warning.level).toContain('一级保护');
      expect(result.warning.lawReference).toContain('野生动物保护法');
      expect(result.warning.penalty).toContain('刑事责任');
    });

    it('should call EasyDL API when API keys are configured', async () => {
      process.env.EASYDL_API_KEY = 'test-api-key';
      process.env.EASYDL_SECRET_KEY = 'test-secret-key';

      const tokenResponse = { data: { access_token: 'mock-token' } };
      const classifyResponse = {
        data: {
          results: [
            { name: '鲫鱼', score: 0.96, label_id: 1 },
          ],
        },
      };

      (axios.post as jest.Mock)
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(classifyResponse);

      recognitionRepo.create.mockReturnValue(mockRecognition as AiRecognition);
      recognitionRepo.save.mockResolvedValue(mockRecognition as AiRecognition);
      fishSpeciesRepo.findOne.mockResolvedValue(mockFishSpecies as FishSpecies);

      const result = await service.recognize('https://example.com/fish.jpg', 'user-456');

      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();

      delete process.env.EASYDL_API_KEY;
      delete process.env.EASYDL_SECRET_KEY;
    });

    it('should fall back to mock when API call fails', async () => {
      process.env.EASYDL_API_KEY = 'test-api-key';
      process.env.EASYDL_SECRET_KEY = 'test-secret-key';

      (axios.post as jest.Mock).mockRejectedValue(new Error('API Error'));

      recognitionRepo.create.mockReturnValue(mockRecognition as AiRecognition);
      recognitionRepo.save.mockResolvedValue(mockRecognition as AiRecognition);
      fishSpeciesRepo.findOne.mockResolvedValue(mockFishSpecies as FishSpecies);

      const result = await service.recognize('https://example.com/fish.jpg', 'user-456');

      expect(result).toBeDefined();
      expect(result.fishName).toBeDefined();

      delete process.env.EASYDL_API_KEY;
      delete process.env.EASYDL_SECRET_KEY;
    });

    it('should record audit log for protected species', async () => {
      const protectedRecognition = {
        ...mockRecognition,
        protectionLevel: ProtectionLevel.LEVEL_2,
      };
      const protectedSpecies = {
        ...mockFishSpecies,
        protectionLevel: ProtectionLevelEnum.LEVEL_2,
      };

      (axios.post as jest.Mock).mockRejectedValue(new Error('No API keys'));
      recognitionRepo.create.mockReturnValue(protectedRecognition as AiRecognition);
      recognitionRepo.save.mockResolvedValue(protectedRecognition as AiRecognition);
      fishSpeciesRepo.findOne.mockResolvedValue(protectedSpecies as FishSpecies);
      auditLogRepo.create.mockReturnValue({} as AuditLog);
      auditLogRepo.save.mockResolvedValue({} as AuditLog);

      await service.recognize('https://example.com/fish.jpg', 'user-456');

      expect(auditLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-456',
          action: AuditAction.PROTECTED_SPECIES_DETECTED,
        }),
      );
    });
  });

  describe('getHistory', () => {
    it('should return paginated history with species details', async () => {
      recognitionRepo.findAndCount.mockResolvedValue([[mockRecognition as AiRecognition], 1]);
      fishSpeciesRepo.findOne.mockResolvedValue(mockFishSpecies as FishSpecies);

      const result = await service.getHistory('user-456', { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should return empty when no history exists', async () => {
      recognitionRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getHistory('user-456', { page: 1, limit: 20 });

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('markReleased', () => {
    it('should mark record as released and return success', async () => {
      recognitionRepo.findOne.mockResolvedValue(mockRecognition as AiRecognition);
      recognitionRepo.save.mockResolvedValue({
        ...mockRecognition,
        wasReleased: true,
      } as AiRecognition);
      auditLogRepo.create.mockReturnValue({} as AuditLog);
      auditLogRepo.save.mockResolvedValue({} as AuditLog);

      const result = await service.markReleased('user-456', 'rec-123');

      expect(result.success).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });

    it('should throw NotFoundException when record not found', async () => {
      recognitionRepo.findOne.mockResolvedValue(null);

      await expect(service.markReleased('user-456', 'invalid-id')).rejects.toThrow();
    });
  });

  describe('markReported', () => {
    it('should mark record as reported', async () => {
      recognitionRepo.findOne.mockResolvedValue(mockRecognition as AiRecognition);
      recognitionRepo.save.mockResolvedValue({
        ...mockRecognition,
        wasReported: true,
      } as AiRecognition);
      auditLogRepo.create.mockReturnValue({} as AuditLog);
      auditLogRepo.save.mockResolvedValue({} as AuditLog);

      const result = await service.markReported('user-456', 'rec-123');

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException when record not found', async () => {
      recognitionRepo.findOne.mockResolvedValue(null);

      await expect(service.markReported('user-456', 'invalid-id')).rejects.toThrow();
    });
  });
});
