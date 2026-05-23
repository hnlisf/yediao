import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('鱼类百科')
@Controller('fish-species')
export class FishSpeciesController {
  constructor(private dataSource: DataSource) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取鱼类百科列表' })
  async findAll(@Req() req: Request) {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const rows: any[] = await this.dataSource.query(
      `SELECT id, chinese_name as "chineseName", scientific_name as "scientificName",
              family, genus, habitat, diet, water_layer as "waterLayer",
              best_season as "bestSeason", protection_level as "protectionLevel",
              edible_rating as "edibleRating", tips, image_url as "imageUrl"
       FROM fish_species WHERE is_active = true ORDER BY id DESC LIMIT $1`,
      [limit],
    );
    return {
      items: rows.map((item) => ({
        id: item.id,
        name: item.chineseName,
        image_url: item.imageUrl,
        family: item.family,
        habitat: item.habitat,
        protection_level: item.protectionLevel,
        description: item.tips,
        scientific_name: item.scientificName,
        diet: item.diet,
        water_layer: item.waterLayer,
        best_season: item.bestSeason,
      })),
      total: rows.length,
    };
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: '搜索鱼类' })
  async search(@Req() req: Request) {
    const q = req.query.q ? String(req.query.q).trim() : '';
    if (!q) return { items: [] };
    const rows: any[] = await this.dataSource.query(
      `SELECT id, chinese_name as "chineseName", family, habitat,
              scientific_name as "scientificName", protection_level as "protectionLevel",
              tips, image_url as "imageUrl", diet, water_layer as "waterLayer",
              best_season as "bestSeason"
       FROM fish_species
       WHERE is_active = true AND (
         chinese_name ILIKE CONCAT('%', $1::text, '%')
         OR scientific_name ILIKE CONCAT('%', $1::text, '%')
         OR family ILIKE CONCAT('%', $1::text, '%')
         OR genus ILIKE CONCAT('%', $1::text, '%')
       )
       ORDER BY id DESC LIMIT 20`,
      [q],
    );
    return {
      items: rows.map((item) => ({
        id: item.id,
        name: item.chineseName,
        image_url: item.imageUrl,
        family: item.family,
        habitat: item.habitat,
        protection_level: item.protectionLevel,
        description: item.tips,
        scientific_name: item.scientificName,
        diet: item.diet,
        water_layer: item.waterLayer,
        best_season: item.bestSeason,
      })),
    };
  }
}
