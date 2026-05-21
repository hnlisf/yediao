import { Injectable } from '@nestjs/common';

@Injectable()
export class FishService {
  async recognize(file: any, userId: number) {
    // MVP阶段：模拟百度EasyDL识别结果
    const mockResults = [
      { fish_name: '鲫鱼', scientific_name: 'Carassius auratus', habits: '杂食性，喜群居，适应性强', protection_level: '无保护', is_protected: false, confidence: 0.95 },
      { fish_name: '鲤鱼', scientific_name: 'Cyprinus carpio', habits: '底栖杂食，喜缓流水域', protection_level: '无保护', is_protected: false, confidence: 0.88 },
      { fish_name: '草鱼', scientific_name: 'Ctenopharyngodon idella', habits: '草食性，中下层水域', protection_level: '无保护', is_protected: false, confidence: 0.82 },
      { fish_name: '中华鲟', scientific_name: 'Acipenser sinensis', habits: '洄游性鱼类，国家一级保护动物', protection_level: '一级保护', is_protected: true, confidence: 0.75 },
    ];
    const result = mockResults[Math.floor(Math.random() * mockResults.length)];
    return {
      ...result,
      warning: result.is_protected ? '⚠️ 这是保护鱼类，请立即放生！' : null,
      image_url: 'https://example.com/uploaded.jpg',
    };
  }

  async getHistory(userId: number) {
    return [
      { id: 1, fish_name: '鲫鱼', confidence: 0.95, created_at: new Date().toISOString() },
      { id: 2, fish_name: '鲤鱼', confidence: 0.88, created_at: new Date().toISOString() },
    ];
  }

  async getDetail(id: number) {
    return { id, fish_name: '鲫鱼', scientific_name: 'Carassius auratus', habits: '杂食性', protection_level: '无保护' };
  }
}
