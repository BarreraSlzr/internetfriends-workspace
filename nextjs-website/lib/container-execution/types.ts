import { z } from 'zod'

// =================================================================
// CONTAINER COMMAND EXECUTION TYPES
// =================================================================

export const CommandRequestSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  environment: z.record(z.string()).optional(),
  working_directory: z.string().optional(),
  timeout_ms: z.number().max(300000).optional(), // Max 5 minutes
  output_format: z.enum(['text', 'json', 'markdown', 'diff']).optional(),
  stream: z.boolean().optional(),
  context: z.object({
    domain_operation: z.string().optional(),
    user_id: z.string().optional(),
    session_id: z.string().optional()
  }).optional()
})

export const CommandResultSchema = z.object({
  success: z.boolean(),
  exit_code: z.number(),
  stdout: z.string(),
  stderr: z.string(),
  execution_time_ms: z.number(),
  container_id: z.string(),
  command_history: z.array(z.object({
    timestamp: z.string(),
    command: z.string(),
    exit_code: z.number()
  })),
  metadata: z.object({
    cpu_usage: z.number(),
    memory_usage: z.number(),
    network_io: z.object({
      bytes_sent: z.number(),
      bytes_received: z.number()
    })
  })
})

// Enhanced types for specific command categories
export const GitOperationSchema = z.object({
  operation: z.enum(['diff', 'log', 'status', 'blame', 'show']),
  repository: z.string(),
  branch: z.string().optional(),
  file_path: z.string().optional(),
  commit_hash: z.string().optional(),
  visualization: z.boolean().optional()
})

export const FileOperationSchema = z.object({
  operation: z.enum(['grep', 'rg', 'sed', 'awk', 'find']),
  pattern: z.string(),
  target: z.string(),
  recursive: z.boolean().optional(),
  case_sensitive: z.boolean().optional(),
  output_format: z.enum(['plain', 'json', 'highlighted']).optional()
})

export const DomainAnalysisSchema = z.object({
  domain: z.string(),
  operations: z.array(z.enum(['whois', 'dns_lookup', 'ssl_check', 'availability', 'history'])),
  include_visualization: z.boolean().optional()
})

// =================================================================
// OPENCODE INTEGRATION TYPES
// =================================================================

export const OpenCodeNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['command', 'git', 'file', 'domain', 'custom']),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  data: z.object({
    command: z.string(),
    args: z.array(z.string()).optional(),
    title: z.string(),
    description: z.string().optional(),
    inputs: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean()
    })),
    outputs: z.array(z.object({
      name: z.string(),
      type: z.string()
    })),
    execution_history: z.array(z.object({
      timestamp: z.string(),
      result: z.any(),
      duration_ms: z.number()
    }))
  }),
  style: z.object({
    background: z.string().optional(),
    border: z.string().optional(),
    color: z.string().optional()
  }).optional()
})

export const CommandFlowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  nodes: z.array(OpenCodeNodeSchema),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
    data: z.object({
      condition: z.string().optional(),
      transform: z.string().optional()
    }).optional()
  })),
  metadata: z.object({
    created_at: z.string(),
    updated_at: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    public: z.boolean(),
    domain_context: z.string().optional()
  })
})

// =================================================================
// MARKDOWN + FRONTMATTER INTEGRATION
// =================================================================

export const CommandDocumentSchema = z.object({
  frontmatter: z.object({
    title: z.string(),
    description: z.string(),
    commands: z.array(z.string()),
    tags: z.array(z.string()),
    domain_context: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimated_time: z.string(),
    prerequisites: z.array(z.string()).optional(),
    author: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    version: z.string(),
    shareable: z.boolean()
  }),
  content: z.string(), // Markdown content with embedded commands
  execution_cells: z.array(z.object({
    id: z.string(),
    command: z.string(),
    language: z.enum(['bash', 'git', 'rg', 'sed', 'awk']),
    editable: z.boolean(),
    auto_execute: z.boolean(),
    output_format: z.string()
  }))
})

// =================================================================
// ORPC INTEGRATION TYPES
// =================================================================

export const RPCContainerMethodSchema = z.object({
  execute_command: z.function()
    .args(CommandRequestSchema)
    .returns(CommandResultSchema),
  
  stream_command: z.function()
    .args(CommandRequestSchema)
    .returns(z.object({
      stream_id: z.string(),
      websocket_url: z.string()
    })),
  
  execute_git_operation: z.function()
    .args(GitOperationSchema)
    .returns(z.object({
      result: CommandResultSchema,
      visualization: z.object({
        type: z.string(),
        data: z.any()
      }).optional()
    })),
  
  execute_file_operation: z.function()
    .args(FileOperationSchema)
    .returns(z.object({
      result: CommandResultSchema,
      matches: z.array(z.object({
        file: z.string(),
        line: z.number(),
        content: z.string(),
        context: z.string()
      }))
    })),
  
  analyze_domain: z.function()
    .args(DomainAnalysisSchema)
    .returns(z.object({
      domain: z.string(),
      analysis: z.record(z.any()),
      visualization: z.any().optional()
    })),
  
  create_command_flow: z.function()
    .args(CommandFlowSchema)
    .returns(z.object({
      flow_id: z.string(),
      execution_url: z.string(),
      share_url: z.string()
    })),
  
  execute_command_flow: z.function()
    .args(z.object({
      flow_id: z.string(),
      inputs: z.record(z.any())
    }))
    .returns(z.object({
      execution_id: z.string(),
      results: z.array(CommandResultSchema),
      flow_visualization: z.any()
    }))
})

// =================================================================
// CONTAINER EXECUTION CONTEXT
// =================================================================

export interface ContainerExecutionContext {
  // Container management
  container_id: string
  image: string
  cpu_limit: number
  memory_limit: number
  timeout_ms: number
  
  // File system
  working_directory: string
  mounted_volumes: Record<string, string>
  
  // Network
  network_access: boolean
  allowed_domains: string[]
  
  // Security
  user_id: number
  group_id: number
  capabilities: string[]
  
  // Monitoring
  metrics_enabled: boolean
  log_level: 'debug' | 'info' | 'warn' | 'error'
}

// =================================================================
// VISUALIZATION TYPES
// =================================================================

export interface CommandVisualization {
  type: 'graph' | 'diff' | 'tree' | 'timeline' | 'heatmap' | 'network'
  data: any
  config: {
    width?: number
    height?: number
    interactive?: boolean
    exportable?: boolean
  }
  metadata: {
    generated_at: string
    command_context: string
    data_points: number
  }
}

export interface DiffVisualization extends CommandVisualization {
  type: 'diff'
  data: {
    old_content: string
    new_content: string
    hunks: Array<{
      old_start: number
      old_lines: number
      new_start: number
      new_lines: number
      lines: Array<{
        type: 'add' | 'remove' | 'context'
        content: string
        line_number: number
      }>
    }>
  }
}

export interface GitGraphVisualization extends CommandVisualization {
  type: 'graph'
  data: {
    commits: Array<{
      hash: string
      message: string
      author: string
      date: string
      parents: string[]
    }>
    branches: Array<{
      name: string
      head: string
      color: string
    }>
    layout: {
      nodes: Array<{ id: string; x: number; y: number }>
      edges: Array<{ source: string; target: string }>
    }
  }
}

// =================================================================
// TYPESCRIPT EXPORTS
// =================================================================

export type CommandRequest = z.infer<typeof CommandRequestSchema>
export type CommandResult = z.infer<typeof CommandResultSchema>
export type GitOperation = z.infer<typeof GitOperationSchema>
export type FileOperation = z.infer<typeof FileOperationSchema>
export type DomainAnalysis = z.infer<typeof DomainAnalysisSchema>
export type OpenCodeNode = z.infer<typeof OpenCodeNodeSchema>
export type CommandFlow = z.infer<typeof CommandFlowSchema>
export type CommandDocument = z.infer<typeof CommandDocumentSchema>
export type RPCContainerMethod = z.infer<typeof RPCContainerMethodSchema>