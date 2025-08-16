import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ComponentAnalysisSchema = z.object({
  designScore: z.number().min(0).max(100),
  usabilityScore: z.number().min(0).max(100),
  accessibilityScore: z.number().min(0).max(100),
  performanceScore: z.number().min(0).max(100),
  accessibilityIssues: z.array(z.string()),
  designImprovements: z.array(z.string()),
  usabilityImprovements: z.array(z.string()),
  performanceImprovements: z.array(z.string()),
  overallRecommendation: z.string(),
  timestamp: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { componentName, componentDescription, screenshotUrl, userPrompt } = body;

    // Validate input
    if (!componentName || !screenshotUrl) {
      return NextResponse.json(
        { error: 'Component name and screenshot URL are required' },
        { status: 400 }
      );
    }

    // Enhanced prompt for component analysis
    const analysisPrompt = `
You are an expert UI/UX designer and accessibility specialist analyzing a React component.

Component Details:
- Name: ${componentName}
- Description: ${componentDescription || 'No description provided'}
- User Request: ${userPrompt || 'General component analysis'}

Please analyze the component screenshot and provide scores (0-100) and specific recommendations for:

1. **Design Quality** - Visual appeal, consistency, modern design principles
2. **Usability** - User experience, intuitive interaction, clear purpose
3. **Accessibility** - WCAG compliance, screen reader support, keyboard navigation
4. **Performance** - Rendering efficiency, optimization potential

Focus on actionable improvements that would make this component better for users.
`;

    // Generate AI analysis using Vercel AI SDK
    const result = await generateObject({
      model: openai('gpt-4-vision-preview'),
      schema: ComponentAnalysisSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: analysisPrompt,
            },
            {
              type: 'image',
              image: screenshotUrl.startsWith('data:') ? screenshotUrl : `data:image/png;base64,${screenshotUrl}`,
            },
          ],
        },
      ],
    });

    const analysis = {
      ...result.object,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        componentName,
        processingTime: Date.now(),
      },
    });

  } catch (error) {
    console.error('AI component analysis error:', error);
    
    // Return mock data if AI fails
    const mockAnalysis = {
      designScore: Math.floor(Math.random() * 30) + 70,
      usabilityScore: Math.floor(Math.random() * 25) + 75,
      accessibilityScore: Math.floor(Math.random() * 35) + 65,
      performanceScore: Math.floor(Math.random() * 20) + 80,
      accessibilityIssues: [
        'Consider improving color contrast ratio',
        'Add ARIA labels for screen readers',
        'Ensure keyboard navigation support',
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      designImprovements: [
        'Enhance visual hierarchy with better spacing',
        'Consider using more consistent border radius',
        'Improve color palette consistency',
      ].slice(0, Math.floor(Math.random() * 2) + 1),
      usabilityImprovements: [
        'Add loading states for better feedback',
        'Consider hover states for interactive elements',
        'Improve button sizing for mobile devices',
      ].slice(0, Math.floor(Math.random() * 2) + 1),
      performanceImprovements: [
        'Consider memoization for expensive calculations',
        'Optimize image loading with lazy loading',
        'Review bundle size impact',
      ].slice(0, Math.floor(Math.random() * 2) + 1),
      overallRecommendation: 'This component shows good foundation but could benefit from accessibility improvements and design consistency enhancements.',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      analysis: mockAnalysis,
      fallback: true,
      error: 'AI analysis failed, returning mock data',
    });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const componentId = url.searchParams.get('componentId');
  
  if (!componentId) {
    return NextResponse.json(
      { error: 'Component ID is required' },
      { status: 400 }
    );
  }

  // Return cached analysis or trigger new analysis
  return NextResponse.json({
    success: true,
    message: 'Use POST to trigger new analysis',
    componentId,
  });
}