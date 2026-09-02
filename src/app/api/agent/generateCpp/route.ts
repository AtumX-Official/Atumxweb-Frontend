import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, editContext } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Check if running in Electron environment
    if (typeof window !== 'undefined' && (window as any).api?.agent?.generateCpp) {
      try {
        const result = await (window as any).api.agent.generateCpp(prompt, editContext)
        return NextResponse.json(result)
      } catch (error) {
        console.error('Electron API error:', error)
      }
    }

    // Fallback: If Electron is not available, return an error with guidance
    return NextResponse.json(
      {
        error: 'AI service is not available',
        message: 'The AI Assistant requires Electron or a configured backend service',
        success: false,
      },
      { status: 503 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('generateCpp error:', errorMessage)
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    )
  }
}
