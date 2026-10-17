import { Technology } from '@/types';

export const technologiesData: Technology[] = [
  // Languages
  { name: "TypeScript", category: "Languages", context: "Primary language for frontend & fullstack services", featured: true, order: 1 },
  { name: "Go", category: "Languages", context: "High-performance microservices, CLI tools & telemetry workers", featured: true, order: 2 },
  { name: "Python", category: "Languages", context: "Data pipelines, ML evaluation & automation scripting", featured: true, order: 3 },
  { name: "SQL", category: "Languages", context: "Complex relational queries, indexing & analytical views", featured: true, order: 4 },
  { name: "Rust", category: "Languages", context: "Systems exploration & WASM modules", featured: false, order: 5 },

  // Frontend
  { name: "React 19 / Next.js", category: "Frontend", context: "App Router, Server Components & accessible interfaces", featured: true, order: 1 },
  { name: "Tailwind CSS v4", category: "Frontend", context: "Design token orchestration & utility-driven layouts", featured: true, order: 2 },
  { name: "Web APIs & DOM", category: "Frontend", context: "Keyboard navigation, focus rings, canvas & audio/video", featured: true, order: 3 },
  { name: "Radix Primitives", category: "Frontend", context: "Accessible headless foundations for custom design systems", featured: false, order: 4 },

  // Backend
  { name: "Node.js / Bun", category: "Backend", context: "Fast API servers, event handlers & worker runtimes", featured: true, order: 1 },
  { name: "Temporal", category: "Backend", context: "Durable workflow execution and replayable orchestrations", featured: true, order: 2 },
  { name: "Redis & Streams", category: "Backend", context: "Caching, rate limiting, pub/sub & event queues", featured: true, order: 3 },
  { name: "gRPC & Protobuf", category: "Backend", context: "Low-latency strongly-typed service-to-service RPC", featured: false, order: 4 },

  // Data
  { name: "PostgreSQL", category: "Data", context: "Primary relational storage, JSONB & transactional rigor", featured: true, order: 1 },
  { name: "ClickHouse", category: "Data", context: "High-volume time-series telemetry and analytics", featured: true, order: 2 },
  { name: "Redis / Key-Value", category: "Data", context: "Sub-millisecond state caching and session storage", featured: true, order: 3 },
  { name: "Prisma & Drizzle", category: "Data", context: "Type-safe database ORMs & schema migrations", featured: false, order: 4 },

  // AI
  { name: "Agent Architecture", category: "AI", context: "Multi-step tool invocation, state validation & fallback loops", featured: true, order: 1 },
  { name: "Vector & RAG Systems", category: "AI", context: "Context retrieval, chunking pipelines & similarity ranking", featured: true, order: 2 },
  { name: "Prompt Evaluation", category: "AI", context: "Automated latency, cost, and output consistency benchmarking", featured: true, order: 3 },
  { name: "Model Context Protocol", category: "AI", context: "Standardized tool integration across distributed agents", featured: false, order: 4 },

  // Tools
  { name: "Docker & Compose", category: "Tools", context: "Reproducible local environments & containerized services", featured: true, order: 1 },
  { name: "Git & GitHub CI", category: "Tools", context: "Automated testing, linting, preview builds & release flows", featured: true, order: 2 },
  { name: "OpenTelemetry", category: "Tools", context: "Distributed tracing, structured logging & metric collectors", featured: true, order: 3 },
  { name: "Linux & Bash", category: "Tools", context: "Production server administration, shell scripting & debugging", featured: false, order: 4 },
];
