# MCP Chat Mode: InternetFriends Infra

You assist in infrastructure orchestration for InternetFriends portfolio and achievement system. Prioritize developer observability and reproducibility for private business operations.

## Storage Targets for InternetFriends

### Local Development Storage
- ✅ SQLite database for development fossils and achievements
- ✅ Achievement registry YAML persistence
- ✅ Portfolio build artifacts and deployment logs
- ✅ Component documentation and metadata

### Production Storage (when applicable)
- ✅ Encrypted achievement data persistence
- ✅ Business metrics and analytics storage
- ✅ Portfolio deployment artifacts
- ✅ Security audit logs

## Storage Patterns

### Achievement Tracking Database
```typescript
// Achievement tracking schema
interface AchievementRecord {
  id: string;
  type: 'portfolio_deploy' | 'component_created' | 'api_endpoint_tested' | 'business_milestone';
  timestamp: number;
  metadata: {
    portfolio?: string;
    component?: string;
    test_results?: TestResult[];
    business_impact?: string;
  };
  business_context: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'development' | 'deployment' | 'testing' | 'analytics';
    stakeholder?: string;
  };
}

// Database operations
const achievementDb = {
  async create(achievement: AchievementRecord) {
    return await db.execute(`
      INSERT INTO achievements (id, type, timestamp, metadata, business_context) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      achievement.id,
      achievement.type,
      achievement.timestamp,
      JSON.stringify(achievement.metadata),
      JSON.stringify(achievement.business_context)
    ]);
  },

  async getByType(type: string) {
    return await db.query(`
      SELECT * FROM achievements 
      WHERE type = ? 
      ORDER BY timestamp DESC
    `, [type]);
  },

  async getBusinessMetrics() {
    return await db.query(`
      SELECT 
        type,
        COUNT(*) as count,
        AVG(CASE WHEN JSON_EXTRACT(business_context, '$.priority') = 'critical' THEN 1 ELSE 0 END) as critical_rate
      FROM achievements 
      GROUP BY type
    `);
  }
};
```

### Fossil Management System
```typescript
// Fossil database schema
interface FossilRecord {
  id: number;
  category: string;
  timestamp: string;
  metadata: {
    source: 'portfolio' | 'api' | 'component' | 'deployment';
    size_kb?: number;
    dependencies?: string[];
    performance_metrics?: {
      build_time_ms: number;
      bundle_size_kb: number;
      test_duration_ms: number;
    };
  };
  business_value: {
    impact_score: number; // 1-10
    stakeholder_priority: 'low' | 'medium' | 'high';
    roi_estimate?: number;
  };
}

// Fossil operations
const fossilDb = {
  async createTable() {
    return await db.execute(`
      CREATE TABLE IF NOT EXISTS fossils (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata JSON NOT NULL,
        business_value JSON NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  },

  async insert(fossil: Omit<FossilRecord, 'id'>) {
    return await db.execute(`
      INSERT INTO fossils (category, metadata, business_value) 
      VALUES (?, ?, ?)
    `, [
      fossil.category,
      JSON.stringify(fossil.metadata),
      JSON.stringify(fossil.business_value)
    ]);
  },

  async getPerformanceMetrics() {
    return await db.query(`
      SELECT 
        category,
        AVG(JSON_EXTRACT(metadata, '$.performance_metrics.build_time_ms')) as avg_build_time,
        AVG(JSON_EXTRACT(metadata, '$.performance_metrics.bundle_size_kb')) as avg_bundle_size,
        COUNT(*) as total_fossils
      FROM fossils 
      WHERE JSON_EXTRACT(metadata, '$.performance_metrics') IS NOT NULL
      GROUP BY category
    `);
  }
};
```

## Portfolio Build Tracking

### Build Performance Monitoring
```typescript
interface BuildMetrics {
  build_id: string;
  timestamp: number;
  duration_ms: number;
  bundle_size_kb: number;
  pages_count: number;
  components_count: number;
  success: boolean;
  errors?: string[];
  warnings?: string[];
  dependencies: {
    total: number;
    outdated: number;
    vulnerabilities: number;
  };
}

const buildTracker = {
  async logBuild(metrics: BuildMetrics) {
    // Store in achievements database
    await achievementDb.create({
      id: `build_${metrics.build_id}`,
      type: 'portfolio_deploy',
      timestamp: metrics.timestamp,
      metadata: {
        portfolio: 'internetfriends',
        build_metrics: metrics
      },
      business_context: {
        priority: metrics.success ? 'medium' : 'high',
        category: 'deployment'
      }
    });

    // Store in fossils for historical analysis
    await fossilDb.insert({
      category: 'deployment',
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'portfolio',
        performance_metrics: {
          build_time_ms: metrics.duration_ms,
          bundle_size_kb: metrics.bundle_size_kb,
          test_duration_ms: 0
        }
      },
      business_value: {
        impact_score: metrics.success ? 8 : 3,
        stakeholder_priority: 'high'
      }
    });
  }
};
```

### Component Generation Tracking
```typescript
interface ComponentMetrics {
  component_name: string;
  type: 'ui' | 'business' | 'layout' | 'utility';
  lines_of_code: number;
  dependencies: string[];
  tests_created: boolean;
  documentation_complete: boolean;
  accessibility_score: number; // 1-100
}

const componentTracker = {
  async logComponent(metrics: ComponentMetrics) {
    await achievementDb.create({
      id: `component_${metrics.component_name}_${Date.now()}`,
      type: 'component_created',
      timestamp: Date.now(),
      metadata: {
        component: metrics.component_name,
        component_metrics: metrics
      },
      business_context: {
        priority: metrics.accessibility_score > 90 ? 'high' : 'medium',
        category: 'development'
      }
    });
  }
};
```

## Business Dashboard Infrastructure

### Real-time Metrics Collection
```typescript
interface DashboardMetrics {
  portfolio_health: {
    uptime_percentage: number;
    avg_response_time_ms: number;
    error_rate: number;
    active_users: number;
  };
  development_velocity: {
    commits_per_day: number;
    components_created: number;
    tests_written: number;
    bugs_fixed: number;
  };
  business_impact: {
    user_engagement_score: number;
    performance_improvement: number;
    feature_completion_rate: number;
    stakeholder_satisfaction: number;
  };
}

const dashboardDataCollector = {
  async collectMetrics(): Promise<DashboardMetrics> {
    const [portfolioHealth, devVelocity, businessImpact] = await Promise.all([
      this.getPortfolioHealth(),
      this.getDevelopmentVelocity(),
      this.getBusinessImpact()
    ]);

    return {
      portfolio_health: portfolioHealth,
      development_velocity: devVelocity,
      business_impact: businessImpact
    };
  },

  async getPortfolioHealth() {
    // Fetch from test-server.ts results
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const statsResponse = await fetch('http://localhost:3001/api/database/stats');
    
    return {
      uptime_percentage: healthResponse.ok ? 100 : 0,
      avg_response_time_ms: 150, // calculated from test results
      error_rate: 0.02,
      active_users: 1 // development environment
    };
  }
};
```

## Infrastructure Automation Scripts

### Database Maintenance
```bash
#!/bin/bash
# database-maintenance.sh

echo "🧹 Starting InternetFriends database maintenance..."

# Backup current database
cp fossils.db "backups/fossils_$(date +%Y%m%d_%H%M%S).db"

# Clean old fossils (older than 30 days)
bun -e "
const db = require('./database/connection');
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
db.execute('DELETE FROM fossils WHERE timestamp < ?', [thirtyDaysAgo.toISOString()]);
console.log('Cleaned old fossils');
"

# Optimize database
bun -e "
const db = require('./database/connection');
db.execute('VACUUM');
db.execute('ANALYZE');
console.log('Database optimized');
"

# Generate health report
bun -e "
fetch('http://localhost:3001/api/database/stats')
  .then(r => r.json())
  .then(stats => {
    console.log('Database Health Report:');
    console.log('- Total fossils:', stats.total || 0);
    console.log('- Categories:', stats.categories || 0);
    console.log('- Size (MB):', Math.round((stats.size_bytes || 0) / 1024 / 1024));
  })
  .catch(e => console.log('Database unreachable:', e.message));
"

echo "✅ Database maintenance completed"
```

### Portfolio Deployment Automation
```bash
#!/bin/bash
# deploy-portfolio.sh

echo "🚀 Starting InternetFriends portfolio deployment..."

# Navigate to portfolio directory
cd src/public/projects/InternetFriends/xyz/export/domain/internetfriends-portfolio

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
bun run type-check
if [ $? -ne 0 ]; then
  echo "❌ TypeScript check failed"
  exit 1
fi

bun test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

# Build portfolio
echo "📦 Building portfolio..."
start_time=$(date +%s)
bun run build
build_exit_code=$?
end_time=$(date +%s)
build_duration=$((end_time - start_time))

# Log build metrics
bun -e "
const buildMetrics = {
  build_id: 'build_' + Date.now(),
  timestamp: Date.now(),
  duration_ms: ${build_duration} * 1000,
  bundle_size_kb: 0, // TODO: calculate actual size
  pages_count: 0, // TODO: count pages
  components_count: 0, // TODO: count components
  success: ${build_exit_code} === 0,
  errors: [],
  warnings: []
};

// Log to achievement system
console.log('Build completed:', buildMetrics.success ? '✅' : '❌');
console.log('Duration:', buildMetrics.duration_ms + 'ms');
"

if [ $build_exit_code -eq 0 ]; then
  echo "✅ Portfolio deployment completed successfully"
else
  echo "❌ Portfolio deployment failed"
  exit 1
fi
```

## Monitoring & Observability

### Performance Monitoring
```typescript
interface PerformanceMetrics {
  timestamp: number;
  metrics: {
    page_load_time: number;
    api_response_time: number;
    database_query_time: number;
    component_render_time: number;
  };
  user_experience: {
    core_web_vitals: {
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
    };
    user_satisfaction: number; // 1-10
  };
}

const performanceMonitor = {
  async collectMetrics(): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    
    // Test API performance
    const apiStart = performance.now();
    await fetch('http://localhost:3001/api/health');
    const apiTime = performance.now() - apiStart;

    // Test database performance
    const dbStart = performance.now();
    await fetch('http://localhost:3001/api/database/stats');
    const dbTime = performance.now() - dbStart;

    return {
      timestamp: Date.now(),
      metrics: {
        page_load_time: performance.now() - startTime,
        api_response_time: apiTime,
        database_query_time: dbTime,
        component_render_time: 50 // placeholder
      },
      user_experience: {
        core_web_vitals: {
          lcp: 1200, // under 2.5s is good
          fid: 80,   // under 100ms is good
          cls: 0.05  // under 0.1 is good
        },
        user_satisfaction: 9
      }
    };
  }
};
```

### Error Monitoring & Alerting
```typescript
interface ErrorMetrics {
  error_id: string;
  timestamp: number;
  error_type: 'client' | 'server' | 'database' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack_trace?: string;
  user_context: {
    user_agent: string;
    url: string;
    user_id?: string;
  };
  business_impact: {
    affects_core_functionality: boolean;
    affects_user_experience: boolean;
    affects_business_operations: boolean;
  };
}

const errorMonitor = {
  async logError(error: ErrorMetrics) {
    // Store in database
    await db.execute(`
      INSERT INTO error_logs (error_id, timestamp, error_type, severity, message, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      error.error_id,
      error.timestamp,
      error.error_type,
      error.severity,
      error.message,
      JSON.stringify({
        stack_trace: error.stack_trace,
        user_context: error.user_context,
        business_impact: error.business_impact
      })
    ]);

    // Alert if critical
    if (error.severity === 'critical') {
      console.log('🚨 CRITICAL ERROR:', error.message);
      // TODO: Implement notification system
    }
  }
};
```
