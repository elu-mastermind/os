# AgentOS

An AI-powered agent orchestration platform built with Next.js. This project implements a comprehensive agent system with dynamic configuration, execution, and memory management capabilities.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Agent System

AgentOS features a comprehensive Agent System with the following components:

### Agent Definition Engine
- Define agent configurations with role, system prompts, and capabilities
- Support for multiple LLM models (GPT-4, Claude 3, etc.)
- Configurable memory scopes (session, conversation, persistent)
- Tool access control and capabilities management

### Agent Registry
- Dynamic agent registration and configuration loading
- Centralized agent execution interface
- Memory management with different persistence strategies
- Support for runtime agent creation and modification

### Key Features
- **10 Pre-configured Agents**: Developer, Writer, Analyst, Researcher, Designer, Project Manager, Support, Security, Marketing, QA
- **Flexible Memory**: Session-based, conversation-level, or persistent memory
- **Model Selection**: Support for multiple LLM providers and models
- **Tool Integration**: Comprehensive tool library for various agent capabilities
- **Type Safety**: Full TypeScript support with extensive type definitions

### Documentation
- [Agent System Implementation Guide](./AGENT_SYSTEM_IMPLEMENTATION.md) - Complete implementation details
- [Agent Registry Usage Guide](./src/lib/AGENT_REGISTRY_USAGE.md) - API reference and examples
- [Demo Script](./src/examples/agentRegistryDemo.ts) - Interactive demonstration

### Quick Start

```typescript
import { agentRegistry } from '@/lib';

// Run an agent
const result = await agentRegistry.run(
  'agent-dev-001',
  'Write a function to sort an array',
  {
    sessionId: 'session-123',
    userId: 'user-456',
    timestamp: new Date(),
  }
);

console.log(result.output);
```
