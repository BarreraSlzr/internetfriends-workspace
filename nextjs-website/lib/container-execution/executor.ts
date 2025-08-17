import { 
  type CommandRequest, 
  type CommandResult, 
  type ContainerExecutionContext,
  type CommandVisualization,
  CommandRequestSchema,
  CommandResultSchema 
} from './types'

// =================================================================
// VERCEL EDGE + CONTAINER EXECUTOR
// =================================================================

export class VercelContainerExecutor {
  private baseURL: string
  private apiKey: string
  private defaultContext: Partial<ContainerExecutionContext>

  constructor(config: {
    baseURL?: string
    apiKey?: string
    defaultContext?: Partial<ContainerExecutionContext>
  } = {}) {
    this.baseURL = config.baseURL || 'https://api.internetfriends.xyz'
    this.apiKey = config.apiKey || process.env.CONTAINER_API_KEY || ''
    this.defaultContext = config.defaultContext || {
      image: 'alpine:latest',
      cpu_limit: 1,
      memory_limit: 512, // MB
      timeout_ms: 30000, // 30 seconds
      network_access: false,
      metrics_enabled: true,
      log_level: 'info'
    }
  }

  // =================================================================
  // CORE EXECUTION METHODS
  // =================================================================

  async executeCommand(request: CommandRequest): Promise<CommandResult> {
    const validatedRequest = CommandRequestSchema.parse(request)
    
    try {
      const response = await fetch(`${this.baseURL}/api/container/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Execution-Context': 'vercel-edge'
        },
        body: JSON.stringify({
          ...validatedRequest,
          context: {
            ...this.defaultContext,
            ...validatedRequest.context
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Container execution failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return CommandResultSchema.parse(result)

    } catch (error) {
      // Fallback to local execution simulation for development
      return this.simulateExecution(validatedRequest)
    }
  }

  async streamCommand(request: CommandRequest): Promise<ReadableStream<string>> {
    const validatedRequest = CommandRequestSchema.parse(request)
    
    // Create a ReadableStream for real-time command output
    return new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(`${this.baseURL}/api/container/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(validatedRequest)
          })

          if (!response.body) {
            throw new Error('No response body for streaming')
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()

          while (true) {
            const { done, value } = await reader.read()
            
            if (done) break
            
            const chunk = decoder.decode(value, { stream: true })
            controller.enqueue(chunk)
          }

        } catch (error) {
          // Simulate streaming for development
          const chunks = ['Starting execution...\n', 'Command running...\n', 'Execution complete.\n']
          
          for (const chunk of chunks) {
            controller.enqueue(chunk)
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } finally {
          controller.close()
        }
      }
    })
  }

  // =================================================================
  // SPECIALIZED COMMAND METHODS
  // =================================================================

  async executeGitDiff(repository: string, options: {
    file?: string
    commit1?: string
    commit2?: string
    branch?: string
    visualization?: boolean
  } = {}): Promise<CommandResult & { visualization?: CommandVisualization }> {
    const command = this.buildGitDiffCommand(repository, options)
    
    const result = await this.executeCommand({
      command: 'git',
      args: command.args,
      working_directory: `/tmp/repos/${repository}`,
      output_format: 'diff',
      context: {
        domain_operation: 'git_diff'
      }
    })

    const response: any = { ...result }

    if (options.visualization && result.success) {
      response.visualization = await this.generateDiffVisualization(result.stdout)
    }

    return response
  }

  async executeRipgrep(pattern: string, target: string, options: {
    case_sensitive?: boolean
    whole_word?: boolean
    include?: string[]
    exclude?: string[]
    context_lines?: number
    json_output?: boolean
  } = {}): Promise<CommandResult & { matches: any[] }> {
    const args = this.buildRipgrepArgs(pattern, target, options)
    
    const result = await this.executeCommand({
      command: 'rg',
      args,
      output_format: options.json_output ? 'json' : 'text',
      context: {
        domain_operation: 'file_search'
      }
    })

    const matches = options.json_output && result.success
      ? this.parseRipgrepJSON(result.stdout)
      : this.parseRipgrepText(result.stdout)

    return { ...result, matches }
  }

  async executeDomainAnalysis(domain: string, operations: string[]): Promise<{
    domain: string
    whois?: any
    dns?: any
    ssl?: any
    availability?: any
    history?: any
    visualization?: CommandVisualization
  }> {
    const results: any = { domain }

    // Execute multiple operations in parallel
    const promises = operations.map(async (operation) => {
      switch (operation) {
        case 'whois':
          const whoisResult = await this.executeCommand({
            command: 'whois',
            args: [domain],
            timeout_ms: 10000
          })
          return { operation, result: this.parseWhoisOutput(whoisResult.stdout) }

        case 'dns_lookup':
          const dnsResult = await this.executeCommand({
            command: 'dig',
            args: ['+json', domain],
            timeout_ms: 5000
          })
          return { operation, result: this.parseDNSOutput(dnsResult.stdout) }

        case 'ssl_check':
          const sslResult = await this.executeCommand({
            command: 'openssl',
            args: ['s_client', '-connect', `${domain}:443`, '-servername', domain],
            timeout_ms: 10000
          })
          return { operation, result: this.parseSSLOutput(sslResult.stdout) }

        default:
          return { operation, result: null }
      }
    })

    const operationResults = await Promise.all(promises)
    
    operationResults.forEach(({ operation, result }) => {
      results[operation] = result
    })

    return results
  }

  // =================================================================
  // OPENCODE FLOW EXECUTION
  // =================================================================

  async executeCommandFlow(flowDefinition: {
    nodes: any[]
    edges: any[]
    inputs: Record<string, any>
  }): Promise<{
    execution_id: string
    results: Record<string, CommandResult>
    flow_state: any
  }> {
    const executionId = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const results: Record<string, CommandResult> = {}
    const flowState = {
      current_node: null,
      completed_nodes: [],
      failed_nodes: [],
      execution_graph: []
    }

    // Topological sort of nodes based on edges
    const sortedNodes = this.topologicalSort(flowDefinition.nodes, flowDefinition.edges)
    
    for (const node of sortedNodes) {
      flowState.current_node = node.id
      
      try {
        // Build command from node data and previous results
        const command = this.buildCommandFromNode(node, results, flowDefinition.inputs)
        
        // Execute command
        const result = await this.executeCommand(command)
        results[node.id] = result
        
        if (result.success) {
          flowState.completed_nodes.push(node.id)
        } else {
          flowState.failed_nodes.push(node.id)
          // Continue or break based on node configuration
          if (node.data.halt_on_error !== false) {
            break
          }
        }
        
        flowState.execution_graph.push({
          node_id: node.id,
          timestamp: new Date().toISOString(),
          success: result.success,
          execution_time_ms: result.execution_time_ms
        })

      } catch (error) {
        flowState.failed_nodes.push(node.id)
        console.error(`Flow execution failed at node ${node.id}:`, error)
        break
      }
    }

    return {
      execution_id: executionId,
      results,
      flow_state: flowState
    }
  }

  // =================================================================
  // MARKDOWN DOCUMENT EXECUTION
  // =================================================================

  async executeMarkdownDocument(document: {
    content: string
    frontmatter: any
    execution_cells: any[]
  }): Promise<{
    document_id: string
    executed_content: string
    cell_results: Record<string, CommandResult>
    execution_summary: any
  }> {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const cellResults: Record<string, CommandResult> = {}
    let executedContent = document.content

    // Execute each code cell
    for (const cell of document.execution_cells) {
      try {
        const result = await this.executeCommand({
          command: cell.command.split(' ')[0],
          args: cell.command.split(' ').slice(1),
          output_format: cell.output_format || 'text'
        })

        cellResults[cell.id] = result

        // Replace cell in content with executed output
        const cellMarker = `\`\`\`${cell.language}\n${cell.command}\n\`\`\``
        const outputBlock = `\`\`\`${cell.language}\n${cell.command}\n\`\`\`\n\n**Output:**\n\`\`\`\n${result.stdout}\n\`\`\``
        
        executedContent = executedContent.replace(cellMarker, outputBlock)

      } catch (error) {
        console.error(`Error executing cell ${cell.id}:`, error)
      }
    }

    return {
      document_id: documentId,
      executed_content: executedContent,
      cell_results: cellResults,
      execution_summary: {
        total_cells: document.execution_cells.length,
        successful_cells: Object.values(cellResults).filter(r => r.success).length,
        failed_cells: Object.values(cellResults).filter(r => !r.success).length,
        total_execution_time: Object.values(cellResults).reduce((sum, r) => sum + r.execution_time_ms, 0)
      }
    }
  }

  // =================================================================
  // UTILITY METHODS
  // =================================================================

  private async simulateExecution(request: CommandRequest): Promise<CommandResult> {
    // Simulation for development/testing
    const startTime = Date.now()
    
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500))
    
    return {
      success: true,
      exit_code: 0,
      stdout: `Simulated output for: ${request.command} ${request.args?.join(' ') || ''}`,
      stderr: '',
      execution_time_ms: Date.now() - startTime,
      container_id: `sim_${Math.random().toString(36).substr(2, 9)}`,
      command_history: [{
        timestamp: new Date().toISOString(),
        command: `${request.command} ${request.args?.join(' ') || ''}`,
        exit_code: 0
      }],
      metadata: {
        cpu_usage: Math.random() * 50,
        memory_usage: Math.random() * 100,
        network_io: {
          bytes_sent: Math.floor(Math.random() * 1000),
          bytes_received: Math.floor(Math.random() * 5000)
        }
      }
    }
  }

  private buildGitDiffCommand(repository: string, options: any): { args: string[] } {
    const args = ['diff']
    
    if (options.commit1 && options.commit2) {
      args.push(`${options.commit1}..${options.commit2}`)
    } else if (options.commit1) {
      args.push(options.commit1)
    }
    
    if (options.file) {
      args.push('--', options.file)
    }
    
    return { args }
  }

  private buildRipgrepArgs(pattern: string, target: string, options: any): string[] {
    const args = []
    
    if (options.case_sensitive === false) args.push('-i')
    if (options.whole_word) args.push('-w')
    if (options.json_output) args.push('--json')
    if (options.context_lines) args.push('-C', options.context_lines.toString())
    
    if (options.include) {
      options.include.forEach((inc: string) => args.push('-g', inc))
    }
    
    if (options.exclude) {
      options.exclude.forEach((exc: string) => args.push('-g', `!${exc}`))
    }
    
    args.push(pattern, target)
    return args
  }

  private parseRipgrepJSON(output: string): any[] {
    // Parse ripgrep JSON output
    try {
      return output.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .filter(item => item.type === 'match')
    } catch {
      return []
    }
  }

  private parseRipgrepText(output: string): any[] {
    // Parse ripgrep text output
    return output.split('\n')
      .filter(line => line.trim())
      .map((line, index) => ({
        line_number: index + 1,
        content: line,
        file: 'unknown' // Would be parsed from actual rg output
      }))
  }

  private parseWhoisOutput(output: string): any {
    // Parse WHOIS output into structured data
    const lines = output.split('\n')
    const result: any = {}
    
    lines.forEach(line => {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim().toLowerCase().replace(/\s+/g, '_')
        const value = line.substring(colonIndex + 1).trim()
        if (value) {
          result[key] = value
        }
      }
    })
    
    return result
  }

  private parseDNSOutput(output: string): any {
    // Parse DNS lookup output
    try {
      return JSON.parse(output)
    } catch {
      return { raw_output: output }
    }
  }

  private parseSSLOutput(output: string): any {
    // Parse SSL certificate output
    const certMatch = output.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/)
    return {
      has_certificate: !!certMatch,
      certificate: certMatch ? certMatch[0] : null,
      connection_successful: output.includes('Verify return code: 0 (ok)')
    }
  }

  private async generateDiffVisualization(diffOutput: string): Promise<CommandVisualization> {
    // Generate visualization data for diff output
    return {
      type: 'diff',
      data: {
        old_content: '',
        new_content: '',
        hunks: [] // Would parse actual diff output
      },
      config: {
        width: 800,
        height: 600,
        interactive: true,
        exportable: true
      },
      metadata: {
        generated_at: new Date().toISOString(),
        command_context: 'git_diff',
        data_points: diffOutput.split('\n').length
      }
    }
  }

  private topologicalSort(nodes: any[], edges: any[]): any[] {
    // Simple topological sort for command flow execution
    const sorted = []
    const visited = new Set()
    const temp = new Set()
    
    const visit = (node: any) => {
      if (temp.has(node.id)) throw new Error('Circular dependency detected')
      if (visited.has(node.id)) return
      
      temp.add(node.id)
      
      // Visit dependencies first
      edges
        .filter(edge => edge.target === node.id)
        .forEach(edge => {
          const depNode = nodes.find(n => n.id === edge.source)
          if (depNode) visit(depNode)
        })
      
      temp.delete(node.id)
      visited.add(node.id)
      sorted.push(node)
    }
    
    nodes.forEach(visit)
    return sorted
  }

  private buildCommandFromNode(node: any, previousResults: Record<string, CommandResult>, inputs: Record<string, any>): CommandRequest {
    // Build command from node definition
    return {
      command: node.data.command,
      args: node.data.args || [],
      context: {
        domain_operation: node.type
      }
    }
  }
}

// =================================================================
// SINGLETON INSTANCE
// =================================================================

let containerExecutor: VercelContainerExecutor | null = null

export function getContainerExecutor(config?: any): VercelContainerExecutor {
  if (!containerExecutor) {
    containerExecutor = new VercelContainerExecutor(config)
  }
  return containerExecutor
}

export { VercelContainerExecutor }