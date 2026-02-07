/**
 * Memory System Types
 * Defines the interface for the scoped memory system
 */

export type MemoryScope = 'agent' | 'workflow' | 'organization' | 'global';
export type MemoryType = 'short_term' | 'long_term' | 'episodic' | 'semantic';

export interface MemoryEntry {
  id?: string;
  type: MemoryType;
  scope: MemoryScope;
  key: string;
  value: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MemoryContext {
  agentId?: string;
  workflowId?: string;
  organizationId?: string;
  userId?: string;
}

export interface MemoryQueryOptions {
  type?: MemoryType;
  scope?: MemoryScope;
  keys?: string[];
  includeExpired?: boolean;
  limit?: number;
}

export interface MemoryInjectionResult {
  systemPrompt: string;
  memoryContext: string;
  totalMemoriesInjected: number;
  memoriesByScope: Record<string, number>;
}

export interface PromptEnhancementOptions {
  maxTokens?: number;
  includeOrganizationBrand?: boolean;
  includeWorkflowContext?: boolean;
  includeAgentHistory?: boolean;
  memoryTypes?: MemoryType[];
}

export interface MemoryService {
  // Read operations
  read(context: MemoryContext, key: string): Promise<MemoryEntry | null>;
  readMany(context: MemoryContext, options?: MemoryQueryOptions): Promise<MemoryEntry[]>;
  readScoped(scope: MemoryScope, scopeId: string, key: string): Promise<MemoryEntry | null>;

  // Write operations
  write(context: MemoryContext, entry: MemoryEntry): Promise<MemoryEntry>;
  writeMany(context: MemoryContext, entries: MemoryEntry[]): Promise<MemoryEntry[]>;
  writeScoped(scope: MemoryScope, scopeId: string, entry: MemoryEntry): Promise<MemoryEntry>;

  // Delete operations
  delete(context: MemoryContext, key: string): Promise<boolean>;
  deleteScoped(scope: MemoryScope, scopeId: string, key: string): Promise<boolean>;
  clearScope(scope: MemoryScope, scopeId: string): Promise<number>;
  clearExpired(context: MemoryContext): Promise<number>;

  // Prompt injection
  injectIntoPrompt(
    systemPrompt: string,
    context: MemoryContext,
    options?: PromptEnhancementOptions
  ): Promise<MemoryInjectionResult>;

  // Utility operations
  search(context: MemoryContext, query: string, options?: MemoryQueryOptions): Promise<MemoryEntry[]>;
  setTTL(context: MemoryContext, key: string, ttlSeconds: number): Promise<boolean>;
}
