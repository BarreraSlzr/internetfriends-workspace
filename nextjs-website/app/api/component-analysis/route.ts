import { NextRequest, NextResponse } from 'next/server';
import { componentRegistry } from '@/app/(internetfriends)/design-system/registry/component.registry';

interface AnalysisRequest {
  componentId: string;
  screenshot: string; // base64 image
  analysisType: 'design' | 'performance' | 'accessibility' | 'improvement';
}

interface AnalysisResponse {
  insights: string;
  suggestions: string[];
  score: number;
  metadata: {
    timestamp: string;
    component: string;
    analysisType: string;
  };
}

// AI prompts for different analysis types
const getAnalysisPrompt = (type: string, componentName: string, description: string) => {
  const baseContext = `Analyze this React component screenshot for "${componentName}": ${description}`;
  
  switch (type) {
    case 'design':
      return `${baseContext}
      
Focus on:
- Visual design quality and consistency
- Color scheme and typography choices
- Spacing and layout effectiveness
- Glass morphism implementation quality
- Overall aesthetic appeal

Provide specific design improvement suggestions.`;

    case 'performance':
      return `${baseContext}
      
Focus on:
- Rendering efficiency potential issues
- CSS performance implications
- Component complexity assessment
- Bundle size impact analysis
- Optimization opportunities

Provide performance improvement recommendations.`;

    case 'accessibility':
      return `${baseContext}
      
Focus on:
- Visual accessibility (contrast, readability)
- Keyboard navigation potential
- Screen reader compatibility
- WCAG compliance assessment
- Inclusive design principles

Provide accessibility improvement suggestions.`;

    case 'improvement':
      return `${baseContext}
      
Focus on:
- General UX/UI improvements
- Component reusability enhancements
- Modern design trends alignment
- User interaction improvements
- Code structure optimization

Provide comprehensive improvement recommendations.`;

    default:
      return `${baseContext}\n\nProvide general analysis and improvement suggestions.`;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { componentId, screenshot, analysisType } = body;

    // Validate component exists
    const component = componentRegistry.getComponentById(componentId);
    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Check if Vercel AI Gateway is configured
    const gatewayUrl = process.env.VERCEL_AI_GATEWAY_URL;
    const gatewayToken = process.env.VERCEL_AI_GATEWAY_TOKEN;
    
    if (!gatewayUrl || !gatewayToken) {
      return NextResponse.json(
        { error: 'AI Gateway not configured' },
        { status: 500 }
      );
    }

    // Prepare AI analysis request
    const prompt = getAnalysisPrompt(analysisType, component.name, component.description);
    
    // Send to AI via Vercel Gateway
    const aiResponse = await fetch(`${gatewayUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gatewayToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: screenshot,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const insights = aiData.choices[0]?.message?.content || 'No insights generated';

    // Parse insights into structured response
    const suggestions = insights
      .split('\n')
      .filter((line: string) => line.trim().startsWith('- ') || line.trim().startsWith('• '))
      .map((line: string) => line.trim().substring(2));

    // Generate a simple score based on analysis
    const score = Math.min(100, Math.max(0, 
      85 - (suggestions.length * 5) + (Math.random() * 10)
    ));

    const response: AnalysisResponse = {
      insights,
      suggestions,
      score: Math.round(score),
      metadata: {
        timestamp: new Date().toISOString(),
        component: component.name,
        analysisType,
      },
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Component analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for analysis history (optional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const componentId = searchParams.get('componentId');
  
  if (!componentId) {
    return NextResponse.json(
      { error: 'Component ID required' },
      { status: 400 }
    );
  }

  const component = componentRegistry.getComponentById(componentId);
  if (!component) {
    return NextResponse.json(
      { error: 'Component not found' },
      { status: 404 }
    );
  }

  // Return component metadata for analysis
  return NextResponse.json({
    component: {
      id: component.id,
      name: component.name,
      category: component.category,
      description: component.description,
      dependencies: component.dependencies,
      props: component.props,
    },
    availableAnalysisTypes: ['design', 'performance', 'accessibility', 'improvement'],
  });
}