# 野钓App API 文档

## 基础信息

- Base URL: `http://localhost:3000/api`
- 认证方式: Bearer Token (JWT)
- 完整Swagger文档: `http://localhost:3000/api/docs`

## 认证模块

### POST /auth/send-code
发送手机验证码

**请求体:**
```json
{
  "phone": "13800138000"
}
```

### POST /auth/register
用户注册

**请求体:**
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

### POST /auth/login
用户登录

**请求体:**
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

## 用户模块

### GET /users/profile
获取当前用户资料 (需认证)

### PUT /users/profile
更新用户资料 (需认证)

**请求体:**
```json
{
  "nickname": "老钓手",
  "avatar": "https://...",
  "fishingAge": 15,
  "frequentSpot": "西湖",
  "skilledFish": ["鲫鱼", "鲤鱼"]
}
```

### PUT /users/privacy
更新隐私设置 (需认证)

## 钓位模块

### GET /spots/nearby
附近钓点

**查询参数:**
- `lng`: 经度
- `lat`: 纬度
- `radius`: 半径(米)，默认5000

### GET /spots/:id
钓点详情

### POST /spots
新增钓点 (需认证)

**请求体:**
```json
{
  "name": "新钓点",
  "longitude": 120.146,
  "latitude": 30.244,
  "type": "lake",
  "fishSpecies": ["鲫鱼", "鲤鱼"],
  "depth": 2.5,
  "waterTemp": 18.5
}
```

### POST /spots/:id/favorite
收藏/取消收藏 (需认证)

### POST /spots/:id/comments
发表评论 (需认证)

### GET /spots/:id/comments
评论列表

## AI识鱼模块

### POST /ai/recognize
识别鱼类 (需认证)

**请求体:**
```json
{
  "imageUrl": "https://..."
}
```

### GET /ai/history
识别历史 (需认证)

## 社区模块

### POST /community/posts
发布动态 (需认证)

### GET /community/posts
动态列表

### POST /community/posts/:id/like
点赞/取消点赞 (需认证)

### POST /community/posts/:id/comments
评论 (需认证)

## 约钓模块

### POST /fishing-dates
发起约钓 (需认证)

### GET /fishing-dates
约钓列表

### GET /fishing-dates/:id
约钓详情

### POST /fishing-dates/:id/join
报名 (需认证)

### DELETE /fishing-dates/:id/join
取消报名 (需认证)

## IM模块

### GET /im/token
获取IM Token (需认证)

### POST /im/groups
创建群组 (需认证)
