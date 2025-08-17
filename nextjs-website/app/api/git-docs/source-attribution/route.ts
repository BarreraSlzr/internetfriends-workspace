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

interface SourceAttributionRequest {
  file?: string
  includePrivate?: boolean
  lineRange?: {
    start: number
    end: number
  }
}

interface SourceAttributionResponse {
  file: string
  urls: {
    github_blob: string
    github_blame: string
    github_history: string
    github_raw: string
  }
  metadata: {
    commit: string
    commit_short: string
    branch: string
    line_count: number
    file_size: number
    last_modified: string
    last_author: string
    last_commit_message: string
  }
  constructs?: {
    interfaces: Array<{
      name: string
      line: number
      type: string
    }>
    types: Array<{
      name: string
      line: number
      type: string
    }>
    schemas: Array<{
      name: string
      line: number
      type: string
    }>
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: SourceAttributionRequest = await request.json()
    const {
      file,
      includePrivate = false,
      lineRange
    } = body

    if (!file) {
      return NextResponse.json(
        createApiError({
          code: 'VALIDATION_ERROR',
          message: 'File parameter is required',
          statusCode: 400
        })
      )
    }

    // Validate file exists
    const filePath = path.join(process.cwd(), file)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        createApiError({
          code: 'NOT_FOUND',
          message: `File not found: ${file}`,
          statusCode: 404
        })
      )
    }

    // Check if attribution data exists for this file
    const attributionDir = path.join(process.cwd(), 'docs/git-generated')
    const attributionFile = path.join(attributionDir, `attribution_${file.replace(/\//g, '_')}.json`)
    
    let attributionData: SourceAttributionResponse | null = null
    
    if (fs.existsSync(attributionFile)) {
      try {
        attributionData = JSON.parse(fs.readFileSync(attributionFile, 'utf-8'))
      } catch (error) {
        return NextResponse.json(
          createApiError({
            code: 'SERVER_ERROR',
            message: 'Failed to parse attribution data',
            statusCode: 500
          })
        )
      }
    } else {
      // Generate attribution data on-demand using our script
      const { execSync } = require('child_process')
      const scriptPath = path.join(process.cwd(), 'scripts/git-docs/source-attribution.sh')
      
      if (fs.existsSync(scriptPath)) {
        try {
          execSync(`${scriptPath} ${file}`, {
            cwd: process.cwd(),
            timeout: 15000
          })
          
          // Try to load the generated attribution
          if (fs.existsSync(attributionFile)) {
            attributionData = JSON.parse(fs.readFileSync(attributionFile, 'utf-8'))
          }
        } catch (error: any) {
          return NextResponse.json(
            createApiError({
              code: 'SERVER_ERROR',
              message: `Failed to generate attribution: ${error.message}`,
              statusCode: 500
            })
          )
        }
      }
    }

    if (!attributionData) {
      return NextResponse.json(
        createApiError({
          code: 'SERVER_ERROR',
          message: 'Could not generate or load attribution data',
          statusCode: 500
        })
      )
    }

    // Filter out private URLs if not requested
    if (!includePrivate) {
      // Remove private repository URLs for public consumption
      const publicData = { ...attributionData }
      
      // Replace private repository URLs with generic placeholders
      if (publicData.urls) {
        Object.keys(publicData.urls).forEach(key => {
          const url = publicData.urls[key as keyof typeof publicData.urls]
          if (url.includes('private') || url.includes('github.com/BarreraSlzr/internetfriends-workspace')) {
            publicData.urls[key as keyof typeof publicData.urls] = '[Private Repository - Contact for Access]'
          }
        })
      }
      
      attributionData = publicData
    }

    // Apply line range filtering if requested
    if (lineRange && attributionData.constructs) {
      const { start, end } = lineRange
      
      // Filter constructs to only include those within the line range
      attributionData.constructs.interfaces = attributionData.constructs.interfaces.filter(
        item => item.line >= start && item.line <= end
      )
      attributionData.constructs.types = attributionData.constructs.types.filter(
        item => item.line >= start && item.line <= end
      )
      attributionData.constructs.schemas = attributionData.constructs.schemas.filter(
        item => item.line >= start && item.line <= end
      )
    }

    return NextResponse.json(createApiResponse(attributionData))

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
    const includePrivate = searchParams.get('includePrivate') === 'true'
    
    // List all available attribution files
    const attributionDir = path.join(process.cwd(), 'docs/git-generated')
    
    if (!fs.existsSync(attributionDir)) {
      return NextResponse.json(
        createApiResponse({
          message: 'No attribution data available',
          files: [],
          count: 0
        })
      )
    }

    const attributionFiles = fs.readdirSync(attributionDir)
      .filter(file => file.startsWith('attribution_') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(attributionDir, file)
        const stats = fs.statSync(filePath)
        
        // Extract original file path from attribution filename
        const originalFile = file
          .replace('attribution_', '')
          .replace('.json', '')
          .replace(/_/g, '/')
        
        let summary = null
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
          summary = {
            commit: content.attribution?.metadata?.commit_short || 'unknown',
            lastModified: content.attribution?.metadata?.last_modified || 'unknown',
            author: content.attribution?.metadata?.last_author || 'unknown',
            constructCount: (
              (content.line_ranges?.constructs?.interfaces?.length || 0) +
              (content.line_ranges?.constructs?.types?.length || 0) +
              (content.line_ranges?.constructs?.schemas?.length || 0)
            )
          }
        } catch {
          // Silent fail
        }
        
        return {
          attributionFile: file,
          originalFile,
          lastModified: stats.mtime,
          size: stats.size,
          summary
        }
      })
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())

    return NextResponse.json(
      createApiResponse({
        files: attributionFiles,
        count: attributionFiles.length,
        includePrivate
      })
    )

  } catch (error: any) {
    return NextResponse.json(
      createApiError({
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to list attribution files',
        statusCode: 500
      })
    )
  }
}