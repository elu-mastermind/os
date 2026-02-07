import type { AgentConfig, AgentExecutionContext, AgentExecutionResult } from '@/types';

class AgentRegistry {
  private configs: Map<string, AgentConfig> = new Map();
  private memory: Map<string, Array<{ role: string; content: string }>> = new Map();

  constructor() {
    this.loadConfigs();
  }

  loadConfigs(): void {
    const agentConfigs = this.importAgentConfigs();
    for (const config of agentConfigs) {
      this.configs.set(config.id, config);
    }
  }

  private importAgentConfigs(): AgentConfig[] {
    try {
      const configsModule = require('@/data/agentConfigs');
      return configsModule.agentConfigs || [];
    } catch (error) {
      console.warn('No agent configs found, using empty registry');
      return [];
    }
  }

  getAgentConfig(agentId: string): AgentConfig | undefined {
    return this.configs.get(agentId);
  }

  getAllAgentConfigs(): AgentConfig[] {
    return Array.from(this.configs.values());
  }

  registerAgent(config: AgentConfig): void {
    this.configs.set(config.id, config);
  }

  unregisterAgent(agentId: string): boolean {
    return this.configs.delete(agentId);
  }

  getMemory(agentId: string, scope: string): Array<{ role: string; content: string }> {
    const key = this.getMemoryKey(agentId, scope);
    return this.memory.get(key) || [];
  }

  setMemory(agentId: string, scope: string, messages: Array<{ role: string; content: string }>): void {
    const key = this.getMemoryKey(agentId, scope);
    this.memory.set(key, messages);
  }

  appendMemory(agentId: string, scope: string, message: { role: string; content: string }): void {
    const key = this.getMemoryKey(agentId, scope);
    const messages = this.memory.get(key) || [];
    messages.push(message);
    this.memory.set(key, messages);
  }

  clearMemory(agentId: string, scope?: string): void {
    if (scope) {
      this.memory.delete(this.getMemoryKey(agentId, scope));
    } else {
      for (const key of this.memory.keys()) {
        if (key.startsWith(`${agentId}:`)) {
          this.memory.delete(key);
        }
      }
    }
  }

  private getMemoryKey(agentId: string, scope: string): string {
    return `${agentId}:${scope}`;
  }

  async run(agentId: string, input: string, context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const config = this.getAgentConfig(agentId);
    
    if (!config) {
      return {
        output: '',
        agentId,
        context,
        error: `Agent with ID "${agentId}" not found`,
      };
    }

    try {
      const memoryKey = context.sessionId || 'default';
      const conversationHistory = this.getMemory(agentId, memoryKey);

      const messages = [
        { role: 'system', content: config.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: input },
      ];

      const output = await this.executeAgent(config, messages, context);

      if (config.memoryScope === 'conversation' || config.memoryScope === 'persistent') {
        this.appendMemory(agentId, memoryKey, { role: 'user', content: input });
        this.appendMemory(agentId, memoryKey, { role: 'assistant', content: output });
      }

      const usage = this.generateMockUsage(input.length, output.length);

      return {
        output,
        agentId,
        context,
        usage,
      };
    } catch (error) {
      return {
        output: '',
        agentId,
        context,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async executeAgent(
    config: AgentConfig,
    messages: Array<{ role: string; content: string }>,
    context: AgentExecutionContext
  ): Promise<string> {
    const input = messages[messages.length - 1].content;
    const systemPrompt = messages[0].content;

    let response = '';
    
    if (config.role.toLowerCase().includes('developer') || config.role.toLowerCase().includes('coder')) {
      response = this.mockDeveloperResponse(systemPrompt, input, config);
    } else if (config.role.toLowerCase().includes('writer') || config.role.toLowerCase().includes('content')) {
      response = this.mockWriterResponse(systemPrompt, input, config);
    } else if (config.role.toLowerCase().includes('analyst') || config.role.toLowerCase().includes('researcher')) {
      response = this.mockAnalystResponse(systemPrompt, input, config);
    } else {
      response = this.mockGeneralResponse(systemPrompt, input, config);
    }

    return response;
  }

  private mockDeveloperResponse(systemPrompt: string, input: string, config: AgentConfig): string {
    return `[${config.role}] Based on the input "${input.substring(0, 50)}...", I would analyze the code requirements and provide a solution.\n\nAvailable tools: ${config.allowedTools.join(', ')}\n\nUsing model: ${config.modelPreference}\n\nThis is a mock response. In production, this would call the actual LLM API.`;
  }

  private mockWriterResponse(systemPrompt: string, input: string, config: AgentConfig): string {
    return `[${config.role}] I've crafted content based on "${input.substring(0, 50)}..."\n\nStyle guidelines from system prompt applied.\n\nUsing model: ${config.modelPreference} with temperature ${config.temperature || 0.7}\n\nThis is a mock response. In production, this would call the actual LLM API.`;
  }

  private mockAnalystResponse(systemPrompt: string, input: string, config: AgentConfig): string {
    return `[${config.role}] Analysis completed for: "${input.substring(0, 50)}..."\n\nKey findings:\n- Data point 1\n- Data point 2\n- Recommendation\n\nUsing model: ${config.modelPreference}\n\nMemory scope: ${config.memoryScope}\n\nThis is a mock response. In production, this would call the actual LLM API.`;
  }

  private mockGeneralResponse(systemPrompt: string, input: string, config: AgentConfig): string {
    return `[${config.role}] Processing your request: "${input.substring(0, 50)}..."\n\nAs a ${config.role}, I'm equipped with tools: ${config.allowedTools.join(', ')}\n\nConfiguration:\n- Model: ${config.modelPreference}\n- Temperature: ${config.temperature || 0.5}\n- Memory: ${config.memoryScope}\n\nThis is a mock response. In production, this would call the actual LLM API.`;
  }

  private generateMockUsage(inputLength: number, outputLength: number) {
    const promptTokens = Math.ceil(inputLength / 4);
    const completionTokens = Math.ceil(outputLength / 4);
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }

  reloadConfigs(): void {
    this.configs.clear();
    this.memory.clear();
    this.loadConfigs();
  }
}

export const agentRegistry = new AgentRegistry();
export { AgentRegistry };
