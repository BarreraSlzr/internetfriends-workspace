#!/usr/bin/env bun

/**
 * OpenCode Session Helper for InternetFriends Components
 * Provides quick validation and pattern checking for steadiest addressability
 */

import { generateStamp, getIsoTimestamp } from '../utils/stamp';

interface ComponentAnalysis {
  name: string;
  propsCount: number;
  hasDisabled: boolean;
  hasTestId: boolean;
  hasStamp: boolean;
  hasIsoTimestamp: boolean;
  hasRawDateUsage: boolean;
  score: number;
  suggestions: string[];
}

interface AnalysisEvent {
  type: 'analysis';
  runId: string;
  timestamp: string;
  filePath: string;
  analysis: ComponentAnalysis;
}

interface EventEmitter {
  emit(event: AnalysisEvent): void;
}

class ConsoleEventEmitter implements EventEmitter {
  emit(event: AnalysisEvent): void {
    console.error(`[EVENT] ${event.type}: ${event.analysis.name} score=${event.analysis.score}`);
  }
}

// Ambient declarations for Bun / Node when type defs not present
// These are lightweight and avoid adding deps just for helper script.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Bun: any; // Provided by Bun runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any; // Node/Bun process
interface ImportMeta { main?: boolean }

interface AnalyzeComponentParams { filePath: string }
interface QuickValidateParams { componentPath?: string; all?: boolean; limit?: number; json?: boolean; events?: boolean }
interface AggregateReport {
  runId: string;
  startedAt: string;
  completedAt: string;
  total: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  issues: Record<string, string[]>;
  components: ComponentAnalysis[];
}

class OpenCodeHelper {
  private emitter?: EventEmitter;
  private runId: string;

  constructor(emitter?: EventEmitter) {
    this.emitter = emitter;
    this.runId = generateStamp();
  }

  async analyzeComponent(params: AnalyzeComponentParams): Promise<ComponentAnalysis> {
    const { filePath } = params;
    try {
      const content = await Bun.file(filePath).text();
      
      // Extract component interface
      const propsMatch = content.match(/interface\s+(\w*Props)\s*{([^}]*)}/);
    if (!propsMatch) {
        return {
          name: 'Unknown',
          propsCount: 0,
          hasDisabled: false,
          hasTestId: false,
          hasStamp: false,
      hasIsoTimestamp: false,
      hasRawDateUsage: /Date\.now\(\)|new Date\(/.test(content),
          score: 0,
          suggestions: ['No Props interface found']
        };
      }
      
      const [, interfaceName, propsBlock] = propsMatch;
      const props = propsBlock.split(';').filter(p => p.trim() && !p.includes('//'));
      
      const analysis: ComponentAnalysis = {
        name: interfaceName,
        propsCount: props.length,
        hasDisabled: propsBlock.includes('disabled'),
        hasTestId: propsBlock.includes('data-testid'),
        hasStamp: content.includes('generateStamp'),
        hasIsoTimestamp: content.includes('getIsoTimestamp'),
        hasRawDateUsage: /Date\.now\(\)|new Date\(/.test(content),
        score: 0,
        suggestions: []
      };
      
      // Calculate score
      let score = 100;
      if (analysis.propsCount > 8) {
        score -= (analysis.propsCount - 8) * 10;
        analysis.suggestions.push(`Too many props (${analysis.propsCount}/8)`);
      }
      
      if (!analysis.hasDisabled) {
        score -= 10;
        analysis.suggestions.push('Consider adding disabled prop');
      }
      
      if (!analysis.hasTestId) {
        score -= 5;
        analysis.suggestions.push('Add data-testid for testing');
      }
      
      if (!analysis.hasStamp) {
        score -= 10;
        analysis.suggestions.push('Use generateStamp() for unique IDs');
      }

      if (!analysis.hasIsoTimestamp) {
        score -= 5;
        analysis.suggestions.push('Use getIsoTimestamp() for createdAt');
      }

      if (analysis.hasRawDateUsage) {
        score -= 15;
        analysis.suggestions.push('Replace raw Date usage with getIsoTimestamp()/generateStamp()');
      }
      
      // Check for banned patterns
      const bannedPatterns = ['Strategy', 'Config', 'Options'];
      for (const pattern of bannedPatterns) {
        if (propsBlock.includes(pattern)) {
          score -= 20;
          analysis.suggestions.push(`Avoid ${pattern} pattern`);
        }
      }
      
      analysis.score = Math.max(0, Math.min(100, score));
      
      // Emit analysis event if emitter configured
      if (this.emitter) {
        this.emitter.emit({
          type: 'analysis',
          runId: this.runId,
          timestamp: getIsoTimestamp(),
          filePath,
          analysis
        });
      }
      
      return analysis;
      
    } catch (error) {
      return {
        name: 'Error',
        propsCount: 0,
        hasDisabled: false,
        hasTestId: false,
        hasStamp: false,
        hasIsoTimestamp: false,
        hasRawDateUsage: false,
        score: 0,
        suggestions: [`Error analyzing file: ${error}`]
      };
    }
  }
  
  async quickValidate(params: QuickValidateParams): Promise<AggregateReport | void> {
    const { componentPath, all = false, limit = 5, json = false, events = false } = params;
    const startedAt = getIsoTimestamp();
    const runId = generateStamp();
    const analyses: ComponentAnalysis[] = [];

    console.log('🎭 OpenCode Quick Validation');
    console.log('==========================');

    if (componentPath) {
      const analysis = await this.analyzeComponent({ filePath: componentPath });
      analyses.push(analysis);
      this.printAnalysis(analysis, { current: 1, total: 1 });
    } else {
      const files = await this.findComponentFiles('.');
      const targetFiles = all ? files : files.slice(0, limit);
      let index = 0;
      for (const file of targetFiles) {
        index += 1;
        const analysis = await this.analyzeComponent({ filePath: file });
        analyses.push(analysis);
        this.printAnalysis(analysis, { current: index, total: targetFiles.length });
      }
    }

    const completedAt = getIsoTimestamp();
    const aggregate = this.buildAggregate({ runId, startedAt, completedAt, analyses });
    this.printAggregateSummary(aggregate);
    if (json) {
      console.log('\nJSON_REPORT ' + JSON.stringify(aggregate));
      return aggregate;
    }
  }

  private buildAggregate(params: { runId: string; startedAt: string; completedAt: string; analyses: ComponentAnalysis[] }): AggregateReport {
    const { runId, startedAt, completedAt, analyses } = params;
    const scores = analyses.map(a => a.score);
    const issues: Record<string, string[]> = {};
    for (const a of analyses) {
      if (a.suggestions.length) issues[a.name] = a.suggestions;
    }
    return {
      runId,
      startedAt,
      completedAt,
      total: analyses.length,
      averageScore: analyses.length ? Number((scores.reduce((s, v) => s + v, 0) / analyses.length).toFixed(2)) : 0,
      minScore: analyses.length ? Math.min(...scores) : 0,
      maxScore: analyses.length ? Math.max(...scores) : 0,
      issues,
      components: analyses
    };
  }

  private printAggregateSummary(report: AggregateReport): void {
    console.log('\n—— Aggregate Summary ——');
    console.log(` Run ID: ${report.runId}`);
    console.log(` Components: ${report.total}`);
    console.log(` Average Score: ${report.averageScore}`);
    console.log(` Min/Max: ${report.minScore}/${report.maxScore}`);
    if (Object.keys(report.issues).length) {
      console.log(' Components With Suggestions:');
      for (const [name, suggestions] of Object.entries(report.issues)) {
        console.log(`  • ${name}: ${suggestions.length} suggestions`);
      }
    }
  }
  
  private printAnalysis(analysis: ComponentAnalysis, progress?: { current: number; total: number }): void {
    const scoreColor = analysis.score >= 90 ? '🟢' : analysis.score >= 70 ? '🟡' : '🔴';
    const progressPrefix = progress ? `[${progress.current}/${progress.total}] ` : '';
    console.log(`\n${progressPrefix}${scoreColor} ${analysis.name} - Score: ${analysis.score}/100`);
    console.log(`  Props: ${analysis.propsCount}/8`);
    console.log(
      `  Patterns: disabled:${analysis.hasDisabled ? '✅' : '❌'} testid:${analysis.hasTestId ? '✅' : '❌'} stamp:${analysis.hasStamp ? '✅' : '❌'} iso:${analysis.hasIsoTimestamp ? '✅' : '❌'} rawDate:${analysis.hasRawDateUsage ? '⚠️' : '✅'}`
    );
    
    if (analysis.suggestions.length > 0) {
      console.log('  Suggestions:');
      analysis.suggestions.forEach(s => console.log(`    • ${s}`));
    }
  }
  
  private async findComponentFiles(dir: string): Promise<string[]> {
    const glob = new Bun.Glob("**/*.{tsx,ts}");
    const entries: string[] = [];
    for await (const file of glob.scan(dir)) {
      entries.push(file as string);
    }
    return entries.filter(f => 
      !f.includes('node_modules') && 
      !f.includes('dist') && 
      (f.includes('.atomic.') || f.includes('.molecular.') || f.includes('.organisms.'))
    );
  }
}

// CLI interface
if ((import.meta as ImportMeta).main) {
  const helper = new OpenCodeHelper();
  const args = (process.argv as string[]).slice(2);
  let componentPath: string | undefined;
  let all = false; let json = false; let limit = 5; let events = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--all') { all = true; }
    else if (a === '--json') { json = true; }
    else if (a === '--events') { events = true; }
    else if (a.startsWith('--limit=')) { const v = Number(a.split('=')[1]); if (!Number.isNaN(v)) limit = v; }
    else if (!a.startsWith('--') && !componentPath) { componentPath = a; }
  }
  
  // Set up event emitter if requested
  const emitter = events ? new ConsoleEventEmitter() : undefined;
  const helperWithEvents = new OpenCodeHelper(emitter);
  
  await helperWithEvents.quickValidate({ componentPath, all, json, limit, events });
}

export { AggregateReport, AnalyzeComponentParams, OpenCodeHelper, QuickValidateParams };

