#!/bin/bash
# Deploy to Vercel Production

set -e

echo "🚀 Deploying InternetFriends Landing Page to Production..."

cd ../production-landing

# Build and validate
echo "📦 Building project..."
npm run build

echo "🔍 Type checking..."
npx tsc --noEmit

echo "🧹 Linting..."
npm run lint

echo "🚢 Deploying to Vercel..."
vercel --prod

echo "✅ Production deployment completed!"
echo "🌐 Visit: https://landingpage-five-phi.vercel.app"
