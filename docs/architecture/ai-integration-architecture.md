# AI Integration Architecture

## Dual-Mode Strategy

The system supports two AI modes to accommodate different security and infrastructure requirements:

**Mode 1: Web-Based (Copy/Paste)**
- HR Admin configures prompt templates in database
- System generates combined prompt (template + context)
- User copies prompt to external AI tool (ChatGPT, Claude, etc.)
- User pastes result back into application
- **Benefit:** No API keys, no infrastructure, maximum flexibility

**Mode 2: Local Ollama**
- Direct integration with Ollama REST API
- Automatic prompt generation and result retrieval
- **Benefit:** Privacy, no external dependencies, faster UX

## Implementation

```	ypescript
// src/lib/ai/ai-service.ts
export type AIMode = 'web' | 'local'

export interface AIConfig {
  mode: AIMode
  ollamaUrl?: string
  ollamaModel?: string
  promptTemplates: {
    resultExplanation: string
    managerFeedback: string
  }
}

export class AIService {
  constructor(private config: AIConfig) {}
  
  async generatePrompt(context: {
    type: 'result_explanation' | 'manager_feedback'
    userText: string
    targetDescription?: string
  }): Promise<string> {
    const template = context.type === 'result_explanation'
      ? this.config.promptTemplates.resultExplanation
      : this.config.promptTemplates.managerFeedback
    
    return \\

Context:
Target: \

User's Input:
\

Please write a professional version of this content.\
  }
  
  async getAIAssistance(context: {
    type: 'result_explanation' | 'manager_feedback'
    userText: string
    targetDescription?: string
  }): Promise<{ type: 'prompt' | 'result', content: string }> {
    const prompt = await this.generatePrompt(context)
    
    if (this.config.mode === 'web') {
      // Web-based: Return prompt for user to copy
      return {
        type: 'prompt',
        content: prompt
      }
    } else {
      // Local Ollama: Call API directly
      const response = await fetch(\\/api/generate\, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.ollamaModel || 'llama2',
          prompt: prompt,
          stream: false
        })
      })
      
      if (!response.ok) {
        throw new Error('Ollama API error')
      }
      
      const data = await response.json()
      return {
        type: 'result',
        content: data.response
      }
    }
  }
}
```

## API Routes

```	ypescript
// src/app/api/ai/generate-prompt/route.ts (Web-based mode)
export async function POST(request: NextRequest) {
  const { type, userText, targetDescription } = await request.json()
  
  const config = await getAIConfig() // From database
  const aiService = new AIService(config)
  
  const result = await aiService.getAIAssistance({
    type,
    userText,
    targetDescription
  })
  
  return NextResponse.json({ success: true, data: result })
}

// src/app/api/ai/generate/route.ts (Local Ollama mode)
export async function POST(request: NextRequest) {
  // Same implementation - AIService handles mode switching
}
```

## AI Config Database Schema

```prisma
model AIConfig {
  id                    String   @id @default(uuid())
  mode                  String   @default("web") // "web" | "local"
  ollamaUrl             String?  @default("http://localhost:11434")
  ollamaModel           String?  @default("llama2")
  resultExplanationTmpl String   @default("Please help write a professional self-evaluation...")
  managerFeedbackTmpl   String   @default("Please help write constructive manager feedback...")
  updatedAt             DateTime @updatedAt
}
```

---

