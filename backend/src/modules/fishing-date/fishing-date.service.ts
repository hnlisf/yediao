import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FishingDate, FishingDateStatus } from '../../entities/fishing-date.entity';
import { FishingDateParticipant } from '../../entities/fishing-date-participant.entity';
import { ImService } from '../im/im.service';

@Injectable()
export class FishingDateService {
  constructor(
    @InjectRepository(FishingDate)
    private dateRepository: Repository<FishingDate>,
    @InjectRepository(FishingDateParticipant)
    private participantRepository: Repository<FishingDateParticipant>,
    private imService: ImService,
  ) {}

  async create(userId: string, dto: {
    title: string;
    description?: string;
    spotId?: string;
    locationName?: string;
    longitude?: number;
    latitude?: number;
    startTime: Date;
    endTime?: Date;
    maxParticipants?: number;
  }) {
    const date = this.dateRepository.create({
      ...dto,
      creatorId: userId,
      currentParticipants: 1,
      status: FishingDateStatus.OPEN,
      maxParticipants: dto.maxParticipants || 2,
    });
    const saved: any = await this.dateRepository.save(date);

    const participant = this.participantRepository.create({
      userId,
      fishingDateId: saved.id,
      isConfirmed: true,
    });
    await this.participantRepository.save(participant);

    const groupResult = await this.imService.createGroup(userId, dto.title, [userId]);
    saved.groupId = groupResult.groupId;
    return saved;
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const [items, total] = await this.dateRepository.findAndCount({
      where,
      relations: ['creator'],
      order: { startTime: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findById(id: string, userId?: string) {
    const date = await this.dateRepository.findOne({
      where: { id },
      relations: ['creator', 'participants', 'participants.user'],
    });
    if (!date) throw new NotFoundException('约钓活动不存在');

    if (userId) {
      const participant = date.participants?.find(p => p.userId === userId);
      (date as any).isJoined = !!participant;
      (date as any).isConfirmed = participant?.isConfirmed || false;
    }
    return date;
  }

  async join(userId: string, fishingDateId: string) {
    const date = await this.dateRepository.findOne({ where: { id: fishingDateId } });
    if (!date) throw new NotFoundException('约钓活动不存在');
    if (date.status === FishingDateStatus.CLOSED || date.status === FishingDateStatus.CANCELLED) {
      throw new BadRequestException('该活动已结束');
    }
    if (date.status === FishingDateStatus.FULL) {
      throw new BadRequestException('人数已满');
    }
    if (date.currentParticipants >= date.maxParticipants) {
      throw new BadRequestException('人数已满');
    }

    const existing = await this.participantRepository.findOne({
      where: { userId, fishingDateId },
    });
    if (existing) throw new BadRequestException('已报名');

    const participant = this.participantRepository.create({
      userId,
      fishingDateId,
      isConfirmed: false,
    });
    await this.participantRepository.save(participant);
    await this.dateRepository.increment({ id: fishingDateId }, 'currentParticipants', 1);

    const updated = await this.dateRepository.findOne({ where: { id: fishingDateId } });
    if (updated && updated.currentParticipants >= updated.maxParticipants) {
      await this.dateRepository.update(fishingDateId, { status: FishingDateStatus.FULL });
    }

    return { message: '报名成功' };
  }

  async cancelJoin(userId: string, fishingDateId: string) {
    const date = await this.dateRepository.findOne({ where: { id: fishingDateId } });
    if (!date) throw new NotFoundException('约钓活动不存在');
    if (date.creatorId === userId) {
      throw new BadRequestException('创建者不能取消报名，请关闭活动');
    }

    const participant = await this.participantRepository.findOne({
      where: { userId, fishingDateId },
    });
    if (!participant) throw new NotFoundException('未报名');

    await this.participantRepository.remove(participant);
    await this.dateRepository.decrement({ id: fishingDateId }, 'currentParticipants', 1);
    await this.dateRepository.update(fishingDateId, { status: FishingDateStatus.OPEN });
    return { message: '已取消报名' };
  }

  async confirmParticipant(reviewerId: string, fishingDateId: string, participantId: string) {
    const date = await this.dateRepository.findOne({ where: { id: fishingDateId } });
    if (!date) throw new NotFoundException('约钓活动不存在');
    if (date.creatorId !== reviewerId) throw new ForbiddenException('只有创建者可以确认');

    const participant = await this.participantRepository.findOne({
      where: { id: participantId, fishingDateId },
    });
    if (!participant) throw new NotFoundException('参与者不存在');

    participant.isConfirmed = true;
    await this.participantRepository.save(participant);
    return { message: '已确认' };
  }

  async close(userId: string, fishingDateId: string) {
    const date = await this.dateRepository.findOne({ where: { id: fishingDateId } });
    if (!date) throw new NotFoundException('约钓活动不存在');
    if (date.creatorId !== userId) throw new ForbiddenException('只有创建者可以关闭');

    await this.dateRepository.update(fishingDateId, { status: FishingDateStatus.CLOSED });
    return { message: '活动已结束' };
  }

  async getMyEvents(userId: string, page = 1, limit = 20) {
    const participants = await this.participantRepository.find({
      where: { userId },
      relations: ['fishingDate', 'fishingDate.creator'],
      skip: (page - 1) * limit,
      take: limit,
    });
    const items = participants.map(p => ({
      ...p.fishingDate,
      isCreator: p.fishingDate.creatorId === userId,
      isConfirmed: p.isConfirmed,
    }));
    return { items, total: items.length, page, limit };
  }

  async getParticipants(fishingDateId: string, page = 1, limit = 20) {
    const [items, total] = await this.participantRepository.findAndCount({
      where: { fishingDateId },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }
}