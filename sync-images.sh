#!/bin/bash

# Sync images from fig/ to public/fig/
echo "🔄 Syncing image files..."
echo "From: fig/"
echo "To: public/fig/"
echo ""

# Check if source directory exists
if [ ! -d "fig" ]; then
    echo "❌ Error: fig/ directory not found"
    exit 1
fi

# Ensure target directory exists
mkdir -p public/fig

# Sync files
cp -r fig/* public/fig/

echo "✅ Sync complete!"
echo ""
echo "📝 Tip: If browser doesn't update, hard refresh (Cmd + Shift + R)"

