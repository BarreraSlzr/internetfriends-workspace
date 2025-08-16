import { NextRequest, NextResponse } from 'next/server';
import { designSystemOrchestrator } from '@/lib/design-system/design-system-orchestrator';
import { componentDiscovery } from '@/lib/design-system/component-discovery';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';
  const mode = searchParams.get('mode') || 'human';

  try {
    switch (mode) {
      case 'human':
        // Human-friendly dashboard data
        const dashboardData = await designSystemOrchestrator.getVisualDashboard();
        
        if (format === 'html') {
          return new Response(generateHTMLDashboard(dashboardData), {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        return NextResponse.json(dashboardData);

      case 'machine':
      case 'mcp':
        // Machine-readable data for AI/MCP
        const machineData = await designSystemOrchestrator.getMachineReadableData();
        return NextResponse.json(machineData);

      case 'validate':
        // CI/CD validation endpoint
        const validation = await designSystemOrchestrator.validateDesignSystem();
        return NextResponse.json(validation, {
          status: validation.isValid ? 200 : 422
        });

      case 'snapshot':
        // Full snapshot (heavy operation)
        const snapshot = await designSystemOrchestrator.generateSnapshot();
        return NextResponse.json(snapshot);

      case 'discover':
        // Lightweight component discovery
        const components = await componentDiscovery.discoverComponents();
        return NextResponse.json({
          components,
          relationships: componentDiscovery.getRelationships(),
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid mode. Use: human, machine, validate, snapshot, or discover' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Design system API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate design system data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Allow external systems to trigger design system analysis
  const body = await request.json();
  const { action, components } = body;

  try {
    switch (action) {
      case 'analyze':
        // Trigger visual comparison of specific components
        const analysisResults = await Promise.all(
          components.map(async (componentId: string) => {
            const component = componentDiscovery.getComponentById(componentId);
            if (!component) return null;

            // Capture screenshot and analyze
            const screenshot = await fetch('/api/screenshot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: `http://localhost:3000/api/component-preview/${componentId}`,
                auth: 'dev-screenshot-key-2024'
              })
            });

            if (screenshot.ok) {
              const screenshotData = await screenshot.json();
              
              // Run visual analysis
              const analysis = await fetch('/api/visual-comparison', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  images: [{ id: componentId, url: screenshotData.url }],
                  prompt: `Analyze ${component.name} for design system consistency and identify improvements`,
                  context: { component: componentId, workspace: 'InternetFriends' }
                })
              });

              return analysis.ok ? await analysis.json() : null;
            }

            return null;
          })
        );

        return NextResponse.json({
          results: analysisResults.filter(Boolean),
          timestamp: new Date().toISOString()
        });

      case 'update-metadata':
        // Allow external systems to update component metadata
        return NextResponse.json({ message: 'Metadata update not implemented yet' });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: analyze, update-metadata' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Design system POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process design system action' },
      { status: 500 }
    );
  }
}

function generateHTMLDashboard(data: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>InternetFriends Design System</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .component-card { transition: transform 0.2s, box-shadow 0.2s; }
    .component-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">InternetFriends Design System</h1>
      <p class="text-gray-600">Automated design system dashboard • Generated ${new Date().toLocaleString()}</p>
    </header>

    <!-- Summary Stats -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="text-2xl font-bold text-blue-600">${data.summary.total}</div>
        <div class="text-gray-600">Total Components</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="text-2xl font-bold text-green-600">${data.summary.health.tests}</div>
        <div class="text-gray-600">Test Coverage</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="text-2xl font-bold text-purple-600">${data.summary.health.tokens}</div>
        <div class="text-gray-600">Token Compliance</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="text-2xl font-bold text-orange-600">${data.summary.health.performance}</div>
        <div class="text-gray-600">Performance Score</div>
      </div>
    </div>

    <!-- Component Grid -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Components</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${data.componentGrid.slice(0, 12).map((component: any) => `
          <div class="component-card p-4 border rounded-lg hover:border-blue-300 cursor-pointer">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-medium">${component.name}</h3>
              <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">${component.category}</span>
            </div>
            <p class="text-sm text-gray-600 mb-2">${component.description}</p>
            <div class="flex justify-between text-xs text-gray-500">
              <span>${component.usageCount} uses</span>
              <span>${component.testStatus}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- API Endpoints -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">API Endpoints</h2>
      <div class="space-y-2 text-sm font-mono">
        <div><span class="text-green-600">GET</span> /api/design-system?mode=human</div>
        <div><span class="text-green-600">GET</span> /api/design-system?mode=machine</div>
        <div><span class="text-green-600">GET</span> /api/design-system?mode=validate</div>
        <div><span class="text-blue-600">POST</span> /api/design-system (action: analyze)</div>
      </div>
    </div>
  </div>

  <script>
    // Add interactivity
    document.querySelectorAll('.component-card').forEach(card => {
      card.addEventListener('click', () => {
        window.open('/design-system', '_blank');
      });
    });
  </script>
</body>
</html>
  `;
}