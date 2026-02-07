import type { AgentConfig, ModelPreference, MemoryScope } from '@/types';
import { agentRegistry } from './agentRegistry';

export interface CreateAgentConfigParams {
  id: string;
  role: string;
  systemPrompt: string;
  allowedTools?: string[];
  modelPreference?: ModelPreference;
  memoryScope?: MemoryScope;
  temperature?: number;
  maxTokens?: number;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

export function createAgentConfig(params: CreateAgentConfigParams): AgentConfig {
  return {
    id: params.id,
    role: params.role,
    systemPrompt: params.systemPrompt,
    allowedTools: params.allowedTools || [],
    modelPreference: params.modelPreference || 'gpt-4-turbo',
    memoryScope: params.memoryScope || 'session',
    temperature: params.temperature,
    maxTokens: params.maxTokens,
    capabilities: params.capabilities,
    metadata: params.metadata,
  };
}

export function registerAgent(config: AgentConfig): void {
  agentRegistry.registerAgent(config);
}

export function createAndRegisterAgent(params: CreateAgentConfigParams): void {
  const config = createAgentConfig(params);
  registerAgent(config);
}

export function getAvailableTools(): string[] {
  return [
    'code-editor',
    'terminal',
    'git',
    'linter',
    'debugger',
    'text-editor',
    'grammar-check',
    'seo-analyzer',
    'plagiarism-checker',
    'spreadsheet',
    'chart-generator',
    'sql-query',
    'python',
    'statistical-tools',
    'web-search',
    'document-reader',
    'citation-manager',
    'note-taking',
    'figma',
    'prototype-builder',
    'color-picker',
    'font-selector',
    'task-manager',
    'calendar',
    'gantt-chart',
    'resource-planner',
    'knowledge-base',
    'ticket-system',
    'customer-database',
    'email-client',
    'vulnerability-scanner',
    'log-analyzer',
    'penetration-testing',
    'security-audit',
    'social-media',
    'email-marketing',
    'analytics',
    'content-calendar',
    'test-runner',
    'coverage-tool',
    'bug-tracker',
    'automation-framework',
  ];
}

export function getAvailableModels(): ModelPreference[] {
  return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
}

export function validateAgentConfig(config: Partial<AgentConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.id || config.id.trim().length === 0) {
    errors.push('Agent ID is required');
  }

  if (!config.role || config.role.trim().length === 0) {
    errors.push('Agent role is required');
  }

  if (!config.systemPrompt || config.systemPrompt.trim().length === 0) {
    errors.push('System prompt is required');
  }

  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2');
  }

  if (config.maxTokens !== undefined && config.maxTokens < 1) {
    errors.push('Max tokens must be greater than 0');
  }

  if (config.allowedTools && !Array.isArray(config.allowedTools)) {
    errors.push('Allowed tools must be an array');
  }

  if (config.capabilities && !Array.isArray(config.capabilities)) {
    errors.push('Capabilities must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function cloneAgentConfig(source: AgentConfig, newId: string, overrides?: Partial<AgentConfig>): AgentConfig {
  return {
    ...source,
    id: newId,
    ...overrides,
    metadata: {
      ...source.metadata,
      ...overrides?.metadata,
      clonedFrom: source.id,
    },
  };
}
