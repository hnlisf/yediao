-- ============================================================
-- 野钓App MVP 数据库初始化脚本
-- PostgreSQL 15
-- ============================================================

-- 创建数据库（如不存在）
-- CREATE DATABASE yediao WITH ENCODING = 'UTF8';

-- 启用PostGIS扩展（用于地理坐标计算）
CREATE EXTENSION IF NOT EXISTS postgis;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    avatar VARCHAR(500),
    fishing_age INT DEFAULT 0,
    frequent_spot VARCHAR(200),
    skilled_fish TEXT,
    status VARCHAR(20) DEFAULT 'active',
    show_fishing_age BOOLEAN DEFAULT true,
    show_frequent_spot BOOLEAN DEFAULT true,
    show_skilled_fish BOOLEAN DEFAULT true,
    allow_push BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);

-- 钓点表
CREATE TABLE IF NOT EXISTS spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    type VARCHAR(50) DEFAULT 'river',
    address TEXT,
    fish_species TEXT,
    depth DECIMAL(5,2),
    water_temp DECIMAL(4,1),
    baits TEXT,
    fishing_methods TEXT,
    photos JSONB,
    favorite_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_spots_location ON spots USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);
CREATE INDEX idx_spots_type ON spots(type);
CREATE INDEX idx_spots_public ON spots(is_public);

-- 钓点收藏表
CREATE TABLE IF NOT EXISTS spot_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, spot_id)
);
CREATE INDEX idx_spot_favorites_user ON spot_favorites(user_id);
CREATE INDEX idx_spot_favorites_spot ON spot_favorites(spot_id);

-- 钓点评论表
CREATE TABLE IF NOT EXISTS spot_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_spot_comments_spot ON spot_comments(spot_id);
CREATE INDEX idx_spot_comments_created ON spot_comments(created_at DESC);

-- 动态表（社区）
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    images JSONB,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_public ON posts(is_public);

-- 动态点赞表
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);

-- 动态评论表
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_created ON post_comments(created_at DESC);

-- 约钓活动表
CREATE TABLE IF NOT EXISTS fishing_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    spot_id UUID REFERENCES spots(id) ON DELETE SET NULL,
    location_name VARCHAR(200),
    longitude DECIMAL(10,7),
    latitude DECIMAL(10,7),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    max_participants INT DEFAULT 2,
    current_participants INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_fishing_dates_start ON fishing_dates(start_time);
CREATE INDEX idx_fishing_dates_status ON fishing_dates(status);

-- 约钓参与者表
CREATE TABLE IF NOT EXISTS fishing_date_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fishing_date_id UUID NOT NULL REFERENCES fishing_dates(id) ON DELETE CASCADE,
    is_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fishing_date_id)
);
CREATE INDEX idx_fdp_date ON fishing_date_participants(fishing_date_id);
CREATE INDEX idx_fdp_user ON fishing_date_participants(user_id);

-- AI识别记录表
CREATE TABLE IF NOT EXISTS ai_recognitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    fish_name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(100),
    habits TEXT,
    protection_level VARCHAR(50) DEFAULT 'none',
    confidence DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ai_user ON ai_recognitions(user_id);
CREATE INDEX idx_ai_created ON ai_recognitions(created_at DESC);

-- 插入测试账号
INSERT INTO users (phone, nickname, fishing_age, frequent_spot, skilled_fish) VALUES
('13800138001', '老钓手', 15, '西湖', '鲫鱼,鲤鱼,草鱼'),
('13800138002', '新手小王', 1, '钱塘江', '鲫鱼');

-- 插入测试钓点
INSERT INTO spots (name, longitude, latitude, type, address, fish_species, depth, water_temp, baits, fishing_methods, is_public) VALUES
('西湖断桥钓点', 120.146, 30.244, 'lake', '杭州市西湖区断桥残雪附近', '鲫鱼,鲤鱼,草鱼', 2.5, 18.5, '红虫,蚯蚓,商品饵', '台钓,传统钓', true),
('钱塘江三桥钓点', 120.208, 30.208, 'river', '杭州市滨江区钱塘江三桥下游', '鲈鱼,鳜鱼,翘嘴', 5.0, 20.0, '路亚饵,活虾', '路亚,海竿', true),
('西溪湿地钓点', 120.063, 30.272, 'pond', '杭州市西湖区西溪湿地北门', '鲫鱼,白条,麦穗', 1.5, 19.0, '红虫,面饵', '台钓,传统钓', true);

-- 插入测试动态
INSERT INTO posts (user_id, content, images, is_public) VALUES
((SELECT id FROM users WHERE phone = '13800138001'), '今天在西湖钓了5斤鲫鱼，手感不错！', '["https://example.com/img1.jpg"]', true),
((SELECT id FROM users WHERE phone = '13800138002'), '新手求带，有人一起去钱塘江吗？', '[]', true);

-- 插入测试约钓
INSERT INTO fishing_dates (creator_id, title, description, spot_id, location_name, longitude, latitude, start_time, end_time, max_participants, current_participants, status) VALUES
((SELECT id FROM users WHERE phone = '13800138001'), '周末西湖约钓', '周六早上6点，一起钓鲫鱼', (SELECT id FROM spots WHERE name = '西湖断桥钓点'), '西湖断桥', 120.146, 30.244, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 6 hours', 4, 1, 'open');

