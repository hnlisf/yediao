-- 野钓App 演示数据种子脚本
-- 用途：填充完整演示数据，用于项目路演
-- 运行：psql postgresql://yediao:yediao123@localhost:5432/yediao -f database/demo_seed.sql

BEGIN;

-- ══════════════════════════════════════════════════════════════
-- 清理旧测试数据
-- ══════════════════════════════════════════════════════════════

DELETE FROM event_participants;
DELETE FROM post_likes;
DELETE FROM post_comments;
DELETE FROM spot_reviews;
DELETE FROM spot_favorites;
DELETE FROM fish_recognitions;
DELETE FROM points_records;
DELETE FROM user_points;
DELETE FROM fishing_events;
DELETE FROM posts;
DELETE FROM spots;
DELETE FROM users;

-- 重置序列，使新插入的记录从ID=1开始
SELECT setval('users_id_seq', 1, false);
SELECT setval('spots_id_seq', 1, false);
SELECT setval('posts_id_seq', 1, false);
SELECT setval('fishing_events_id_seq', 1, false);
SELECT setval('event_participants_id_seq', 1, false);
SELECT setval('post_comments_id_seq', 1, false);
SELECT setval('post_likes_id_seq', 1, false);
SELECT setval('spot_favorites_id_seq', 1, false);
SELECT setval('spot_reviews_id_seq', 1, false);
SELECT setval('fish_recognitions_id_seq', 1, false);

-- ══════════════════════════════════════════════════════════════
-- 1. 用户数据（7个真实感用户）
-- ══════════════════════════════════════════════════════════════

INSERT INTO users (phone, nickname, avatar_url, fishing_age, frequent_spot, skilled_fish, privacy_settings, oauth_provider) VALUES
('13800000001', '老钓手老王', 'https://api.dicebear.com/7.x/avataaars/svg?seed=FishingMaster',
 15, ARRAY['千岛湖', '钱塘江', '西湖'], ARRAY['草鱼', '青鱼', '鳜鱼'],
 '{"show_fishing_age":true,"show_frequent_spot":true,"show_skilled_fish":true}'::jsonb, 'wechat'),

('13800000002', '湖边小李', 'https://api.dicebear.com/7.x/avataaars/svg?seed=OldAngler',
 8, ARRAY['千岛湖', '太湖'], ARRAY['鲢鱼', '鳙鱼', '翘嘴'],
 '{"show_fishing_age":true,"show_frequent_spot":true,"show_skilled_fish":true}'::jsonb, 'wechat'),

('13800000003', '野钓达人', 'https://api.dicebear.com/7.x/avataaars/svg?seed=LakeHunter',
 12, ARRAY['钱塘江', '富春江'], ARRAY['鲤鱼', '鲫鱼', '黄鳝'],
 '{"show_fishing_age":true,"show_frequent_spot":true,"show_skilled_fish":true}'::jsonb, 'alipay'),

('13800000004', '溪流钓手', 'https://api.dicebear.com/7.x/avataaars/svg?seed=RiverRookie',
 5, ARRAY['天目溪', '楠溪江'], ARRAY['虹鳟', '金鳟', '马口鱼'],
 '{"show_fishing_age":false,"show_frequent_spot":true,"show_skilled_fish":true}'::jsonb, 'wechat'),

('13800000005', '水库专业户', 'https://api.dicebear.com/7.x/avataaars/svg?seed=TroutKing',
 20, ARRAY['新安江水库', '富春江水库'], ARRAY['青鱼', '草鱼', '鳜鱼', '鳊鱼'],
 '{"show_fishing_age":true,"show_frequent_spot":true,"show_skilled_fish":true}'::jsonb, 'wechat'),

('13800000006', '鲈鱼猎人', 'https://api.dicebear.com/7.x/avataaars/svg?seed=CatfishJoe',
 10, ARRAY['钱塘江入海口', '舟山海域'], ARRAY['鲈鱼', '黑鱼', '海鳗'],
 '{"show_fishing_age":true,"show_frequent_spot":true,"show_skilled_fish":true}'::jsonb, 'wechat'),

('13800000007', '新手钓鱼侠', 'https://api.dicebear.com/7.x/avataaars/svg?seed=BassFan',
 1, ARRAY['西湖', '京杭大运河'], ARRAY['鲫鱼', '小鲤鱼'],
 '{"show_fishing_age":true,"show_frequent_spot":true,"show_skilled_fish":true}'::jsonb, 'wechat');

-- ══════════════════════════════════════════════════════════════
-- 2. 钓点数据（8个精选钓点）
-- ══════════════════════════════════════════════════════════════

INSERT INTO spots (name, description, latitude, longitude,
                   fish_species, water_depth, water_temp,
                   bait, fishing_methods, photos, creator_id, created_at) VALUES
('千岛湖中心湖区',
 '千岛湖是国家5A级风景区，水质清澈，渔业资源丰富。湖中鱼类众多，是钓鳜鱼和鲢鳙的绝佳地点。每年4-10月是最佳钓鱼季节。',
 29.6052, 119.0077,
 ARRAY['鳜鱼', '鲢鱼', '鳙鱼', '翘嘴', '鳊鱼'], '30m', '22℃',
 ARRAY['嫩草', '玉米', '商品饵', '小鱼'],
 ARRAY['手竿', '海竿', '路亚', '浮钓'],
 ARRAY['https://images.unsplash.com/photo-1502786129293-79981df4e689?w=800&q=80',
        'https://images.unsplash.com/photo-1468413253725-0d5181091126?w=800&q=80',
        'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80'],
 1, NOW() - INTERVAL '2 hours'),

('钱塘江杭州段',
 '钱塘江杭州河段交通便利，鱼类资源丰富，适合初学者练习。江边有专门的钓鱼区域，设施完善。',
 30.265, 120.152,
 ARRAY['鲤鱼', '鲫鱼', '鲢鱼', '鳙鱼', '黄鳝'], '8m', '20℃',
 ARRAY['蚯蚓', '玉米', '商品饵', '红虫'],
 ARRAY['手竿', '海竿', '传统钓'],
 ARRAY['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'],
 3, NOW() - INTERVAL '5 hours'),

('新安江水库',
 '新安江水库是华东地区著名的大型水库，水质清澈，库湾众多。青鱼和草鱼体型硕大，是挑战大物的绝佳场所。',
 29.485, 118.875,
 ARRAY['青鱼', '草鱼', '鳜鱼', '鳊鱼', '翘嘴'], '50m', '18℃',
 ARRAY['螺蛳', '蚌肉', '嫩草', '玉米'],
 ARRAY['手竿', '抛竿', '路亚'],
 ARRAY['https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80',
        'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'],
 5, NOW() - INTERVAL '1 day'),

('天目溪上游',
 '天目溪上游水质清澈，溪水冰凉，是养殖虹鳟和金鳟的绝佳环境。这里也是马口鱼的家园，飞蝇钓爱好者的圣地。',
 30.347, 119.453,
 ARRAY['虹鳟', '金鳟', '马口鱼', '石斑鱼'], '1.5m', '14℃',
 ARRAY['飞蝇饵', '蚯蚓', '人工蝇'],
 ARRAY['飞蝇钓', '路亚', '手竿'],
 ARRAY['https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800&q=80'],
 4, NOW() - INTERVAL '3 days'),

('西湖苏堤',
 '西湖苏堤是杭州最经典的野钓场所之一。环境优美，鱼种丰富，适合各个水平的钓鱼爱好者。',
 30.242, 120.135,
 ARRAY['鲫鱼', '鲤鱼', '鳊鱼', '草鱼'], '2.5m', '22℃',
 ARRAY['蚯蚓', '红虫', '商品饵', '玉米'],
 ARRAY['手竿', '传统钓'],
 ARRAY['https://images.unsplash.com/photo-1547027072-332f0a7b87be?w=800&q=80',
        'https://images.unsplash.com/photo-1502786129293-79981df4e689?w=800&q=80'],
 2, NOW() - INTERVAL '4 hours'),

('富春江七里泷',
 '富春江七里泷是富春江最美的河段之一，两岸青山绿水，是钓鳜鱼和翘嘴的绝佳场所。',
 29.823, 119.543,
 ARRAY['鳜鱼', '翘嘴', '鲤鱼', '青鱼', '黄鳝'], '15m', '21℃',
 ARRAY['小鱼', '泥鳅', '玉米', '嫩草'],
 ARRAY['手竿', '海竿', '路亚'],
 ARRAY['https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80',
        'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&q=80'],
 3, NOW() - INTERVAL '12 hours'),

('太湖滨湖湿地',
 '太湖滨湖湿地公园是苏州重要的生态保护区，也是钓鱼爱好者的乐园。太湖白鱼是当地的特色鱼种。',
 31.157, 120.258,
 ARRAY['太湖白鱼', '鲢鱼', '鳙鱼', '鲤鱼', '鳜鱼'], '3m', '23℃',
 ARRAY['商品饵', '玉米', '嫩草', '螺丝'],
 ARRAY['手竿', '抛竿', '浮钓'],
 ARRAY['https://images.unsplash.com/photo-1468413253725-0d5181091126?w=800&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'],
 2, NOW() - INTERVAL '8 hours'),

('楠溪江源头',
 '楠溪江源头水质清澈见底，被誉为"天下第一水"。这里是马口鱼和石斑鱼的家园，是飞蝇钓的天堂。',
 28.217, 120.713,
 ARRAY['马口鱼', '石斑鱼', '虹鳟', '石爬鮀'], '0.8m', '16℃',
 ARRAY['飞蝇饵', '小虫', '人工蝇'],
 ARRAY['飞蝇钓', '路亚微饵'],
 ARRAY['https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800&q=80',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80'],
 4, NOW() - INTERVAL '2 days');

-- ══════════════════════════════════════════════════════════════
-- 3. 动态（社区帖子）
-- ══════════════════════════════════════════════════════════════

INSERT INTO posts (user_id, content, images, likes_count, comments_count, created_at) VALUES
(1,
 '🎣 今天在千岛湖钓获大鳜鱼！8斤2两，用的是活饵钓法。这条鳜鱼力气超大，遛了快10分钟才上岸。太激动了！',
 ARRAY['https://images.unsplash.com/photo-1502786129293-79981df4e689?w=600&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80'],
 128, 34, NOW() - INTERVAL '2 hours'),

(2,
 '🌅 周末清晨的钱塘江日出钓鱼，太美了！虽然鱼不大，但心情舒畅。钓了十几条鲫鱼，够回家熬汤了。',
 ARRAY['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80',
        'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=600&q=80'],
 89, 21, NOW() - INTERVAL '6 hours'),

(5,
 '💪 终于圆梦！32斤大青鱼！在新安江水库蹲守了3天，打了50斤螺蛳窝，终于等来了这一口。感谢老婆支持我钓鱼，下次还来！',
 ARRAY['https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=600&q=80',
        'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=600&q=80'],
 256, 67, NOW() - INTERVAL '1 day'),

(4,
 '🏔️ 天目溪飞蝇钓初体验，虹鳟太漂亮了！第一次用飞蝇竿，虽然只钓了两条，但已经深深中毒。这项运动太有魅力了！',
 ARRAY['https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600&q=80'],
 76, 18, NOW() - INTERVAL '3 days'),

(3,
 '🏞️ 分享一个野钓好地方——富春江七里泷！鳜鱼和翘嘴都很好钓，两岸风景如画，比千岛湖人少多了。强烈推荐！',
 ARRAY['https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=80',
        'https://images.unsplash.com/photo-1502786129293-79981df4e689?w=600&q=80'],
 145, 38, NOW() - INTERVAL '5 days'),

(6,
 '🦈 海钓初体验！今天在舟山海域钓到了大鲈鱼，船长说这条有12斤！海水湛蓝，海风凉爽，太刺激了。下次还要来！',
 ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
        'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80',
        'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=600&q=80'],
 198, 45, NOW() - INTERVAL '7 days'),

(7,
 '🎉 新手报到！第一次在西湖苏堤钓鱼，上了3条小鲫鱼，虽然不多但超级开心！感谢旁边老钓友的耐心指导。钓鱼真的很有趣！',
 ARRAY['https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=600&q=80'],
 56, 22, NOW() - INTERVAL '4 hours'),

(1,
 '📚 分享一个春季钓鱼技巧：早春钓鲫鱼，用红虫拉饵效果好，钓位选择向阳浅滩。鱼口轻，建议用细线小钩。钓友们春天快乐！',
 ARRAY[]::text[],
 112, 29, NOW() - INTERVAL '2 days'),

(2,
 '🌊 太湖滨湖湿地一日游，钓鱼加农家乐，完美的一天！太湖白鱼真的很好吃，农家乐老板做的糖醋白鱼绝了。',
 ARRAY['https://images.unsplash.com/photo-1468413253725-0d5181091126?w=600&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'],
 167, 41, NOW() - INTERVAL '10 days'),

(4,
 '🐟 楠溪江马口鱼群太疯狂了！一杆下去就是一口，飞蝇钓简直停不下来。水清得像矿泉水，鱼美得像画。强烈推荐溪流钓爱好者来！',
 ARRAY['https://images.unsplash.com/photo-1502786129293-79981df4e689?w=600&q=80',
        'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80'],
 134, 35, NOW() - INTERVAL '6 days');

-- ══════════════════════════════════════════════════════════════
-- 4. 动态评论
-- ══════════════════════════════════════════════════════════════

INSERT INTO post_comments (post_id, user_id, content, created_at) VALUES
(1, 2, '太厉害了！8斤的鳜鱼可不多见，恭喜恭喜！', NOW() - INTERVAL '1 hour'),
(1, 3, '用什么竿子钓的？求推荐装备', NOW() - INTERVAL '1.5 hours'),
(1, 5, '老王果然是老手，这鳜鱼品相真好！', NOW() - INTERVAL '2 hours'),
(3, 1, '32斤！我的天，太震撼了！', NOW() - INTERVAL '20 hours'),
(3, 4, '用什么打窝的？我也想去试试', NOW() - INTERVAL '18 hours'),
(3, 2, '这才是真正的钓鱼人！向大佬学习', NOW() - INTERVAL '22 hours'),
(4, 1, '飞蝇钓确实容易中毒，我也在学', NOW() - INTERVAL '2 days'),
(5, 7, '周末准备去，谢谢推荐！', NOW() - INTERVAL '4 days'),
(6, 3, '海钓就是刺激！鲈鱼味道也很鲜美', NOW() - INTERVAL '6 days'),
(7, 2, '欢迎新钓友！钓鱼真的很上瘾，哈哈', NOW() - INTERVAL '3 hours'),
(7, 1, '苏堤确实是新手练手的好地方，加油！', NOW() - INTERVAL '3.5 hours'),
(8, 4, '实用的技巧，收藏了！', NOW() - INTERVAL '1 day'),
(8, 7, '红虫拉饵真的好用吗？求详细教程', NOW() - INTERVAL '20 hours'),
(2, 1, '鲫鱼熬汤确实鲜美，钓到了就是赚到！', NOW() - INTERVAL '5 hours'),
(5, 6, '富春江我也去过，七里泷那段确实漂亮', NOW() - INTERVAL '4 days');

-- ══════════════════════════════════════════════════════════════
-- 5. 动态点赞
-- ══════════════════════════════════════════════════════════════

INSERT INTO post_likes (post_id, user_id) VALUES
-- Post 1 likes
(1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
-- Post 2 likes
(2, 1), (2, 3), (2, 4),
-- Post 3 likes
(3, 1), (3, 2), (3, 3), (3, 4), (3, 6), (3, 7),
-- Post 4 likes
(4, 1), (4, 2), (4, 5),
-- Post 5 likes
(5, 1), (5, 4), (5, 6), (5, 7),
-- Post 6 likes
(6, 1), (6, 2), (6, 3), (6, 4),
-- Post 7 likes
(7, 1), (7, 2),
-- Post 8 likes
(8, 3), (8, 4), (8, 5),
-- Post 10 likes
(10, 1), (10, 2), (10, 5);

-- ══════════════════════════════════════════════════════════════
-- 6. 约钓活动（fishing_events）
-- ══════════════════════════════════════════════════════════════

INSERT INTO fishing_events (creator_id, spot_id, title, description, start_time, end_time, max_participants, current_participants, status, created_at) VALUES
(1, 1, '🎣 千岛湖周末鳜鱼趴',
 '周末去千岛湖钓鳜鱼，用活饵钓法，希望大家都钓到大鱼！新手老手都可以，装备自带，中午农家乐聚餐。',
 NOW() + INTERVAL '5 days' + INTERVAL '6 hours',
 NOW() + INTERVAL '5 days' + INTERVAL '17 hours',
 8, 3, 'open', NOW() - INTERVAL '2 days'),

(2, 2, '🌅 钱塘江晨钓五人组',
 '每天早上5点集合，钓到上午10点收竿。主要是钓鲫鱼和鲤鱼，适合新手入门。想一起锻炼身体的钓友来吧！',
 NOW() + INTERVAL '2 days' + INTERVAL '5 hours',
 NOW() + INTERVAL '2 days' + INTERVAL '10 hours',
 5, 4, 'open', NOW() - INTERVAL '1 day'),

(5, 3, '💪 新安江水库巨物挑战',
 '挑战30斤以上大青鱼！有经验的钓友来，新手不建议。大物需要耐心，可能需要连续作战2-3天。带足装备和干粮！',
 NOW() + INTERVAL '10 days' + INTERVAL '6 hours',
 NOW() + INTERVAL '12 days' + INTERVAL '18 hours',
 4, 2, 'open', NOW() - INTERVAL '5 days'),

(4, 4, '🏔️ 天目溪飞蝇钓入门之旅',
 '组织一次飞蝇钓体验活动，溪流飞蝇钓入门教学，钓虹鳟和金鳟。有装备的带装备，没装备的我这边可以借。',
 NOW() + INTERVAL '7 days' + INTERVAL '8 hours',
 NOW() + INTERVAL '7 days' + INTERVAL '16 hours',
 6, 5, 'full', NOW() - INTERVAL '3 days'),

(3, 6, '🏞️ 富春江夜钓鳜鱼',
 '夜钓鳜鱼，用小泥鳅做饵，体验鳜鱼的凶猛中钩。夜晚的富春江别有风味，记得带手电筒和驱蚊液。',
 NOW() + INTERVAL '3 days' + INTERVAL '19 hours',
 NOW() + INTERVAL '4 days' + INTERVAL '2 hours',
 6, 2, 'open', NOW() - INTERVAL '1 day'),

(2, 7, '🌊 太湖农家乐钓鱼休闲游',
 '带上家人来太湖农家乐，钓鱼、吃鱼、赏太湖美景。钓到的鱼中午现做，全鱼宴走起！适合家庭参与。',
 NOW() + INTERVAL '14 days' + INTERVAL '8 hours',
 NOW() + INTERVAL '14 days' + INTERVAL '18 hours',
 10, 7, 'open', NOW() - INTERVAL '4 days'),

(6, 5, '🐟 西湖苏堤新手钓鱼体验',
 '专门针对新手的钓鱼体验活动，手把手教绑钩、调漂、开饵。钓到鱼大家一起开心，钓不到也有老钓友分享渔获！',
 NOW() + INTERVAL '8 days' + INTERVAL '7 hours',
 NOW() + INTERVAL '8 days' + INTERVAL '11 hours',
 8, 6, 'open', NOW() - INTERVAL '6 hours'),

(5, 3, '🎣 上周新安江大物活动回顾',
 '分享上周新安江水库的大物挑战活动，我们成功钓获了一条28斤的青鱼！感谢各位参与，下次活动见！',
 NOW() - INTERVAL '3 days' + INTERVAL '6 hours',
 NOW() - INTERVAL '3 days' + INTERVAL '18 hours',
 5, 5, 'closed', NOW() - INTERVAL '10 days'),

(1, 1, '🌅 千岛湖春季钓鱼赛',
 '上个月举办的千岛湖春季钓鱼比赛，感谢各位钓友参与！最终老钓手队获得冠军，钓获总重58斤。',
 NOW() - INTERVAL '14 days' + INTERVAL '6 hours',
 NOW() - INTERVAL '14 days' + INTERVAL '16 hours',
 12, 12, 'closed', NOW() - INTERVAL '21 days');

-- ══════════════════════════════════════════════════════════════
-- 7. 活动参与（event_participants）
-- ══════════════════════════════════════════════════════════════

INSERT INTO event_participants (event_id, user_id, status, created_at) VALUES
-- Event 1 (千岛湖)
(1, 2, 'joined', NOW() - INTERVAL '1 day'),
(1, 3, 'joined', NOW() - INTERVAL '1.5 days'),
-- Event 2 (钱塘江)
(2, 1, 'joined', NOW() - INTERVAL '18 hours'),
(2, 7, 'joined', NOW() - INTERVAL '20 hours'),
(2, 4, 'joined', NOW() - INTERVAL '12 hours'),
-- Event 3 (新安江)
(3, 1, 'joined', NOW() - INTERVAL '4 days'),
-- Event 4 (天目溪，满员)
(4, 1, 'joined', NOW() - INTERVAL '2 days'),
(4, 2, 'joined', NOW() - INTERVAL '2.5 days'),
(4, 5, 'joined', NOW() - INTERVAL '3 days'),
(4, 6, 'joined', NOW() - INTERVAL '2.8 days'),
-- Event 5 (富春江)
(5, 5, 'joined', NOW() - INTERVAL '20 hours'),
-- Event 6 (太湖)
(6, 1, 'joined', NOW() - INTERVAL '3 days'),
(6, 3, 'joined', NOW() - INTERVAL '3.5 days'),
(6, 4, 'joined', NOW() - INTERVAL '2 days'),
-- Event 7 (西湖)
(7, 1, 'joined', NOW() - INTERVAL '5 hours'),
(7, 4, 'joined', NOW() - INTERVAL '4 hours');

-- ══════════════════════════════════════════════════════════════
-- 8. 钓点收藏（spot_favorites）
-- ══════════════════════════════════════════════════════════════

INSERT INTO spot_favorites (user_id, spot_id) VALUES
(2, 1), (3, 1), (4, 1),
(1, 2), (4, 2),
(1, 3), (2, 3),
(1, 4),
(7, 5), (3, 5),
(1, 6), (5, 6),
(2, 7),
(4, 8);

-- ══════════════════════════════════════════════════════════════
-- 9. 钓点评论（spot_reviews）
-- ══════════════════════════════════════════════════════════════

INSERT INTO spot_reviews (spot_id, user_id, rating, content, created_at) VALUES
(1, 1, 5, '千岛湖水质真的很棒！上次钓了条8斤的鳜鱼，太过瘾了。推荐用活饵钓鳜鱼，效果最佳。', NOW() - INTERVAL '3 days'),
(1, 2, 5, '周末去的，人不算多。鲢鳙很好钓，半天上了20多条。建议早上5点就到，占个好位置。', NOW() - INTERVAL '5 days'),
(1, 3, 4, '风景绝佳，鱼也大。就是停车有点贵。建议停景区外步行进去。', NOW() - INTERVAL '7 days'),
(2, 3, 4, '交通很方便，地铁就能到。鲤鱼特别多，新手练习的好地方。记得带驱蚊水！', NOW() - INTERVAL '2 days'),
(2, 4, 3, '鱼不算大，但胜在方便。涨潮时鱼口更好。', NOW() - INTERVAL '4 days'),
(3, 5, 5, '大物天堂！上周上了条32斤的青鱼，圆了我的巨物梦。用了15斤的螺蛳打窝，等了3天才发窝。', NOW() - INTERVAL '1 day'),
(3, 1, 5, '水质清澈，环境优美。青鱼和草鱼都有，适合练手。建议住农家乐，可以钓两天。', NOW() - INTERVAL '6 days'),
(4, 4, 5, '飞蝇钓的天堂！虹鳟和金鳟都很漂亮，钓完拍了超多照片。水很凉，夏天来最舒服。', NOW() - INTERVAL '10 days'),
(5, 2, 4, '苏堤钓鱼很有意境，钓着鱼还能欣赏西湖美景。鲫鱼很多，适合休闲。', NOW() - INTERVAL '1 day'),
(5, 7, 4, '第一次钓鱼就是在这里，上了条小鲫鱼超级开心！环境很好，管理也规范。', NOW() - INTERVAL '2 days'),
(6, 3, 5, '富春江的鳜鱼真是名不虚传！用小泥鳅做饵，一下午上了6条。两岸风景如画。', NOW() - INTERVAL '8 days'),
(7, 2, 4, '太湖白鱼真的很鲜美！在这里农家乐吃了一顿全鱼宴，太棒了。钓了条5斤的白鱼。', NOW() - INTERVAL '3 days'),
(8, 4, 5, '楠溪江的水清得可以直饮！马口鱼颜色超美，飞蝇钓超级有成就感。这里真的是钓鱼人的圣地。', NOW() - INTERVAL '5 days');

-- ══════════════════════════════════════════════════════════════
-- 10. AI识鱼记录
-- ══════════════════════════════════════════════════════════════

INSERT INTO fish_recognitions (user_id, image_url, fish_name, scientific_name, habits, protection_level, is_protected, confidence, created_at) VALUES
(1, 'https://images.unsplash.com/photo-1502786129293-79981df4e689?w=600&q=80',
 '鳜鱼', 'Siniperca chuatsi',
 '肉食性，伏击捕食，主要在水底岩石和水草区活动',
 'common', false, 0.96, NOW() - INTERVAL '1 day'),

(2, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
 '草鱼', 'Ctenopharyngodon idella',
 '草食性，喜静怕惊，主要在水草丰富区活动',
 'common', false, 0.93, NOW() - INTERVAL '2 days'),

(5, 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=600&q=80',
 '青鱼', 'Mylopharyngodon piceus',
 '肉食性，以螺蛳蚌蚬为主，力大耐溜',
 'common', false, 0.98, NOW() - INTERVAL '3 days'),

(4, 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600&q=80',
 '虹鳟', 'Oncorhynchus mykiss',
 '冷水鱼，主要在水体中下层活动，对水质要求高',
 'common', false, 0.91, NOW() - INTERVAL '5 days'),

(3, 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=600&q=80',
 '黄鳝', 'Monopterus albus',
 '肉食性小鱼虾昆虫幼虫，夜行性，黄鳝夜钓效果更好',
 'common', false, 0.89, NOW() - INTERVAL '7 days');

COMMIT;

-- ══════════════════════════════════════════════════════════════
-- 验证数据
-- ══════════════════════════════════════════════════════════════

SELECT '用户' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT '钓点', COUNT(*) FROM spots
UNION ALL SELECT '动态', COUNT(*) FROM posts
UNION ALL SELECT '约钓活动', COUNT(*) FROM fishing_events
UNION ALL SELECT '活动参与', COUNT(*) FROM event_participants
UNION ALL SELECT '动态评论', COUNT(*) FROM post_comments
UNION ALL SELECT '动态点赞', COUNT(*) FROM post_likes
UNION ALL SELECT '钓点收藏', COUNT(*) FROM spot_favorites
UNION ALL SELECT '钓点评论', COUNT(*) FROM spot_reviews
UNION ALL SELECT 'AI识鱼', COUNT(*) FROM fish_recognitions;
