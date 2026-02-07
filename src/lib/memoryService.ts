/**
 * Memory Service
 * Provides scoped memory management with database persistence
 */

import { prisma } from './prisma';
import type {
  MemoryEntry,
  MemoryContext,
  MemoryQueryOptions,
  MemoryInjectionResult,
  PromptEnhancementOptions,
  MemoryService as IMemoryService,
} from '@/types/memory';
import type { MemoryScope, MemoryType } from '@/types/memory';

export class MemoryService implements IMemoryService {
  private readonly DEFAULT_MAX_TOKENS = 500;
  private readonly DEFAULT_TTL_SECONDS = 86400; // 24 hours

  // ==================== READ OPERATIONS ====================

  async read(context: MemoryContext, key: string): Promise<MemoryEntry | null> {
    const entry = await prisma.agentMemory.findFirst({
      where: {
        key,
        OR: this.buildScopeFilters(context),
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return entry ? this.mapToMemoryEntry(entry) : null;
  }

  async readMany(context: MemoryContext, options?: MemoryQueryOptions): Promise<MemoryEntry[]> {
    const where: any = {
      OR: this.buildScopeFilters(context),
    };

    if (options?.type) {
      where.type = options.type;
    }

    if (options?.scope) {
      where.scope = options.scope;
    }

    if (options?.keys && options.keys.length > 0) {
      where.key = { in: options.keys };
    }

    if (!options?.includeExpired) {
      where.expiresAt = {
        gt: new Date(),
      };
    }

    const entries = await prisma.agentMemory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
    });

    return entries.map(this.mapToMemoryEntry);
  }

  async readScoped(scope: MemoryScope, scopeId: string, key: string): Promise<MemoryEntry | null> {
    const entry = await prisma.agentMemory.findFirst({
      where: {
        key,
        scope,
        ...(scope === 'agent' && { agentId: scopeId }),
        ...(scope === 'workflow' && { workflowId: scopeId }),
        ...(scope === 'organization' && { organizationId: scopeId }),
        expiresAt: { gt: new Date() },
      },
    });

    return entry ? this.mapToMemoryEntry(entry) : null;
  }

  // ==================== WRITE OPERATIONS ====================

  async write(context: MemoryContext, entry: MemoryEntry): Promise<MemoryEntry> {
    const expiresAt = entry.expiresAt || this.calculateExpiry(entry.type);

    const existing = await prisma.agentMemory.findFirst({
      where: {
        key: entry.key,
        OR: this.buildScopeFilters(context),
      },
    });

    if (existing) {
      const updated = await prisma.agentMemory.update({
        where: { id: existing.id },
        data: {
          type: entry.type,
          scope: entry.scope,
          value: entry.value,
          metadata: entry.metadata as any,
          expiresAt,
        },
      });
      return this.mapToMemoryEntry(updated);
    }

    const created = await prisma.agentMemory.create({
      data: {
        type: entry.type,
        scope: entry.scope,
        key: entry.key,
        value: entry.value,
        metadata: entry.metadata as any,
        expiresAt,
        ...(entry.scope === 'agent' && context.agentId && { agentId: context.agentId }),
        ...(entry.scope === 'workflow' && context.workflowId && { workflowId: context.workflowId }),
        ...(entry.scope === 'organization' && context.organizationId && { organizationId: context.organizationId }),
      },
    });

    return this.mapToMemoryEntry(created);
  }

  async writeMany(context: MemoryContext, entries: MemoryEntry[]): Promise<MemoryEntry[]> {
    const results: MemoryEntry[] = [];

    for (const entry of entries) {
      const result = await this.write(context, entry);
      results.push(result);
    }

    return results;
  }

  async writeScoped(scope: MemoryScope, scopeId: string, entry: MemoryEntry): Promise<MemoryEntry> {
    const context: MemoryContext = {
      ...(scope === 'agent' && { agentId: scopeId }),
      ...(scope === 'workflow' && { workflowId: scopeId }),
      ...(scope === 'organization' && { organizationId: scopeId }),
    };

    return this.write(context, { ...entry, scope });
  }

  // ==================== DELETE OPERATIONS ====================

  async delete(context: MemoryContext, key: string): Promise<boolean> {
    const result = await prisma.agentMemory.deleteMany({
      where: {
        key,
        OR: this.buildScopeFilters(context),
      },
    });

    return result.count > 0;
  }

  async deleteScoped(scope: MemoryScope, scopeId: string, key: string): Promise<boolean> {
    const result = await prisma.agentMemory.deleteMany({
      where: {
        key,
        scope,
        ...(scope === 'agent' && { agentId: scopeId }),
        ...(scope === 'workflow' && { workflowId: scopeId }),
        ...(scope === 'organization' && { organizationId: scopeId }),
      },
    });

    return result.count > 0;
  }

  async clearScope(scope: MemoryScope, scopeId: string): Promise<number> {
    const result = await prisma.agentMemory.deleteMany({
      where: {
        scope,
        ...(scope === 'agent' && { agentId: scopeId }),
        ...(scope === 'workflow' && { workflowId: scopeId }),
        ...(scope === 'organization' && { organizationId: scopeId }),
      },
    });

    return result.count;
  }

  async clearExpired(context: MemoryContext): Promise<number> {
    const result = await prisma.agentMemory.deleteMany({
      where: {
        expiresAt: { lte: new Date() },
        OR: this.buildScopeFilters(context),
      },
    });

    return result.count;
  }

  // ==================== PROMPT INJECTION ====================

  async injectIntoPrompt(
    systemPrompt: string,
    context: MemoryContext,
    options?: PromptEnhancementOptions
  ): Promise<MemoryInjectionResult> {
    const maxTokens = options?.maxTokens || this.DEFAULT_MAX_TOKENS;
    const memoryTypes = options?.memoryTypes || ['semantic', 'episodic', 'long_term'];

    const memoriesByScope: Record<string, number> = {
      agent: 0,
      workflow: 0,
      organization: 0,
      global: 0,
    };

    const memoryContextParts: string[] = [];

    // Organization-level memory (brand, policies, etc.)
    if (options?.includeOrganizationBrand !== false && context.organizationId) {
      const orgMemories = await this.readMany(
        { organizationId: context.organizationId },
        { scope: 'organization', type: 'semantic', limit: 10 }
      );

      if (orgMemories.length > 0) {
        const orgContext = this.formatMemoriesForPrompt('Organization Context', orgMemories);
        memoryContextParts.push(orgContext);
        memoriesByScope.organization = orgMemories.length;
      }
    }

    // Workflow-level memory
    if (options?.includeWorkflowContext !== false && context.workflowId) {
      // Read workflow memories - note: we can't filter by multiple types at once, so we read all and filter
      const allWorkflowMemories = await this.readMany(
        { workflowId: context.workflowId },
        { scope: 'workflow', limit: 15 }
      );

      const workflowMemories = allWorkflowMemories.filter(m => memoryTypes.includes(m.type));

      if (workflowMemories.length > 0) {
        const workflowContext = this.formatMemoriesForPrompt('Workflow Context', workflowMemories);
        memoryContextParts.push(workflowContext);
        memoriesByScope.workflow = workflowMemories.length;
      }
    }

    // Agent-level memory (history, preferences)
    if (options?.includeAgentHistory !== false && context.agentId) {
      // Read agent memories - filter by types after fetching
      const allAgentMemories = await this.readMany(
        { agentId: context.agentId },
        { limit: 20 }
      );

      const agentMemories = allAgentMemories.filter(m => memoryTypes.includes(m.type));

      if (agentMemories.length > 0) {
        const agentContext = this.formatMemoriesForPrompt('Agent Memory', agentMemories);
        memoryContextParts.push(agentContext);
        memoriesByScope.agent = agentMemories.length;
      }
    }

    // Global memory (shared knowledge, templates)
    const globalMemories = await this.readMany(
      {},
      { scope: 'global', type: 'semantic', limit: 5 }
    );

    if (globalMemories.length > 0) {
      const globalContext = this.formatMemoriesForPrompt('Global Knowledge', globalMemories);
      memoryContextParts.push(globalContext);
      memoriesByScope.global = globalMemories.length;
    }

    const totalMemoriesInjected = Object.values(memoriesByScope).reduce((a, b) => a + b, 0);

    let finalSystemPrompt = systemPrompt;

    if (memoryContextParts.length > 0) {
      const memoryContext = memoryContextParts.join('\n\n');
      finalSystemPrompt = `${systemPrompt}\n\n--- Context from Memory ---\n${memoryContext}\n--- End Memory Context ---`;
    }

    return {
      systemPrompt: finalSystemPrompt,
      memoryContext: memoryContextParts.join('\n\n'),
      totalMemoriesInjected,
      memoriesByScope,
    };
  }

  // ==================== UTILITY OPERATIONS ====================

  async search(
    context: MemoryContext,
    query: string,
    options?: MemoryQueryOptions
  ): Promise<MemoryEntry[]> {
    const where: any = {
      OR: this.buildScopeFilters(context),
      OR: [
        { key: { contains: query, mode: 'insensitive' } },
        { value: { contains: query, mode: 'insensitive' } },
      ],
      expiresAt: { gt: new Date() },
    };

    if (options?.type) {
      where.type = options.type;
    }

    if (options?.scope) {
      where.scope = options.scope;
    }

    const entries = await prisma.agentMemory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
    });

    return entries.map(this.mapToMemoryEntry);
  }

  async setTTL(context: MemoryContext, key: string, ttlSeconds: number): Promise<boolean> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const result = await prisma.agentMemory.updateMany({
      where: {
        key,
        OR: this.buildScopeFilters(context),
      },
      data: { expiresAt },
    });

    return result.count > 0;
  }

  // ==================== PRIVATE HELPERS ====================

  private buildScopeFilters(context: MemoryContext) {
    const filters: any[] = [];

    if (context.agentId) {
      filters.push({
        scope: 'agent' as MemoryScope,
        agentId: context.agentId,
      });
    }

    if (context.workflowId) {
      filters.push({
        scope: 'workflow' as MemoryScope,
        workflowId: context.workflowId,
      });
    }

    if (context.organizationId) {
      filters.push({
        scope: 'organization' as MemoryScope,
        organizationId: context.organizationId,
      });
    }

    // Always include global memory
    filters.push({
      scope: 'global' as MemoryScope,
    });

    return filters;
  }

  private calculateExpiry(type: MemoryType): Date {
    const now = new Date();

    switch (type) {
      case 'short_term':
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      case 'episodic':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case 'semantic':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      case 'long_term':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
      default:
        return new Date(now.getTime() + this.DEFAULT_TTL_SECONDS * 1000);
    }
  }

  private formatMemoriesForPrompt(sectionTitle: string, memories: MemoryEntry[]): string {
    const formattedItems = memories
      .map((mem) => {
        const parts: string[] = [];
        parts.push(`- ${mem.key}`);
        if (mem.value) {
          parts.push(`  ${mem.value}`);
        }
        if (mem.metadata?.type) {
          parts.push(`  (Type: ${mem.metadata.type})`);
        }
        return parts.join('\n');
      })
      .join('\n');

    return `## ${sectionTitle}\n${formattedItems}`;
  }

  private mapToMemoryEntry(entry: any): MemoryEntry {
    return {
      id: entry.id,
      type: entry.type,
      scope: entry.scope,
      key: entry.key,
      value: entry.value,
      metadata: entry.metadata as Record<string, unknown> | undefined,
      expiresAt: entry.expiresAt,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
}

// Singleton instance
export const memoryService = new MemoryService();
