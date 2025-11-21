#!/bin/bash

# 清理占用端口的 Vite 进程
echo "🔍 查找占用端口的进程..."

# 查找占用 5173 和 5174 端口的进程
PIDS=$(lsof -ti:5173,5174 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ 没有发现占用端口的进程"
else
    echo "🛑 发现以下进程占用端口: $PIDS"
    echo "正在终止这些进程..."
    kill -9 $PIDS 2>/dev/null
    sleep 1
    echo "✅ 进程已清理完成"
fi

# 也清理所有 vite 相关进程
VITE_PIDS=$(ps aux | grep -i '[v]ite' | awk '{print $2}')
if [ ! -z "$VITE_PIDS" ]; then
    echo "🛑 发现额外的 Vite 进程，正在清理..."
    kill -9 $VITE_PIDS 2>/dev/null
    echo "✅ 所有 Vite 进程已清理"
fi

echo ""
echo "现在可以重新运行: npm run dev"

