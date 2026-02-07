/**
 * Memory Helper Utilities
 * Provides convenience functions for common memory operations
 */

import { memoryService } from './memoryService';
import type { MemoryContext, MemoryEntry } from '@/types/memory';

/**
 * Store agent preferences and learnings
 */
export async function storeAgentPreferences(
  agentId: string,
  preferences: Record<string, string>
): Promise<MemoryEntry[]> {
  const entries: MemoryEntry[] = Object.entries(preferences).map(([key, value]) => ({
    type: 'long_term' as const,
    scope: 'agent' as const,
    key: `pref_${key}`,
    value,
    metadata: { category: 'preferences' },
  }));

  return memoryService.writeMany({ agentId }, entries);
}

/**
 * Store workflow context and state
 */
export async function storeWorkflowContext(
  workflowId: string,
  context: Record<string, unknown>
): Promise<MemoryEntry[]> {
  const entries: MemoryEntry[] = Object.entries(context).map(([key, value]) => ({
    type: 'short_term' as const,
    scope: 'workflow' as const,
    key: `ctx_${key}`,
    value: JSON.stringify(value),
    metadata: { category: 'context' },
  }));

  return memoryService.writeMany({ workflowId }, entries);
}

/**
 * Store organization brand guidelines
 */
export async function storeBrandGuidelines(
  organizationId: string,
  guidelines: {
    voice?: string;
    tone?: string;
    style?: string;
    formatting?: string;
  }
): Promise<MemoryEntry[]> {
  const entries: MemoryEntry[] = Object.entries(guidelines)
    .filter(([_, value]) => value)
    .map(([key, value]) => ({
      type: 'semantic' as const,
      scope: 'organization' as const,
      key: `brand_${key}`,
      value: value as string,
      metadata: { category: 'brand' },
    }));

  return memoryService.writeMany({ organizationId }, entries);
}

/**
 * Store error history for debugging
 */
export async function storeError(
  context: MemoryContext,
  error: Error,
  resolution?: string
): Promise<MemoryEntry> {
  const key = `error_${Date.now()}`;
  const value = JSON.stringify({
    message: error.message,
    stack: error.stack,
    resolution,
    timestamp: new Date().toISOString(),
  });

  return memoryService.write(context, {
    type: 'episodic',
    scope: context.workflowId ? 'workflow' : 'agent',
    key,
    value,
    metadata: { errorType: error.name, resolved: !!resolution },
  });
}

/**
 * Store conversation history with LLM
 */
export async function storeConversationTurn(
  context: MemoryContext,
  userMessage: string,
  assistantResponse: string
): Promise<MemoryEntry[]> {
  const timestamp = Date.now();
  const entries: MemoryEntry[] = [
    {
      type: 'episodic',
      scope: context.workflowId ? 'workflow' : 'agent',
      key: `turn_${timestamp}_user`,
      value: userMessage,
      metadata: { role: 'user', timestamp: new Date(timestamp).toISOString() },
    },
    {
      type: 'episodic',
      scope: context.workflowId ? 'workflow' : 'agent',
      key: `turn_${timestamp}_assistant`,
      value: assistantResponse,
      metadata: { role: 'assistant', timestamp: new Date(timestamp).toISOString() },
    },
  ];

  return memoryService.writeMany(context, entries);
}

/**
 * Get agent preferences as a typed object
 */
export async function getAgentPreferences(
  agentId: string
): Promise<Record<string, string>> {
  const memories = await memoryService.readMany(
    { agentId },
    { type: 'long_term' }
  );

  const preferences: Record<string, string> = {};

  for (const memory of memories) {
    if (memory.key.startsWith('pref_')) {
      const key = memory.key.replace('pref_', '');
      preferences[key] = memory.value;
    }
  }

  return preferences;
}

/**
 * Get workflow context as a typed object
 */
export async function getWorkflowContext(
  workflowId: string
): Promise<Record<string, unknown>> {
  const memories = await memoryService.readMany(
    { workflowId },
    { type: 'short_term' }
  );

  const context: Record<string, unknown> = {};

  for (const memory of memories) {
    if (memory.key.startsWith('ctx_')) {
      const key = memory.key.replace('ctx_', '');
      try {
        context[key] = JSON.parse(memory.value);
      } catch {
        context[key] = memory.value;
      }
    }
  }

  return context;
}

/**
 * Get recent errors for a workflow or agent
 */
export async function getRecentErrors(
  context: MemoryContext,
  limit = 10
): Promise<Array<{ key: string; error: any; resolution?: string }>> {
  const memories = await memoryService.search(
    context,
    'error',
    { limit }
  );

  return memories
    .filter((mem) => mem.key.startsWith('error_'))
    .map((mem) => {
      try {
        const data = JSON.parse(mem.value);
        return {
          key: mem.key,
          error: data,
          resolution: data.resolution,
          timestamp: mem.updatedAt,
        };
      } catch {
        return { key: mem.key, error: mem.value };
      }
    });
}

/**
 * Clear all conversation turns
 */
export async function clearConversationHistory(
  context: MemoryContext
): Promise<number> {
  const memories = await memoryService.readMany(context);

  let cleared = 0;
  for (const memory of memories) {
    if (memory.key.startsWith('turn_')) {
      const deleted = await memoryService.delete(context, memory.key);
      if (deleted) cleared++;
    }
  }

  return cleared;
}

/**
 * Create a memory-aware prompt builder
 */
export function createPromptBuilder(context: MemoryContext) {
  return {
    async build(
      basePrompt: string,
      options?: {
        maxTokens?: number;
        includeOrgBrand?: boolean;
        includeWorkflowCtx?: boolean;
        includeAgentHistory?: boolean;
      }
    ) {
      const result = await memoryService.injectIntoPrompt(basePrompt, context, {
        maxTokens: options?.maxTokens,
        includeOrganizationBrand: options?.includeOrgBrand,
        includeWorkflowContext: options?.includeWorkflowCtx,
        includeAgentHistory: options?.includeAgentHistory,
      });
      return result;
    },

    async withBrand<T extends string>(
      prompt: T,
      organizationId: string
    ): Promise<string> {
      const result = await memoryService.injectIntoPrompt(
        prompt,
        { organizationId },
        {
          includeOrganizationBrand: true,
          includeWorkflowContext: false,
          includeAgentHistory: false,
        }
      );
      return result.systemPrompt;
    },

    async withWorkflow<T extends string>(
      prompt: T,
      workflowId: string
    ): Promise<string> {
      const result = await memoryService.injectIntoPrompt(
        prompt,
        { workflowId },
        {
          includeOrganizationBrand: false,
          includeWorkflowContext: true,
          includeAgentHistory: false,
        }
      );
      return result.systemPrompt;
    },

    async withAgent<T extends string>(
      prompt: T,
      agentId: string
    ): Promise<string> {
      const result = await memoryService.injectIntoPrompt(
        prompt,
        { agentId },
        {
          includeOrganizationBrand: false,
          includeWorkflowContext: false,
          includeAgentHistory: true,
        }
      );
      return result.systemPrompt;
    },
  };
}
