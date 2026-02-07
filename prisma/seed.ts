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
    ],
  });
  console.log('Created agent memories');

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
