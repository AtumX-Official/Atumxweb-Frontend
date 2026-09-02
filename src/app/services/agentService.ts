/**
 * AgentService: Wrapper around window.api.agent with proper error handling,
 * browser fallback, and recovery mechanisms for AI Assistant functionality.
 */

interface GenerateCppResponse {
  success?: boolean
  files?: Array<{ path: string; content: string }>
  code?: string
  suggestedName?: string
  libDeps?: string[]
  notes?: string
  error?: string | { message: string }
  unverified?: boolean
  pinWarning?: string
}

interface ReadProjectFilesResponse {
  files?: Array<{ path: string; content: string }>
  error?: string
  success?: boolean
}

interface EnsureLibrariesResponse {
  added?: string[]
  unresolved?: string[]
  error?: string
  success?: boolean
}

interface CompileAndFixResponse {
  compiled?: boolean
  files?: Array<{ path: string; content: string }>
  rounds?: number
  envError?: boolean
  error?: string
  success?: boolean
}

interface FixCppResponse {
  success?: boolean
  files?: Array<{ path: string; content: string }>
  error?: string | { message: string }
}

interface AgentStatusData {
  type?: 'status' | 'tool' | string
  text?: string
}

type AgentStatusCallback = (data: AgentStatusData) => void

class AgentService {
  private isElectronAvailable: boolean

  constructor() {
    this.isElectronAvailable = this.checkElectronAvailability()
  }

  /**
   * Check if Electron API is available in the current environment
   */
  private checkElectronAvailability(): boolean {
    if (typeof window === 'undefined') return false
    return !!(window as any).api?.agent
  }

  /**
   * Ensure Electron API is available before calling it
   */
  private ensureElectronAvailable(): boolean {
    this.isElectronAvailable = this.checkElectronAvailability()
    return this.isElectronAvailable
  }

  /**
   * Generate C++ code using the AI assistant
   */
  async generateCpp(
    prompt: string,
    editContext?: string
  ): Promise<GenerateCppResponse> {
    if (!this.ensureElectronAvailable()) {
      return {
        success: false,
        error: 'AI service is not available. The application is running in browser mode. Please use the Electron version to access the AI Assistant.',
      }
    }

    try {
      const result = await (window as any).api.agent.generateCpp?.(prompt, editContext)
      if (!result) {
        return {
          success: false,
          error: 'No response from AI service. Please check your connection and try again.',
        }
      }
      return result
    } catch (error) {
      const errorMessage = this.getErrorMessage(error)
      console.error('Error in generateCpp:', errorMessage)
      return {
        success: false,
        error: `Failed to generate C++ code: ${errorMessage}`,
      }
    }
  }

  /**
   * Read all project files from a given root path
   */
  async readProjectFiles(
    rootPath: string
  ): Promise<ReadProjectFilesResponse> {
    if (!this.ensureElectronAvailable()) {
      return {
        success: false,
        files: [],
        error: 'Cannot read project files: Electron API not available',
      }
    }

    try {
      const files = await (window as any).api.agent.readProjectFiles?.(rootPath)
      return { success: true, files: files || [] }
    } catch (error) {
      const errorMessage = this.getErrorMessage(error)
      console.error('Error in readProjectFiles:', errorMessage)
      return {
        success: false,
        files: [],
        error: `Failed to read project files: ${errorMessage}`,
      }
    }
  }

  /**
   * Ensure required libraries are added to the project
   */
  async ensureLibraries(
    rootPath: string,
    libDeps?: string[]
  ): Promise<EnsureLibrariesResponse> {
    if (!this.ensureElectronAvailable()) {
      return {
        success: false,
        added: [],
        unresolved: [],
        error: 'Cannot ensure libraries: Electron API not available',
      }
    }

    try {
      const result = await (window as any).api.agent.ensureLibraries?.(
        rootPath,
        libDeps
      )
      return { success: true, ...result }
    } catch (error) {
      const errorMessage = this.getErrorMessage(error)
      console.error('Error in ensureLibraries:', errorMessage)
      return {
        success: false,
        added: [],
        unresolved: [],
        error: `Failed to ensure libraries: ${errorMessage}`,
      }
    }
  }

  /**
   * Compile project and auto-fix errors using AI
   */
  async compileAndFix(
    rootPath: string,
    prompt: string
  ): Promise<CompileAndFixResponse> {
    if (!this.ensureElectronAvailable()) {
      return {
        compiled: false,
        error: 'Cannot compile: Electron API not available',
      }
    }

    try {
      const result = await (window as any).api.agent.compileAndFix?.(
        rootPath,
        prompt
      )
      return result || { compiled: false }
    } catch (error) {
      const errorMessage = this.getErrorMessage(error)
      console.error('Error in compileAndFix:', errorMessage)
      return {
        compiled: false,
        error: `Compilation failed: ${errorMessage}`,
      }
    }
  }

  /**
   * Fix C++ compilation errors using AI
   */
  async fixCpp(
    rootPath: string,
    buildError: string
  ): Promise<FixCppResponse> {
    if (!this.ensureElectronAvailable()) {
      return {
        success: false,
        error: 'Cannot fix errors: Electron API not available',
      }
    }

    try {
      const result = await (window as any).api.agent.fixCpp?.(
        rootPath,
        buildError
      )
      return result || { success: false }
    } catch (error) {
      const errorMessage = this.getErrorMessage(error)
      console.error('Error in fixCpp:', errorMessage)
      return {
        success: false,
        error: `Failed to fix errors: ${errorMessage}`,
      }
    }
  }

  /**
   * Register a callback for agent status updates
   */
  onOutput(callback: AgentStatusCallback): void {
    if (!this.ensureElectronAvailable()) {
      console.warn('Agent output stream not available: Electron API not available')
      return
    }

    try {
      (window as any).api.agent.onOutput?.(callback)
    } catch (error) {
      console.error('Error registering output callback:', error)
    }
  }

  /**
   * Remove all event listeners for agent output
   */
  removeAllListeners(): void {
    if (!this.ensureElectronAvailable()) {
      return
    }

    try {
      (window as any).api.agent.removeAllListeners?.()
    } catch (error) {
      console.error('Error removing listeners:', error)
    }
  }

  /**
   * Extract error message from various error types
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    if (error && typeof error === 'object') {
      const err = error as any
      if (err.message) return String(err.message)
      if (err.error) return String(err.error)
    }
    return 'Unknown error occurred'
  }

  /**
   * Check if the agent service is available
   */
  isAvailable(): boolean {
    return this.checkElectronAvailability()
  }
}

// Export singleton instance
export const agentService = new AgentService()

// Export class for testing
export { AgentService }
