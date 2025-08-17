import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

// Simple response helpers for this API
function createApiResponse<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
}

function createApiError(error: { code: string; message: string; statusCode: number }) {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString()
  }
}

interface GitVisualIntegrationRequest {
  command: 'detect-changes' | 'generate-docs' | 'snapshot' | 'compare' | 'audit' | 'integrate'
  parameters?: {
    component?: string
    fromCommit?: string
    toCommit?: string
    baseline?: string
    current?: string
    label?: string
  }
  includeGitContext?: boolean
  triggerVisualComparison?: boolean
}

interface GitVisualIntegrationResponse {
  command: string
  result: any
  gitContext?: any
  visualComparisonResult?: any
  processingTime: number
  generatedFiles?: string[]
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    const body: GitVisualIntegrationRequest = await request.json()
    const {
      command,
      parameters = {},
      includeGitContext = true,
      triggerVisualComparison = false
    } = body

    // Validate Git repository
    try {
      execSync('git rev-parse --is-inside-work-tree', { cwd: process.cwd() })
    } catch {
      return NextResponse.json(
        createApiError({
          code: 'SERVER_ERROR',
          message: 'Not in a Git repository',
          statusCode: 500
        })
      )
    }

    // Validate visual test docs script exists
    const visualTestScript = path.join(process.cwd(), 'scripts/git-docs/visual-test-docs.sh')
    if (!fs.existsSync(visualTestScript)) {
      return NextResponse.json(
        createApiError({
          code: 'SERVER_ERROR',
          message: 'Visual test documentation script not found',
          statusCode: 500
        })
      )
    }

    let scriptResult: string
    let generatedFiles: string[] = []
    
    // Execute visual test documentation command
    try {
      const {
        component,
        fromCommit = 'HEAD~1',
        toCommit = 'HEAD',
        baseline,
        current,
        label
      } = parameters

      let scriptCommand: string

      switch (command) {
        case 'detect-changes':
          scriptCommand = `${visualTestScript} detect-changes "${fromCommit}" "${toCommit}"`
          break
          
        case 'generate-docs':
          if (!component) {
            return NextResponse.json(
              createApiError({
                code: 'VALIDATION_ERROR',
                message: 'Component parameter required for generate-docs command',
                statusCode: 400
              })
            )
          }
          scriptCommand = `${visualTestScript} generate-docs "${component}"`
          break
          
        case 'snapshot':
          if (!component) {
            return NextResponse.json(
              createApiError({
                code: 'VALIDATION_ERROR',
                message: 'Component parameter required for snapshot command',
                statusCode: 400
              })
            )
          }
          scriptCommand = `${visualTestScript} snapshot "${component}" "${label || 'api-generated'}"`
          break
          
        case 'compare':
          if (!component) {
            return NextResponse.json(
              createApiError({
                code: 'VALIDATION_ERROR',
                message: 'Component parameter required for compare command',
                statusCode: 400
              })
            )
          }
          scriptCommand = `${visualTestScript} compare "${component}" "${baseline || 'HEAD~1'}" "${current || 'HEAD'}"`
          break
          
        case 'audit':
          scriptCommand = `${visualTestScript} audit "${component || 'all'}"`
          break
          
        case 'integrate':
          scriptCommand = `${visualTestScript} integrate`
          break
          
        default:
          return NextResponse.json(
            createApiError({
              code: 'VALIDATION_ERROR',
              message: `Invalid command: ${command}`,
              statusCode: 400
            })
          )
      }

      scriptResult = execSync(scriptCommand, {
        cwd: process.cwd(),
        encoding: 'utf-8',
        timeout: 60000
      })

      // Extract generated file paths from script output
      const fileMatches = scriptResult.match(/Generated.*?:\s*(.+)/g)
      if (fileMatches) {
        generatedFiles = fileMatches.map(match => {
          const filePath = match.split(': ')[1]
          return filePath?.trim() || ''
        }).filter(Boolean)
      }

    } catch (error: any) {
      return NextResponse.json(
        createApiError({
          code: 'SERVER_ERROR',
          message: `Visual test documentation command failed: ${error.message}`,
          statusCode: 500
        })
      )
    }

    // Get Git context if requested
    let gitContext = null
    if (includeGitContext) {
      try {
        const gitContextJson = execSync(`
          echo "{
            \\"repository\\": {
              \\"url\\": \\"$(git config --get remote.origin.url | sed 's/\\.git$//')\\"",
              \\"branch\\": \\"$(git branch --show-current)\\"",
              \\"commit\\": \\"$(git rev-parse HEAD)\\"",
              \\"commit_short\\": \\"$(git rev-parse --short HEAD)\\"",
              \\"last_commit_message\\": \\"$(git log -1 --format='%s')\\"",
              \\"last_author\\": \\"$(git log -1 --format='%an')\\"",
              \\"last_modified\\": \\"$(git log -1 --format='%ai')\\"
            }
          }"
        `, {
          cwd: process.cwd(),
          encoding: 'utf-8',
          timeout: 10000
        })
        
        gitContext = JSON.parse(gitContextJson)
      } catch (error) {
        gitContext = { error: 'Failed to get Git context' }
      }
    }

    // Trigger visual comparison if requested
    let visualComparisonResult = null
    if (triggerVisualComparison && parameters.component) {
      try {
        const visualComparisonUrl = new URL('/api/visual-comparison', request.url)
        const visualResponse = await fetch(visualComparisonUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            images: [],
            prompt: `Analyze ${parameters.component} component for visual regression after Git changes`,
            context: {
              component: parameters.component,
              command,
              gitContext,
              mode: 'git-integration-analysis'
            },
            outputFormat: 'json'
          })
        })

        if (visualResponse.ok) {
          visualComparisonResult = await visualResponse.json()
        }
      } catch (error) {
        visualComparisonResult = { error: 'Visual comparison API failed' }
      }
    }

    // Parse script result for structured data
    let parsedResult: any = {
      output: scriptResult,
      summary: `${command} command executed successfully`
    }

    // Try to extract specific information based on command type
    switch (command) {
      case 'detect-changes':
        const changedFiles = scriptResult.split('\n').filter(line => 
          line.includes('.tsx') || line.includes('.ts') || line.includes('.scss')
        )
        parsedResult.changedFiles = changedFiles
        parsedResult.changeCount = changedFiles.length
        break
        
      case 'snapshot':
        const snapshotMatch = scriptResult.match(/Visual snapshot created: (.+)/)
        if (snapshotMatch) {
          parsedResult.snapshotPath = snapshotMatch[1]
        }
        break
        
      case 'compare':
        const comparisonMatch = scriptResult.match(/Visual comparison report generated: (.+)/)
        if (comparisonMatch) {
          parsedResult.comparisonReport = comparisonMatch[1]
        }
        break
        
      case 'audit':
        const auditMatch = scriptResult.match(/Visual audit report generated: (.+)/)
        if (auditMatch) {
          parsedResult.auditReport = auditMatch[1]
        }
        break
    }

    const processingTime = Date.now() - startTime

    const response: GitVisualIntegrationResponse = {
      command,
      result: parsedResult,
      gitContext,
      visualComparisonResult,
      processingTime,
      generatedFiles
    }

    return NextResponse.json(createApiResponse(response))

  } catch (error: any) {
    return NextResponse.json(
      createApiError({
        code: 'SERVER_ERROR',
        message: error.message || 'Unknown error occurred',
        statusCode: 500
      })
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const component = searchParams.get('component')
    const includeSnapshots = searchParams.get('includeSnapshots') === 'true'
    
    // Get visual test documentation status
    const visualDocsDir = path.join(process.cwd(), 'docs/visual-tests')
    const snapshotDir = path.join(process.cwd(), 'nextjs-website/visual-snapshots')
    
    const status = {
      system: {
        visualDocsExists: fs.existsSync(visualDocsDir),
        snapshotDirExists: fs.existsSync(snapshotDir),
        scriptAvailable: fs.existsSync(path.join(process.cwd(), 'scripts/git-docs/visual-test-docs.sh'))
      },
      components: {
        total: 0,
        documented: 0,
        withSnapshots: 0
      },
      recentActivity: []
    }

    // Count components
    try {
      const componentFiles = execSync(`find . -path "*/components/*" -name "*.tsx" | wc -l`, {
        cwd: process.cwd(),
        encoding: 'utf-8'
      }).trim()
      status.components.total = parseInt(componentFiles) || 0
    } catch (error) {
      status.components.total = 0
    }

    // Count documented components
    if (fs.existsSync(path.join(visualDocsDir, 'snapshots'))) {
      try {
        const documentedFiles = fs.readdirSync(path.join(visualDocsDir, 'snapshots'))
          .filter(file => file.endsWith('.visual.md'))
        status.components.documented = documentedFiles.length
      } catch (error) {
        status.components.documented = 0
      }
    }

    // Count components with snapshots
    if (fs.existsSync(snapshotDir)) {
      try {
        const snapshotDirs = fs.readdirSync(snapshotDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
        status.components.withSnapshots = snapshotDirs.length
      } catch (error) {
        status.components.withSnapshots = 0
      }
    }

    // Get recent activity
    if (fs.existsSync(visualDocsDir)) {
      try {
        const recentFiles = execSync(`find "${visualDocsDir}" -name "*.md" -o -name "*.json" | head -5`, {
          cwd: process.cwd(),
          encoding: 'utf-8'
        }).trim().split('\n').filter(Boolean)
        
        status.recentActivity = recentFiles.map(file => {
          const stats = fs.statSync(file)
          return {
            file: path.relative(process.cwd(), file),
            lastModified: stats.mtime,
            size: stats.size
          }
        })
      } catch (error) {
        status.recentActivity = []
      }
    }

    // If specific component requested, get detailed info
    let componentInfo = null
    if (component) {
      componentInfo = {
        name: component,
        documentation: fs.existsSync(path.join(visualDocsDir, 'snapshots', `${component}.visual.md`)),
        snapshots: fs.existsSync(path.join(snapshotDir, component)) ? 
          fs.readdirSync(path.join(snapshotDir, component)).filter(f => f.endsWith('.json')).length : 0,
        gitAttribution: fs.existsSync(path.join(process.cwd(), 'docs/git-generated', `attribution_*${component}*.json`))
      }

      if (includeSnapshots && componentInfo.snapshots > 0) {
        try {
          const snapshotFiles = fs.readdirSync(path.join(snapshotDir, component))
            .filter(f => f.endsWith('.json'))
            .map(f => {
              const filePath = path.join(snapshotDir, component, f)
              const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
              return {
                filename: f,
                ...content
              }
            })
          componentInfo.snapshotDetails = snapshotFiles
        } catch (error) {
          componentInfo.snapshotDetails = []
        }
      }
    }

    return NextResponse.json(
      createApiResponse({
        status,
        component: componentInfo,
        availableCommands: [
          'detect-changes',
          'generate-docs',
          'snapshot',
          'compare',
          'audit',
          'integrate'
        ],
        integration: {
          gitDocsApi: '/api/git-docs/generate',
          visualComparisonApi: '/api/visual-comparison',
          designSystemApi: '/api/design-system/snapshots'
        }
      })
    )

  } catch (error: any) {
    return NextResponse.json(
      createApiError({
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to get Git-Visual integration status',
        statusCode: 500
      })
    )
  }
}