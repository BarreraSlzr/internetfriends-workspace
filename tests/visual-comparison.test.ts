import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import { NextRequest } from 'next/server';
import { POST, GET } from '../nextjs-website/app/api/visual-comparison/route';

// Mock visual analysis result for testing
const mockVisualAnalysisResult = {
  analysis: {
    summary: 'Test analysis of component consistency',
    findings: [
      {
        category: 'Component Consistency',
        observation: 'Button variants show consistent styling',
        impact: 'low' as const,
        recommendation: 'Maintain current patterns',
        fileReference: 'components/atomic/button/button.atomic.tsx'
      },
      {
        category: 'Design System',
        observation: 'Glass effects need standardization',
        impact: 'high' as const,
        recommendation: 'Create unified glass utility',
        fileReference: 'styles/design-tokens.scss'
      }
    ],
    visualDifferences: [
      {
        area: 'Border Radius',
        description: 'Inconsistent values between 8px and 12px',
        severity: 'minor' as const
      }
    ],
    actionItems: [
      {
        task: 'Standardize border radius values',
        priority: 'high' as const,
        estimatedTime: '45 minutes',
        files: ['styles/design-tokens.scss', 'tailwind.config.ts']
      }
    ]
  }
};

const mockImageData = {
  images: [
    {
      id: 'test-img-1',
      base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      description: 'Test button component'
    },
    {
      id: 'test-img-2', 
      url: 'http://localhost:3000/test-image.png',
      description: 'Reference design'
    }
  ],
  prompt: 'Compare button consistency across components',
  context: {
    workspace: 'InternetFriends',
    sessionId: 'test-session-123',
    mode: 'investigation' as const
  }
};

describe('Visual Comparison API', () => {
  
  describe('GET /api/visual-comparison', () => {
    it('should return API documentation and health check', async () => {
      const request = new NextRequest('http://localhost:3000/api/visual-comparison');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.service).toBe('Visual Comparison API');
      expect(data.version).toBe('1.0.0');
      expect(data.endpoints).toBeDefined();
      expect(data.integration.opencode).toBeDefined();
    });
  });

  describe('POST /api/visual-comparison', () => {
    it('should reject requests with no images', async () => {
      const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
        method: 'POST',
        body: JSON.stringify({
          images: [],
          prompt: 'Test prompt'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('At least one image is required');
    });

    it('should reject requests with no prompt', async () => {
      const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
        method: 'POST',
        body: JSON.stringify({
          images: mockImageData.images,
          prompt: ''
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt is required for analysis');
    });

    it('should process valid visual comparison request', async () => {
      const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
        method: 'POST',
        body: JSON.stringify(mockImageData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toBeDefined();
      expect(data.session.id).toBeDefined();
      expect(data.session.createdAt).toBeDefined();
      expect(data.markdown).toBeDefined();
      expect(data.addressable).toBeDefined();
      expect(data.quickActions).toBeDefined();
    });

    it('should return markdown format when requested', async () => {
      const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
        method: 'POST',
        body: JSON.stringify({
          ...mockImageData,
          outputFormat: 'markdown'
        })
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/markdown');
      
      const markdown = await response.text();
      expect(markdown).toContain('# Visual Comparison Analysis');
      expect(markdown).toContain('## 🎯 Summary');
      expect(markdown).toContain('## 📊 Key Findings');
    });

    it('should return JSON format when requested', async () => {
      const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
        method: 'POST',
        body: JSON.stringify({
          ...mockImageData,
          outputFormat: 'json'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBeDefined();
      expect(data.analysis).toBeDefined();
      expect(data.analysis.summary).toBeDefined();
      expect(data.analysis.findings).toBeDefined();
      expect(data.openCodeAddressable).toBeDefined();
    });

    it('should generate proper OpenCode addressable commands', async () => {
      const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
        method: 'POST', 
        body: JSON.stringify(mockImageData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.addressable.commands).toBeDefined();
      expect(data.addressable.fileReferences).toBeDefined();
      expect(data.addressable.taskBreakdown).toBeDefined();
      
      // Check that commands include epic workflow
      const commands = data.addressable.commands;
      expect(commands.some((cmd: string) => cmd.includes('epic start'))).toBe(true);
      expect(commands.some((cmd: string) => cmd.includes('design-system'))).toBe(true);
    });

    it('should provide quick actions for immediate use', async () => {
      const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
        method: 'POST',
        body: JSON.stringify(mockImageData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.quickActions).toBeDefined();
      expect(Array.isArray(data.quickActions)).toBe(true);
      expect(data.quickActions.length).toBeGreaterThan(0);
      
      // Check structure of quick actions
      data.quickActions.forEach((action: any) => {
        expect(action.label).toBeDefined();
        expect(action.command).toBeDefined();
        expect(typeof action.label).toBe('string');
        expect(typeof action.command).toBe('string');
      });
    });
  });
});

describe('Visual Comparison Integration Patterns', () => {
  
  it('should follow consistent timestamp patterns', async () => {
    const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
      method: 'POST',
      body: JSON.stringify(mockImageData)
    });

    const response = await POST(request);
    const data = await response.json();

    // Check timestamp consistency with InternetFriends patterns
    expect(data.session.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format
    expect(data.session.id).toMatch(/^\d{8}-\d{6}-[a-z0-9]{5}$/); // stamp format
  });

  it('should integrate with existing screenshot API patterns', async () => {
    const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
      method: 'POST',
      body: JSON.stringify(mockImageData)
    });

    const response = await POST(request);
    const data = await response.json();

    // Check that commands reference existing screenshot API
    const commands = data.addressable.commands;
    const screenshotCommand = commands.find((cmd: string) => 
      cmd.includes('/api/screenshot') && cmd.includes('dev-screenshot-key-2024')
    );
    expect(screenshotCommand).toBeDefined();
  });

  it('should reference correct InternetFriends file paths', async () => {
    const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
      method: 'POST',
      body: JSON.stringify(mockImageData)
    });

    const response = await POST(request);
    const data = await response.json();

    const fileReferences = data.addressable.fileReferences;
    
    // Should include common InternetFriends paths
    expect(fileReferences.some((ref: string) => 
      ref.includes('components/atomic/')
    )).toBe(true);
    
    expect(fileReferences.some((ref: string) => 
      ref.includes('design-system')
    )).toBe(true);
  });

  it('should generate epic-compatible commands', async () => {
    const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
      method: 'POST',
      body: JSON.stringify(mockImageData)
    });

    const response = await POST(request);
    const data = await response.json();

    const commands = data.addressable.commands;
    const epicCommand = commands.find((cmd: string) => 
      cmd.includes('./scripts/epic-tools/epic start')
    );
    
    expect(epicCommand).toBeDefined();
    expect(epicCommand).toContain('--timeline');
    expect(epicCommand).toContain('visual-');
  });
});

describe('Markdown Output Quality', () => {
  
  it('should generate well-structured markdown', async () => {
    const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
      method: 'POST',
      body: JSON.stringify({
        ...mockImageData,
        outputFormat: 'markdown'
      })
    });

    const response = await POST(request);
    const markdown = await response.text();

    // Check markdown structure
    expect(markdown).toContain('# Visual Comparison Analysis');
    expect(markdown).toContain('## 🎯 Summary');
    expect(markdown).toContain('## 📊 Key Findings');
    expect(markdown).toContain('## 🔍 Visual Differences');
    expect(markdown).toContain('## ✅ Action Items');
    expect(markdown).toContain('## 🤖 OpenCode Integration');
    
    // Check for proper code blocks
    expect(markdown).toContain('```bash');
    expect(markdown).toContain('```');
    
    // Check for proper file references
    expect(markdown).toMatch(/`[^`]+\.(ts|tsx|scss)`/);
  });

  it('should include actionable commands in markdown', async () => {
    const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
      method: 'POST',
      body: JSON.stringify({
        ...mockImageData,
        outputFormat: 'markdown'
      })
    });

    const response = await POST(request);
    const markdown = await response.text();

    // Should contain executable commands
    expect(markdown).toContain('epic start');
    expect(markdown).toContain('design-system');
    expect(markdown).toContain('git status');
    
    // Should have proper file reference format
    expect(markdown).toMatch(/- `[^`]+`/); // File references with backticks
  });
});

// Performance and Error Handling Tests
describe('Error Handling and Edge Cases', () => {
  
  it('should handle malformed JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
      method: 'POST',
      body: 'invalid-json'
    });

    const response = await POST(request);
    
    expect(response.status).toBe(500);
  });

  it('should handle missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
      method: 'POST',
      body: JSON.stringify({
        // Missing images and prompt
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should handle extremely large image inputs', async () => {
    // Create a large base64 string (simulating large image)
    const largeBase64 = 'data:image/png;base64,' + 'A'.repeat(1000000); // 1MB of data
    
    const request = new NextRequest('http://localhost:3000/api/visual-comparison', {
      method: 'POST',
      body: JSON.stringify({
        images: [{
          id: 'large-img',
          base64: largeBase64,
          description: 'Large test image'
        }],
        prompt: 'Test with large image'
      })
    });

    const response = await POST(request);
    
    // Should either process successfully or fail gracefully
    expect([200, 413, 500]).toContain(response.status);
  });
});

export { mockVisualAnalysisResult, mockImageData };