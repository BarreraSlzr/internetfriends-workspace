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

interface GitDocGenerationRequest {
  files?: string[]
  includePrivate?: boolean
  format?: 'markdown' | 'json' | 'both'
  detectBreakingChanges?: boolean
}

interface GitDocGenerationResponse {
  generated: {
    count: number
    files: string[]
    outputDir: string
  }
  attribution: any
  breakingChanges?: any
  processingTime: number
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    const body: GitDocGenerationRequest = await request.json()
    const {
      files = [],
      includePrivate = false,
      format = 'both',
      detectBreakingChanges = true
    } = body

    // Validate that we're in a Git repository
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

    // Execute Git documentation generation
    const scriptPath = path.join(process.cwd(), '../scripts/git-docs/orchestrator.sh')
    
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        createApiError({
          code: 'SERVER_ERROR',
          message: 'Git documentation script not found',
          statusCode: 500
        })
      )
    }

    // Run documentation generation
    let generationResult: string
    try {
      generationResult = execSync(`${scriptPath} generate`, {
        cwd: path.join(process.cwd(), '..'),
        encoding: 'utf-8',
        timeout: 30000
      })
    } catch (error: any) {
      return NextResponse.json(
        createApiError({
          code: 'SERVER_ERROR',
          message: `Documentation generation failed: ${error.message}`,
          statusCode: 500
        })
      )
    }

    // Load generated attribution data
    const attributionPath = path.join(process.cwd(), '../docs/git-generated/source-attribution.json')
    let attribution = null
    
    if (fs.existsSync(attributionPath)) {
      try {
        attribution = JSON.parse(fs.readFileSync(attributionPath, 'utf-8'))
      } catch {
        attribution = { error: 'Failed to parse attribution data' }
      }
    }

    // Run breaking change detection if requested
    let breakingChanges = null
    if (detectBreakingChanges) {
      try {
        const breakingChangeScript = path.join(process.cwd(), '../scripts/git-docs/breaking-change-detector.sh')
        if (fs.existsSync(breakingChangeScript)) {
          execSync(`${breakingChangeScript} analyze`, {
            cwd: path.join(process.cwd(), '..'),
            timeout: 15000
          })

          // Load the most recent breaking changes report
          const reportsDir = path.join(process.cwd(), '../docs/git-generated')
          const reportFiles = fs.readdirSync(reportsDir)
            .filter(file => file.startsWith('breaking-changes-') && file.endsWith('.json'))
            .sort()
            .reverse()

          if (reportFiles.length > 0) {
            const latestReport = path.join(reportsDir, reportFiles[0])
            breakingChanges = JSON.parse(fs.readFileSync(latestReport, 'utf-8'))
          }
        }
      } catch (error) {
        breakingChanges = { error: 'Breaking change detection failed', details: error }
      }
    }

    // Count generated files
    const outputDir = path.join(process.cwd(), '../docs/git-generated')
    const generatedFiles = fs.existsSync(outputDir)
      ? fs.readdirSync(outputDir).filter(file => file.endsWith('.md'))
      : []

    const processingTime = Date.now() - startTime

    const response: GitDocGenerationResponse = {
      generated: {
        count: generatedFiles.length,
        files: generatedFiles.slice(0, 20), // Limit to first 20 for response size
        outputDir: './docs/git-generated'
      },
      attribution,
      breakingChanges,
      processingTime
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
    // Get list of available documentation files
    const outputDir = path.join(process.cwd(), '../docs/git-generated')
    
    if (!fs.existsSync(outputDir)) {
      return NextResponse.json(
        createApiResponse({
          message: 'No documentation has been generated yet',
          files: [],
          count: 0
        })
      )
    }

    const files = fs.readdirSync(outputDir)
    const documentationFiles = files.filter(file => file.endsWith('.md'))
    const attributionFiles = files.filter(file => file.includes('attribution') && file.endsWith('.json'))
    const breakingChangeFiles = files.filter(file => file.startsWith('breaking-changes-') && file.endsWith('.json'))

    // Get latest attribution data
    let latestAttribution = null
    if (fs.existsSync(path.join(outputDir, 'source-attribution.json'))) {
      try {
        latestAttribution = JSON.parse(
          fs.readFileSync(path.join(outputDir, 'source-attribution.json'), 'utf-8')
        )
      } catch {
        // Silent fail
      }
    }

    return NextResponse.json(
      createApiResponse({
        documentation: {
          count: documentationFiles.length,
          files: documentationFiles.map(file => ({
            name: file,
            type: file.includes('public_') ? 'public' : file.includes('private_') ? 'private' : 'standard',
            lastModified: fs.statSync(path.join(outputDir, file)).mtime
          }))
        },
        attribution: {
          count: attributionFiles.length,
          latest: latestAttribution ? {
            timestamp: latestAttribution[0]?.generated_at,
            filesTracked: latestAttribution.length
          } : null
        },
        breakingChanges: {
          count: breakingChangeFiles.length,
          files: breakingChangeFiles.slice(0, 5) // Most recent 5
        },
        outputDirectory: outputDir
      })
    )

  } catch (error: any) {
    return NextResponse.json(
      createApiError({
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to list documentation files',
        statusCode: 500
      })
    )
  }
}