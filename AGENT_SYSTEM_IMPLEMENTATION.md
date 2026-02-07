# Agent System Implementation - Phase 2

This document describes the implementation of the Agent System Core Intelligence for the AgentOS project.

## Overview

The Agent System consists of two main components:

1. **Agent Definition Engine** - Defines the structure and configuration of agents
2. **Agent Registry** - Manages agent configurations and provides execution capabilities

## Implementation Details

### 1. Agent Definition Engine

The Agent Definition Engine provides the core abstractions for defining agents:

#### Type Definitions (`src/types/index.ts`)

```typescript
// New types added:
export type ModelPreference = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku';
export type MemoryScope = 'session' | 'conversation' | 'persistent';

export interface AgentConfig {
  id: string;                              // Unique identifier
  role: string;                            // Agent's role/title
  systemPrompt: string;                    // System prompt defining behavior
  allowedTools: string[];                  // Tools the agent can use
  modelPreference: ModelPreference;         // Preferred LLM model
  memoryScope: MemoryScope;                // Memory persistence scope
  temperature?: number;                    // Sampling temperature (0-2)
  maxTokens?: number;                      // Maximum response tokens
  capabilities?: string[];                 // Agent capabilities
  metadata?: Record<string, unknown>;      // Additional metadata
}

export interface AgentExecutionContext {
  sessionId?: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentExecutionResult {
  output: string;
  agentId: string;
  context: AgentExecutionContext;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

#### Agent Factory (`src/lib/agentFactory.ts`)

Provides utility functions for creating and managing agent configurations:

- `createAgentConfig(params)` - Creates a new AgentConfig object
- `registerAgent(config)` - Registers an agent with the registry
- `createAndRegisterAgent(params)` - Creates and registers an agent in one step
- `getAvailableTools()` - Returns list of available tools
- `getAvailableModels()` - Returns list of available models
- `validateAgentConfig(config)` - Validates agent configuration
- `cloneAgentConfig(source, newId, overrides)` - Creates a copy of an agent config

### 2. Agent Registry

The Agent Registry (`src/lib/agentRegistry.ts`) is the core management system for agents.

#### Key Features

1. **Dynamic Configuration Loading**
   - Loads agent configs from `src/data/agentConfigs.ts`
   - Supports runtime registration of new agents
   - Can reload configurations on demand

2. **Agent Execution**
   - `run(agentId, input, context)` - Execute an agent with input
   - Handles different agent types with appropriate mock responses
   - Manages conversation history based on memory scope
   - Returns structured results with usage metrics

3. **Memory Management**
   - Session-based memory
   - Conversation-level memory
   - Persistent memory storage
   - Memory clearing per scope or entire agent

4. **Query Operations**
   - Get specific agent by ID
   - List all registered agents
   - Register/unregister agents

#### Core Class: AgentRegistry

```typescript
class AgentRegistry {
  // Agent Configuration
  loadConfigs(): void
  getAgentConfig(agentId: string): AgentConfig | undefined
  getAllAgentConfigs(): AgentConfig[]
  registerAgent(config: AgentConfig): void
  unregisterAgent(agentId: string): boolean
  reloadConfigs(): void

  // Memory Management
  getMemory(agentId: string, scope: string): Message[]
  setMemory(agentId: string, scope: string, messages: Message[]): void
  appendMemory(agentId: string, scope: string, message: Message): void
  clearMemory(agentId: string, scope?: string): void

  // Agent Execution
  run(agentId: string, input: string, context: AgentExecutionContext): Promise<AgentExecutionResult>
}
```

## Sample Agent Configurations

Ten pre-configured agents are provided in `src/data/agentConfigs.ts`:

1. **Senior Software Developer** (`agent-dev-001`)
   - Model: gpt-4-turbo
   - Tools: code-editor, terminal, git, linter, debugger
   - Memory: conversation

2. **Content Writer** (`agent-writer-001`)
   - Model: gpt-4
   - Tools: text-editor, grammar-check, seo-analyzer, plagiarism-checker
   - Memory: session

3. **Data Analyst** (`agent-analyst-001`)
   - Model: claude-3-opus
   - Tools: spreadsheet, chart-generator, sql-query, python, statistical-tools
   - Memory: persistent

4. **Research Assistant** (`agent-researcher-001`)
   - Model: claude-3-sonnet
   - Tools: web-search, document-reader, citation-manager, note-taking
   - Memory: conversation

5. **UX/UI Designer** (`agent-designer-001`)
   - Model: gpt-4
   - Tools: figma, prototype-builder, color-picker, font-selector
   - Memory: session

6. **Project Manager** (`agent-project-001`)
   - Model: gpt-4-turbo
   - Tools: task-manager, calendar, gantt-chart, resource-planner
   - Memory: persistent

7. **Customer Support Agent** (`agent-support-001`)
   - Model: gpt-3.5-turbo
   - Tools: knowledge-base, ticket-system, customer-database, email-client
   - Memory: conversation

8. **Security Analyst** (`agent-security-001`)
   - Model: claude-3-opus
   - Tools: vulnerability-scanner, log-analyzer, penetration-testing, security-audit
   - Memory: session

9. **Marketing Specialist** (`agent-marketer-001`)
   - Model: gpt-4
   - Tools: social-media, email-marketing, analytics, content-calendar
   - Memory: conversation

10. **QA Engineer** (`agent-qa-001`)
    - Model: gpt-4-turbo
    - Tools: test-runner, coverage-tool, bug-tracker, automation-framework
    - Memory: session

## Usage Examples

### Basic Agent Execution

```typescript
import { agentRegistry } from '@/lib';

const result = await agentRegistry.run(
  'agent-dev-001',
  'Write a function to sort an array',
  {
    sessionId: 'session-123',
    userId: 'user-456',
    timestamp: new Date(),
  }
);

console.log(result.output);
console.log(result.usage);
```

### Creating Custom Agents

```typescript
import { createAndRegisterAgent } from '@/lib';

createAndRegisterAgent({
  id: 'agent-custom-001',
  role: 'Custom Specialist',
  systemPrompt: 'You are a specialist in...',
  allowedTools: ['tool-1', 'tool-2'],
  modelPreference: 'gpt-4',
  memoryScope: 'conversation',
  temperature: 0.7,
});
```

### Memory Management

```typescript
import { agentRegistry } from '@/lib';

// Get conversation history
const history = agentRegistry.getMemory('agent-dev-001', 'session-123');

// Append to memory
agentRegistry.appendMemory('agent-dev-001', 'session-123', {
  role: 'user',
  content: 'New message'
});

// Clear memory
agentRegistry.clearMemory('agent-dev-001', 'session-123');
```

## Testing

Comprehensive test suite provided in `src/lib/__tests__/agentRegistry.test.ts`:

- Agent registration and unregistration
- Configuration queries
- Memory management
- Agent execution
- Error handling
- Configuration validation

Run tests with:
```bash
npm test
```

## Demo

A demonstration script is available at `src/examples/agentRegistryDemo.ts`:

```bash
npx tsx src/examples/agentRegistryDemo.ts
```

This script demonstrates:
- Listing all available agents
- Running agents
- Memory management
- Creating custom agents
- Validation

## Architecture

```
src/
├── types/
│   └── index.ts                    # Type definitions
├── lib/
│   ├── agentRegistry.ts            # Core registry class
│   ├── agentFactory.ts             # Factory functions
│   ├── AGENT_REGISTRY_USAGE.md     # Usage documentation
│   └── __tests__/
│       └── agentRegistry.test.ts    # Test suite
├── data/
│   └── agentConfigs.ts             # Pre-configured agents
└── examples/
    └── agentRegistryDemo.ts        # Demo script
```

## Memory Scope Behavior

- **session**: Memory persists only during a single execution (no storage)
- **conversation**: Memory persists across multiple turns in a conversation
- **persistent**: Memory persists indefinitely across all sessions

## Model Support

The system supports multiple LLM models:
- OpenAI: gpt-4, gpt-4-turbo, gpt-3.5-turbo
- Anthropic: claude-3-opus, claude-3-sonnet, claude-3-haiku

## Notes

- Current implementation uses mock responses for demonstration
- In production, the `executeAgent` method would be replaced with actual LLM API calls
- Token usage is estimated based on input/output length
- The registry is designed to be easily extensible for additional features

## Future Enhancements

Potential improvements for future phases:
- Integration with actual LLM APIs
- Tool execution framework
- Advanced memory strategies (RAG, vector databases)
- Agent collaboration protocols
- Performance monitoring and analytics
- Dynamic tool loading
- Agent chaining and composition
