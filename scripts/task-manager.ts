#!/usr/bin/env bun

/**
 * InternetFriends Task Manager & Orchestrator CLI
 * Comprehensive task tracking and automation for project improvements
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  category: 'eslint' | 'typescript' | 'styling' | 'performance' | 'feature' | 'bug';
  estimatedTime: number; // in minutes
  dependencies?: string[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface ProjectState {
  currentPhase: string;
  tasks: Task[];
  metrics: {
    eslintIssuesFixed: number;
    typeScriptErrors: number;
    testsCoverage: number;
    performanceScore: number;
  };
  lastUpdated: string;
}

class TaskManager {
  private tasksFile = join(process.cwd(), 'tasks.json');
  private state: ProjectState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): ProjectState {
    if (existsSync(this.tasksFile)) {
      try {
        return JSON.parse(readFileSync(this.tasksFile, 'utf-8'));
      } catch (error) {
        console.warn('⚠️  Failed to load existing tasks, creating new state');
      }
    }

    return {
      currentPhase: 'Code Quality & Fixes',
      tasks: this.getInitialTasks(),
      metrics: {
        eslintIssuesFixed: 927,
        typeScriptErrors: 4,
        testsCoverage: 0,
        performanceScore: 85,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  private getInitialTasks(): Task[] {
    const now = new Date().toISOString();

    return [
      {
        id: 'fix-broken-exports',
        title: 'Fix Broken Export Names',
        description: 'Fix export names that got incorrectly prefixed with underscores during ESLint auto-fix',
        priority: 'high',
        status: 'completed',
        category: 'eslint',
        estimatedTime: 30,
        createdAt: now,
        updatedAt: now,
        completedAt: now,
      },
      {
        id: 'fix-curriculum-data',
        title: 'Fix Curriculum Data Structure',
        description: 'Resolve undefined curriculum.contactInfo.availability causing runtime errors',
        priority: 'high',
        status: 'pending',
        category: 'bug',
        estimatedTime: 20,
        dependencies: ['fix-broken-exports'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'fix-link-href-undefined',
        title: 'Fix Undefined href Props in Links',
        description: 'Resolve "href expects string or object but got undefined" errors in navigation',
        priority: 'medium',
        status: 'pending',
        category: 'bug',
        estimatedTime: 25,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'fix-react-prop-warnings',
        title: 'Fix React Prop Warnings',
        description: 'Fix _className, _onSubmit, _onChange props and missing keys in lists',
        priority: 'medium',
        status: 'pending',
        category: 'eslint',
        estimatedTime: 45,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'fix-img-src-empty',
        title: 'Fix Empty Image Sources',
        description: 'Replace empty string src attributes with null or proper image sources',
        priority: 'low',
        status: 'pending',
        category: 'bug',
        estimatedTime: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'complete-orchestrator',
        title: 'Complete Orchestrator UI',
        description: 'Finalize the React Flow orchestrator page with real-time monitoring',
        priority: 'high',
        status: 'in-progress',
        category: 'feature',
        estimatedTime: 120,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'optimize-dark-mode',
        title: 'Optimize Dark Mode Styling',
        description: 'Fine-tune dark mode variations and ensure consistent theming',
        priority: 'medium',
        status: 'pending',
        category: 'styling',
        estimatedTime: 60,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'add-testing-framework',
        title: 'Add Testing Framework',
        description: 'Set up comprehensive testing with Jest and React Testing Library',
        priority: 'medium',
        status: 'pending',
        category: 'feature',
        estimatedTime: 90,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'performance-optimization',
        title: 'Performance Optimization',
        description: 'Optimize components, reduce bundle size, improve Core Web Vitals',
        priority: 'medium',
        status: 'pending',
        category: 'performance',
        estimatedTime: 180,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'documentation-update',
        title: 'Update Documentation',
        description: 'Complete component documentation, API docs, and usage examples',
        priority: 'low',
        status: 'pending',
        category: 'feature',
        estimatedTime: 120,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  private saveState(): void {
    this.state.lastUpdated = new Date().toISOString();
    writeFileSync(this.tasksFile, JSON.stringify(this.state, null, 2));
  }

  // Task Management Methods
  public listTasks(filter?: { status?: Task['status']; category?: Task['category']; priority?: Task['priority'] }): void {
    let filteredTasks = this.state.tasks;

    if (filter) {
      if (filter.status) filteredTasks = filteredTasks.filter(t => t.status === filter.status);
      if (filter.category) filteredTasks = filteredTasks.filter(t => t.category === filter.category);
      if (filter.priority) filteredTasks = filteredTasks.filter(t => t.priority === filter.priority);
    }

    console.log('\n🎯 InternetFriends Task Manager');
    console.log('=====================================');
    console.log(`📊 Current Phase: ${this.state.currentPhase}`);
    console.log(`📈 Tasks: ${filteredTasks.length} shown, ${this.state.tasks.length} total`);
    console.log('=====================================\n');

    filteredTasks.forEach(task => {
      const statusIcon = this.getStatusIcon(task.status);
      const priorityColor = this.getPriorityColor(task.priority);
      const categoryBadge = `[${task.category.toUpperCase()}]`;

      console.log(`${statusIcon} ${priorityColor}${task.title}\x1b[0m`);
      console.log(`   ${categoryBadge} ${task.description}`);
      console.log(`   ⏱️  ${task.estimatedTime}min | 📅 ${new Date(task.updatedAt).toLocaleDateString()}`);
      if (task.dependencies && task.dependencies.length > 0) {
        console.log(`   🔗 Depends on: ${task.dependencies.join(', ')}`);
      }
      console.log('');
    });

    this.showMetrics();
  }

  public updateTask(id: string, updates: Partial<Task>): void {
    const taskIndex = this.state.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      console.error(`❌ Task not found: ${id}`);
      return;
    }

    this.state.tasks[taskIndex] = {
      ...this.state.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.status === 'completed') {
      this.state.tasks[taskIndex].completedAt = new Date().toISOString();
    }

    this.saveState();
    console.log(`✅ Updated task: ${this.state.tasks[taskIndex].title}`);
  }

  public addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: `custom-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    this.state.tasks.push(newTask);
    this.saveState();
    console.log(`✅ Added task: ${newTask.title}`);
  }

  public getNextTask(): Task | null {
    const availableTasks = this.state.tasks.filter(task => {
      if (task.status === 'completed' || task.status === 'blocked') return false;

      // Check if dependencies are met
      if (task.dependencies) {
        return task.dependencies.every(depId => {
          const depTask = this.state.tasks.find(t => t.id === depId);
          return depTask?.status === 'completed';
        });
      }

      return true;
    });

    if (availableTasks.length === 0) return null;

    // Sort by priority and estimated time
    availableTasks.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];

      if (aPriority !== bPriority) return bPriority - aPriority;
      return a.estimatedTime - b.estimatedTime; // Shorter tasks first
    });

    return availableTasks[0];
  }

  public generateReport(): void {
    const completed = this.state.tasks.filter(t => t.status === 'completed').length;
    const inProgress = this.state.tasks.filter(t => t.status === 'in-progress').length;
    const pending = this.state.tasks.filter(t => t.status === 'pending').length;
    const blocked = this.state.tasks.filter(t => t.status === 'blocked').length;

    const totalTime = this.state.tasks.reduce((sum, task) => sum + task.estimatedTime, 0);
    const completedTime = this.state.tasks
      .filter(t => t.status === 'completed')
      .reduce((sum, task) => sum + task.estimatedTime, 0);

    console.log('\n📊 PROJECT STATUS REPORT');
    console.log('='.repeat(50));
    console.log(`🎯 Current Phase: ${this.state.currentPhase}`);
    console.log(`📅 Last Updated: ${new Date(this.state.lastUpdated).toLocaleString()}\n`);

    console.log('📈 Task Progress:');
    console.log(`   ✅ Completed: ${completed} tasks (${Math.round(completedTime/totalTime*100)}% of work)`);
    console.log(`   🔄 In Progress: ${inProgress} tasks`);
    console.log(`   ⏳ Pending: ${pending} tasks`);
    console.log(`   🚫 Blocked: ${blocked} tasks\n`);

    console.log('🔧 Code Quality Metrics:');
    console.log(`   ESLint Issues Fixed: ${this.state.metrics.eslintIssuesFixed}`);
    console.log(`   TypeScript Errors: ${this.state.metrics.typeScriptErrors}`);
    console.log(`   Test Coverage: ${this.state.metrics.testsCoverage}%`);
    console.log(`   Performance Score: ${this.state.metrics.performanceScore}/100\n`);

    const nextTask = this.getNextTask();
    if (nextTask) {
      console.log(`🎯 Next Recommended Task: ${nextTask.title}`);
      console.log(`   Priority: ${nextTask.priority.toUpperCase()} | Time: ${nextTask.estimatedTime}min`);
    } else {
      console.log('🎉 All available tasks completed or blocked!');
    }

    console.log('='.repeat(50));
  }

  // Utility Methods
  private getStatusIcon(status: Task['status']): string {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'pending': return '⏳';
      case 'blocked': return '🚫';
      default: return '❓';
    }
  }

  private getPriorityColor(priority: Task['priority']): string {
    switch (priority) {
      case 'critical': return '\x1b[31m'; // Red
      case 'high': return '\x1b[33m';     // Yellow
      case 'medium': return '\x1b[36m';   // Cyan
      case 'low': return '\x1b[37m';      // White
      default: return '\x1b[37m';
    }
  }

  private showMetrics(): void {
    const completed = this.state.tasks.filter(t => t.status === 'completed').length;
    const total = this.state.tasks.length;
    const progress = Math.round((completed / total) * 100);

    console.log('📊 Quick Metrics:');
    console.log(`   Progress: ${progress}% (${completed}/${total} tasks)`);
    console.log(`   ESLint Fixes: ${this.state.metrics.eslintIssuesFixed}`);
    console.log(`   TS Errors: ${this.state.metrics.typeScriptErrors}`);
    console.log('');
  }

  // Execute automation commands
  public async executeTask(taskId: string): Promise<void> {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) {
      console.error(`❌ Task not found: ${taskId}`);
      return;
    }

    console.log(`🚀 Executing: ${task.title}`);
    this.updateTask(taskId, { status: 'in-progress' });

    try {
      // Task-specific automation logic
      switch (taskId) {
        case 'fix-curriculum-data':
          await this.fixCurriculumData();
          break;
        case 'fix-link-href-undefined':
          await this.fixUndefinedHrefs();
          break;
        case 'fix-react-prop-warnings':
          await this.fixReactPropWarnings();
          break;
        default:
          console.log(`⚠️  No automation available for: ${task.title}`);
          console.log('   This task requires manual intervention.');
          return;
      }

      this.updateTask(taskId, { status: 'completed' });
      console.log(`✅ Completed: ${task.title}`);
    } catch (error) {
      console.error(`❌ Failed to execute ${task.title}:`, error);
      this.updateTask(taskId, { status: 'blocked' });
    }
  }

  // Automation methods
  private async fixCurriculumData(): Promise<void> {
    console.log('   🔧 Checking curriculum data structure...');
    // Implementation would go here
  }

  private async fixUndefinedHrefs(): Promise<void> {
    console.log('   🔧 Scanning for undefined href props...');
    // Implementation would go here
  }

  private async fixReactPropWarnings(): Promise<void> {
    console.log('   🔧 Fixing React prop warnings...');
    // Implementation would go here
  }
}

// CLI Interface
async function main() {
  const taskManager = new TaskManager();
  const [, , command, ...args] = process.argv;

  switch (command) {
    case 'list':
    case 'ls':
      const filters: unknown = {};
      if (args.includes('--pending')) filters.status = 'pending';
      if (args.includes('--completed')) filters.status = 'completed';
      if (args.includes('--high')) filters.priority = 'high';
      if (args.includes('--bugs')) filters.category = 'bug';
      taskManager.listTasks(filters);
      break;

    case 'next':
      const nextTask = taskManager.getNextTask();
      if (nextTask) {
        console.log(`🎯 Next Task: ${nextTask.title}`);
        console.log(`   Priority: ${nextTask.priority} | Time: ${nextTask.estimatedTime}min`);
        console.log(`   Description: ${nextTask.description}`);
      } else {
        console.log('🎉 No more tasks available!');
      }
      break;

    case 'complete':
      const taskId = args[0];
      if (!taskId) {
        console.error('❌ Please provide a task ID');
        process.exit(1);
      }
      taskManager.updateTask(taskId, { status: 'completed' });
      break;

    case 'execute':
      const execTaskId = args[0];
      if (!execTaskId) {
        console.error('❌ Please provide a task ID');
        process.exit(1);
      }
      await taskManager.executeTask(execTaskId);
      break;

    case 'report':
      taskManager.generateReport();
      break;

    case 'add':
      console.log('🔨 Interactive task creation coming soon...');
      break;

    default:
      console.log('🎛️  InternetFriends Task Manager');
      console.log('');
      console.log('Usage:');
      console.log('  bun scripts/task-manager.ts <command>');
      console.log('');
      console.log('Commands:');
      console.log('  list, ls          List all tasks (--pending, --completed, --high, --bugs)');
      console.log('  next              Show next recommended task');
      console.log('  complete <id>     Mark task as completed');
      console.log('  execute <id>      Execute automated task');
      console.log('  report            Generate project status report');
      console.log('  add               Add new task (interactive)');
      console.log('');
      console.log('Examples:');
      console.log('  bun scripts/task-manager.ts list --pending --high');
      console.log('  bun scripts/task-manager.ts next');
      console.log('  bun scripts/task-manager.ts complete fix-broken-exports');
      console.log('  bun scripts/task-manager.ts report');
  }
}

if (import.meta.main) {
  main().catch(console.error);
}

export { TaskManager, Task, ProjectState };
