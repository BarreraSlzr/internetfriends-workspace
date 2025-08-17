import type { ComponentRegistryEntry } from '@/lib/design-system/component-registry';

export interface ComponentAnalysisClient {
  analyze: (params: AnalyzeParams) => Promise<AnalysisResult>;
  getHistory: (componentId: string) => Promise<AnalysisHistory[]>;
  batchAnalyze: (components: ComponentRegistryEntry[]) => Promise<BatchAnalysisResult>;
}

export interface AnalyzeParams {
  componentId: string;
  screenshot: string;
  analysisType: 'design' | 'performance' | 'accessibility' | 'improvement';
  options?: {
    includeCode?: boolean;
    generateVariants?: boolean;
    compareToBaseline?: boolean;
  };
}

export interface AnalysisResult {
  insights: string;
  suggestions: string[];
  score: number;
  metadata: {
    timestamp: string;
    component: string;
    analysisType: string;
  };
  variants?: {
    improved: string; // Generated code
    alternative: string; // Alternative implementation
  };
}

export interface AnalysisHistory {
  id: string;
  timestamp: string;
  analysisType: string;
  score: number;
  insights: string;
}

export interface BatchAnalysisResult {
  results: Map<string, AnalysisResult>;
  summary: {
    averageScore: number;
    topIssues: string[];
    recommendations: string[];
  };
}

// Transport layer - tRPC-style API client
class ComponentAnalysisTransport implements ComponentAnalysisClient {
  private baseUrl: string;
  
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async analyze(params: AnalyzeParams): Promise<AnalysisResult> {
    const response = await fetch(`${this.baseUrl}/component-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getHistory(componentId: string): Promise<AnalysisHistory[]> {
    const response = await fetch(
      `${this.baseUrl}/component-analysis/history?componentId=${componentId}`
    );

    if (!response.ok) {
      throw new Error(`History fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  async batchAnalyze(components: ComponentRegistryEntry[]): Promise<BatchAnalysisResult> {
    const response = await fetch(`${this.baseUrl}/component-analysis/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentIds: components.map(c => c.id) }),
    });

    if (!response.ok) {
      throw new Error(`Batch analysis failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Hook for easy React integration
export function useComponentAnalysis() {
  const client = new ComponentAnalysisTransport();

  return {
    analyzeComponent: client.analyze.bind(client),
    getAnalysisHistory: client.getHistory.bind(client),
    batchAnalyzeComponents: client.batchAnalyze.bind(client),
  };
}

// Event-driven analysis system
export interface AnalysisEvent {
  type: 'ANALYSIS_STARTED' | 'ANALYSIS_COMPLETED' | 'ANALYSIS_FAILED' | 'BATCH_COMPLETED';
  componentId: string;
  timestamp: string;
  data?: unknown;
}

export class ComponentAnalysisOrchestrator {
  private eventListeners: Map<string, ((event: AnalysisEvent) => void)[]> = new Map();
  private client: ComponentAnalysisClient;

  constructor(client?: ComponentAnalysisClient) {
    this.client = client || new ComponentAnalysisTransport();
  }

  // Event system
  on(eventType: AnalysisEvent['type'], callback: (event: AnalysisEvent) => void) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  private emit(event: AnalysisEvent) {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(callback => callback(event));
  }

  // Orchestrated analysis with events
  async analyzeWithEvents(params: AnalyzeParams): Promise<AnalysisResult> {
    this.emit({
      type: 'ANALYSIS_STARTED',
      componentId: params.componentId,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await this.client.analyze(params);
      
      this.emit({
        type: 'ANALYSIS_COMPLETED',
        componentId: params.componentId,
        timestamp: new Date().toISOString(),
        data: result,
      });

      return result;
    } catch (error) {
      this.emit({
        type: 'ANALYSIS_FAILED',
        componentId: params.componentId,
        timestamp: new Date().toISOString(),
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      throw error;
    }
  }

  // Batch analysis with progress events
  async batchAnalyzeWithProgress(
    components: ComponentRegistryEntry[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<BatchAnalysisResult> {
    const results = new Map<string, AnalysisResult>();
    let completed = 0;

    for (const component of components) {
      try {
        // Note: For real implementation, you'd need to capture screenshots
        // This is a simplified version
        const result = await this.analyzeWithEvents({
          componentId: component.id,
          screenshot: '', // Would be captured from live component
          analysisType: 'improvement',
        });
        
        results.set(component.id, result);
        completed++;
        onProgress?.(completed, components.length);
        
      } catch (error) {
        console.error(`Analysis failed for ${component.id}:`, error);
      }
    }

    const scores = Array.from(results.values()).map(r => r.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    const summary = {
      averageScore,
      topIssues: this.extractTopIssues(Array.from(results.values())),
      recommendations: this.generateRecommendations(Array.from(results.values())),
    };

    const batchResult: BatchAnalysisResult = { results, summary };

    this.emit({
      type: 'BATCH_COMPLETED',
      componentId: 'batch',
      timestamp: new Date().toISOString(),
      data: batchResult,
    });

    return batchResult;
  }

  private extractTopIssues(results: AnalysisResult[]): string[] {
    const allSuggestions = results.flatMap(r => r.suggestions);
    // Simple frequency analysis
    const issueCount = new Map<string, number>();
    
    allSuggestions.forEach(suggestion => {
      const key = suggestion.toLowerCase();
      issueCount.set(key, (issueCount.get(key) || 0) + 1);
    });

    return Array.from(issueCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);
  }

  private generateRecommendations(results: AnalysisResult[]): string[] {
    const lowScoreComponents = results.filter(r => r.score < 70);
    const recommendations: string[] = [];

    if (lowScoreComponents.length > 0) {
      recommendations.push(`Focus on ${lowScoreComponents.length} components with scores below 70`);
    }

    const commonIssues = this.extractTopIssues(results);
    if (commonIssues.length > 0) {
      recommendations.push(`Address common issue: ${commonIssues[0]}`);
    }

    return recommendations;
  }
}

// Global instance for easy access
export const componentAnalysis = new ComponentAnalysisOrchestrator();

// React hook with orchestration
export function useComponentAnalysisOrchestrator() {
  return {
    analyzeComponent: componentAnalysis.analyzeWithEvents.bind(componentAnalysis),
    batchAnalyze: componentAnalysis.batchAnalyzeWithProgress.bind(componentAnalysis),
    onAnalysisEvent: componentAnalysis.on.bind(componentAnalysis),
  };
}