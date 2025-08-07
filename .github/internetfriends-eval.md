# MCP Chat Mode: InternetFriends Eval

You explore InternetFriends logic assumptions in real-time with `bun -e` and provide CLI snippets to verify runtime behavior for portfolio management, achievement tracking, and business admin workflows.

## Common Eval Patterns

### Achievement Registry Operations
```bash
# Validate achievement registry structure
bun -e "const fs = require('fs'); const yaml = require('yaml'); const content = fs.readFileSync('src/public/projects/InternetFriends/achievements.registry.yml', 'utf8'); console.log('Registry valid:', yaml.parse(content))"

# Count achievement entries
bun -e "const yaml = require('yaml'); const registry = yaml.parse(require('fs').readFileSync('src/public/projects/InternetFriends/achievements.registry.yml', 'utf8')); console.log('Achievement count:', Object.keys(registry).length)"

# Check for specific achievement types
bun -e "const yaml = require('yaml'); const registry = yaml.parse(require('fs').readFileSync('src/public/projects/InternetFriends/achievements.registry.yml', 'utf8')); console.log('Portfolio achievements:', Object.values(registry).filter(a => a.type?.includes('portfolio')))"
```

### Portfolio Health Monitoring
```bash
# Quick health check
bun -e "fetch('http://localhost:3001/api/health').then(r => r.json()).then(console.log).catch(e => console.log('Server down:', e.message))"

# Database connection test
bun -e "fetch('http://localhost:3001/api/database/stats').then(r => r.json()).then(d => console.log('DB Stats:', d)).catch(console.error)"

# Fossil count verification
bun -e "fetch('http://localhost:3001/api/database/fossils').then(r => r.json()).then(d => console.log('Fossils:', d.fossils?.length || 0)).catch(console.error)"

# API endpoint availability
bun -e "const endpoints = ['/api/health', '/api/database/stats', '/api/docs']; Promise.all(endpoints.map(ep => fetch(\`http://localhost:3001\${ep}\`).then(r => ({endpoint: ep, status: r.status})))).then(console.log)"
```

### Development Environment Validation
```bash
# Check Next.js configuration
bun -e "const config = require('./src/public/projects/InternetFriends/xyz/export/domain/internetfriends-portfolio/next.config.js'); console.log('Next.js config:', config)"

# Validate package.json scripts
bun -e "const pkg = require('./src/public/projects/InternetFriends/xyz/export/domain/internetfriends-portfolio/package.json'); console.log('Available scripts:', Object.keys(pkg.scripts))"

# Check TypeScript configuration
bun -e "const fs = require('fs'); const tsconfig = fs.existsSync('./src/public/projects/InternetFriends/xyz/export/domain/internetfriends-portfolio/tsconfig.json'); console.log('TypeScript configured:', tsconfig)"
```

### Business Logic Validation
```bash
# Calculate achievement metrics
bun -e "fetch('http://localhost:3001/api/database/stats').then(r => r.json()).then(stats => console.log('Business metrics:', { totalAchievements: stats.total, successRate: Math.round((stats.successful / stats.total) * 100) + '%' }))"

# Test portfolio component availability
bun -e "const fs = require('fs'); const componentsDir = './src/public/projects/InternetFriends/xyz/export/domain/internetfriends-portfolio/components'; const exists = fs.existsSync(componentsDir); console.log('Components available:', exists, exists ? fs.readdirSync(componentsDir).length + ' files' : 'directory missing')"

# Validate environment variables
bun -e "console.log('Environment check:', { NODE_ENV: process.env.NODE_ENV, PORT: process.env.PORT || '3000', DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing' })"
```

### File System & Project Structure
```bash
# Project structure validation
bun -e "const fs = require('fs'); const structure = { readme: fs.existsSync('./src/public/projects/InternetFriends/README.md'), registry: fs.existsSync('./src/public/projects/InternetFriends/achievements.registry.yml'), portfolio: fs.existsSync('./src/public/projects/InternetFriends/xyz/export/domain/internetfriends-portfolio') }; console.log('Project structure:', structure)"

# Count portfolio files
bun -e "const fs = require('fs'); const path = require('path'); const portfolioPath = './src/public/projects/InternetFriends/xyz/export/domain/internetfriends-portfolio'; if (fs.existsSync(portfolioPath)) { const files = fs.readdirSync(portfolioPath, {recursive: true}).filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx')); console.log('Code files:', files.length); } else { console.log('Portfolio directory not found'); }"

# Check for test files
bun -e "const fs = require('fs'); const glob = require('glob'); const testFiles = glob.sync('./src/public/projects/InternetFriends/**/test*.{ts,js}'); console.log('Test files found:', testFiles.length, testFiles)"
```

## Quick Diagnostics

### Performance Checks
```bash
# Server response time
bun -e "const start = Date.now(); fetch('http://localhost:3001/api/health').then(() => console.log('Response time:', Date.now() - start + 'ms')).catch(e => console.log('Server unreachable'))"

# Memory usage check
bun -e "console.log('Memory usage:', { used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB', total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB' })"
```

### Data Validation
```bash
# Achievement data integrity
bun -e "fetch('http://localhost:3001/api/database/fossils').then(r => r.json()).then(data => { const fossils = data.fossils || []; const categories = [...new Set(fossils.map(f => f.category))]; console.log('Data integrity:', { totalFossils: fossils.length, categories: categories.length, uniqueCategories: categories }); })"

# API consistency check
bun -e "Promise.all([fetch('http://localhost:3001/api/health'), fetch('http://localhost:3001/api/database/stats')]).then(responses => console.log('API consistency:', responses.map(r => r.status).every(s => s === 200) ? 'PASS' : 'FAIL'))"
```

## Development Workflow Helpers

### Quick Setup Validation
```bash
# One-liner environment check
bun -e "const checks = { bun: !!process.versions.bun, node: !!process.versions.node, portfolio: require('fs').existsSync('./src/public/projects/InternetFriends/xyz/export/domain/internetfriends-portfolio/package.json') }; console.log('Setup status:', checks, Object.values(checks).every(Boolean) ? '✅ READY' : '❌ SETUP NEEDED')"

# Dependency verification
bun -e "const pkg = require('./src/public/projects/InternetFriends/xyz/export/domain/internetfriends-portfolio/package.json'); const deps = Object.keys({...pkg.dependencies, ...pkg.devDependencies}); console.log('Dependencies:', deps.length, 'packages installed')"
```

### Development Server Status
```bash
# Check if dev server is running
bun -e "fetch('http://localhost:3000').then(() => console.log('Dev server: ✅ Running on 3000')).catch(() => fetch('http://localhost:3001').then(() => console.log('Test server: ✅ Running on 3001')).catch(() => console.log('Servers: ❌ Not running')))"

# Quick build validation
bun -e "const fs = require('fs'); const buildExists = fs.existsSync('./src/public/projects/InternetFriends/xyz/export/domain/internetfriends-portfolio/.next'); console.log('Build status:', buildExists ? '✅ Built' : '❌ No build found')"
```
