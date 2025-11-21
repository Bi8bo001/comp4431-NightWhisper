#!/bin/bash

# Cleanup script for NightWhisper
# Kills processes occupying frontend (5173, 5174) and backend (8000) ports

echo "🔍 Searching for processes using ports..."

# Find processes using frontend and backend ports
PIDS=$(lsof -ti:5173,5174,8000 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ No processes found using these ports"
else
    echo "🛑 Found processes using ports: $PIDS"
    echo "Terminating these processes..."
    kill -9 $PIDS 2>/dev/null
    sleep 1
    echo "✅ Processes terminated"
fi

# Also cleanup any vite processes
VITE_PIDS=$(ps aux | grep -i '[v]ite' | awk '{print $2}')
if [ ! -z "$VITE_PIDS" ]; then
    echo "🛑 Found additional Vite processes, cleaning up..."
    kill -9 $VITE_PIDS 2>/dev/null
    echo "✅ All Vite processes cleaned"
fi

# Also cleanup any python server processes
PYTHON_PIDS=$(ps aux | grep -i '[p]ython.*server.py' | awk '{print $2}')
if [ ! -z "$PYTHON_PIDS" ]; then
    echo "🛑 Found additional Python server processes, cleaning up..."
    kill -9 $PYTHON_PIDS 2>/dev/null
    echo "✅ All Python server processes cleaned"
fi

echo ""
echo "✅ Cleanup complete! You can now run:"
echo "   Frontend: npm run dev"
echo "   Backend: cd backend && ./start_server.sh"

