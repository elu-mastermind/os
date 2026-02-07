# Agent Registry Usage Guide

The Agent Registry is a core component that manages agent configurations and provides a unified interface for running agents.

## Basic Usage

### Getting Started

```typescript
import { agentRegistry } from '@/lib';

// Get all registered agent configs
const allAgents = agentRegistry.getAllAgentConfigs();
console.log('Available agents:', allAgents);

// Get a specific agent config
const devAgent = agentRegistry.getAgentConfig('agent-dev-001');
```

### Running an Agent

```typescript
import { agentRegistry } from '@/lib';

// Run an agent with input
const result = await agentRegistry.run(
  'agent-dev-001', // agentId
  'Write a function to sort an array of numbers', // input
  {
    sessionId: 'session-123',
    userId: 'user-456',
    timestamp: new Date(),
    metadata: { workflowId: 'workflow-789' }
  } // context
);

console.log('Agent output:', result.output);
console.log('Token usage:', result.usage);
```

### Creating and Registering Custom Agents

```typescript
import { createAndRegisterAgent } from '@/lib';

createAndRegisterAgent({
  id: 'agent-custom-001',
  role: 'Custom Specialist',
  systemPrompt: 'You are a specialist in custom tasks...',
  allowedTools: ['tool-1', 'tool-2'],
  modelPreference: 'gpt-4',
  memoryScope: 'conversation',
  temperature: 0.7,
  capabilities: ['capability-1', 'capability-2'],
  metadata: {
    version: '1.0.0',
    author: 'user'
  }
});
```

### Memory Management

```typescript
import { agentRegistry } from '@/lib';

// Get conversation history for an agent
const history = agentRegistry.getMemory('agent-dev-001', 'session-123');

// Append a message to memory
agentRegistry.appendMemory('agent-dev-001', 'session-123', {
  role: 'user',
  content: 'New message'
});

// Clear memory for a session
agentRegistry.clearMemory('agent-dev-001', 'session-123');

// Clear all memory for an agent
agentRegistry.clearMemory('agent-dev-001');
```

### Agent Configuration Structure

```typescript
interface AgentConfig {
  id: string;                    // Unique identifier for the agent
  role: string;                  // Agent's role/title
  systemPrompt: string;          // System prompt defining agent behavior
  allowedTools: string[];        // List of tools the agent can use
  modelPreference: ModelPreference; // Preferred LLM model
  memoryScope: MemoryScope;      // Memory scope: 'session' | 'conversation' | 'persistent'
  temperature?: number;          // Sampling temperature (0-2)
  maxTokens?: number;           // Maximum tokens in response
  capabilities?: string[];       // List of agent capabilities
  metadata?: Record<string, unknown>; // Additional metadata
}
```

### Available Models

- `gpt-4`
- `gpt-4-turbo`
- `gpt-3.5-turbo`
- `claude-3-opus`
- `claude-3-sonnet`
- `claude-3-haiku`

### Memory Scopes

- **session**: Memory persists only during a single session
- **conversation**: Memory persists across multiple turns in a conversation
- **persistent**: Memory persists indefinitely across all sessions

### Available Tools

See `getAvailableTools()` function for the complete list of available tools.

### Validation

```typescript
import { validateAgentConfig } from '@/lib';

const validation = validateAgentConfig({
  id: 'test-agent',
  role: 'Test Role',
  systemPrompt: 'You are a test agent'
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Cloning Agents

```typescript
import { cloneAgentConfig, registerAgent } from '@/lib';

const baseAgent = agentRegistry.getAgentConfig('agent-dev-001');
const clonedAgent = cloneAgentConfig(baseAgent, 'agent-dev-002', {
  role: 'Modified Developer',
  temperature: 0.5
});

registerAgent(clonedAgent);
```

## Example Workflow

```typescript
import { agentRegistry } from '@/lib';

async function processUserRequest(userId: string, agentId: string, input: string) {
  const context = {
    sessionId: `session-${Date.now()}`,
    userId,
    timestamp: new Date()
  };

  // Check if agent exists
  const agent = agentRegistry.getAgentConfig(agentId);
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }

  // Run the agent
  const result = await agentRegistry.run(agentId, input, context);

  if (result.error) {
    console.error('Agent execution failed:', result.error);
    return null;
  }

  return result;
}

// Usage
const response = await processUserRequest(
  'user-123',
  'agent-dev-001',
  'Help me debug this function'
);
```

## Reloading Configurations

If you modify agent configs at runtime, you can reload the registry:

```typescript
agentRegistry.reloadConfigs();
```

This will clear all configs and memory, then reload from the data source.
