# OpenCode Vercel AI Gateway Steady Auth - FREE TIER OPTIMIZED

Complete authentication management system for OpenCode with Vercel AI Gateway integration, optimized for Vercel's free tier.

## 🆓 Free Tier Quick Setup

```bash
# 1. Get your Vercel token from https://vercel.com/account/tokens
export VERCEL_TOKEN="your_token_here"

# 2. Run free tier setup
bun scripts/vercel-free-tier-setup.ts

# 3. Start OpenCode with steady auth
bun scripts/opencode-steady-auth.ts /path/to/project
```

## 🎯 Free Tier Features

### ✅ Rate Limiting & Usage Tracking
- **1,000 requests/day** limit (conservative for free tier)
- **20 requests/minute** rate limiting
- Daily usage tracking and warnings
- Automatic rate limit protection

### ✅ Optimized Token Management
- **45-minute** token refresh (vs 30min for pro)
- Reduced API calls to conserve quota
- Smart caching with usage counters
- Graceful degradation on limits

### ✅ Usage Monitoring
- Real-time usage statistics
- Daily limit warnings at 80% usage
- Request counting and analytics
- Status monitoring

## 📋 Commands

```bash
# Quick setup for free tier
bun scripts/vercel-free-tier-setup.ts

# Start OpenCode with steady auth
bun scripts/opencode-steady-auth.ts [project]

# Check status and usage
bun scripts/opencode-steady-auth.ts status

# Show usage statistics
bun scripts/opencode-steady-auth.ts usage

# Reset authentication cache
bun scripts/opencode-steady-auth.ts reset
```

## 🔍 Free Tier Limits & Optimizations

| Feature | Free Tier | Pro Tier | Optimization |
|---------|-----------|----------|--------------|
| Daily Requests | 1,000 | 10,000 | Conservative limit |
| Token Refresh | 45 min | 30 min | Fewer API calls |
| Rate Limiting | 20/min | 100/min | Built-in protection |
| Usage Tracking | ✅ | ✅ | Free tier focused |
| Auto Rotation | ✅ | ✅ | Optimized timing |

## 🛠️ Environment Variables (Free Tier)

```bash
# Required
VERCEL_TOKEN=your_vercel_token

# Free tier optimized
VERCEL_TIER=free
VERCEL_AUTH_REFRESH_INTERVAL=45
VERCEL_DAILY_REQUEST_LIMIT=1000
VERCEL_MINUTE_REQUEST_LIMIT=20

# Optional
VERCEL_TEAM_ID=your_team_id
VERCEL_AI_GATEWAY_URL=your_gateway_url
```

## 📊 Usage Monitoring

The system tracks:
- **Daily requests** with limit warnings
- **Total lifetime requests**
- **Remaining quota** for the day
- **Rate limit status**

Example output:
```
📊 Usage Statistics:
   Daily requests: 245/1000
   Total requests: 2,847
   Remaining today: 755
   ⚠️ Warning: Approaching daily rate limit
```

## 🔄 How Free Tier Optimization Works

1. **Conservative Limits**: Set to 1,000/day (well below typical free limits)
2. **Smart Refresh**: 45-minute tokens (fewer refresh API calls)
3. **Request Counting**: Track every request to prevent overages
4. **Rate Protection**: Automatic blocking when limits approached
5. **Usage Alerts**: Warnings at 80% daily usage

## 🎯 Benefits for Free Tier Users

- **Zero overage risk**: Built-in protection against rate limits
- **Transparent usage**: Always know your current quota
- **Optimized performance**: Fewer background API calls
- **Steady operation**: No authentication interruptions
- **Cost awareness**: Usage tracking for upgrade decisions

Perfect for personal projects, learning, and development work!