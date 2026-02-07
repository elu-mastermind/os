import { describe, it, expect, beforeEach } from '@jest/globals';
import { AgentRegistry } from '../agentRegistry';
import { createAgentConfig, validateAgentConfig } from '../agentFactory';
import type { AgentConfig, AgentExecutionContext } from '@/types';

describe('AgentRegistry', () => {
  let registry: AgentRegistry;
  let mockConfigs: AgentConfig[];

  beforeEach(() => {
    registry = new AgentRegistry();
    mockConfigs = [
      {
        id: 'agent-test-1',
        role: 'Test Agent 1',
        systemPrompt: 'You are a test agent',
        allowedTools: ['tool1', 'tool2'],
        modelPreference: 'gpt-4',
        memoryScope: 'session',
        temperature: 0.5,
        maxTokens: 1000,
      },
      {
        id: 'agent-test-2',
        role: 'Test Agent 2',
        systemPrompt: 'You are another test agent',
        allowedTools: ['tool3'],
        modelPreference: 'claude-3-opus',
        memoryScope: 'conversation',
        temperature: 0.7,
      },
    ];

    mockConfigs.forEach(config => registry.registerAgent(config));
  });

  describe('Agent Registration', () => {
    it('should register an agent', () => {
      const newAgent: AgentConfig = {
        id: 'agent-test-3',
        role: 'Test Agent 3',
        systemPrompt: 'You are a third test agent',
        allowedTools: ['tool1'],
        modelPreference: 'gpt-4-turbo',
        memoryScope: 'persistent',
      };

      registry.registerAgent(newAgent);
      const retrieved = registry.getAgentConfig('agent-test-3');

      expect(retrieved).toEqual(newAgent);
    });

    it('should get all agent configs', () => {
      const allAgents = registry.getAllAgentConfigs();
      expect(allAgents).toHaveLength(2);
      expect(allAgents.every(agent => agent.id.startsWith('agent-test'))).toBe(true);
    });

    it('should get a specific agent config', () => {
      const agent = registry.getAgentConfig('agent-test-1');
      expect(agent).toBeDefined();
      expect(agent?.role).toBe('Test Agent 1');
    });

    it('should return undefined for non-existent agent', () => {
      const agent = registry.getAgentConfig('non-existent');
      expect(agent).toBeUndefined();
    });

    it('should unregister an agent', () => {
      const result = registry.unregisterAgent('agent-test-1');
      expect(result).toBe(true);
      
      const agent = registry.getAgentConfig('agent-test-1');
      expect(agent).toBeUndefined();
    });

    it('should return false when unregistering non-existent agent', () => {
      const result = registry.unregisterAgent('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Memory Management', () => {
    it('should get empty memory for new session', () => {
      const memory = registry.getMemory('agent-test-1', 'session-1');
      expect(memory).toEqual([]);
    });

    it('should set memory', () => {
      const messages = [{ role: 'user', content: 'Hello' }];
      registry.setMemory('agent-test-1', 'session-1', messages);
      
      const memory = registry.getMemory('agent-test-1', 'session-1');
      expect(memory).toEqual(messages);
    });

    it('should append memory', () => {
      registry.appendMemory('agent-test-1', 'session-1', { role: 'user', content: 'Hello' });
      registry.appendMemory('agent-test-1', 'session-1', { role: 'assistant', content: 'Hi there' });
      
      const memory = registry.getMemory('agent-test-1', 'session-1');
      expect(memory).toHaveLength(2);
      expect(memory[1].content).toBe('Hi there');
    });

    it('should clear memory for specific scope', () => {
      registry.appendMemory('agent-test-1', 'session-1', { role: 'user', content: 'Hello' });
      registry.appendMemory('agent-test-1', 'session-2', { role: 'user', content: 'World' });
      
      registry.clearMemory('agent-test-1', 'session-1');
      
      const memory1 = registry.getMemory('agent-test-1', 'session-1');
      const memory2 = registry.getMemory('agent-test-1', 'session-2');
      
      expect(memory1).toEqual([]);
      expect(memory2).toHaveLength(1);
    });

    it('should clear all memory for an agent', () => {
      registry.appendMemory('agent-test-1', 'session-1', { role: 'user', content: 'Hello' });
      registry.appendMemory('agent-test-1', 'session-2', { role: 'user', content: 'World' });
      
      registry.clearMemory('agent-test-1');
      
      const memory1 = registry.getMemory('agent-test-1', 'session-1');
      const memory2 = registry.getMemory('agent-test-1', 'session-2');
      
      expect(memory1).toEqual([]);
      expect(memory2).toEqual([]);
    });
  });

  describe('Agent Execution', () => {
    it('should run an agent successfully', async () => {
      const context: AgentExecutionContext = {
        sessionId: 'session-1',
        userId: 'user-1',
        timestamp: new Date(),
      };

      const result = await registry.run('agent-test-1', 'Hello', context);

      expect(result.output).toBeDefined();
      expect(result.output).toBeTruthy();
      expect(result.agentId).toBe('agent-test-1');
      expect(result.context).toEqual(context);
      expect(result.error).toBeUndefined();
      expect(result.usage).toBeDefined();
    });

    it('should return error for non-existent agent', async () => {
      const context: AgentExecutionContext = {
        timestamp: new Date(),
      };

      const result = await registry.run('non-existent', 'Hello', context);

      expect(result.output).toBe('');
      expect(result.error).toContain('not found');
    });

    it('should store conversation history for conversation scope', async () => {
      const context: AgentExecutionContext = {
        sessionId: 'session-1',
        timestamp: new Date(),
      };

      await registry.run('agent-test-2', 'First message', context);
      await registry.run('agent-test-2', 'Second message', context);

      const memory = registry.getMemory('agent-test-2', 'session-1');
      expect(memory.length).toBeGreaterThan(2);
    });

    it('should not store history for session scope', async () => {
      const context: AgentExecutionContext = {
        sessionId: 'session-1',
        timestamp: new Date(),
      };

      await registry.run('agent-test-1', 'First message', context);

      const memory = registry.getMemory('agent-test-1', 'session-1');
      expect(memory).toEqual([]);
    });

    it('should return token usage', async () => {
      const context: AgentExecutionContext = {
        timestamp: new Date(),
      };

      const result = await registry.run('agent-test-1', 'Hello', context);

      expect(result.usage).toBeDefined();
      expect(result.usage?.promptTokens).toBeGreaterThan(0);
      expect(result.usage?.completionTokens).toBeGreaterThanOrEqual(0);
      expect(result.usage?.totalTokens).toBeGreaterThan(0);
    });
  });

  describe('Config Reloading', () => {
    it('should reload configs', () => {
      registry.registerAgent({
        id: 'agent-test-3',
        role: 'Test Agent 3',
        systemPrompt: 'You are a test agent',
        allowedTools: [],
        modelPreference: 'gpt-4',
        memoryScope: 'session',
      });

      expect(registry.getAgentConfig('agent-test-3')).toBeDefined();

      registry.reloadConfigs();

      expect(registry.getAgentConfig('agent-test-3')).toBeUndefined();
      expect(registry.getAgentConfig('agent-test-1')).toBeUndefined();
      expect(registry.getAgentConfig('agent-test-2')).toBeUndefined();
    });
  });
});

describe('Agent Factory', () => {
  describe('createAgentConfig', () => {
    it('should create agent config with minimal params', () => {
      const config = createAgentConfig({
        id: 'agent-1',
        role: 'Role',
        systemPrompt: 'Prompt',
      });

      expect(config.id).toBe('agent-1');
      expect(config.role).toBe('Role');
      expect(config.systemPrompt).toBe('Prompt');
      expect(config.allowedTools).toEqual([]);
      expect(config.modelPreference).toBe('gpt-4-turbo');
      expect(config.memoryScope).toBe('session');
    });

    it('should create agent config with all params', () => {
      const config = createAgentConfig({
        id: 'agent-1',
        role: 'Role',
        systemPrompt: 'Prompt',
        allowedTools: ['tool1'],
        modelPreference: 'gpt-4',
        memoryScope: 'persistent',
        temperature: 0.8,
        maxTokens: 2000,
        capabilities: ['cap1'],
        metadata: { key: 'value' },
      });

      expect(config.allowedTools).toEqual(['tool1']);
      expect(config.modelPreference).toBe('gpt-4');
      expect(config.memoryScope).toBe('persistent');
      expect(config.temperature).toBe(0.8);
      expect(config.maxTokens).toBe(2000);
      expect(config.capabilities).toEqual(['cap1']);
      expect(config.metadata).toEqual({ key: 'value' });
    });
  });

  describe('validateAgentConfig', () => {
    it('should validate correct config', () => {
      const result = validateAgentConfig({
        id: 'agent-1',
        role: 'Role',
        systemPrompt: 'Prompt',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject config without id', () => {
      const result = validateAgentConfig({
        role: 'Role',
        systemPrompt: 'Prompt',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Agent ID is required');
    });

    it('should reject config with invalid temperature', () => {
      const result = validateAgentConfig({
        id: 'agent-1',
        role: 'Role',
        systemPrompt: 'Prompt',
        temperature: 3,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Temperature must be between 0 and 2');
    });

    it('should reject config with invalid maxTokens', () => {
      const result = validateAgentConfig({
        id: 'agent-1',
        role: 'Role',
        systemPrompt: 'Prompt',
        maxTokens: 0,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Max tokens must be greater than 0');
    });

    it('should return multiple errors', () => {
      const result = validateAgentConfig({
        temperature: 3,
        maxTokens: 0,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
