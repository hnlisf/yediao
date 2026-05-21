# 🎣 野钓App MVP

野钓爱好者一站式服务平台，提供钓点发现、AI识鱼、社区社交、约钓交友等功能。

## 功能特性

- 📱 **手机号登录** - 验证码快速注册/登录
- 🗺️ **钓点地图** - 基于高德地图的附近钓点发现
- 🐟 **AI识鱼** - 百度EasyDL拍照识别鱼种
- 👥 **社区动态** - 分享钓鱼故事、点赞评论
- 🎣 **约钓活动** - 发起/报名约钓活动
- 💬 **即时通讯** - 融云IM单聊/群聊

## 技术栈

| 层级 | 技术 |
|------|------|
| 移动端 | React Native (Expo) |
| Web端 | Next.js 14 + React 18 |
| 后端 | NestJS + TypeScript |
| 数据库 | PostgreSQL 15 + TypeORM |
| 缓存 | Redis 7 |
| 地图 | 高德地图SDK |
| AI | 百度EasyDL API |
| IM | 融云IM PaaS |
| 部署 | Docker Compose |

## 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/hnlisf/yediao.git
cd yediao/backend/yediao-app

# 2. Docker一键启动
docker-compose up -d

# 3. 访问服务
# API文档: http://localhost:3000/api/docs
# Web端:   http://localhost:3001
```

## 项目结构

```
yediao/
└── backend/yediao-app/          # 项目根目录
    ├── backend/                 # NestJS 后端服务（端口 3000）
    │   └── src/
    │       ├── modules/         # 功能模块
    │       │   ├── upload/      # 文件上传
    │       │   ├── push/        # 推送服务
    │       │   ├── ai/          # AI识鱼
    │       │   ├── spot/        # 钓点管理
    │       │   ├── spot-audit/  # 钓点审核
    │       │   ├── community/   # 社区动态
    │       │   ├── fishing-date/# 约钓活动
    │       │   ├── im/          # 即时通讯
    │       │   ├── points/      # 积分系统
    │       │   ├── redis/       # Redis缓存
    │       │   ├── auth/        # 认证授权
    │       │   └── user/        # 用户管理
    │       ├── auth/             # 基础认证（JWT/OAuth）
    │       ├── chat/             # 聊天服务
    │       ├── common/           # 公共模块（过滤器、拦截器等）
    │       ├── config/           # 配置
    │       ├── entities/         # TypeORM 实体
    │       ├── fish/             # 鱼类管理
    │       ├── social/           # 社交
    │       └── spots/            # 钓点（遗留）
    ├── web/                     # Next.js Web端（端口 3001）
    │   └── src/app/             # App Router 页面
    ├── mobile/                   # React Native 移动端
    ├── database/                 # 数据库初始化脚本
    ├── docs/                     # 技术文档
    ├── docker-compose.yml        # 容器编排
    └── start.sh                  # 服务启动脚本
```

## 测试账号

| 手机号 | 验证码 | 昵称 |
|--------|--------|------|
| 13800138001 | 123456 | 钓鱼老王 |
| 13800138002 | 123456 | 野钓小李 |
| 13800138003 | 123456 | 夜钓达人 |

## 开发

```bash
# 后端开发
cd backend
npm install
npm run start:dev

# Web开发
cd web
npm install
npm run dev

# 移动端开发
cd mobile
npm install
npx expo start
```

## API文档

启动后端服务后访问: http://localhost:3000/api/docs

## 开发团队

6智能体研发公司
