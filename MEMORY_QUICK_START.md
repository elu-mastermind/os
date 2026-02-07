# Memory System - Quick Start Guide

## What is the Memory System?

A scoped memory management system that enables agents and workflows to store, retrieve, and contextualize information across different organizational levels.

## Quick Examples

### Basic Usage

```typescript
import { memoryService } from '@/lib';

// Store agent preferences
await memoryService.write(
  { agentId: 'agent-001' },
  {
    type: 'long_term',
    scope: 'agent',
    key: 'code_style',
    value: 'Prefer functional programming'
  }
);

// Retrieve preferences
const memory = await memoryService.read({ agentId: 'agent-001' }, 'code_style');
console.log(memory?.value); // "Prefer functional programming"
```

### Organization Brand Guidelines

```typescript
import { storeBrandGuidelines } from '@/lib';

await storeBrandGuidelines('org-123', {
  voice: 'Professional and friendly',
  tone: 'Concise and actionable',
  style: 'Modern'
});
```

### Workflow Context

```typescript
import { storeWorkflowContext, getWorkflowContext } from '@/lib';

// Store context
await storeWorkflowContext('workflow-456', {
  currentPhase: 'implementation',
  deadline: '2024-03-15',
  completedSteps: ['design', 'planning']
});

// Retrieve context
const context = await getWorkflowContext('workflow-456');
```

### Prompt Enhancement

```typescript
import { memoryService } from '@/lib';

// Inject memory into prompt
const result = await memoryService.injectIntoPrompt(
  'You are a helpful assistant.',
  {
    agentId: 'agent-001',
    workflowId: 'workflow-456',
    organizationId: 'org-123'
  },
  {
    includeOrganizationBrand: true,
    includeWorkflowContext: true,
    includeAgentHistory: true
  }
);

console.log(result.systemPrompt); // Enhanced prompt with memory context
console.log(result.totalMemoriesInjected); // Number of memories used
```

## Memory Scopes

| Scope | Description | Example Use Cases |
|-------|-------------|------------------|
| **agent** | Individual agent preferences | Code style, learnings, preferences |
| **workflow** | Shared workflow context | Task state, errors, dependencies |
| **organization** | Organization-wide knowledge | Brand guidelines, policies, standards |
| **global** | System-wide knowledge | Best practices, common patterns |

## Memory Types

| Type | TTL | Best For |
|------|-----|----------|
| **short_term** | 1 hour | Session variables, task state |
| **episodic** | 24 hours | Conversation turns, errors |
| **semantic** | 30 days | Guidelines, documentation, standards |
| **long_term** | 1 year | Persistent preferences, learned patterns |

## Helper Functions

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

// Store agent preferences
await storeAgentPreferences('agent-001', {
  framework: 'React',
  language: 'TypeScript',
  testing: 'Jest'
});

// Store error with resolution
try {
  // some operation
} catch (error) {
  await storeError({ agentId: 'agent-001' }, error, 'Added retry logic');
}

// Create prompt builder
const builder = createPromptBuilder({
  agentId: 'agent-001',
  organizationId: 'org-123'
});

const enhancedPrompt = await builder.build('Help the user', {
  includeOrgBrand: true,
  includeAgentHistory: true
});
```

## Files Created

- `src/types/memory.ts` - Type definitions
- `src/lib/memoryService.ts` - Core memory service
- `src/lib/memoryHelpers.ts` - Convenience functions
- `src/examples/memoryServiceDemo.ts` - Comprehensive demo
- `prisma/schema.prisma` - Updated database schema
- `prisma/seed.ts` - Enhanced seed data
- `MEMORY_SYSTEM.md` - Complete documentation
- `PHASE3_IMPLEMENTATION_SUMMARY.md` - Implementation details

## Documentation

For complete documentation, see:
- **[MEMORY_SYSTEM.md](./MEMORY_SYSTEM.md)** - Full documentation with all examples
- **[PHASE3_IMPLEMENTATION_SUMMARY.md](./PHASE3_IMPLEMENTATION_SUMMARY.md)** - Implementation details

## Running the Demo

```bash
# Set up the database
npm run db:generate
npm run db:migrate
npm run db:seed

# Run the memory service demo
npx tsx src/examples/memoryServiceDemo.ts
```

## Integration with Agent Registry

```typescript
import { agentRegistry, memoryService } from '@/lib';

// Get agent config
const config = agentRegistry.getAgentConfig('agent-001');

// Enhance system prompt with memory
const enhanced = await memoryService.injectIntoPrompt(
  config.systemPrompt,
  { agentId: 'agent-001', organizationId: 'org-123' },
  { includeOrganizationBrand: true }
);

// Run agent with enhanced prompt
const result = await agentRegistry.run('agent-001', input, context);
```

## Key Features

✅ **Four Scoped Memory Levels** - agent, workflow, organization, global
✅ **Four Memory Types** - short_term, episodic, semantic, long_term
✅ **Automatic TTL Management** - Configurable time-to-live for each memory type
✅ **Prompt Enhancement** - Automatically inject memory into LLM prompts
✅ **Database Persistence** - Full Prisma integration
✅ **Search & Query** - Flexible memory retrieval options
✅ **Convenience Helpers** - Common operations made simple
