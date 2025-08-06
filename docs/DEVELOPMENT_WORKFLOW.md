# InternetFriends Development Workflow

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Zed Editor with Cerebras integration
- Vercel CLI
- GitHub CLI

### Workspace Setup
```bash
./setup.sh
```

## 🔧 Development Commands

### Core Development
```bash
npm run dev           # Start development server (port 3000)
npm run build         # Build for production
npm run lint          # Run ESLint
npm run typecheck     # TypeScript checking
```

### Deployment
```bash
npm run deploy:staging  # Deploy to Vercel staging
npm run deploy:prod     # Deploy to Vercel production
./scripts/deploy-prod.sh # Full production deployment with checks
```

## 🤖 AI-Powered Development with Cerebras

### Zed AI Assistant Commands
- **Code Review**: Select code → Ask AI to review for performance, security, accessibility
- **Component Generation**: "Create a React component for [feature] with TypeScript and Tailwind"
- **Bug Fixing**: "Analyze this error and suggest fixes with explanations"
- **Optimization**: "Optimize this code for better performance and readability"

### Chat Mode Prompts
```
Code Review Mode: "Review this component for Next.js best practices"
Architecture Mode: "Help design a scalable folder structure for this feature"
Debug Mode: "Debug this TypeScript error with step-by-step solution"
Testing Mode: "Generate comprehensive tests for this utility function"
```

## 📁 Project Structure

```
internetfriends-workspace/
├── production-landing/     # Main Next.js application
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/              # Utility libraries
│   └── public/           # Static assets
├── shared/               # Shared utilities (future)
├── components/           # Reusable components (future)
├── utils/               # Workspace utilities
├── scripts/             # Development scripts
└── docs/               # Documentation
```

## 🔄 Production Workflow

1. **Development**: Work in `production-landing/`
2. **Testing**: Run `npm run build` and `npm run lint`
3. **Staging**: Deploy with `npm run deploy:staging`
4. **Production**: Deploy with `npm run deploy:prod`

## 🌐 Live URLs
- **Production**: https://landingpage-five-phi.vercel.app
- **Repository**: https://github.com/BarreraSlzr/internetfriends-workspace

## 🎯 Future Expansion
This workspace will evolve from the landing page into the complete InternetFriends product suite, adding:
- User authentication system
- Dashboard components
- API integrations
- Marketing tools
- Analytics platform
