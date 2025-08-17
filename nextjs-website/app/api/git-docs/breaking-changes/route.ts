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

interface BreakingChangeRequest {
  fromCommit?: string
  toCommit?: string
  targetFiles?: string[]
  severity?: 'all' | 'critical' | 'high' | 'medium'
}

interface BreakingChangeAnalysis {
  analysis: {
    from_commit: string
    to_commit: string
    analyzed_at: string
    total_breaking_changes: number
    repository: string
    branch: string
  }
  breaking_changes: Array<{
    type: string
    severity: string
    file: string
    change: string
    commit_range: string
    detected_at: string
  }>
  summary: {
    critical: number
    high: number
    medium: number
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: BreakingChangeRequest = await request.json()
    const {
      fromCommit = 'HEAD~1',
      toCommit = 'HEAD',
      targetFiles = [],
      severity = 'all'
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

    // Validate commit references
    try {
      execSync(`git rev-parse ${fromCommit}`, { cwd: process.cwd() })
      execSync(`git rev-parse ${toCommit}`, { cwd: process.cwd() })
    } catch {
      return NextResponse.json(
        createApiError({
          code: 'VALIDATION_ERROR',
          message: 'Invalid commit references',
          statusCode: 400
        })
      )
    }

    // Run breaking change detection
    const scriptPath = path.join(process.cwd(), 'scripts/git-docs/breaking-change-detector.sh')
    
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        createApiError({
          code: 'SERVER_ERROR',
          message: 'Breaking change detector script not found',
          statusCode: 500
        })
      )
    }

    let analysisResult: string
    try {
      analysisResult = execSync(`${scriptPath} analyze ${fromCommit} ${toCommit}`, {
        cwd: process.cwd(),
        encoding: 'utf-8',
        timeout: 30000
      })
    } catch (error: any) {
      return NextResponse.json(
        createApiError({
          code: 'SERVER_ERROR',
          message: `Breaking change analysis failed: ${error.message}`,
          statusCode: 500
        })
      )
    }

    // Load the most recent breaking changes report
    const reportsDir = path.join(process.cwd(), 'docs/git-generated')
    let breakingChangeReport: BreakingChangeAnalysis | null = null

    if (fs.existsSync(reportsDir)) {
      const reportFiles = fs.readdirSync(reportsDir)
        .filter(file => file.startsWith('breaking-changes-') && file.endsWith('.json'))
        .sort()
        .reverse()

      if (reportFiles.length > 0) {
        const latestReport = path.join(reportsDir, reportFiles[0])
        try {
          breakingChangeReport = JSON.parse(fs.readFileSync(latestReport, 'utf-8'))
        } catch (error) {
          return NextResponse.json(
            createApiError({
              code: 'SERVER_ERROR',
              message: 'Failed to parse breaking change report',
              statusCode: 500
            })
          )
        }
      }
    }

    if (!breakingChangeReport) {
      return NextResponse.json(
        createApiError({
          code: 'NOT_FOUND',
          message: 'No breaking change report generated',
          statusCode: 404
        })
      )
    }

    // Filter by severity if requested
    if (severity !== 'all') {
      breakingChangeReport.breaking_changes = breakingChangeReport.breaking_changes.filter(
        change => change.severity.toLowerCase() === severity.toLowerCase()
      )
      
      // Recalculate summary
      const filtered = breakingChangeReport.breaking_changes
      breakingChangeReport.summary = {
        critical: filtered.filter(c => c.severity === 'CRITICAL').length,
        high: filtered.filter(c => c.severity === 'HIGH').length,
        medium: filtered.filter(c => c.severity === 'MEDIUM').length
      }
    }

    return NextResponse.json(createApiResponse(breakingChangeReport))

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
    // List all breaking change reports
    const reportsDir = path.join(process.cwd(), 'docs/git-generated')
    
    if (!fs.existsSync(reportsDir)) {
      return NextResponse.json(
        createApiResponse({
          message: 'No breaking change reports found',
          reports: [],
          count: 0
        })
      )
    }

    const reportFiles = fs.readdirSync(reportsDir)
      .filter(file => file.startsWith('breaking-changes-') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(reportsDir, file)
        const stats = fs.statSync(filePath)
        
        // Extract timestamp from filename
        const timestampMatch = file.match(/breaking-changes-(\d{8}-\d{6})\.json/)
        const timestamp = timestampMatch ? timestampMatch[1] : 'unknown'
        
        // Try to get summary from file
        let summary = null
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
          summary = content.summary || null
        } catch {
          // Silent fail
        }
        
        return {
          filename: file,
          timestamp,
          lastModified: stats.mtime,
          size: stats.size,
          summary
        }
      })
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())

    return NextResponse.json(
      createApiResponse({
        reports: reportFiles,
        count: reportFiles.length,
        latest: reportFiles[0] || null
      })
    )

  } catch (error: any) {
    return NextResponse.json(
      createApiError({
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to list breaking change reports',
        statusCode: 500
      })
    )
  }
}