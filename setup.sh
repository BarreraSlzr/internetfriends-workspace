#!/bin/bash
# InternetFriends Workspace Setup Script

echo "🌟 Setting up InternetFriends Production Workspace..."

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
npm install

# Setup production-landing
echo "🚀 Setting up production-landing..."
cd production-landing
npm install
cd ..

echo "✅ Workspace setup complete!"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev           - Start development server"
echo "  npm run build         - Build for production"
echo "  npm run deploy:prod   - Deploy to Vercel production"
echo "  ./scripts/dev.sh      - Alternative dev start"
echo ""
echo "🎯 Open in Zed:"
echo "  zed /Users/emmanuelbarrera/Projects/InternetFriends/zed_workspace"
