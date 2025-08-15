#!/usr/bin/env bun

/**
 * OpenCode Session Manager
 * Enhanced session management with context preservation, agent specialization, and workflow templates
 */

import { spawn } from "bun";
import { createAuthManager } from "../lib/auth/vercel-auth-manager";
import { generateDelegation } from "../components/scripts/opencode-delegate";
import { generateStamp, getIsoTimestamp } from "../components/utils/stamp";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

interface SessionContext {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  agentType: 'general' | 'refactor' | 'feature' | 'debug' | 'docs' | 'perf';
  workingDirectory: string;
  lastCommand?: string;
  context: {
    files: string[];
    tasks: string[];
    notes: string[];
    progress: string;
  };
  templates?: string[];
}

interface AgentProfile {
  type: string;
  name: string;
  description: string;
  systemPrompt: string;
  defaultArgs: string[];
  environment: Record<string, string>;
  templates: string[];
}

interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  agentType: string;
  tasks: string[];
  context: Partial<SessionContext['context']>;
  autoRun?: boolean;
}

class OpenCodeSessionManager {
  private authManager: ReturnType<typeof createAuthManager>;
  private configDir: string;
  private sessionsDir: string;
  
  constructor() {
    this.authManager = createAuthManager();
    this.configDir = join(process.env.HOME || ".", ".config", "opencode");
    this.sessionsDir = join(this.configDir, "sessions");
  }

  async initialize(): Promise<void> {
    await mkdir(this.configDir, { recursive: true });
    await mkdir(this.sessionsDir, { recursive: true });
    await this.authManager.initialize();
  }

  /**
   * Agent Profiles for specialized workflows
   */
  private getAgentProfiles(): Record<string, AgentProfile> {
    return {
      general: {
        type: 'general',
        name: 'General Assistant',
        description: 'Standard OpenCode session for general development tasks',
        systemPrompt: 'You are a helpful software engineering assistant.',
        defaultArgs: [],
        environment: {},
        templates: ['basic', 'debug', 'docs']
      },
      refactor: {
        type: 'refactor',
        name: 'Refactoring Specialist',
        description: 'Focused on code refactoring and architectural improvements',
        systemPrompt: 'You are a refactoring specialist. Focus on code quality, patterns, and maintainability.',
        defaultArgs: ['--context=refactor'],
        environment: { OPENCODE_MODE: 'refactor' },
        templates: ['refactor-component', 'extract-utility', 'modernize-patterns']
      },
      feature: {
        type: 'feature',
        name: 'Feature Developer',
        description: 'Building new features with comprehensive testing and documentation',
        systemPrompt: 'You are a feature developer. Build complete, tested, documented features.',
        defaultArgs: ['--context=feature'],
        environment: { OPENCODE_MODE: 'feature' },
        templates: ['feature-complete', 'component-with-tests', 'api-endpoint']
      },
      debug: {
        type: 'debug',
        name: 'Debug Specialist',
        description: 'Focused on finding and fixing bugs with systematic approach',
        systemPrompt: 'You are a debugging specialist. Use systematic approaches to identify and fix issues.',
        defaultArgs: ['--context=debug'],
        environment: { OPENCODE_MODE: 'debug' },
        templates: ['bug-hunt', 'error-analysis', 'performance-debug']
      },
      docs: {
        type: 'docs',
        name: 'Documentation Expert',
        description: 'Creating comprehensive documentation and guides',
        systemPrompt: 'You are a documentation expert. Create clear, comprehensive, and useful documentation.',
        defaultArgs: ['--context=docs'],
        environment: { OPENCODE_MODE: 'docs' },
        templates: ['api-docs', 'user-guide', 'architecture-docs']
      },
      perf: {
        type: 'perf',
        name: 'Performance Optimizer',
        description: 'Optimizing performance with metrics and monitoring',
        systemPrompt: 'You are a performance optimization expert. Use data-driven approaches to improve performance.',
        defaultArgs: ['--context=perf'],
        environment: { OPENCODE_MODE: 'perf' },
        templates: ['perf-audit', 'bundle-optimize', 'runtime-optimize']
      }
    };
  }

  /**
   * Session Templates for common workflows
   */
  private getSessionTemplates(): Record<string, SessionTemplate> {
    return {
      'basic': {
        id: 'basic',
        name: 'Basic Development',
        description: 'General development session',
        agentType: 'general',
        tasks: ['Analyze requirements', 'Implement solution', 'Test changes'],
        context: { files: [], tasks: [], notes: [], progress: '0%' }
      },
      'feature-complete': {
        id: 'feature-complete',
        name: 'Complete Feature Development',
        description: 'Full feature with tests, docs, and validation',
        agentType: 'feature',
        tasks: [
          'Analyze requirements and dependencies',
          'Design component/API structure', 
          'Implement core functionality',
          'Add comprehensive tests',
          'Create documentation',
          'Validate with build/lint/test suite'
        ],
        context: { 
          files: [], 
          tasks: [], 
          notes: ['Remember to follow atomic design patterns', 'Use SCSS modules only'], 
          progress: '0%' 
        },
        autoRun: false
      },
      'refactor-component': {
        id: 'refactor-component',
        name: 'Component Refactoring',
        description: 'Systematic component improvement',
        agentType: 'refactor',
        tasks: [
          'Analyze current component structure',
          'Identify improvement opportunities',
          'Refactor with pattern compliance',
          'Update tests and documentation',
          'Validate changes'
        ],
        context: { files: [], tasks: [], notes: ['Check helper.scoring results first'], progress: '0%' }
      },
      'bug-hunt': {
        id: 'bug-hunt',
        name: 'Bug Investigation',
        description: 'Systematic bug identification and fixing',
        agentType: 'debug',
        tasks: [
          'Reproduce the issue',
          'Analyze error logs and stack traces',
          'Identify root cause',
          'Implement fix with tests',
          'Verify fix resolves issue'
        ],
        context: { files: [], tasks: [], notes: ['Document reproduction steps'], progress: '0%' }
      },
      'perf-audit': {
        id: 'perf-audit',
        name: 'Performance Audit',
        description: 'Comprehensive performance analysis and optimization',
        agentType: 'perf',
        tasks: [
          'Run performance measurement scripts',
          'Analyze bundle size and critical CSS',
          'Identify optimization opportunities',
          'Implement optimizations',
          'Validate improvements with metrics'
        ],
        context: { 
          files: [], 
          tasks: [], 
          notes: ['Use scripts/perf/ tools', 'Check against perf.budgets.json'], 
          progress: '0%' 
        }
      }
    };
  }

  /**
   * Create a new session with optional template
   */
  async createSession(options: {
    title: string;
    description?: string;
    agentType?: string;
    template?: string;
    workingDirectory?: string;
  }): Promise<SessionContext> {
    const { title, description = '', agentType = 'general', template, workingDirectory = process.cwd() } = options;
    
    const sessionId = generateStamp();
    const timestamp = getIsoTimestamp();
    
    let context: SessionContext['context'] = {
      files: [],
      tasks: [],
      notes: [],
      progress: '0%'
    };

    // Apply template if specified
    if (template) {
      const templates = this.getSessionTemplates();
      const sessionTemplate = templates[template];
      if (sessionTemplate) {
        context = { ...context, ...sessionTemplate.context };
        if (sessionTemplate.tasks) {
          context.tasks = [...sessionTemplate.tasks];
        }
      }
    }

    const session: SessionContext = {
      id: sessionId,
      createdAt: timestamp,
      updatedAt: timestamp,
      title,
      description,
      agentType: agentType as SessionContext['agentType'],
      workingDirectory,
      context,
      templates: template ? [template] : undefined
    };

    await this.saveSession(session);
    return session;
  }

  /**
   * Save session context
   */
  private async saveSession(session: SessionContext): Promise<void> {
    const sessionFile = join(this.sessionsDir, `${session.id}.json`);
    await writeFile(sessionFile, JSON.stringify(session, null, 2));
  }

  /**
   * Load session context
   */
  async loadSession(sessionId: string): Promise<SessionContext | null> {
    try {
      const sessionFile = join(this.sessionsDir, `${sessionId}.json`);
      const content = await readFile(sessionFile, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<SessionContext[]> {
    try {
      const { readdir } = await import('fs/promises');
      const files = await readdir(this.sessionsDir);
      const sessions: SessionContext[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const sessionId = file.replace('.json', '');
          const session = await this.loadSession(sessionId);
          if (session) sessions.push(session);
        }
      }
      
      return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch {
      return [];
    }
  }

  /**
   * Start OpenCode with session context
   */
  async startSession(sessionId: string, args: string[] = []): Promise<void> {
    const session = await this.loadSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const profile = this.getAgentProfiles()[session.agentType];
    const env = await this.authManager.getOpenCodeEnv();
    
    // Combine environments
    const sessionEnv = {
      ...env,
      ...profile.environment,
      OPENCODE_SESSION_ID: session.id,
      OPENCODE_SESSION_CONTEXT: JSON.stringify(session.context)
    };

    console.log(`🚀 Starting OpenCode session: ${session.title}`);
    console.log(`   Agent: ${profile.name}`);
    console.log(`   Directory: ${session.workingDirectory}`);
    console.log(`   Progress: ${session.context.progress}`);
    
    if (session.context.tasks.length > 0) {
      console.log("📋 Session Tasks:");
      session.context.tasks.forEach((task, i) => {
        console.log(`   ${i + 1}. ${task}`);
      });
    }

    // Update session access time
    session.updatedAt = getIsoTimestamp();
    await this.saveSession(session);

    // Start OpenCode with session context
    const opencode = spawn(["opencode", ...profile.defaultArgs, ...args], {
      env: { ...process.env, ...sessionEnv },
      cwd: session.workingDirectory,
      stdio: ["inherit", "inherit", "inherit"],
    });

    const exitCode = await opencode.exited;
    process.exit(exitCode);
  }

  /**
   * Show session status and management commands
   */
  async showStatus(): Promise<void> {
    const sessions = await this.listSessions();
    const profiles = this.getAgentProfiles();
    const templates = this.getSessionTemplates();

    console.log("📊 OpenCode Session Manager Status");
    console.log("===================================");
    
    // Auth status
    try {
      const env = await this.authManager.getOpenCodeEnv();
      const stats = await this.authManager.getUsageStats();
      console.log("🔐 Authentication:");
      console.log(`   Status: ✅ Active`);
      console.log(`   Daily usage: ${stats.daily}/${stats.dailyLimit}`);
    } catch {
      console.log("🔐 Authentication: ❌ Error");
    }

    // Sessions
    console.log(`\n📋 Sessions (${sessions.length}):`);
    if (sessions.length === 0) {
      console.log("   No sessions found");
    } else {
      sessions.slice(0, 5).forEach(session => {
        const profile = profiles[session.agentType];
        console.log(`   ${session.id}: ${session.title}`);
        console.log(`     Agent: ${profile.name} | Progress: ${session.context.progress}`);
        console.log(`     Updated: ${new Date(session.updatedAt).toLocaleString()}`);
      });
      if (sessions.length > 5) {
        console.log(`   ... and ${sessions.length - 5} more`);
      }
    }

    // Agent profiles
    console.log(`\n🤖 Available Agents:`);
    Object.values(profiles).forEach(profile => {
      console.log(`   ${profile.type}: ${profile.name}`);
      console.log(`     ${profile.description}`);
    });

    // Templates
    console.log(`\n📝 Session Templates:`);
    Object.values(templates).forEach(template => {
      console.log(`   ${template.id}: ${template.name}`);
      console.log(`     ${template.description} (${template.agentType} agent)`);
    });
  }
}

async function main(): Promise<void> {
  const manager = new OpenCodeSessionManager();
  await manager.initialize();
  
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case "new":
    case "create": {
      const title = args[0];
      if (!title) {
        console.error("Usage: session-manager new <title> [--agent=type] [--template=name] [--desc=description]");
        process.exit(1);
      }
      
      const agentType = args.find(arg => arg.startsWith('--agent='))?.split('=')[1];
      const template = args.find(arg => arg.startsWith('--template='))?.split('=')[1];
      const description = args.find(arg => arg.startsWith('--desc='))?.split('=')[1];
      
      const session = await manager.createSession({
        title,
        description,
        agentType,
        template
      });
      
      console.log(`✅ Created session: ${session.id}`);
      console.log(`   Title: ${session.title}`);
      console.log(`   Agent: ${session.agentType}`);
      if (template) console.log(`   Template: ${template}`);
      
      // Auto-start if requested
      if (args.includes('--start')) {
        await manager.startSession(session.id);
      }
      break;
    }
    
    case "start":
    case "resume": {
      const sessionId = args[0];
      if (!sessionId) {
        console.error("Usage: session-manager start <session-id>");
        process.exit(1);
      }
      await manager.startSession(sessionId, args.slice(1));
      break;
    }
    
    case "list":
    case "ls": {
      const sessions = await manager.listSessions();
      if (sessions.length === 0) {
        console.log("No sessions found");
      } else {
        console.log("📋 OpenCode Sessions:");
        sessions.forEach(session => {
          console.log(`   ${session.id}: ${session.title}`);
          console.log(`     Agent: ${session.agentType} | Progress: ${session.context.progress}`);
          console.log(`     Updated: ${new Date(session.updatedAt).toLocaleString()}`);
          console.log();
        });
      }
      break;
    }
    
    case "status":
    case "info":
      await manager.showStatus();
      break;
      
    case "help":
      console.log("OpenCode Session Manager");
      console.log("========================");
      console.log("");
      console.log("Commands:");
      console.log("  new <title> [options]      - Create new session");
      console.log("    --agent=<type>           - Set agent type (general, refactor, feature, debug, docs, perf)");
      console.log("    --template=<name>        - Use session template");
      console.log("    --desc=<description>     - Set description");
      console.log("    --start                  - Auto-start session after creation");
      console.log("");
      console.log("  start <session-id>         - Start/resume session");
      console.log("  list                       - List all sessions");
      console.log("  status                     - Show manager status and available options");
      console.log("  help                       - Show this help");
      console.log("");
      console.log("Examples:");
      console.log("  bun session-manager new 'Fix header performance' --agent=perf --template=perf-audit");
      console.log("  bun session-manager new 'Build user dashboard' --agent=feature --template=feature-complete --start");
      console.log("  bun session-manager start abc123");
      break;
      
    default:
      console.error("Unknown command. Use 'help' for usage information.");
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});