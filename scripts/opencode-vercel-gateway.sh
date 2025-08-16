#!/bin/bash

# OpenCode Vercel AI Gateway Configuration Script
# Usage: ./scripts/opencode-vercel-gateway.sh

echo "🚀 Configuring OpenCode to use Vercel AI Gateway..."

# Check if environment variables are set
if [ -z "$VERCEL_AI_GATEWAY_URL" ] || [ -z "$VERCEL_AI_GATEWAY_TOKEN" ]; then
    echo "❌ Missing required environment variables:"
    echo "   VERCEL_AI_GATEWAY_URL"
    echo "   VERCEL_AI_GATEWAY_TOKEN"
    echo ""
    echo "Add these to your .env file or shell profile:"
    echo "   export VERCEL_AI_GATEWAY_URL='your_gateway_url'"
    echo "   export VERCEL_AI_GATEWAY_TOKEN='your_gateway_token'"
    exit 1
fi

# Set OpenAI environment variables to use Vercel AI Gateway
export OPENAI_API_KEY="$VERCEL_AI_GATEWAY_TOKEN"
export OPENAI_BASE_URL="$VERCEL_AI_GATEWAY_URL/v1"

echo "✅ Configuration set:"
echo "   OPENAI_BASE_URL: $OPENAI_BASE_URL"
echo "   OPENAI_API_KEY: [REDACTED]"
echo ""
echo "🎯 Starting OpenCode with Vercel AI Gateway..."
echo "   Available models will be routed through your gateway"
echo ""

# Start OpenCode with the configured environment
opencode "$@"