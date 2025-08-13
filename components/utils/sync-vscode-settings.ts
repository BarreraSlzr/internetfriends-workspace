#!/usr/bin/env bun

/**
 * ADDRESSABILITY SETTINGS SYNC SCRIPT
 * Validates settings hierarchy and prevents drift between workspace root and child packages
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface VSCodeSettings {
  [key: string]: any;
}

interface ValidationResult {
  valid: boolean;
  rootSettings: VSCodeSettings | null;
  childSettings: Map<string, VSCodeSettings>;
  conflicts: string[];
  suggestions: string[];
}

export function validateSettingsHierarchy(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    rootSettings: null,
    childSettings: new Map(),
    conflicts: [],
    suggestions: []
  };

  const workspaceRoot = join(process.cwd(), '..');
  const rootSettingsPath = join(workspaceRoot, '.vscode', 'settings.json');
  
  // Load root settings
  if (existsSync(rootSettingsPath)) {
    try {
      result.rootSettings = JSON.parse(readFileSync(rootSettingsPath, 'utf-8'));
    } catch (error) {
      result.conflicts.push(`Failed to parse root settings: ${error}`);
      result.valid = false;
    }
  } else {
    result.suggestions.push('Root .vscode/settings.json not found - copy from components/docs/root-vscode-settings.json');
  }

  // Load child settings (components package)
  const childSettingsPath = join(process.cwd(), '.vscode', 'settings.json');
  if (existsSync(childSettingsPath)) {
    try {
      const childSettings = JSON.parse(readFileSync(childSettingsPath, 'utf-8'));
      result.childSettings.set('components', childSettings);
      
      // Check for addressability violations
      if (result.rootSettings) {
        const addressabilityKeys = [
          'editor.inlineSuggest.enabled',
          'editor.formatOnSave',
          'github.copilot.maxCompletions',
          'typescript.preferences.importModuleSpecifier'
        ];
        
        for (const key of addressabilityKeys) {
          if (key in childSettings && key in result.rootSettings) {
            result.conflicts.push(`Addressability key "${key}" duplicated in child settings`);
            result.valid = false;
          }
        }
      }
    } catch (error) {
      result.conflicts.push(`Failed to parse child settings: ${error}`);
      result.valid = false;
    }
  }

  return result;
}

export function generateSyncReport(): string {
  const validation = validateSettingsHierarchy();
  const timestamp = new Date().toISOString();
  
  let report = `# ADDRESSABILITY SETTINGS VALIDATION\n`;
  report += `Generated: ${timestamp}\n\n`;
  
  if (validation.valid) {
    report += `✅ **Status**: Settings hierarchy is valid\n\n`;
  } else {
    report += `❌ **Status**: Settings conflicts detected\n\n`;
  }
  
  if (validation.conflicts.length > 0) {
    report += `## Conflicts\n`;
    validation.conflicts.forEach(conflict => {
      report += `- ❌ ${conflict}\n`;
    });
    report += `\n`;
  }
  
  if (validation.suggestions.length > 0) {
    report += `## Suggestions\n`;
    validation.suggestions.forEach(suggestion => {
      report += `- 💡 ${suggestion}\n`;
    });
    report += `\n`;
  }
  
  report += `## Child Settings Summary\n`;
  for (const [package, settings] of validation.childSettings) {
    const keyCount = Object.keys(settings).length;
    report += `- **${package}**: ${keyCount} keys\n`;
  }
  
  return report;
}

// CLI execution
if (import.meta.main) {
  console.log(generateSyncReport());
}