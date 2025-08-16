#!/usr/bin/env bun
/**
 * OpenCode Visual Analysis Integration
 * Connects visual comparison results with workspace context for immediate actionability
 */

import { generateStamp, getIsoTimestamp } from '../nextjs-website/lib/utils/stamp';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

interface OpenCodeSessionContext {
  workspaceRoot: string;
  currentBranch: string;
  recentCommits: string[];
  openFiles: string[];
  projectType: 'internetfriends' | 'generic';
  timestamp: string;
  sessionId: string;
}

interface VisualAnalysisAction {
  type: 'file-edit' | 'git-command' | 'epic-command' | 'api-call' | 'investigation';
  description: string;
  command?: string;
  filePath?: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  dependencies?: string[];
}

interface ActionableSession {
  sessionId: string;
  createdAt: string;
  context: OpenCodeSessionContext;
  visualAnalysis: any;
  actions: VisualAnalysisAction[];
  quickCommands: string[];
  epicIntegration?: {
    epicName: string;
    features: string[];
  };
}

async function getWorkspaceContext(): Promise<OpenCodeSessionContext> {
  const workspaceRoot = process.cwd();
  
  try {
    // Get current branch
    const { stdout: branch } = await execAsync('git branch --show-current');
    const currentBranch = branch.trim();

    // Get recent commits
    const { stdout: commits } = await execAsync('git log --oneline -5');
    const recentCommits = commits.trim().split('\n');

    // Detect project type
    const isInternetFriends = existsSync(join(workspaceRoot, 'nextjs-website')) || 
                               existsSync(join(workspaceRoot, 'components'));

    return {
      workspaceRoot,
      currentBranch,
      recentCommits,
      openFiles: [], // Could be enhanced to detect actual open files
      projectType: isInternetFriends ? 'internetfriends' : 'generic',
      timestamp: getIsoTimestamp(),
      sessionId: generateStamp()
    };
  } catch (error) {
    console.warn('Failed to gather git context:', error);
    return {
      workspaceRoot,
      currentBranch: 'unknown',
      recentCommits: [],
      openFiles: [],
      projectType: 'generic',
      timestamp: getIsoTimestamp(),
      sessionId: generateStamp()
    };
  }
}

function interpretVisualAnalysisForOpenCode(
  visualAnalysis: any, 
  context: OpenCodeSessionContext
): VisualAnalysisAction[] {
  const actions: VisualAnalysisAction[] = [];

  // Parse analysis results and convert to actionable tasks
  if (visualAnalysis.analysis?.actionItems) {
    visualAnalysis.analysis.actionItems.forEach((item: any) => {
      // File editing actions
      if (item.files && item.files.length > 0) {
        actions.push({
          type: 'file-edit',
          description: `Edit ${item.files.join(', ')}: ${item.task}`,
          filePath: item.files[0], // Primary file
          priority: item.priority || 'medium',
          estimatedMinutes: parseEstimatedTime(item.estimatedTime),
          dependencies: item.files.slice(1) // Additional files
        });
      }

      // Epic integration for larger tasks
      if (item.priority === 'high' && item.estimatedTime && 
          parseEstimatedTime(item.estimatedTime) > 30) {
        actions.push({
          type: 'epic-command',
          description: `Start epic for: ${item.task}`,
          command: `./scripts/epic-tools/epic start visual-fix-${generateStamp().slice(-5)} --timeline="${item.estimatedTime}" --goal="${item.task}"`,
          priority: 'immediate',
          estimatedMinutes: 5
        });
      }
    });
  }

  // Add investigation actions based on findings
  if (visualAnalysis.analysis?.findings) {
    const criticalFindings = visualAnalysis.analysis.findings.filter(
      (f: any) => f.impact === 'high'
    );

    if (criticalFindings.length > 0) {
      actions.push({
        type: 'investigation',
        description: `Investigate ${criticalFindings.length} critical design issues`,
        priority: 'immediate',
        estimatedMinutes: criticalFindings.length * 15
      });
    }
  }

  // Git workflow actions for InternetFriends projects
  if (context.projectType === 'internetfriends') {
    actions.push({
      type: 'git-command',
      description: 'Create feature branch for visual fixes',
      command: `git checkout -b feature/visual-fixes-${generateStamp().slice(-8)}`,
      priority: 'high',
      estimatedMinutes: 2
    });

    // Design system specific actions
    actions.push({
      type: 'api-call',
      description: 'Capture current design system state',
      command: `curl -X POST http://localhost:3000/api/screenshot -H "Authorization: Bearer dev-screenshot-key-2024" -d '{"url":"http://localhost:3000/design-system"}'`,
      priority: 'medium',
      estimatedMinutes: 5
    });
  }

  return actions.sort((a, b) => {
    const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function parseEstimatedTime(timeString: string): number {
  if (!timeString) return 30; // Default 30 minutes
  
  const hourMatch = timeString.match(/(\d+)\s*hour/i);
  const minuteMatch = timeString.match(/(\d+)\s*min/i);
  
  let minutes = 0;
  if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
  if (minuteMatch) minutes += parseInt(minuteMatch[1]);
  
  return minutes || 30;
}

function generateQuickCommands(actions: VisualAnalysisAction[], context: OpenCodeSessionContext): string[] {
  const commands: string[] = [];

  // Add immediate actions as quick commands
  const immediateActions = actions.filter(a => a.priority === 'immediate');
  immediateActions.forEach(action => {
    if (action.command) {
      commands.push(action.command);
    }
  });

  // Add development server if not running
  if (context.projectType === 'internetfriends') {
    commands.push('# Start development server (if not running)');
    commands.push('bun run dev');
    commands.push('# Open design system page');
    commands.push('open http://localhost:3000/design-system?mode=visual-comparison');
  }

  // Add git status check
  commands.push('# Check current status');
  commands.push('git status');

  return commands;
}

async function createActionableSession(visualAnalysisResult: any): Promise<ActionableSession> {
  const context = await getWorkspaceContext();
  const actions = interpretVisualAnalysisForOpenCode(visualAnalysisResult, context);
  const quickCommands = generateQuickCommands(actions, context);

  // Epic integration for complex tasks
  let epicIntegration: ActionableSession['epicIntegration'];
  const epicActions = actions.filter(a => a.type === 'epic-command');
  if (epicActions.length > 0) {
    epicIntegration = {
      epicName: `visual-consistency-${generateStamp().slice(-5)}`,
      features: actions
        .filter(a => a.type === 'file-edit')
        .map(a => a.description.split(':')[0].trim())
    };
  }

  return {
    sessionId: generateStamp(),
    createdAt: getIsoTimestamp(),
    context,
    visualAnalysis: visualAnalysisResult,
    actions,
    quickCommands,
    epicIntegration
  };
}

function generateActionableMarkdown(session: ActionableSession): string {
  const { sessionId, createdAt, context, actions, quickCommands, epicIntegration } = session;

  return `# OpenCode Visual Analysis Session
**Session ID:** \`${sessionId}\`  
**Created:** ${createdAt}  
**Workspace:** \`${context.workspaceRoot}\`  
**Branch:** \`${context.currentBranch}\`

## 🎯 Immediate Actions
${actions
  .filter(a => a.priority === 'immediate')
  .map((action, i) => `
### ${i + 1}. ${action.description}
- **Type:** ${action.type}
- **Estimated Time:** ${action.estimatedMinutes} minutes
${action.command ? `- **Command:** \`${action.command}\`` : ''}
${action.filePath ? `- **File:** \`${action.filePath}\`` : ''}
`)
  .join('\n')}

## 📋 All Actions
${actions.map((action, i) => `
### ${i + 1}. ${action.description} (${action.priority.toUpperCase()})
- **Type:** ${action.type}
- **Time:** ${action.estimatedMinutes}min
${action.command ? `- **Command:** \`${action.command}\`` : ''}
${action.filePath ? `- **File:** \`${action.filePath}\`` : ''}
${action.dependencies ? `- **Dependencies:** ${action.dependencies.map(d => `\`${d}\``).join(', ')}` : ''}
`).join('\n')}

## ⚡ Quick Commands
\`\`\`bash
${quickCommands.join('\n')}
\`\`\`

${epicIntegration ? `
## 🎭 Epic Integration
**Epic Name:** \`${epicIntegration.epicName}\`  
**Features:** ${epicIntegration.features.map(f => `\`${f}\``).join(', ')}

\`\`\`bash
# Start epic for this visual analysis session
./scripts/epic-tools/epic start ${epicIntegration.epicName} --timeline="today" --goal="Visual consistency fixes"

# Add features
${epicIntegration.features.map(f => `./scripts/epic-tools/epic feature add ${epicIntegration.epicName} "${f}"`).join('\n')}
\`\`\`
` : ''}

## 🔍 Context
- **Project Type:** ${context.projectType}
- **Recent Commits:** ${context.recentCommits.slice(0, 3).join(', ')}
- **Session Workspace:** Ready for OpenCode integration

---
*Generated by OpenCode Visual Analysis Integration*
`;
}

// CLI usage
if (import.meta.main) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
OpenCode Visual Analysis Integration

Usage:
  bun scripts/opencode-visual-integration.ts [options]

Options:
  --context                 Show workspace context
  --test-analysis <file>    Test with analysis result file
  --json                    Output JSON format
  --help, -h               Show this help

Examples:
  bun scripts/opencode-visual-integration.ts --context
  bun scripts/opencode-visual-integration.ts --test-analysis analysis.json
`);
    process.exit(0);
  }

  if (args.includes('--context')) {
    getWorkspaceContext().then(context => {
      console.log(JSON.stringify(context, null, 2));
    });
  } else if (args.includes('--test-analysis')) {
    const fileIndex = args.indexOf('--test-analysis') + 1;
    const filename = args[fileIndex];
    
    if (filename && existsSync(filename)) {
      const analysisResult = JSON.parse(readFileSync(filename, 'utf-8'));
      createActionableSession(analysisResult).then(session => {
        if (args.includes('--json')) {
          console.log(JSON.stringify(session, null, 2));
        } else {
          console.log(generateActionableMarkdown(session));
        }
      });
    } else {
      console.error('Analysis file not found:', filename);
      process.exit(1);
    }
  } else {
    console.log('Use --help for usage information');
  }
}

export { 
  createActionableSession, 
  generateActionableMarkdown, 
  getWorkspaceContext,
  interpretVisualAnalysisForOpenCode
};