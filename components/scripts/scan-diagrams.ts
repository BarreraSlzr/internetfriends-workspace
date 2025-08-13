#!/usr/bin/env bun
/**
 * Diagram Lint Script - validates state machine diagram frontmatter
 * Ensures all .mmd files have required comment tokens for traceability
 */

import { generateStamp, getIsoTimestamp } from '../utils/stamp';

// Ambient declarations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Bun: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any  
declare const process: any;
interface ImportMeta { main?: boolean }

interface DiagramInfo {
  filePath: string;
  id?: string;
  title?: string;
  createdAt?: string;
  stamp?: string;
  description?: string;
  valid: boolean;
  missingTokens: string[];
}

interface LintResult {
  runId: string;
  timestamp: string;
  total: number;
  valid: number;
  invalid: number;
  diagrams: DiagramInfo[];
}

const REQUIRED_TOKENS = ['id', 'title', 'createdAt', 'stamp', 'description'];

async function lintDiagram(filePath: string): Promise<DiagramInfo> {
  try {
    const content = await Bun.file(filePath).text();
    const info: DiagramInfo = {
      filePath,
      valid: true,
      missingTokens: []
    };
    
    // Extract frontmatter comment tokens  
    const commentMatch = content.match(/^%%\s*$([\s\S]*?)^%%\s*$/m);
    if (!commentMatch) {
      info.valid = false;
      info.missingTokens = [...REQUIRED_TOKENS];
      return info;
    }
    
    const frontmatter = commentMatch[1];
    for (const token of REQUIRED_TOKENS) {
      const tokenRegex = new RegExp(`%%\\s*${token}:\\s*(.*)$`, 'im');
      const match = frontmatter.match(tokenRegex);
      if (match) {
        (info as any)[token] = match[1].trim();
      } else {
        info.valid = false;
        info.missingTokens.push(token);
      }
    }
    
    return info;
  } catch (error) {
    return {
      filePath,
      valid: false,
      missingTokens: [...REQUIRED_TOKENS]
    };
  }
}

async function scanDiagrams(): Promise<LintResult> {
  const glob = new Bun.Glob("**/*.mmd");
  const diagrams: DiagramInfo[] = [];
  
  // Scan from docs/state directory
  for await (const file of glob.scan("../docs/state")) {
    const fullPath = `../docs/state/${file}`;
    const info = await lintDiagram(fullPath);
    diagrams.push(info);
  }
  
  return {
    runId: generateStamp(),
    timestamp: getIsoTimestamp(),
    total: diagrams.length,
    valid: diagrams.filter(d => d.valid).length,
    invalid: diagrams.filter(d => !d.valid).length,
    diagrams
  };
}

if ((import.meta as ImportMeta).main) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  
  const result = await scanDiagrams();
  
  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('Diagram Lint Results');
    console.log('===================');
    console.log(`Total: ${result.total}, Valid: ${result.valid}, Invalid: ${result.invalid}`);
    
    for (const diagram of result.diagrams) {
      const status = diagram.valid ? '✅' : '❌';
      console.log(`\n${status} ${diagram.filePath}`);
      if (!diagram.valid) {
        console.log(`  Missing: ${diagram.missingTokens.join(', ')}`);
      } else {
        console.log(`  ID: ${diagram.id}, Title: ${diagram.title}`);
      }
    }
  }
  
  // Exit non-zero if any invalid diagrams
  process.exit(result.invalid > 0 ? 1 : 0);
}

export { lintDiagram, scanDiagrams };

