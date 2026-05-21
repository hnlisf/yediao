-- 野钓App MVP 数据库初始化脚本
-- PostgreSQL 15
-- 创建时间: 2026-05-16

-- 启用PostGIS扩展 (用于地理位置计算)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    nickname VARCHAR(50),
    avatar_url TEXT,
    fishing_age INT DEFAULT 0,
    frequent_spots TEXT[],
    skilled_fish TEXT[],
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);

-- 2. 钓位表
CREATE TABLE IF NOT EXISTS spots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    fish_species TEXT[],
    water_depth VARCHAR(50),
    water_temp VARCHAR(50),
    bait TEXT[],
    fishing_methods TEXT[],
    photos TEXT[],
    creator_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_spots_location ON spots USING GIST(location);
CREATE INDEX idx_spots_creator ON spots(creator_id);

-- 3. 钓位收藏表
CREATE TABLE IF NOT EXISTS spot_favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    spot_id INT REFERENCES spots(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, spot_id)
);

CREATE INDEX idx_favorites_user ON spot_favorites(user_id);
CREATE INDEX idx_favorites_spot ON spot_favorites(spot_id);

-- 4. 钓位评论表
CREATE TABLE IF NOT EXISTS spot_reviews (
    id SERIAL PRIMARY KEY,
    spot_id INT REFERENCES spots(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_spot ON spot_reviews(spot_id);

-- 5. AI识鱼记录表
CREATE TABLE IF NOT EXISTS fish_recognitions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    fish_name VARCHAR(100),
    scientific_name VARCHAR(100),
    habits TEXT,
    protection_level VARCHAR(50),
    is_protected BOOLEAN DEFAULT FALSE,
    confidence DECIMAL(5, 4),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fish_user ON fish_recognitions(user_id);
CREATE INDEX idx_fish_created ON fish_recognitions(created_at DESC);

-- 6. 动态表
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    images TEXT[],
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- 7. 动态点赞表
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_likes_post ON post_likes(post_id);

-- 8. 动态评论表
CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON post_comments(post_id);

-- 9. 约钓活动表
CREATE TABLE IF NOT EXISTS fishing_events (
    id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(id) ON DELETE CASCADE,
    spot_id INT REFERENCES spots(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    max_participants INT DEFAULT 10,
    current_participants INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_status ON fishing_events(status);
CREATE INDEX idx_events_start ON fishing_events(start_time);

-- 10. 约钓报名表
CREATE TABLE IF NOT EXISTS event_participants (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES fishing_events(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'joined',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_participants_event ON event_participants(event_id);
CREATE INDEX idx_participants_user ON event_participants(user_id);

-- 插入测试数据

-- 测试用户
INSERT INTO users (phone, nickname, avatar_url, fishing_age, frequent_spots, skilled_fish, privacy_settings) VALUES
('13800138001', '钓鱼老王', 'https://example.com/avatar1.jpg', 15, ARRAY['颐和园后湖', '密云水库'], ARRAY['鲫鱼', '鲤鱼'], '{"phone_visible": false, "location_visible": true}'),
('13800138002', '野钓小李', 'https://example.com/avatar2.jpg', 3, ARRAY['潮白河'], ARRAY['草鱼', '青鱼'], '{"phone_visible": false, "location_visible": true}'),
('13800138003', '夜钓达人', 'https://example.com/avatar3.jpg', 8, ARRAY['官厅水库'], ARRAY['鲶鱼', '黄颡鱼'], '{"phone_visible": false, "location_visible": false}');

-- 测试钓位
INSERT INTO spots (name, description, latitude, longitude, location, fish_species, water_depth, water_temp, bait, fishing_methods, photos, creator_id) VALUES
('颐和园后湖钓点', '环境优美，鱼种丰富，适合休闲钓', 39.9999, 116.2754, ST_SetSRID(ST_MakePoint(116.2754, 39.9999), 4326), ARRAY['鲫鱼', '鲤鱼', '草鱼'], '1.5-3米', '18-25°C', ARRAY['红虫', '蚯蚓', '商品饵'], ARRAY['台钓', '传统钓'], ARRAY['https://example.com/spot1.jpg'], 1),
('密云水库野钓区', '大水面，大鱼多，需提前了解政策', 40.4999, 116.9754, ST_SetSRID(ST_MakePoint(116.9754, 40.4999), 4326), ARRAY['鲤鱼', '草鱼', '青鱼', '鲢鳙'], '3-10米', '15-22°C', ARRAY['玉米粒', '商品饵', '螺蛳'], ARRAY['海竿', '矶钓'], ARRAY['https://example.com/spot2.jpg'], 1),
('潮白河桥段', '河流钓点，水流平缓，鲫鱼多', 39.8999, 116.6754, ST_SetSRID(ST_MakePoint(116.6754, 39.8999), 4326), ARRAY['鲫鱼', '白条', '麦穗'], '0.5-2米', '20-28°C', ARRAY['红虫', '蚯蚓'], ARRAY['传统钓', '路亚'], ARRAY['https://example.com/spot3.jpg'], 2);

-- 测试动态
INSERT INTO posts (user_id, content, images, likes_count, comments_count) VALUES
(1, '今天在后湖钓了条大鲤鱼，手感真棒！', ARRAY['https://example.com/post1.jpg'], 5, 2),
(2, '潮白河的鲫鱼口很好，早口最佳', ARRAY['https://example.com/post2.jpg'], 3, 1),
(3, '夜钓鲶鱼，终于破龟了', ARRAY['https://example.com/post3.jpg'], 8, 3);

-- 测试约钓活动
INSERT INTO fishing_events (creator_id, spot_id, title, description, start_time, end_time, max_participants, current_participants, status) VALUES
(1, 1, '周末后湖约钓', '周六早上6点集合，一起钓鲫鱼', '2026-05-17 06:00:00', '2026-05-17 12:00:00', 5, 2, 'open'),
(2, 3, '潮白河早口局', '早口钓鲫鱼，有经验者优先', '2026-05-18 05:30:00', '2026-05-18 09:00:00', 4, 1, 'open');

-- 测试约钓报名
INSERT INTO event_participants (event_id, user_id, status) VALUES
(1, 2, 'joined'),
(2, 1, 'joined');

-- 更新location字段触发器
CREATE OR REPLACE FUNCTION update_spot_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_spot_location ON spots;
CREATE TRIGGER trigger_update_spot_location
    BEFORE INSERT OR UPDATE ON spots
    FOR EACH ROW
    EXECUTE FUNCTION update_spot_location();

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_spots_updated_at ON spots;
CREATE TRIGGER trigger_spots_updated_at
    BEFORE UPDATE ON spots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_posts_updated_at ON posts;
CREATE TRIGGER trigger_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_events_updated_at ON fishing_events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON fishing_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
