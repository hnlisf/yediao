import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum ProtectionLevelEnum {
  NONE = 'none',
  LEVEL_2 = '二级',
  LEVEL_1 = '一级',
}

@Entity('fish_species')
export class FishSpecies {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, comment: '中文名' })
  @Index()
  chineseName: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '学名' })
  scientificName: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '科' })
  family: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '属' })
  genus: string;

  @Column({ type: 'simple-json', nullable: true, comment: '别名' })
  aliases: string[];

  @Column({ type: 'text', nullable: true, comment: '栖息环境' })
  habitat: string;

  @Column({ type: 'text', nullable: true, comment: '食性' })
  diet: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '活动水层' })
  waterLayer: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '最佳钓季' })
  bestSeason: string;

  @Column({ type: 'enum', enum: ProtectionLevelEnum, default: ProtectionLevelEnum.NONE, comment: '保护级别' })
  protectionLevel: ProtectionLevelEnum;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'IUCN等级' })
  iucnStatus: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '肉质评价' })
  edibleRating: string;

  @Column({ type: 'simple-json', nullable: true, comment: '常见做法' })
  cookingMethods: string[];

  @Column({ type: 'text', nullable: true, comment: '食用禁忌' })
  contraindications: string;

  @Column({ type: 'text', nullable: true, comment: '适用饵料' })
  baitRecommendation: string;

  @Column({ type: 'text', nullable: true, comment: '钓组建议' })
  rigSuggestion: string;

  @Column({ type: 'text', nullable: true, comment: '技巧提示' })
  tips: string;

  @Column({ type: 'simple-json', nullable: true, comment: '易混淆鱼种' })
  similarSpecies: string[];

  @Column({ type: 'int', nullable: true, comment: 'AI模型标签ID' })
  modelLabelId: number;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '图片URL' })
  imageUrl: string;

  @Column({ default: true, comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
