/**
 * Agent Registry Demo
 * 
 * This file demonstrates how to use the Agent Registry to manage and execute agents.
 * Run this file with: npx tsx src/examples/agentRegistryDemo.ts
 */

import { agentRegistry } from '@/lib/agentRegistry';

async function demo() {
  console.log('=== Agent Registry Demo ===\n');

  // 1. List all available agents
  console.log('1. Available Agents:');
  const allAgents = agentRegistry.getAllAgentConfigs();
  allAgents.forEach(agent => {
    console.log(`   - ${agent.id}: ${agent.role}`);
    console.log(`     Model: ${agent.modelPreference}`);
    console.log(`     Tools: ${agent.allowedTools.join(', ')}`);
    console.log(`     Memory: ${agent.memoryScope}\n`);
  });

  // 2. Get a specific agent
  console.log('2. Get Specific Agent:');
  const devAgent = agentRegistry.getAgentConfig('agent-dev-001');
  if (devAgent) {
    console.log(`   Role: ${devAgent.role}`);
    console.log(`   System Prompt: ${devAgent.systemPrompt.substring(0, 100)}...\n`);
  }

  // 3. Run an agent
  console.log('3. Run Agent:');
  const context = {
    sessionId: 'demo-session-001',
    userId: 'demo-user',
    timestamp: new Date(),
  };

  const result = await agentRegistry.run(
    'agent-dev-001',
    'Create a simple TypeScript function to reverse a string',
    context
  );

  console.log('   Output:', result.output.substring(0, 200) + '...');
  console.log('   Usage:', result.usage);
  console.log('   Error:', result.error || 'None\n');

  // 4. Run with conversation memory
  console.log('4. Conversation Memory:');
  await agentRegistry.run(
    'agent-analyst-001',
    'I have sales data for Q1',
    context
  );

  const history = agentRegistry.getMemory('agent-analyst-001', 'demo-session-001');
  console.log(`   Conversation has ${history.length} messages\n`);

  // 5. Create and register a custom agent
  console.log('5. Create Custom Agent:');
  const { createAndRegisterAgent } = await import('@/lib/agentFactory');
  
  createAndRegisterAgent({
    id: 'agent-demo-custom',
    role: 'Demo Assistant',
    systemPrompt: 'You are a helpful demo assistant. Keep responses brief and friendly.',
    allowedTools: ['demo-tool'],
    modelPreference: 'gpt-3.5-turbo',
    memoryScope: 'session',
    temperature: 0.8,
  });

  const customAgent = agentRegistry.getAgentConfig('agent-demo-custom');
  console.log(`   Created: ${customAgent?.role}\n`);

  // 6. Run the custom agent
  console.log('6. Run Custom Agent:');
  const customResult = await agentRegistry.run(
    'agent-demo-custom',
    'Say hello to the user',
    { timestamp: new Date() }
  );
  console.log('   Output:', customResult.output.substring(0, 150) + '...\n');

  // 7. Validate an agent config
  console.log('7. Validate Agent Config:');
  const { validateAgentConfig } = await import('@/lib/agentFactory');
  const validation = validateAgentConfig({
    id: 'test-agent',
    role: 'Test',
    systemPrompt: 'Test prompt',
  });
  console.log(`   Valid: ${validation.valid}`);
  if (!validation.valid) {
    console.log(`   Errors: ${validation.errors.join(', ')}\n`);
  }

  console.log('=== Demo Complete ===');
}

// Only run if this file is executed directly
if (require.main === module) {
  demo().catch(console.error);
}

export { demo };
