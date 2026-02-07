# Memory System - Phase 3 Implementation

## Overview

The Memory System provides scoped memory management with database persistence, enabling agents and workflows to store, retrieve, and contextualize information across different levels of granularity.

## Architecture

### Memory Scopes

The system supports four hierarchical memory scopes:

1. **Agent-level** (`agent`)
   - Individual agent preferences, learnings, and history
   - Scoped to a specific agent instance
   - Example: Code style preferences, recent learnings, conversation history

2. **Workflow-level** (`workflow`)
   - Shared context within a workflow execution
   - Accessible to all agents in the workflow
   - Example: Workflow state, task dependencies, error history

3. **Organization-level** (`organization`)
   - Brand guidelines, policies, and shared knowledge
   - Accessible to all agents and workflows in the organization
   - Example: Brand voice, code standards, API endpoints

4. **Global** (`global`)
   - System-wide knowledge and templates
   - Accessible to all users and organizations
   - Example: Best practices, common patterns, system templates

### Memory Types

- **short_term**: Temporary memory (1 hour TTL) - session variables, task state
- **episodic**: Event-based memory (24 hour TTL) - conversation turns, errors
- **semantic**: Knowledge-based memory (30 day TTL) - guidelines, standards, documentation
- **long_term**: Persistent memory (1 year TTL) - preferences, learned patterns

## API Reference

### Memory Service

#### Read Operations

```typescript
// Read a single memory entry
const memory = await memoryService.read(
  { agentId: 'agent-001' },
  'preference_code_style'
);

// Read multiple memories with filters
const memories = await memoryService.readMany(
  { organizationId: 'org-123' },
  { type: 'semantic', limit: 20 }
);

// Read from a specific scope
const workflowMemory = await memoryService.readScoped(
  'workflow',
  'workflow-456',
  'current_state'
);
```

#### Write Operations

```typescript
// Write a single memory
await memoryService.write(
  { agentId: 'agent-001' },
  {
    type: 'long_term',
    scope: 'agent',
    key: 'preference_code_style',
    value: 'Prefer functional programming patterns',
    metadata: { category: 'preferences' }
  }
);

// Write multiple memories in bulk
const entries = [
  { type: 'short_term', scope: 'agent', key: 'var1', value: 'value1' },
  { type: 'short_term', scope: 'agent', key: 'var2', value: 'value2' }
];
await memoryService.writeMany({ agentId: 'agent-001' }, entries);

// Write to a specific scope
await memoryService.writeScoped(
  'organization',
  'org-123',
  {
    type: 'semantic',
    scope: 'organization',
    key: 'brand_voice',
    value: 'Professional, concise, and friendly'
  }
);
```

#### Delete Operations

```typescript
// Delete a specific memory
await memoryService.delete({ agentId: 'agent-001' }, 'old_key');

// Delete from a specific scope
await memoryService.deleteScoped('workflow', 'workflow-456', 'state');

// Clear all memories in a scope
const count = await memoryService.clearScope('agent', 'agent-001');

// Clear expired memories
const expiredCount = await memoryService.clearExpired({ agentId: 'agent-001' });
```

#### Prompt Injection

```typescript
// Inject contextual memory into a system prompt
const result = await memoryService.injectIntoPrompt(
  'You are a helpful assistant.',
  { agentId: 'agent-001', workflowId: 'workflow-456', organizationId: 'org-123' },
  {
    maxTokens: 1000,
    includeOrganizationBrand: true,
    includeWorkflowContext: true,
    includeAgentHistory: true,
    memoryTypes: ['semantic', 'episodic']
  }
);

console.log(result.systemPrompt); // Enhanced prompt with memory context
console.log(result.totalMemoriesInjected); // Number of memories injected
console.log(result.memoriesByScope); // Breakdown by scope
```

#### Search Operations

```typescript
// Search for memories containing a query
const results = await memoryService.search(
  { agentId: 'agent-001' },
  'TypeScript',
  { limit: 10, type: 'episodic' }
);
```

#### TTL Management

```typescript
// Set time-to-live for a memory (in seconds)
await memoryService.setTTL(
  { agentId: 'agent-001' },
  'session_token',
  3600 // 1 hour
);
```

### Memory Helpers

Convenience functions for common operations:

```typescript
import {
  storeAgentPreferences,
  storeWorkflowContext,
  storeBrandGuidelines,
  storeError,
  storeConversationTurn,
  getAgentPreferences,
  getWorkflowContext,
  getRecentErrors,
  clearConversationHistory,
  createPromptBuilder
} from '@/lib';
```

#### Store Agent Preferences

```typescript
await storeAgentPreferences('agent-001', {
  codeStyle: 'functional',
  language: 'TypeScript',
  framework: 'React'
});
```

#### Store Workflow Context

```typescript
await storeWorkflowContext('workflow-456', {
  currentTask: 'Implement authentication',
  dependencies: ['auth-service', 'user-database'],
  deadline: '2024-03-15'
});
```

#### Store Brand Guidelines

```typescript
await storeBrandGuidelines('org-123', {
  voice: 'Professional and friendly',
  tone: 'Concise',
  style: 'Modern',
  formatting: 'Use Markdown'
});
```

#### Store Error History

```typescript
try {
  // Some operation
} catch (error) {
  await storeError(
    { agentId: 'agent-001' },
    error,
    'Increased timeout to 30 seconds'
  );
}
```

#### Store Conversation Turns

```typescript
await storeConversationTurn(
  { agentId: 'agent-001' },
  userMessage,
  assistantResponse
);
```

#### Retrieve Data

```typescript
// Get typed preferences
const preferences = await getAgentPreferences('agent-001');

// Get workflow context
const context = await getWorkflowContext('workflow-456');

// Get recent errors
const errors = await getRecentErrors({ agentId: 'agent-001' }, 10);
```

#### Clear Data

```typescript
// Clear conversation history
await clearConversationHistory({ agentId: 'agent-001' });
```

#### Prompt Builder

```typescript
const builder = createPromptBuilder({
  agentId: 'agent-001',
  workflowId: 'workflow-456',
  organizationId: 'org-123'
});

// Build with specific scopes
const withBrand = await builder.withBrand('Help the user', 'org-123');
const withWorkflow = await builder.withWorkflow('Continue the task', 'workflow-456');
const withAgent = await builder.withAgent('Respond as yourself', 'agent-001');

// Build with all scopes
const fullPrompt = await builder.build('You are a helpful assistant', {
  maxTokens: 1000,
  includeOrgBrand: true,
  includeWorkflowCtx: true,
  includeAgentHistory: true
});
```

## Database Schema

The `AgentMemory` model stores all memory entries:

```prisma
model AgentMemory {
  id        String @id @default(uuid())
  type      MemoryType
  scope     MemoryScope
  key       String
  value     String
  metadata  Json?
  expiresAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  agentId   String
  agent     Agent @relation(fields: [agentId], references: [id], onDelete: Cascade)

  workflowId    String?
  organizationId String?

  @@index([agentId, type, scope])
  @@index([workflowId, type, scope])
  @@index([organizationId, type, scope])
  @@index([key])
}
```

## Use Cases

### 1. Brand Consistency

Store organization brand guidelines and automatically inject them into prompts:

```typescript
await storeBrandGuidelines('org-123', {
  voice: 'Professional, innovative',
  tone: 'Confident yet approachable'
});

// Later, when generating content
const result = await memoryService.injectIntoPrompt(
  'Write a product description',
  { organizationId: 'org-123' },
  { includeOrganizationBrand: true }
);
```

### 2. Agent Personalization

Remember agent preferences and learnings:

```typescript
await storeAgentPreferences('agent-001', {
  codeStyle: 'functional',
  preferredFramework: 'React'
});

// Use when agent executes tasks
const preferences = await getAgentPreferences('agent-001');
```

### 3. Workflow State Management

Track workflow progress and context:

```typescript
await storeWorkflowContext('workflow-456', {
  currentStep: 'data-processing',
  completedSteps: ['ingestion', 'validation'],
  variables: { userId: '123', projectId: 'abc' }
});

// Access in subsequent workflow steps
const context = await getWorkflowContext('workflow-456');
```

### 4. Error Tracking and Learning

Store errors and their resolutions for future reference:

```typescript
try {
  await performOperation();
} catch (error) {
  await storeError(
    { workflowId: 'workflow-456' },
    error,
    'Added retry logic with exponential backoff'
  );
}

// Later, search for similar errors
const apiErrors = await getRecentErrors(
  { workflowId: 'workflow-456' },
  10
);
```

### 5. Conversation History

Store and retrieve conversation context:

```typescript
// After each exchange
await storeConversationTurn(
  { agentId: 'agent-001' },
  userMessage,
  assistantResponse
);

// Inject into next prompt
const result = await memoryService.injectIntoPrompt(
  'Continue the conversation',
  { agentId: 'agent-001' },
  { includeAgentHistory: true }
);
```

## Best Practices

1. **Choose the Right Scope**
   - Use `agent` scope for individual agent preferences
   - Use `workflow` scope for shared workflow context
   - Use `organization` scope for brand and policies
   - Use `global` scope for universal knowledge

2. **Set Appropriate TTLs**
   - `short_term` for session variables (1 hour)
   - `episodic` for conversation turns and errors (24 hours)
   - `semantic` for guidelines and documentation (30 days)
   - `long_term` for persistent preferences (1 year)

3. **Use Structured Keys**
   - Prefix keys by category: `pref_`, `ctx_`, `brand_`, `error_`
   - Use consistent naming conventions
   - Avoid special characters in keys

4. **Leverage Metadata**
   - Store additional context in metadata field
   - Use for filtering and categorization
   - Include timestamps for temporal queries

5. **Monitor Memory Usage**
   - Clean up expired memories regularly
   - Set appropriate TTLs for different use cases
   - Use `clearExpired()` periodically

## Integration with Agent Registry

The memory system integrates seamlessly with the existing Agent Registry:

```typescript
import { agentRegistry, memoryService } from '@/lib';

// Enhanced agent execution with memory injection
async function runAgentWithMemory(
  agentId: string,
  input: string,
  context: AgentExecutionContext
) {
  const config = agentRegistry.getAgentConfig(agentId);

  // Inject memory into system prompt
  const enhancedPrompt = await memoryService.injectIntoPrompt(
    config.systemPrompt,
    {
      agentId,
      workflowId: context.metadata?.workflowId as string,
      organizationId: context.metadata?.organizationId as string
    },
    {
      includeOrganizationBrand: true,
      includeWorkflowContext: true,
      includeAgentHistory: true
    }
  );

  // Store conversation turn
  await storeConversationTurn(
    { agentId },
    input,
    '' // Will be filled after execution
  );

  // Execute with enhanced prompt
  const result = await agentRegistry.run(agentId, input, {
    ...context,
    metadata: {
      ...context.metadata,
      enhancedSystemPrompt: enhancedPrompt.systemPrompt
    }
  });

  return result;
}
```

## Testing

Run the demo to see the memory system in action:

```bash
npx tsx src/examples/memoryServiceDemo.ts
```

This will demonstrate:
- Writing to different scopes
- Reading and searching memories
- Prompt injection
- TTL management
- Bulk operations

## Future Enhancements

Potential improvements for future phases:

1. **Vector Search**: Integrate with vector databases for semantic search
2. **Memory Compression**: Automatically compress old or less-accessed memories
3. **Memory Prioritization**: Implement importance scoring for memory retention
4. **Cross-Agent Sharing**: Allow agents to share specific memories
5. **Memory Analytics**: Track memory usage patterns and access statistics
6. **Memory Export/Import**: Support exporting and importing memory sets
7. **Memory Versioning**: Track changes to semantic memories over time
