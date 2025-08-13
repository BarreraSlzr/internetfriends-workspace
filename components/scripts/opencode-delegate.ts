#!/usr/bin/env bun
/**
 * OpenCode Delegation Orchestrator
 * Generates structured session tasks (steps) for OpenCode to execute.
 * Ensures canonical timestamps, param object pattern, and future fossilization alignment.
 */

import { generateStamp, getIsoTimestamp } from '../utils/stamp';
// Ambient fallbacks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;
interface ImportMeta { main?: boolean }

interface DelegationTask {
  id: string;
  createdAt: string;
  stamp: string;
  title: string;
  description: string;
  category: 'analysis' | 'refactor' | 'docs' | 'test' | 'validation';
  priority: 'high' | 'normal' | 'low';
  steps: string[];
  blockers?: string[];
  ready: boolean;
}

interface GenerateDelegationParams {
  focus?: string; // high-level intent
  mode?: 'component' | 'docs' | 'infra' | 'mixed';
  includeDocs?: boolean;
  includeTests?: boolean;
}

interface DelegationBundle {
  runId: string;
  createdAt: string;
  stamp: string;
  focus: string;
  tasks: DelegationTask[];
  summary: {
    counts: Record<string, number>;
    highPriority: number;
    ready: number;
  };
}

function createTask(params: Omit<DelegationTask, 'id' | 'createdAt' | 'stamp'>): DelegationTask {
  return {
    id: generateStamp(),
    createdAt: getIsoTimestamp(),
    stamp: generateStamp(),
    ...params
  };
}

function generateDelegation(params: GenerateDelegationParams): DelegationBundle {
  const { focus = 'improve orchestrator + state documentation', mode = 'mixed', includeDocs = true, includeTests = true } = params;
  const baseTasks: DelegationTask[] = [];

  // Analysis task
  baseTasks.push(createTask({
    title: 'Analyze component coverage for helper scoring',
    description: 'Scan all molecular/atomic components to ensure scoring dimensions align with patterns.yaml; identify gaps (e.g., theme usage, memoization).',
    category: 'analysis',
    priority: 'high',
    steps: [
      'Run helper with --all --json',
      'Aggregate missing pattern categories',
      'Propose new scoring factors if needed',
      'Document decisions in PR description'
    ],
    ready: true
  }));

  // Refactor task
  baseTasks.push(createTask({
    title: 'Refactor helper to emit event hooks (future fossilization)',
    description: 'Inject lightweight event emitter interface; each component analysis emits analysis event (no persistence yet).',
    category: 'refactor',
    priority: 'normal',
    steps: [
      'Define minimal Emitter interface',
      'Add --events flag to enable emission',
      'Emit analysis: { component, score, suggestions }',
      'Update README with usage'
    ],
    ready: true
  }));

  if (includeDocs) {
    baseTasks.push(createTask({
      title: 'Add sequence diagram for component analysis loop',
      description: 'Create sequenceDiagram describing helper invocation -> iteration -> aggregate -> output.',
      category: 'docs',
      priority: 'normal',
      steps: [
        'Create orchestration.analysis.sequence.mmd',
        'Follow guide frontmatter',
        'Link from state README index'
      ],
      ready: true
    }));
  }

  if (includeTests) {
    baseTasks.push(createTask({
      title: 'Add unit tests for scoring edge cases',
      description: 'Test raw Date detection, missing disabled, >8 props, banned pattern, stamp & iso presence.',
      category: 'test',
      priority: 'high',
      steps: [
        'Create tests/helper.scoring.test.ts',
        'Mock component content variations',
        'Assert expected deductions and suggestions',
        'Integrate into existing test script'
      ],
      ready: false,
      blockers: ['Test harness / runner config not present yet']
    }));
  }

  // Validation task
  baseTasks.push(createTask({
    title: 'Prepare diagram lint script scaffold',
    description: 'Add placeholder scripts/scan-diagrams.ts that lists diagrams and verifies frontmatter tokens.',
    category: 'validation',
    priority: 'low',
    steps: [
      'List all *.mmd under docs/state',
      'Check for required comment tokens (id,title,createdAt,stamp,description)',
      'Print JSON summary',
      'Exit non-zero if any missing'
    ],
    ready: true
  }));

  const counts: Record<string, number> = {};
  for (const t of baseTasks) counts[t.category] = (counts[t.category] || 0) + 1;

  return {
    runId: generateStamp(),
    createdAt: getIsoTimestamp(),
    stamp: generateStamp(),
    focus,
    tasks: baseTasks,
    summary: {
      counts,
      highPriority: baseTasks.filter(t => t.priority === 'high').length,
      ready: baseTasks.filter(t => t.ready).length
    }
  };
}

if ((import.meta as ImportMeta).main) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const bundle = generateDelegation({});
  if (json) {
    console.log(JSON.stringify(bundle, null, 2));
  } else {
    console.log('OpenCode Delegation Plan');
    console.log('========================');
    console.log(`Focus: ${bundle.focus}`);
    for (const task of bundle.tasks) {
      console.log(`\n• ${task.title} [${task.category}] (${task.priority})`);
      console.log(`  Ready: ${task.ready ? 'yes' : 'no'}`);
      if (task.blockers?.length) console.log(`  Blockers: ${task.blockers.join(', ')}`);
      task.steps.forEach((s, i) => console.log(`    ${i + 1}. ${s}`));
    }
  }
}

export { generateDelegation, generateStamp, getIsoTimestamp };
