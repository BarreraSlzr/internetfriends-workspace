# Services Layer Documentation

This directory will contain the microservices architecture for our Hetzner-based backend compute layer. These services represent the Phase 2 evolution of our hybrid cloud architecture.

## Services Architecture Overview

The services layer is designed as a collection of containerized microservices that will run on our dedicated Hetzner infrastructure, providing the backbone for our application's business logic.

```mermaid
stateDiagram-v2
    direction TB
    
    state "Service Orchestration" as SO {
        [*] --> Load_Balancer: nginx/Caddy
        Load_Balancer --> Auth_Service: Authentication & authorization
        Load_Balancer --> User_Service: User management
        Load_Balancer --> AI_Service: AI processing
        Load_Balancer --> Notification_Service: Email, push notifications
        Load_Balancer --> Analytics_Service: Usage tracking
        
        Auth_Service --> Database: User credentials
        User_Service --> Database: User profiles
        AI_Service --> External_AI: OpenAI, Replicate
        Notification_Service --> Email_Provider: SendGrid, etc.
        Analytics_Service --> Analytics_DB: Time-series data
    }
    
    state "Inter-Service Communication" as ISC {
        direction LR
        REST_APIs: HTTP/REST APIs
        Event_Bus: Redis Pub/Sub
        Message_Queue: Bull/BullMQ
        
        REST_APIs --> Synchronous: Direct service calls
        Event_Bus --> Asynchronous: Real-time events
        Message_Queue --> Background: Job processing
    }
    
    SO --> ISC
```

## Planned Service Architecture

### Core Services (Phase 2)

| Service | Purpose | Technology Stack | Database | External Dependencies |
|---------|---------|------------------|----------|----------------------|
| `auth-service` | User authentication, JWT management | Node.js, Fastify, bcrypt | PostgreSQL | None |
| `user-service` | User profiles, preferences, settings | Node.js, Fastify, Prisma | PostgreSQL | Auth Service |
| `ai-service` | AI request processing, model management | Python, FastAPI, LangChain | Redis (cache) | OpenAI, Replicate |
| `notification-service` | Email, push notifications, webhooks | Node.js, Fastify | PostgreSQL | SendGrid, FCM |
| `analytics-service` | Usage tracking, performance metrics | Node.js, Fastify | TimescaleDB | None |
| `file-service` | File uploads, image processing | Node.js, Fastify, Sharp | PostgreSQL | S3-compatible storage |

### Service Communication Patterns

```mermaid
sequenceDiagram
    participant C as Client (Vercel)
    participant LB as Load Balancer
    participant AS as Auth Service
    participant US as User Service
    participant AIS as AI Service
    participant DB as Database
    
    Note over C,DB: User Authentication Flow
    C->>LB: POST /auth/login
    LB->>AS: Forward request
    AS->>DB: Validate credentials
    DB->>AS: User data
    AS->>AS: Generate JWT
    AS->>LB: JWT token
    LB->>C: Authentication response
    
    Note over C,DB: Authenticated API Request
    C->>LB: GET /user/profile (with JWT)
    LB->>AS: Validate token
    AS->>LB: Token valid
    LB->>US: Get user profile
    US->>DB: Query user data
    DB->>US: User profile
    US->>LB: Profile response
    LB->>C: User profile
    
    Note over C,DB: AI Processing Request
    C->>LB: POST /ai/generate (with JWT)
    LB->>AS: Validate token
    AS->>LB: Token valid
    LB->>AIS: Process AI request
    AIS->>AIS: Queue background job
    AIS->>LB: Job ID response
    LB->>C: Processing started
    
    Note over AIS,DB: Background Processing
    AIS->>AIS: Process AI request
    AIS->>DB: Save result
    AIS->>C: WebSocket notification (optional)
```

## Docker Containerization Strategy

### Base Dockerfile Template
```dockerfile
# services/base.dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose Configuration
```yaml
# services/docker-compose.yml
version: '3.8'

services:
  # Core Infrastructure
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - auth-service
      - user-service
      - ai-service

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: internetfriends
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Application Services
  auth-service:
    build:
      context: ./auth-service
      target: production
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/internetfriends
      JWT_SECRET: ${JWT_SECRET}
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  user-service:
    build:
      context: ./user-service
      target: production
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/internetfriends
      AUTH_SERVICE_URL: http://auth-service:3001
    depends_on:
      - postgres
      - auth-service
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  ai-service:
    build:
      context: ./ai-service
      dockerfile: Dockerfile.python
      target: production
    environment:
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      REPLICATE_API_TOKEN: ${REPLICATE_API_TOKEN}
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: internetfriends-network
```

## Service Implementation Templates

### Auth Service Structure
```
services/auth-service/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── health.controller.js
│   ├── middleware/
│   │   ├── validation.js
│   │   └── rate-limit.js
│   ├── services/
│   │   ├── jwt.service.js
│   │   ├── password.service.js
│   │   └── user.service.js
│   ├── models/
│   │   └── user.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── health.routes.js
│   └── app.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

### AI Service Structure (Python/FastAPI)
```
services/ai-service/
├── src/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── generate.py
│   │   │   ├── models.py
│   │   │   └── health.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── models.py
│   ├── services/
│   │   ├── openai_service.py
│   │   ├── replicate_service.py
│   │   └── cache_service.py
│   ├── workers/
│   │   └── ai_worker.py
│   └── main.py
├── tests/
├── Dockerfile.python
├── requirements.txt
├── pyproject.toml
└── README.md
```

## Service Development Workflow

### Local Development Setup
```bash
# Start all services for development
cd services
docker-compose -f docker-compose.dev.yml up -d

# Or start individual services
cd auth-service && npm run dev
cd user-service && npm run dev
cd ai-service && python -m uvicorn main:app --reload
```

### Testing Strategy
```bash
# Unit tests (per service)
cd auth-service && npm test
cd user-service && npm test
cd ai-service && python -m pytest

# Integration tests (cross-service)
cd services && npm run test:integration

# E2E tests (full system)
cd services && npm run test:e2e
```

### Deployment Pipeline
```yaml
# .github/workflows/services-deploy.yml
name: Deploy Services
on:
  push:
    branches: [main]
    paths: ['services/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run service tests
        run: |
          cd services
          docker-compose -f docker-compose.test.yml up --abort-on-container-exit

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Hetzner
        run: |
          # SSH into Hetzner server
          # Pull latest images
          # Rolling deployment with zero downtime
          ssh ${{ secrets.HETZNER_USER }}@${{ secrets.HETZNER_HOST }} '
            cd /opt/internetfriends/services
            git pull origin main
            docker-compose pull
            docker-compose up -d --no-deps --build
          '
```

## Monitoring & Observability

### Health Check Implementation
```javascript
// services/shared/health.js
const healthCheck = {
  async database(pool) {
    try {
      const result = await pool.query('SELECT 1');
      return { status: 'healthy', latency: result.duration };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },

  async redis(client) {
    try {
      const start = Date.now();
      await client.ping();
      return { status: 'healthy', latency: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },

  async externalService(url) {
    try {
      const start = Date.now();
      const response = await fetch(url);
      return {
        status: response.ok ? 'healthy' : 'degraded',
        latency: Date.now() - start,
        statusCode: response.status
      };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
};

module.exports = { healthCheck };
```

### Metrics Collection
```javascript
// services/shared/metrics.js
const prometheus = require('prom-client');

// Default metrics
prometheus.collectDefaultMetrics();

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['service']
});

const backgroundJobs = new prometheus.Counter({
  name: 'background_jobs_total',
  help: 'Total number of background jobs processed',
  labelNames: ['service', 'job_type', 'status']
});

module.exports = {
  httpRequestDuration,
  activeConnections,
  backgroundJobs,
  register: prometheus.register
};
```

## Security Implementation

### Inter-Service Authentication
```javascript
// services/shared/auth.js
const jwt = require('jsonwebtoken');

class ServiceAuth {
  static generateServiceToken(serviceName) {
    return jwt.sign(
      { service: serviceName, type: 'service' },
      process.env.SERVICE_JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  static verifyServiceToken(token) {
    try {
      const payload = jwt.verify(token, process.env.SERVICE_JWT_SECRET);
      return payload.type === 'service' ? payload : null;
    } catch (error) {
      return null;
    }
  }

  static middleware() {
    return (req, res, next) => {
      const token = req.headers['x-service-token'];
      if (!token) {
        return res.status(401).json({ error: 'Service token required' });
      }

      const payload = this.verifyServiceToken(token);
      if (!payload) {
        return res.status(403).json({ error: 'Invalid service token' });
      }

      req.service = payload;
      next();
    };
  }
}

module.exports = { ServiceAuth };
```

## Data Management Strategy

### Database Migration System
```javascript
// services/shared/migrations.js
const migrations = {
  async up(db) {
    // Create tables, add columns, etc.
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
  },

  async down(db) {
    // Rollback changes
    await db.query('DROP TABLE IF EXISTS users');
  }
};

module.exports = { migrations };
```

### Event-Driven Architecture
```javascript
// services/shared/events.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

class EventBus {
  static async publish(event, data) {
    await redis.publish('events', JSON.stringify({ event, data, timestamp: Date.now() }));
  }

  static subscribe(events, handler) {
    const subscriber = new Redis(process.env.REDIS_URL);
    subscriber.subscribe('events');
    
    subscriber.on('message', (channel, message) => {
      const { event, data } = JSON.parse(message);
      if (events.includes(event)) {
        handler(event, data);
      }
    });

    return subscriber;
  }
}

// Usage examples
EventBus.publish('USER_CREATED', { userId: '123', email: 'user@example.com' });
EventBus.publish('SETTINGS_UPDATED', { userId: '123', theme: 'dark' });

module.exports = { EventBus };
```

## Epic Integration

### Current Epic: Services Foundation
- 🎯 Design service architecture and communication patterns
- 🎯 Create base Docker containers and orchestration
- 🎯 Implement core auth and user services
- 🎯 Set up monitoring and health checking
- 🎯 Create deployment pipeline

### Next Epic: Service Migration
- 🎯 Migrate API endpoints from Vercel to Hetzner services
- 🎯 Implement load balancing and failover
- 🎯 Add comprehensive logging and metrics
- 🎯 Performance testing and optimization

### Future Epic: Advanced Features
- 🎯 Implement event-driven architecture
- 🎯 Add background job processing
- 🎯 Create service mesh for advanced communication
- 🎯 Implement distributed tracing

---

**Implementation Roadmap:**
1. **Week 1-2**: Set up base infrastructure (Docker, databases, load balancer)
2. **Week 3-4**: Implement auth-service and user-service
3. **Week 5-6**: Create AI service and notification service  
4. **Week 7-8**: Add monitoring, logging, and deployment automation
5. **Week 9-10**: Performance testing and optimization
6. **Week 11-12**: Full migration from Vercel API routes

This services layer will provide the foundation for scalable, maintainable backend services that can handle enterprise-level workloads while maintaining the flexibility to evolve with our needs.