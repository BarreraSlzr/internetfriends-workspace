# 🌐 InternetFriends Production Workspace

> **Production-focused development environment for InternetFriends ecosystem**

This workspace manages the production InternetFriends landing page and provides a foundation for expanding into the complete product suite.

## 🚀 Quick Start

```bash
# Setup workspace
npm run setup

# Start development
./scripts/dev.sh

# Build for production
./scripts/build.sh

# Deploy to production
./scripts/deploy.sh
```

## 📁 Project Structure

```
zed_workspace/
├── production-landing/     # Main Next.js landing page
├── shared/                 # Shared utilities and types
├── components/             # Reusable UI components
├── utils/                  # Helper functions
├── docs/                   # Documentation
├── scripts/                # Build and deployment scripts
└── .zed/                   # Zed editor configuration
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS + Framer Motion
- **Language**: TypeScript
- **UI Components**: Radix UI
- **Database**: PostgreSQL + Kysely
- **Deployment**: Vercel
- **AI Assistant**: Cerebras (via Zed)

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run deploy:prod` | Deploy to production |
| `npm run setup` | Install dependencies |
| `npm run clean` | Clean build artifacts |
| `npm run typecheck` | Run TypeScript checks |

## 🤖 AI-Powered Development

This workspace is optimized for AI-assisted development using:

- **Cerebras API** integration with Zed
- **Lightning-fast** code generation (2000+ tokens/sec)
- **Context-aware** suggestions for InternetFriends ecosystem
- **Automated** code reviews and refactoring

### Setup Cerebras Integration

1. Get your API key from [cloud.cerebras.ai](https://cloud.cerebras.ai)
2. Copy `.env.example` to `.env`
3. Add your Cerebras API key
4. Restart Zed to apply configuration

## 🚀 Production Deployment

The landing page is deployed to Vercel and accessible at:
- **Production**: https://landingpage-five-phi.vercel.app
- **Staging**: Deployed on every push to `develop`

### Deployment Process

1. **Development**: Work in feature branches
2. **Staging**: Merge to `develop` → Auto-deploy to staging
3. **Production**: Merge to `main` → Deploy via `npm run deploy:prod`

## 📈 Evolution Roadmap

This workspace will evolve from a simple landing page to a complete InternetFriends product suite:

1. **Phase 1**: Landing page optimization (Current)
2. **Phase 2**: User authentication and profiles
3. **Phase 3**: Market platform integration
4. **Phase 4**: AI-powered features and automation
5. **Phase 5**: Full ecosystem deployment

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

- `OPENAI_API_KEY`: Cerebras API key for AI assistance
- `VERCEL_TOKEN`: Vercel deployment token
- `DATABASE_URL`: PostgreSQL connection string
- `GITHUB_TOKEN`: GitHub API token

## 🤝 Contributing

1. Create feature branch from `develop`
2. Make changes with AI assistance
3. Run tests and type checks
4. Submit PR with detailed description
5. Deploy to staging for review

## 📞 Support

For questions about this workspace:
- Check the `/docs` directory
- Review the InternetFriends market project
- Use Cerebras AI for code assistance

---

**Built with ❤️ for the InternetFriends ecosystem**
