#!/bin/bash

# Start NightWhisper Backend Server

cd "$(dirname "$0")"

echo "🚀 Starting NightWhisper Backend Server..."
echo ""

# Initialize conda (if using conda)
if command -v conda &> /dev/null; then
    eval "$(conda shell.bash hook)"
    echo "📦 Activating conda environment: nightwhisper"
    conda activate nightwhisper
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with OPENAI_API_KEY"
    exit 1
fi

# Check if Python is available
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Error: python not found"
    exit 1
fi

# Use python if available, otherwise python3
PYTHON_CMD=$(command -v python || command -v python3)

# Check if dependencies are installed
if ! $PYTHON_CMD -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Start server
echo "✅ Starting server on http://localhost:8000"
echo "📝 API docs available at http://localhost:8000/docs"
echo ""
$PYTHON_CMD api/server.py

