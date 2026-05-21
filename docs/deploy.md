# 野钓App MVP 部署文档

## 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 2核4G以上服务器（推荐）

## 快速启动

### 1. 克隆代码

```bash
git clone <仓库地址>
cd yediao-app
```

### 2. 配置环境变量

```bash
cp backend/scripts/.env.example .env
# 编辑 .env 填入真实配置（OSS、EasyDL、融云、高德地图等）
```

### 3. 启动服务

```bash
docker-compose up -d
```

### 4. 验证服务

- 后端API: http://localhost:3000
- API文档: http://localhost:3000/api/docs
- Web端: http://localhost:3001

## 服务说明

| 服务 | 端口 | 说明 |
|------|------|------|
| PostgreSQL | 5432 | 主数据库，含PostGIS扩展 |
| Redis | 6379 | 缓存/会话 |
| 后端API | 3000 | NestJS REST API |
| Web端 | 3001 | Next.js SSR |

## 测试账号

| 手机号 | 昵称 | 说明 |
|--------|------|------|
| 13800138001 | 老钓手 | 资深用户，有钓点和约钓数据 |
| 13800138002 | 新手小王 | 新用户，有动态数据 |

## 生产环境注意事项

1. 修改 `JWT_SECRET` 为强随机字符串
2. 配置阿里云OSS密钥
3. 配置百度EasyDL API密钥
4. 配置融云IM密钥
5. 配置高德地图Key
6. 启用HTTPS
7. 配置域名和Nginx反向代理
