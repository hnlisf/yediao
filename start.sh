#!/bin/sh
set -e

echo "========================================"
echo "野钓App 启动中..."
echo "========================================"

# 等待PostgreSQL就绪
echo "等待PostgreSQL..."
until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME:-yediao}"; do
  sleep 1
done
echo "PostgreSQL已就绪"

# 启动后端服务
cd /app/backend
PORT=3000 node dist/main &

# 启动Web端
cd /app/web
PORT=3001 npm start &

wait
