#!/bin/bash

# 同步根目录 fig/ 到 public/fig/
echo "🔄 同步图片文件..."
echo "从: fig/"
echo "到: public/fig/"
echo ""

# 检查源目录是否存在
if [ ! -d "fig" ]; then
    echo "❌ 错误: fig/ 目录不存在"
    exit 1
fi

# 确保目标目录存在
mkdir -p public/fig

# 同步文件
cp -r fig/* public/fig/

echo "✅ 同步完成！"
echo ""
echo "📝 提示: 如果浏览器没有更新，请硬刷新 (Cmd + Shift + R)"

