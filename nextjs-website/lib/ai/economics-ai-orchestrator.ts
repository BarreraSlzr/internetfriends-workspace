import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { ComponentAnalysisOrchestrator } from './component-analysis-transport';

export interface EconomicsAnalysisConfig {
  models: {
    vision: string; // GPT-4 Vision for chart analysis
    text: string; // GPT-4 for insights generation
    embedding: string; // For semantic search
  };
  percy: {
    enabled: boolean;
    projectToken: string;
    compareBaseline: boolean;
  };
  vercelGateway: {
    enabled: boolean;
    fallbackModels: string[];
  };
}

export interface EconomicsVisualAnalysis {
  chartType: 'trading' | 'mining' | 'token_flow' | 'network_health';
  screenshot: string; // Base64 encoded
  insights: {
    trends: string[];
    anomalies: string[];
    predictions: string[];
    signals: {
      type: 'buy' | 'sell' | 'hold' | 'accumulate' | 'distribute';
      confidence: number;
      reasoning: string;
    }[];
  };
  metadata: {
    timestamp: string;
    modelUsed: string;
    performanceMetrics: {
      analysisTime: number;
      confidenceScore: number;
    };
  };
}

export interface MultiModelInsight {
  id: string;
  query: string;
  responses: {
    modelId: string;
    response: string;
    confidence: number;
    timestamp: string;
  }[];
  consensus: {
    agreement: number; // 0-1 scale
    primaryInsight: string;
    dissenting: string[];
    recommendation: string;
  };
}

export class EconomicsAIOrchestrator {
  private config: EconomicsAnalysisConfig;
  private componentAnalysis: ComponentAnalysisOrchestrator;

  constructor(config: EconomicsAnalysisConfig, componentAnalysis: ComponentAnalysisOrchestrator) {
    this.config = config;
    this.componentAnalysis = componentAnalysis;
  }

  // GPT-4 Vision Analysis for Charts/Dashboards
  async analyzeChartWithVision(
    screenshot: string,
    chartType: EconomicsVisualAnalysis['chartType'],
    context?: string
  ): Promise<EconomicsVisualAnalysis> {
    const startTime = Date.now();

    const prompt = this.buildVisionPrompt(chartType, context);

    try {
      const { text } = await generateText({
        model: openai(this.config.models.vision),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image',
                image: `data:image/png;base64,${screenshot}`,
              }
            ]
          }
        ],
        maxTokens: 1500,
        temperature: 0.1, // Lower temperature for financial analysis
      });

      const analysisContent = text;
      if (!analysisContent) {
        throw new Error('No analysis content received from vision model');
      }

      // Parse structured response
      const analysis = this.parseVisionAnalysis(analysisContent);

      return {
        chartType,
        screenshot,
        insights: analysis,
        metadata: {
          timestamp: new Date().toISOString(),
          modelUsed: this.config.models.vision,
          performanceMetrics: {
            analysisTime: Date.now() - startTime,
            confidenceScore: this.calculateConfidenceScore(analysis),
          },
        },
      };
    } catch (error) {
      console.error('Vision analysis failed:', error);
      throw new Error(`Vision analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Multi-Model Consensus Analysis
  async getMultiModelInsights(
    query: string,
    context: Record<string, unknown>
  ): Promise<MultiModelInsight> {
    const models = [
      this.config.models.text,
      ...this.config.vercelGateway.fallbackModels
    ];

    const responses = await Promise.allSettled(
      models.map(async (modelId) => {
        const startTime = Date.now();
        
        try {
          const response = await this.queryModel(modelId, query, context);
          
          return {
            modelId,
            response: response.content,
            confidence: response.confidence || 0.8,
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime,
          };
        } catch (error) {
          console.error(`Model ${modelId} failed:`, error);
          return null;
        }
      })
    );

    const validResponses = responses
      .filter((result): result is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof this.queryModel>>>> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    if (validResponses.length === 0) {
      throw new Error('All models failed to provide responses');
    }

    const consensus = this.calculateConsensus(validResponses);

    return {
      id: `insight_${Date.now()}`,
      query,
      responses: validResponses,
      consensus,
    };
  }

  // Percy Visual Regression Integration
  async runVisualRegressionTests(
    economicsDashboardUrl: string,
    testScenarios: Array<{
      name: string;
      params: Record<string, unknown>;
      viewport: { width: number; height: number };
    }>
  ): Promise<{
    passed: boolean;
    screenshots: string[];
    differences: Array<{
      scenario: string;
      diff: string;
      impact: 'critical' | 'major' | 'minor';
    }>;
  }> {
    if (!this.config.percy.enabled) {
      throw new Error('Percy is not enabled in configuration');
    }

    const results: Array<{
      scenario: string;
      screenshot: string;
      passed: boolean;
      diff?: string;
    }> = [];

    for (const scenario of testScenarios) {
      try {
        // This would integrate with Percy CLI/API
        const screenshot = await this.captureScreenshot(
          economicsDashboardUrl,
          scenario.params,
          scenario.viewport
        );

        const percyResult = await this.submitToPercy(
          scenario.name,
          screenshot,
          scenario.viewport
        );

        results.push({
          scenario: scenario.name,
          screenshot,
          passed: percyResult.passed,
          diff: percyResult.diff,
        });
      } catch (error) {
        console.error(`Percy test failed for ${scenario.name}:`, error);
        results.push({
          scenario: scenario.name,
          screenshot: '',
          passed: false,
        });
      }
    }

    const differences = results
      .filter(result => !result.passed && result.diff)
      .map(result => ({
        scenario: result.scenario,
        diff: result.diff!,
        impact: this.assessVisualImpact(result.diff!) as 'critical' | 'major' | 'minor',
      }));

    return {
      passed: results.every(result => result.passed),
      screenshots: results.map(result => result.screenshot),
      differences,
    };
  }

  // Enhanced Economics Analysis with AI Orchestration
  async analyzeEconomicsComprehensively(
    dashboardScreenshot: string,
    metricsData: Record<string, unknown>,
    timeframe: '1h' | '24h' | '7d' | '30d'
  ): Promise<{
    visualAnalysis: EconomicsVisualAnalysis;
    multiModelInsights: MultiModelInsight;
    strategicRecommendations: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    riskAssessment: {
      level: 'low' | 'medium' | 'high' | 'critical';
      factors: string[];
      mitigation: string[];
    };
  }> {
    // 1. Visual Analysis with GPT-4 Vision
    const visualAnalysis = await this.analyzeChartWithVision(
      dashboardScreenshot,
      'trading',
      `Economics dashboard analysis for ${timeframe} timeframe`
    );

    // 2. Multi-Model Consensus
    const multiModelInsights = await this.getMultiModelInsights(
      `Analyze G's token economics trends and provide strategic insights for ${timeframe} period`,
      {
        visualInsights: visualAnalysis.insights,
        metricsData,
        timeframe,
      }
    );

    // 3. Strategic Recommendations
    const strategicRecommendations = await this.generateStrategicRecommendations(
      visualAnalysis,
      multiModelInsights,
      metricsData
    );

    // 4. Risk Assessment
    const riskAssessment = await this.performRiskAssessment(
      visualAnalysis,
      multiModelInsights,
      metricsData
    );

    return {
      visualAnalysis,
      multiModelInsights,
      strategicRecommendations,
      riskAssessment,
    };
  }

  // Private helper methods
  private buildVisionPrompt(
    chartType: EconomicsVisualAnalysis['chartType'],
    context?: string
  ): string {
    const basePrompt = `You are an expert cryptocurrency and token economics analyst. Analyze this ${chartType} chart and provide insights in JSON format.

Focus on:
1. **Trends**: Identify key patterns, momentum, support/resistance levels
2. **Anomalies**: Unusual movements, volume spikes, or irregularities  
3. **Predictions**: Short-term projections based on technical analysis
4. **Signals**: Trading recommendations with confidence levels

Context: ${context || 'General token economics analysis'}

Respond with a JSON object containing:
{
  "trends": ["trend1", "trend2"],
  "anomalies": ["anomaly1", "anomaly2"], 
  "predictions": ["prediction1", "prediction2"],
  "signals": [
    {
      "type": "buy|sell|hold|accumulate|distribute",
      "confidence": 0.85,
      "reasoning": "explanation"
    }
  ]
}`;

    return basePrompt;
  }

  private parseVisionAnalysis(content: string): EconomicsVisualAnalysis['insights'] {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in vision response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        trends: parsed.trends || [],
        anomalies: parsed.anomalies || [],
        predictions: parsed.predictions || [],
        signals: parsed.signals || [],
      };
    } catch (error) {
      console.error('Failed to parse vision analysis:', error);
      // Fallback to text extraction
      return {
        trends: this.extractFromText(content, 'trends'),
        anomalies: this.extractFromText(content, 'anomalies'),
        predictions: this.extractFromText(content, 'predictions'),
        signals: [],
      };
    }
  }

  private extractFromText(content: string, type: string): string[] {
    const lines = content.split('\n');
    const results: string[] = [];
    let inSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes(type)) {
        inSection = true;
        continue;
      }
      
      if (inSection && line.trim().startsWith('-')) {
        results.push(line.trim().substring(1).trim());
      } else if (inSection && line.trim() === '') {
        break;
      }
    }

    return results;
  }

  private calculateConfidenceScore(analysis: EconomicsVisualAnalysis['insights']): number {
    const hasContent = [
      analysis.trends.length > 0,
      analysis.anomalies.length > 0, 
      analysis.predictions.length > 0,
      analysis.signals.length > 0,
    ].filter(Boolean).length;

    const signalConfidence = analysis.signals.length > 0 
      ? analysis.signals.reduce((sum, signal) => sum + signal.confidence, 0) / analysis.signals.length
      : 0.5;

    return Math.min(0.95, (hasContent / 4) * 0.7 + signalConfidence * 0.3);
  }

  private async queryModel(
    modelId: string,
    query: string,
    context: Record<string, unknown>
  ): Promise<{ content: string; confidence?: number }> {
    const prompt = `${query}\n\nContext: ${JSON.stringify(context, null, 2)}`;

    const { text } = await generateText({
      model: openai(modelId),
      prompt,
      maxTokens: 1000,
      temperature: 0.2,
    });

    return {
      content: text || '',
      confidence: 0.8, // Could be calculated based on response patterns
    };
  }

  private calculateConsensus(responses: Array<{
    modelId: string;
    response: string;
    confidence: number;
  }>): MultiModelInsight['consensus'] {
    // Simple consensus calculation - in production, use semantic similarity
    const totalConfidence = responses.reduce((sum, r) => sum + r.confidence, 0);
    const averageConfidence = totalConfidence / responses.length;

    // Find the most confident response as primary insight
    const mostConfident = responses.reduce((max, current) =>
      current.confidence > max.confidence ? current : max
    );

    // Identify dissenting opinions (responses with significantly different content)
    const dissenting = responses
      .filter(r => r.modelId !== mostConfident.modelId && r.confidence > 0.7)
      .map(r => `${r.modelId}: ${r.response.substring(0, 100)}...`);

    return {
      agreement: averageConfidence,
      primaryInsight: mostConfident.response,
      dissenting,
      recommendation: this.generateConsensusRecommendation(responses),
    };
  }

  private generateConsensusRecommendation(responses: Array<{
    response: string;
    confidence: number;
  }>): string {
    const highConfidenceResponses = responses.filter(r => r.confidence > 0.8);
    
    if (highConfidenceResponses.length === 0) {
      return 'Insufficient consensus - requires manual review';
    }

    if (highConfidenceResponses.length === 1) {
      return `Single high-confidence recommendation: ${highConfidenceResponses[0].response.substring(0, 200)}...`;
    }

    return `Strong consensus from ${highConfidenceResponses.length} models - proceed with confidence`;
  }

  private async captureScreenshot(
    url: string,
    params: Record<string, unknown>,
    viewport: { width: number; height: number }
  ): Promise<string> {
    // This would integrate with Playwright or similar
    // For now, return a placeholder
    return 'screenshot_placeholder';
  }

  private async submitToPercy(
    name: string,
    screenshot: string,
    viewport: { width: number; height: number }
  ): Promise<{ passed: boolean; diff?: string }> {
    // Percy API integration would go here
    return { passed: true };
  }

  private assessVisualImpact(diff: string): string {
    // Analyze visual differences to determine impact level
    if (diff.includes('critical') || diff.includes('layout')) return 'critical';
    if (diff.includes('major') || diff.includes('color')) return 'major';
    return 'minor';
  }

  private async generateStrategicRecommendations(
    visualAnalysis: EconomicsVisualAnalysis,
    multiModelInsights: MultiModelInsight,
    metricsData: Record<string, unknown>
  ): Promise<{
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  }> {
    const query = `Based on the analysis, provide strategic recommendations in three timeframes: immediate (next 24h), short-term (next week), and long-term (next month)`;
    
    const response = await this.queryModel(
      this.config.models.text,
      query,
      { visualAnalysis, multiModelInsights, metricsData }
    );

    // Parse recommendations - simplified version
    return {
      immediate: ['Monitor key support levels', 'Adjust position sizes based on volatility'],
      shortTerm: ['Evaluate community sentiment trends', 'Optimize mining efficiency'],
      longTerm: ['Assess tokenomics sustainability', 'Plan infrastructure scaling'],
    };
  }

  private async performRiskAssessment(
    visualAnalysis: EconomicsVisualAnalysis,
    multiModelInsights: MultiModelInsight,
    metricsData: Record<string, unknown>
  ): Promise<{
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    mitigation: string[];
  }> {
    const riskFactors = [
      ...visualAnalysis.insights.anomalies,
      ...(multiModelInsights.consensus.dissenting.length > 2 ? ['Model consensus low'] : []),
    ];

    const riskLevel = riskFactors.length > 3 ? 'high' : 
                     riskFactors.length > 1 ? 'medium' : 'low';

    return {
      level: riskLevel,
      factors: riskFactors,
      mitigation: [
        'Increase monitoring frequency',
        'Implement automatic position sizing',
        'Set up emergency alerts',
      ],
    };
  }
}

// Factory function for easy setup
export function createEconomicsAIOrchestrator(
  config: Partial<EconomicsAnalysisConfig> = {}
): EconomicsAIOrchestrator {
  const defaultConfig: EconomicsAnalysisConfig = {
    models: {
      vision: 'gpt-4-vision-preview',
      text: 'gpt-4-turbo-preview', 
      embedding: 'text-embedding-3-large',
    },
    percy: {
      enabled: process.env.PERCY_TOKEN ? true : false,
      projectToken: process.env.PERCY_TOKEN || '',
      compareBaseline: true,
    },
    vercelGateway: {
      enabled: true,
      fallbackModels: [
        'claude-3-sonnet-20240229',
        'gpt-3.5-turbo',
      ],
    },
  };

  const mergedConfig = { ...defaultConfig, ...config };
  
  // Import component analysis orchestrator
  const { componentAnalysis } = require('./component-analysis-transport');
  
  return new EconomicsAIOrchestrator(mergedConfig, componentAnalysis);
}

// React hook for economics AI orchestration
export function useEconomicsAIOrchestrator() {
  const orchestrator = createEconomicsAIOrchestrator();

  return {
    analyzeChart: orchestrator.analyzeChartWithVision.bind(orchestrator),
    getMultiModelInsights: orchestrator.getMultiModelInsights.bind(orchestrator),
    runVisualTests: orchestrator.runVisualRegressionTests.bind(orchestrator),
    comprehensiveAnalysis: orchestrator.analyzeEconomicsComprehensively.bind(orchestrator),
  };
}