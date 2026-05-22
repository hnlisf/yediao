import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import axios from 'axios';
import { AiRecognition, ProtectionLevel } from '../../entities/ai-recognition.entity';
import { FishSpecies, ProtectionLevelEnum } from '../../entities/fish-species.entity';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
import { PointRecord, PointAction } from '../../entities/point-record.entity';
import { QuerySpeciesDto, QueryHistoryDto } from './dto/ai.dto';

interface EasyDLResult {
  fishName: string;
  scientificName: string;
  habits: string;
  protectionLevel: ProtectionLevel;
  confidence: number;
  modelLabelId?: number;
}

export interface RecognitionResponse {
  id: string;
  fishName: string;
  scientificName: string;
  habits: string;
  protectionLevel: ProtectionLevel;
  confidence: number;
  fishSpeciesId?: string;
  fullDetails?: Record<string, any>;
  warning?: {
    level: string;
    message: string;
    lawReference: string;
    penalty: string;
    forcePrompt: boolean;
  };
  actionButtons: {
    release: { label: string; points: number; action: string };
    report: { label: string; action: string };
  };
  wasReleased: boolean;
  wasReported: boolean;
  createdAt: Date;
}

const PROTECTION_WARNING_MAP: Record<string, { lawReference: string; penalty: string }> = {
  [ProtectionLevelEnum.LEVEL_1]: {
    lawReference: '《中华人民共和国野生动物保护法》第十条 国家重点保护野生动物分为一级保护野生动物和二级保护野生动物',
    penalty: '非法猎捕、杀害国家重点保护野生动物的，依照相关法律法规追究刑事责任，最高可判处十年以上有期徒刑',
  },
  [ProtectionLevelEnum.LEVEL_2]: {
    lawReference: '《中华人民共和国野生动物保护法》第十条 国家重点保护野生动物分为一级保护野生动物和二级保护野生动物',
    penalty: '非法猎捕、杀害国家重点保护野生动物的，没收猎获物、猎捕工具和违法所得，并处罚款；构成犯罪的，依法追究刑事责任',
  },
  level_1: {
    lawReference: '《中华人民共和国野生动物保护法》第十条 国家重点保护野生动物分为一级保护野生动物和二级保护野生动物',
    penalty: '非法猎捕、杀害国家重点保护野生动物的，依照相关法律法规追究刑事责任，最高可判处十年以上有期徒刑',
  },
  level_2: {
    lawReference: '《中华人民共和国野生动物保护法》第十条 国家重点保护野生动物分为一级保护野生动物和二级保护野生动物',
    penalty: '非法猎捕、杀害国家重点保护野生动物的，没收猎获物、猎捕工具和违法所得，并处罚款；构成犯罪的，依法追究刑事责任',
  },
  level_3: {
    lawReference: '《中华人民共和国野生动物保护法》及各省市相关保护规定',
    penalty: '违规捕猎受保护野生动物将面临行政处罚或刑事责任',
  },
};

const POINT_PER_RELEASE = 10;

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiRecognition)
    private recognitionRepository: Repository<AiRecognition>,
    @InjectRepository(FishSpecies)
    private fishSpeciesRepository: Repository<FishSpecies>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(PointRecord)
    private pointRecordRepository: Repository<PointRecord>,
  ) {}

  // ==================== 鱼类识别 ====================

  async recognize(imageUrl: string, userId: string): Promise<RecognitionResponse> {
    const easyDLResult = await this.callEasyDL(imageUrl);

    let fishSpecies: FishSpecies | null = null;
    if (easyDLResult.fishName) {
      fishSpecies = await this.fishSpeciesRepository.findOne({
        where: { chineseName: easyDLResult.fishName, isActive: true },
      });
    }

    const recognition = this.recognitionRepository.create({
      userId,
      imageUrl,
      fishName: easyDLResult.fishName || '未知鱼类',
      scientificName: easyDLResult.scientificName || '',
      habits: easyDLResult.habits || '',
      protectionLevel: easyDLResult.protectionLevel || ProtectionLevel.NONE,
      confidence: easyDLResult.confidence || 0,
      fishSpeciesId: fishSpecies?.id || null,
      fullDetails: fishSpecies ? this.stripEntityMetadata(fishSpecies) : null,
    });
    await this.recognitionRepository.save(recognition);

    if (recognition.protectionLevel !== ProtectionLevel.NONE) {
      await this.recordAuditLog(userId, AuditAction.PROTECTED_SPECIES_DETECTED, {
        recognitionId: recognition.id,
        fishName: recognition.fishName,
        protectionLevel: recognition.protectionLevel,
        confidence: recognition.confidence,
      });
    }

    return this.buildRecognitionResponse(recognition, fishSpecies);
  }

  // ==================== 鱼种百科 ====================

  async getSpeciesList(query: QuerySpeciesDto) {
    const { keyword, protectionLevel, family, waterLayer, page = 1, limit = 20 } = query;

    const qb = this.fishSpeciesRepository.createQueryBuilder('fs').where('fs.isActive = :active', { active: true });

    if (keyword) {
      qb.andWhere(
        '(fs.chineseName LIKE :kw OR fs.scientificName LIKE :kw OR fs.family LIKE :kw OR fs.genus LIKE :kw)',
        { kw: `%${keyword}%` },
      );
    }
    if (protectionLevel) {
      qb.andWhere('fs.protectionLevel = :pl', { pl: protectionLevel });
    }
    if (family) {
      qb.andWhere('fs.family = :family', { family });
    }
    if (waterLayer) {
      qb.andWhere('fs.waterLayer = :wl', { wl: waterLayer });
    }

    const [items, total] = await qb
      .orderBy('fs.protectionLevel', 'DESC')
      .addOrderBy('fs.chineseName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const itemsStripped = items.map((s) => this.stripEntityMetadata(s));
    return { items: itemsStripped, total, page, limit };
  }

  async getSpeciesById(id: string) {
    const species = await this.fishSpeciesRepository.findOne({ where: { id, isActive: true } });
    if (!species) throw new NotFoundException('鱼种不存在');
    return this.stripEntityMetadata(species);
  }

  async getSpeciesFamilies() {
    const result = await this.fishSpeciesRepository
      .createQueryBuilder('fs')
      .select('DISTINCT fs.family', 'family')
      .where('fs.isActive = :active', { active: true })
      .andWhere('fs.family IS NOT NULL')
      .orderBy('fs.family', 'ASC')
      .getRawMany();
    return result.map((r) => r.family).filter(Boolean);
  }

  async getProtectedSpecies() {
    const items = await this.fishSpeciesRepository.find({
      where: { isActive: true, protectionLevel: Not(ProtectionLevelEnum.NONE) },
      order: { protectionLevel: 'DESC', chineseName: 'ASC' },
    });
    return items.map((s) => this.stripEntityMetadata(s));
  }

  // ==================== 识别历史 ====================

  async getHistory(userId: string, query: QueryHistoryDto) {
    const { fishName, protected: isProtected, released, page = 1, limit = 20 } = query;

    const qb = this.recognitionRepository.createQueryBuilder('ar').where('ar.userId = :userId', { userId });

    if (fishName) {
      qb.andWhere('ar.fishName LIKE :fn', { fn: `%${fishName}%` });
    }
    if (isProtected !== undefined) {
      if (isProtected) {
        qb.andWhere('ar.protectionLevel != :none', { none: ProtectionLevel.NONE });
      } else {
        qb.andWhere('ar.protectionLevel = :none', { none: ProtectionLevel.NONE });
      }
    }
    if (released !== undefined) {
      qb.andWhere('ar.wasReleased = :released', { released });
    }

    const [items, total] = await qb
      .orderBy('ar.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const itemsWithSpecies = await Promise.all(
      items.map(async (item) => {
        let fishSpecies: FishSpecies | null = null;
        if (item.fishSpeciesId) {
          fishSpecies = await this.fishSpeciesRepository.findOne({
            where: { id: item.fishSpeciesId, isActive: true },
          });
        }
        return this.buildRecognitionResponse(item, fishSpecies);
      }),
    );

    return { items: itemsWithSpecies, total, page, limit };
  }

  async getHistoryStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalRecognitions, protectedDetections, totalReleased, monthlyRecognitions, monthlyReleased, uniqueSpecies] =
      await Promise.all([
        this.recognitionRepository.count({ where: { userId } }),
        this.recognitionRepository.count({ where: { userId, protectionLevel: Not(ProtectionLevel.NONE) } }),
        this.recognitionRepository.count({ where: { userId, wasReleased: true } }),
        this.recognitionRepository.count({ where: { userId, createdAt: Not(In([new Date(0)])) } }),
        this.recognitionRepository.count({ where: { userId, wasReleased: true, createdAt: Not(In([new Date(0)])) } }),
        this.recognitionRepository
          .createQueryBuilder('ar')
          .select('COUNT(DISTINCT ar.fishName)', 'cnt')
          .where('ar.userId = :userId', { userId })
          .getRawOne(),
      ]);

    const monthlyCount = await this.recognitionRepository
      .createQueryBuilder('ar')
      .where('ar.userId = :userId', { userId })
      .andWhere('ar.createdAt >= :start', { start: startOfMonth })
      .getCount();

    const monthlyReleaseCount = await this.recognitionRepository
      .createQueryBuilder('ar')
      .where('ar.userId = :userId', { userId })
      .andWhere('ar.wasReleased = :released', { released: true })
      .andWhere('ar.createdAt >= :start', { start: startOfMonth })
      .getCount();

    const pointRecords = await this.pointRecordRepository.find({
      where: { userId: +userId, source: PointAction.RECOGNITION_RELEASE },
    });
    const totalPoints = pointRecords.reduce((sum, r) => sum + r.points, 0);

    return {
      totalRecognitions,
      uniqueSpecies: parseInt(uniqueSpecies?.cnt || '0', 10),
      totalReleased,
      protectedDetections,
      totalPoints,
      monthlyRecognitions: monthlyCount,
      monthlyReleased: monthlyReleaseCount,
    };
  }

  async getHistoryById(userId: string, id: string) {
    const record = await this.recognitionRepository.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException('识别记录不存在');

    let fishSpecies: FishSpecies | null = null;
    if (record.fishSpeciesId) {
      fishSpecies = await this.fishSpeciesRepository.findOne({
        where: { id: record.fishSpeciesId, isActive: true },
      });
    }
    return this.buildRecognitionResponse(record, fishSpecies);
  }

  async deleteHistory(userId: string, id: string) {
    const record = await this.recognitionRepository.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException('识别记录不存在');

    await this.recognitionRepository.remove(record);
    return { success: true };
  }

  async markReleased(userId: string, recognitionId: string) {
    const record = await this.recognitionRepository.findOne({
      where: { id: recognitionId, userId },
    });
    if (!record) throw new NotFoundException('识别记录不存在');
    if (record.wasReleased) return { success: true, pointsEarned: 0, message: '已放生' };

    record.wasReleased = true;
    await this.recognitionRepository.save(record);

    const pointsEarned = POINT_PER_RELEASE;
    const pointRecord = this.pointRecordRepository.create({        userId: +userId,
      source: PointAction.RECOGNITION_RELEASE,
      points: pointsEarned,
      description: `放生鱼类：${record.fishName}`,
    });
    await this.pointRecordRepository.save(pointRecord);

    await this.recordAuditLog(userId, AuditAction.SPECIES_RELEASED, {
      recognitionId: record.id,
      fishName: record.fishName,
      fishSpeciesId: record.fishSpeciesId,
    });

    return { success: true, pointsEarned };
  }

  async markReported(userId: string, recognitionId: string) {
    const record = await this.recognitionRepository.findOne({
      where: { id: recognitionId, userId },
    });
    if (!record) throw new NotFoundException('识别记录不存在');
    if (record.wasReported) return { success: true };

    record.wasReported = true;
    await this.recognitionRepository.save(record);

    await this.recordAuditLog(userId, AuditAction.SPECIES_REPORTED, {
      recognitionId: record.id,
      fishName: record.fishName,
      fishSpeciesId: record.fishSpeciesId,
      imageUrl: record.imageUrl,
    });

    return { success: true };
  }

  // ==================== 私有方法 ====================

  private async callEasyDL(imageUrl: string): Promise<EasyDLResult> {
    const apiKey = process.env.EASYDL_API_KEY;
    const secretKey = process.env.EASYDL_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return this.getMockResult();
    }

    try {
      const tokenResponse = await axios.post(
        'https://aip.baidubce.com/oauth/2.0/token',
        null,
        {
          params: {
            grant_type: 'client_credentials',
            client_id: apiKey,
            client_secret: secretKey,
          },
        },
      );

      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) {
        return this.getMockResult();
      }

      const response = await axios.post(
        `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/classification/fish_recognition?access_token=${accessToken}`,
        {
          image: imageUrl,
          top_num: 5,
        },
      );

      return this.parseEasyDLResponse(response.data);
    } catch (error) {
      console.error('EasyDL API error:', error?.message || error);
      return this.getMockResult();
    }
  }

  private parseEasyDLResponse(data: any): EasyDLResult {
    try {
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const topResult = data.results[0];
        const fishName = topResult.name || topResult.label || '未知鱼类';
        const confidence = topResult.score || topResult.confidence || 0;
        const modelLabelId = topResult.label_id || topResult.class_id;

        const protectionLevel = this.inferProtectionLevel(fishName);

        return {
          fishName,
          scientificName: '',
          habits: '',
          protectionLevel,
          confidence,
          modelLabelId,
        };
      }
    } catch (error) {
      console.error('Failed to parse EasyDL response:', error);
    }
    return this.getMockResult();
  }

  private inferProtectionLevel(fishName: string): ProtectionLevel {
    const protectedSpecies = ['中华鲟', '白鲟', '中华草龟', '鼋', '水獭', '江豚'];
    if (protectedSpecies.some((s) => fishName.includes(s))) {
      return ProtectionLevel.LEVEL_1;
    }
    const level2Species = ['黄鳝', '鳜鱼', '鲥鱼', '河鲀'];
    if (level2Species.some((s) => fishName.includes(s))) {
      return ProtectionLevel.LEVEL_2;
    }
    return ProtectionLevel.NONE;
  }

  private getMockResult(): EasyDLResult {
    const fishDatabase: EasyDLResult[] = [
      { fishName: '鲫鱼', scientificName: 'Carassius auratus', habits: '底层鱼类，杂食性，喜栖息于水草丰富的静水环境', protectionLevel: ProtectionLevel.NONE, confidence: 0.96, modelLabelId: 1 },
      { fishName: '鲤鱼', scientificName: 'Cyprinus carpio', habits: '底层鱼类，杂食性，适应性强，喜弱碱性水', protectionLevel: ProtectionLevel.NONE, confidence: 0.94, modelLabelId: 2 },
      { fishName: '草鱼', scientificName: 'Ctenopharyngodon idella', habits: '中下层鱼类，草食性，生长迅速', protectionLevel: ProtectionLevel.NONE, confidence: 0.92, modelLabelId: 3 },
      { fishName: '青鱼', scientificName: 'Mylopharyngodon piceus', habits: '底层鱼类，肉食性，喜食螺蛳', protectionLevel: ProtectionLevel.LEVEL_2, confidence: 0.89, modelLabelId: 4 },
      { fishName: '鲢鱼', scientificName: 'Hypophthalmichthys molitrix', habits: '上层鱼类，滤食性，净化水质', protectionLevel: ProtectionLevel.NONE, confidence: 0.91, modelLabelId: 5 },
      { fishName: '鳜鱼', scientificName: 'Siniperca chuatsi', habits: '底层肉食性鱼类，喜欢栖息于水流缓慢的溪流和湖泊', protectionLevel: ProtectionLevel.LEVEL_2, confidence: 0.88, modelLabelId: 6 },
      { fishName: '中华鲟', scientificName: 'Acipenser sinensis', habits: '大型洄游性鱼类，国家一级保护动物', protectionLevel: ProtectionLevel.LEVEL_1, confidence: 0.95, modelLabelId: 7 },
    ];
    return fishDatabase[Math.floor(Math.random() * fishDatabase.length)];
  }

  private buildRecognitionResponse(record: AiRecognition, species: FishSpecies | null): RecognitionResponse {
    const response: RecognitionResponse = {
      id: record.id,
      fishName: record.fishName,
      scientificName: record.scientificName || species?.scientificName || '',
      habits: record.habits || species?.habitat || '',
      protectionLevel: record.protectionLevel,
      confidence: record.confidence,
      fishSpeciesId: record.fishSpeciesId || species?.id,
      fullDetails: species ? this.stripEntityMetadata(species) : record.fullDetails,
      actionButtons: {
        release: { label: '立即放生', points: POINT_PER_RELEASE, action: 'release' },
        report: { label: '上报记录', action: 'report' },
      },
      wasReleased: record.wasReleased,
      wasReported: record.wasReported,
      createdAt: record.createdAt,
    };

    if (species && species.protectionLevel !== ProtectionLevelEnum.NONE) {
      const warningInfo = PROTECTION_WARNING_MAP[species.protectionLevel] || PROTECTION_WARNING_MAP.level_2;
      const isLevel1 = species.protectionLevel === ProtectionLevelEnum.LEVEL_1;
      response.warning = {
        level: isLevel1 ? '一级保护' : '二级保护',
        message: `${record.fishName}属于${isLevel1 ? '国家一级' : '国家二级'}重点保护野生动物，请立即放生并上报，非法捕捞将面临刑事责任`,
        lawReference: warningInfo.lawReference,
        penalty: warningInfo.penalty,
        forcePrompt: true,
      };
    } else if (record.protectionLevel !== ProtectionLevel.NONE) {
      const pl = record.protectionLevel;
      const warningInfo = PROTECTION_WARNING_MAP[pl] || PROTECTION_WARNING_MAP.level_2;
      response.warning = {
        level: pl === ProtectionLevel.LEVEL_1 ? '一级保护' : pl === ProtectionLevel.LEVEL_2 ? '二级保护' : '三级保护',
        message: `${record.fishName}属于受保护野生动物，请立即放生并上报`,
        lawReference: warningInfo.lawReference,
        penalty: warningInfo.penalty,
        forcePrompt: true,
      };
    }

    return response;
  }

  private stripEntityMetadata(entity: object): Record<string, any> {
    const plain = Object.assign({}, entity);
    const keysToDelete = ['id', 'createdAt', 'updatedAt', 'isActive'];
    for (const key of keysToDelete) {
      delete (plain as any)[key];
    }
    return plain;
  }

  private async recordAuditLog(
    userId: string,
    action: AuditAction,
    metadata: Record<string, any>,
  ): Promise<void> {
    try {
      const log = this.auditLogRepository.create({ userId, action, metadata });
      await this.auditLogRepository.save(log);
    } catch (error) {
      console.error('Failed to record audit log:', error);
    }
  }
}
