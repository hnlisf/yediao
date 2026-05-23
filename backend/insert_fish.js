const { Client } = require('pg');

const fishData = [
  ['草鱼','Ctenopharyngodon idella','鲤科','草鱼属', JSON.stringify(['草鲩','白鲩']),'淡水湖泊水库河流近岸','草食性水草为主','中下层','4-10月','none','LC','高', JSON.stringify(['红烧','糖醋','清蒸']),'尿酸高者少食','嫩玉米芦苇心商品饵','底钓30cm子线','打大窝守钓30分钟发窝','鲤鱼青鱼','https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400'],
  ['青鱼','Mylopharyngodon piceus','鲤科','青鱼属', JSON.stringify(['青鲩','螺蛳青']),'淡水水库湖泊深水区','肉食性螺蛳蚌类虾','底层','5-9月','none','LC','高', JSON.stringify(['红烧','砂锅']),'尿酸高者少食','螺蛳肉蚌肉虾仁','底铅坠躺底50cm子线','守大鱼需要耐心','草鱼鲤鱼','https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400'],
  ['鲤鱼','Cyprinus carpio','鲤科','鲤属', JSON.stringify(['鲤子','红鱼']),'淡水各水域静水区','杂食性蠕虫昆虫植物','底层','全年可钓春秋最佳','none','VU','高', JSON.stringify(['红烧','糖醋']),'慢性病慎食','蚯蚓红虫商品饵玉米','台钓调四钓二30cm子线','抛竿要轻保持安静','草鱼青鱼','https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=400'],
  ['鲫鱼','Carassius auratus','鲤科','鲫属', JSON.stringify(['鲫瓜','寒鱼']),'淡水各水域广温耐寒','杂食性浮游生物水草昆虫','底层','全年可钓春季最佳','none','LC','高', JSON.stringify(['鲫鱼汤','红烧']),'过敏体质慎食','蚯蚓红虫商品拉饵麦粒','台钓拉饵调三钓一25cm子线','鲫鱼是入门鱼连竿乐趣多','鳊鱼草鱼','https://images.unsplash.com/photo-1461685265827-c4fd47f6942d?w=400'],
  ['翘嘴','Culter alburnus','鲤科','红铂属', JSON.stringify(['红铂','大白鱼']),'大江大湖中上层水域','肉食性小鱼小虾','中上层','5-10月','none','LC','高', JSON.stringify(['清蒸','干烧']),'过敏体质少食','小活鱼泥鳅米诺亮片','路亚枪柄竿纺车轮中快收饵','搜索全水层匀速收饵是关键','蒙古红铂红鳍红铂','https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400'],
  ['鳜鱼','Siniperca chuatsi','鮨科','鳜属', JSON.stringify(['桂花鱼','桂鱼']),'江河湖泊乱石水草区','肉食性小鱼小虾','底层','4-10月','none','LC','很高', JSON.stringify(['清蒸','松鼠桂鱼']),'过敏体质少食','活泥鳅小活鱼软虫','路亚慢收停顿要大咬口要放','守大鱼经典目标','石扁头斑鳜','https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?w=400'],
  ['黄鳝','Monopterus albus','合鳃鱼科','黄鳝属', JSON.stringify(['鳝鱼','长鱼']),'稻田池塘沟渠泥洞中','肉食性小鱼蛙类昆虫','底层','5-9月','none','LC','高', JSON.stringify(['爆炒鳝丝','红烧黄鳝']),'热性体质少食','大蚯蚓小虾猪肝条','寻洞作钓钩挂饵送入洞中','夜钓最佳白天要安静','泥鳅七星鱼','https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400'],
  ['黑鱼','Channa argus','鳢科','鳢属', JSON.stringify(['乌鱼','财鱼']),'淡水池塘沼泽稻田','肉食性捕食小鱼青蛙','中层','5-9月','none','LC','高', JSON.stringify(['水煮黑鱼','酸菜黑鱼']),'过敏体质少食','活泥鳅小鱼软虫米诺','路亚慢收突然加速诱发攻击','耐低氧可守水草丛','斑鳜月鳢','https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400'],
  ['鲶鱼','Silurus asotus','鲶科','鲶属', JSON.stringify(['土鲶','鲇鱼']),'淡水江河湖泊底层','肉食性小鱼腐肉','底层','全年可钓夏季最佳','none','LC','高', JSON.stringify(['鲶鱼炖豆腐','红烧鲶鱼']),'过敏体质少食','鸡肝猪肺蚯蚓小鱼','底钓躺底铅坠要重夜钓佳','夜行性天黑后黄金时段','大口鲶六须鲶','https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=400'],
  ['马口鱼','Opsariichthys bidens','鲤科','马口鱼属', JSON.stringify(['马口','溪哥']),'山涧溪流清澈水体','杂食性水生昆虫小鱼','中上层','4-8月','none','LC','中', JSON.stringify(['酥炸马口','香煎马口']),'一般无禁忌','小飞蝇亮片小型米诺','路亚快收逗引要勤','溪流钓乐趣多大小都有快感','宽鳍马口小金线鱼','https://images.unsplash.com/photo-1461685265827-c4fd47f6942d?w=400'],
];

(async () => {
  const c = new Client({ host: 'localhost', database: 'yediao', user: 'yediao', password: 'yediao123' });
  await c.connect();
  let inserted = 0;
  for (const d of fishData) {
    try {
      const r = await c.query(
        `INSERT INTO fish_species (chinese_name,scientific_name,family,genus,aliases,habitat,diet,water_layer,best_season,protection_level,iucn_status,edible_rating,cooking_methods,contraindications,bait_recommendation,rig_suggestion,tips,similar_species,image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT DO NOTHING RETURNING id`, d);
      if (r.rowCount > 0) inserted++;
    } catch(e) { console.error('Error inserting', d[0], e.message); }
  }
  const { rows } = await c.query('SELECT count(*) FROM fish_species');
  console.log('插入', inserted, '条，总计:', rows[0].count);
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
