import { PrismaClient, PlanType, UserRole, AgentLevel, AgentStatus, MemoryType, MemoryScope, WorkflowStatus, StepType, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      plan: PlanType.pro,
      settings: {
        maxAgents: 20,
        maxWorkflows: 50,
        allowCustomAgents: true,
        apiAccess: true,
      },
    },
  });
  console.log(`Created organization: ${org.name}`);

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      name: 'Admin User',
      password: '$2a$10$YourHashedPasswordHere', // Should be properly hashed in production
      role: UserRole.admin,
      organizationId: org.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@acme.com',
      name: 'Manager User',
      password: '$2a$10$YourHashedPasswordHere',
      role: UserRole.manager,
      organizationId: org.id,
    },
  });
  console.log('Created users');

  // Create agents
  const executiveAgent = await prisma.agent.create({
    data: {
      name: 'Executive Assistant',
      role: 'Executive Coordinator',
      description: 'High-level coordination and decision support',
      level: AgentLevel.executive,
      status: AgentStatus.idle,
      skills: ['strategy', 'planning', 'coordination'],
      tools: ['calendar', 'email', 'slack'],
      kpis: { tasksCompleted: 150, successRate: 0.95, avgResponseTime: 120 },
      organizationId: org.id,
    },
  });

  const specialistAgent = await prisma.agent.create({
    data: {
      name: 'Code Reviewer',
      role: 'Senior Developer',
      description: 'Code quality and review specialist',
      level: AgentLevel.specialist,
      status: AgentStatus.idle,
      skills: ['typescript', 'react', 'node.js', 'testing'],
      tools: ['github', 'vscode', 'jest'],
      kpis: { tasksCompleted: 320, successRate: 0.98, avgResponseTime: 300 },
      organizationId: org.id,
    },
  });
  console.log('Created agents');

  // Create agent memories
  await prisma.agentMemory.createMany({
    data: [
      {
        agentId: executiveAgent.id,
        type: MemoryType.long_term,
        scope: MemoryScope.agent,
        key: 'preferred_meeting_times',
        value: 'Morning meetings preferred, avoid Friday afternoons',
      },
      {
        agentId: specialistAgent.id,
        type: MemoryType.short_term,
        scope: MemoryScope.agent,
        key: 'current_project',
        value: 'Working on authentication module refactor',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      {
        agentId: specialistAgent.id,
        type: MemoryType.episodic,
        scope: MemoryScope.agent,
        key: 'recent_error_api_timeout',
        value: 'API timeout on user endpoint. Resolution: Increased timeout to 30s and added retry logic.',
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      },
      {
        agentId: specialistAgent.id,
        type: MemoryType.semantic,
        scope: MemoryScope.agent,
        key: 'code_style_preferences',
        value: 'Use functional programming patterns, prefer immutability, use TypeScript strict mode',
      },
    ],
  });
  console.log('Created agent memories');

  // Create workflow memory
  await prisma.agentMemory.createMany({
    data: [
      {
        agentId: specialistAgent.id,
        type: MemoryType.short_term,
        scope: MemoryScope.workflow,
        key: 'workflow_context',
        value: JSON.stringify({
          currentPhase: 'implementation',
          totalPhases: 4,
          completedPhases: ['design', 'planning'],
          deadline: '2024-03-15'
        }),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        agentId: specialistAgent.id,
        type: MemoryType.episodic,
        scope: MemoryScope.workflow,
        key: 'workflow_error_001',
        value: 'Design review failed: Missing accessibility compliance. Fixed by adding ARIA labels.',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    ],
  });
  console.log('Created workflow memories');

  // Create organization-level memory (brand, policies, standards)
  await prisma.agentMemory.createMany({
    data: [
      {
        agentId: specialistAgent.id,
        type: MemoryType.semantic,
        scope: MemoryScope.organization,
        organizationId: org.id,
        key: 'brand_voice',
        value: 'Professional, innovative, concise. Use clear language and avoid jargon when possible.',
      },
      {
        agentId: specialistAgent.id,
        type: MemoryType.semantic,
        scope: MemoryScope.organization,
        organizationId: org.id,
        key: 'code_standards',
        value: 'Follow TypeScript best practices, use strict mode, write unit tests for all functions, maintain 80%+ code coverage.',
      },
      {
        agentId: specialistAgent.id,
        type: MemoryType.semantic,
        scope: MemoryScope.organization,
        organizationId: org.id,
        key: 'communication_style',
        value: 'Be direct and actionable in responses. Provide concrete examples when explaining concepts.',
      },
    ],
  });
  console.log('Created organization memories');

  // Create global memory (best practices, templates)
  await prisma.agentMemory.createMany({
    data: [
      {
        agentId: specialistAgent.id,
        type: MemoryType.semantic,
        scope: MemoryScope.global,
        key: 'best_practices_error_handling',
        value: 'Always validate inputs, handle errors gracefully, provide meaningful error messages, log errors for debugging.',
      },
      {
        agentId: specialistAgent.id,
        type: MemoryType.semantic,
        scope: MemoryScope.global,
        key: 'best_practices_security',
        value: 'Never expose sensitive information in logs, use environment variables for secrets, implement rate limiting, validate all inputs.',
      },
      {
        agentId: specialistAgent.id,
        type: MemoryType.semantic,
        scope: MemoryScope.global,
        key: 'best_practices_code_quality',
        value: 'Write self-documenting code, follow DRY principle, keep functions small and focused, use descriptive variable names.',
      },
    ],
  });
  console.log('Created global memories');

  // Create workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: 'Feature Development Pipeline',
      description: 'Complete workflow from design to deployment',
      status: WorkflowStatus.draft,
      organizationId: org.id,
      edges: [
        { source: 'step-1', target: 'step-2' },
        { source: 'step-2', target: 'step-3' },
        { source: 'step-3', target: 'step-4', condition: 'approved' },
      ],
      steps: {
        create: [
          {
            name: 'Design Review',
            type: StepType.task,
            orderIndex: 0,
            config: { inputs: ['design_spec'], outputs: ['review_report'], timeout: 3600 },
          },
          {
            name: 'Code Implementation',
            type: StepType.task,
            orderIndex: 1,
            config: { inputs: ['review_report'], outputs: ['code_changes'], timeout: 14400 },
          },
          {
            name: 'Code Review',
            type: StepType.approval,
            orderIndex: 2,
            agentId: specialistAgent.id,
            config: { inputs: ['code_changes'], timeout: 7200 },
          },
          {
            name: 'Deployment',
            type: StepType.task,
            orderIndex: 3,
            config: { inputs: ['approved_code'], outputs: ['deployment_result'], timeout: 1800 },
          },
        ],
      },
    },
  });
  console.log('Created workflow');

  // Create tool credential
  await prisma.toolCredential.create({
    data: {
      name: 'OpenAI API',
      toolType: 'openai',
      credentials: { apiKey: 'sk-encrypted-key-here' },
      environment: 'production',
      allowedAgents: [executiveAgent.id, specialistAgent.id],
      organizationId: org.id,
    },
  });
  console.log('Created tool credential');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
