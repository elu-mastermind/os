/**
 * Memory Service Demo
 * Demonstrates the scoped memory system with different scopes
 */

import { memoryService } from '@/lib';
import type {
  MemoryEntry,
  MemoryContext,
  PromptEnhancementOptions,
} from '@/types/memory';

async function main() {
  console.log('=== Memory System Demo ===\n');

  // Define context
  const context: MemoryContext = {
    agentId: 'agent-dev-001',
    workflowId: 'workflow-123',
    organizationId: 'org-456',
    userId: 'user-789',
  };

  // ==================== WRITE OPERATIONS ====================

  console.log('1. Writing Organization-level Memory (Brand)');
  await memoryService.write(
    { organizationId: context.organizationId },
    {
      type: 'semantic',
      scope: 'organization',
      key: 'brand_guidelines',
      value: 'TechCorp: Professional, innovative, concise. Use clear language.',
      metadata: { category: 'brand', version: '1.0' },
    }
  );

  await memoryService.write(
    { organizationId: context.organizationId },
    {
      type: 'semantic',
      scope: 'organization',
      key: 'code_standards',
      value: 'Follow TypeScript best practices, use strict mode, write tests for all functions.',
      metadata: { category: 'standards' },
    }
  );

  console.log('✓ Organization memory written\n');

  console.log('2. Writing Workflow-level Memory');
  await memoryService.write(
    { workflowId: context.workflowId },
    {
      type: 'episodic',
      scope: 'workflow',
      key: 'previous_errors',
      value: 'Issue: API timeout on user authentication. Fix: Increased timeout to 30s.',
      metadata: { resolved: true, timestamp: new Date().toISOString() },
    }
  );

  await memoryService.write(
    { workflowId: context.workflowId },
    {
      type: 'short_term',
      scope: 'workflow',
      key: 'current_task',
      value: 'Implementing user profile update functionality',
      metadata: { status: 'in_progress' },
    }
  );

  console.log('✓ Workflow memory written\n');

  console.log('3. Writing Agent-level Memory');
  await memoryService.write(
    { agentId: context.agentId },
    {
      type: 'long_term',
      scope: 'agent',
      key: 'agent_preferences',
      value: 'Prefer functional programming patterns, use React for UI components',
      metadata: { role: 'developer' },
    }
  );

  await memoryService.write(
    { agentId: context.agentId },
    {
      type: 'episodic',
      scope: 'agent',
      key: 'recent_learnings',
      value: 'Learned about new TypeScript 5.4 features: NoInfer utility type, group array methods',
      metadata: { learnedAt: new Date().toISOString() },
    }
  );

  console.log('✓ Agent memory written\n');

  console.log('4. Writing Global Memory');
  await memoryService.write(
    {},
    {
      type: 'semantic',
      scope: 'global',
      key: 'best_practices',
      value: 'Always validate inputs, handle errors gracefully, write self-documenting code',
      metadata: { category: 'general' },
    }
  );

  console.log('✓ Global memory written\n');

  // ==================== READ OPERATIONS ====================

  console.log('5. Reading Agent Memory');
  const agentMemory = await memoryService.read(
    { agentId: context.agentId },
    'agent_preferences'
  );
  console.log('Result:', agentMemory);
  console.log('');

  console.log('6. Reading Workflow Memory by Key');
  const workflowMemory = await memoryService.readScoped(
    'workflow',
    context.workflowId!,
    'current_task'
  );
  console.log('Result:', workflowMemory);
  console.log('');

  console.log('7. Reading All Organization Memories');
  const orgMemories = await memoryService.readMany(
    { organizationId: context.organizationId }
  );
  console.log(`Found ${orgMemories.length} organization memories:`);
  orgMemories.forEach((mem) => {
    console.log(`  - ${mem.key}: ${mem.value.substring(0, 60)}...`);
  });
  console.log('');

  // ==================== SEARCH OPERATIONS ====================

  console.log('8. Searching for Memories');
  const searchResults = await memoryService.search(
    { agentId: context.agentId },
    'TypeScript'
  );
  console.log(`Found ${searchResults.length} matching memories:`);
  searchResults.forEach((mem) => {
    console.log(`  - [${mem.scope}] ${mem.key}: ${mem.value.substring(0, 50)}...`);
  });
  console.log('');

  // ==================== PROMPT INJECTION ====================

  console.log('9. Injecting Memory into System Prompt');
  const baseSystemPrompt =
    'You are a senior software developer helping to build applications.';

  const options: PromptEnhancementOptions = {
    maxTokens: 1000,
    includeOrganizationBrand: true,
    includeWorkflowContext: true,
    includeAgentHistory: true,
    memoryTypes: ['semantic', 'episodic', 'long_term'],
  };

  const injectionResult = await memoryService.injectIntoPrompt(
    baseSystemPrompt,
    context,
    options
  );

  console.log('Enhanced System Prompt:');
  console.log('='.repeat(80));
  console.log(injectionResult.systemPrompt);
  console.log('='.repeat(80));
  console.log('');
  console.log('Injection Statistics:');
  console.log(`  Total Memories Injected: ${injectionResult.totalMemoriesInjected}`);
  console.log('  By Scope:');
  Object.entries(injectionResult.memoriesByScope).forEach(([scope, count]) => {
    console.log(`    - ${scope}: ${count}`);
  });
  console.log('');

  // ==================== BULK WRITE ====================

  console.log('10. Bulk Write Multiple Memories');
  const bulkEntries: MemoryEntry[] = [
    {
      type: 'short_term',
      scope: 'agent',
      key: 'session_variable_1',
      value: 'User prefers dark mode',
    },
    {
      type: 'short_term',
      scope: 'agent',
      key: 'session_variable_2',
      value: 'Project deadline: 2024-03-15',
    },
    {
      type: 'semantic',
      scope: 'workflow',
      key: 'api_endpoints',
      value: 'GET /api/users, POST /api/users, PUT /api/users/:id, DELETE /api/users/:id',
    },
  ];

  const writtenEntries = await memoryService.writeMany(
    { agentId: context.agentId, workflowId: context.workflowId },
    bulkEntries
  );
  console.log(`✓ Successfully wrote ${writtenEntries.length} memories\n`);

  // ==================== TTL MANAGEMENT ====================

  console.log('11. Setting TTL for a Memory Entry');
  const ttlSet = await memoryService.setTTL(
    { agentId: context.agentId },
    'session_variable_1',
    3600 // 1 hour
  );
  console.log(`TTL set: ${ttlSet ? 'Success' : 'Failed'}\n`);

  // ==================== CLEAR OPERATIONS ====================

  console.log('12. Clearing Expired Memories');
  const clearedCount = await memoryService.clearExpired({
    agentId: context.agentId,
  });
  console.log(`Cleared ${clearedCount} expired memories\n`);

  console.log('13. Clearing Agent Scope');
  const agentCleared = await memoryService.clearScope('agent', context.agentId!);
  console.log(`Cleared ${agentCleared} memories from agent scope\n`);

  console.log('=== Demo Complete ===');
}

// Run the demo
main().catch(console.error);
