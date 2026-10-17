import { Note } from '@/types';

export const notesData: Note[] = [
  {
    id: "architecting-resilient-agent-workflows",
    slug: "architecting-resilient-agent-workflows",
    title: "Architecting Resilient Agent Workflows Without Fragile Prompts",
    category: "Architecture & AI",
    publishedAt: "2026-03-12",
    readTime: "7 min read",
    excerpt: "Why state machines, structured schema validation, and deterministic fallback loops outperform monolithic prompt engineering in mission-critical systems.",
    tags: ["Agentic AI", "System Architecture", "TypeScript", "Reliability"],
    toc: [
      { id: "the-illusion-of-the-mega-prompt", text: "The Illusion of the Mega-Prompt", level: 2 },
      { id: "deterministic-state-machines", text: "Deterministic State Machines as Guardrails", level: 2 },
      { id: "idempotency-and-side-effects", text: "Managing Side Effects with Idempotency Tokens", level: 2 },
      { id: "practical-takeaways", text: "Practical Takeaways for Production Builders", level: 2 }
    ],
    content: [
      "In early autonomous AI experiments, the standard pattern was simple: append everything into a giant system prompt, provide a dozen tools, and hope the language model navigates the plan flawlessly. In real-world enterprise operations, this approach collapses quickly under unexpected edge cases, API timeouts, and non-deterministic formatting quirks.",
      "Reliability does not emerge from polite prompt phrases like 'Please think step by step and be accurate.' It emerges from engineering boundaries: rigid state machines, verified schema contracts, and explicit transition rules that separate decision reasoning from execution guarantees.",
      "When we treat each tool execution as a state transition in a Directed Acyclic Graph (DAG), the AI model becomes a selector rather than an unchecked orchestrator. The underlying runtime validates input schemas before invocation, assigns unique idempotency keys to external side effects, and catches failures with deterministic retry backoffs.",
      "If a sub-task encounters an unrecoverable schema validation error, the engine does not abort the entire mission. Instead, it transitions into an explicit recovery state, supplying the model with the exact JSON validation diff so it can course-correct with full context.",
      "The key principle to remember: software engineering fundamentals still apply in the age of AI. Strong typing, transaction isolation, immutable event logs, and testable unit states are more essential today than ever before."
    ]
  },
  {
    id: "neo-brutalism-design-system-practical-guide",
    slug: "neo-brutalism-design-system-practical-guide",
    title: "Building Accessible Neo-Brutal Interfaces with Tailwind CSS v4",
    category: "Design Systems & UI",
    publishedAt: "2026-01-20",
    readTime: "6 min read",
    excerpt: "A practical guide to bold typography, high-contrast borders, and tactile hard shadows without compromising WCAG 2.2 accessibility or mobile responsiveness.",
    tags: ["Neo-Brutalism", "Tailwind CSS", "Accessibility", "Design Tokens"],
    toc: [
      { id: "beyond-the-visual-gimmick", text: "Beyond the Visual Gimmick", level: 2 },
      { id: "design-tokens-and-color-budgeting", text: "Design Tokens & Color Budgeting", level: 2 },
      { id: "hard-shadows-and-mobile-layout", text: "Hard Shadows Without Layout Shifting", level: 2 },
      { id: "keyboard-navigation-and-focus", text: "Keyboard Navigation and Visible Focus", level: 2 }
    ],
    content: [
      "Neo-brutalism in web design is frequently misunderstood as intentional ugliness or chaotic retro-nostalgia. When executed properly, however, it is one of the most functional, honest visual design languages available: high readability, clear boundaries, and tactile physical feedback.",
      "The core rule of modern neo-brutalism is discipline: 1 clear primary focal point per viewport, controlled color distribution, and structural grid alignment. The background should feel like natural paper (#FFF9E9) to reduce glare, paired with deep crisp ink (#111111) for maximum readability.",
      "A common trap is treating shadows as soft blurs. In neo-brutalism, shadows are solid, offset graphic elements (e.g. 5px 5px 0 #111111). When a user presses a button, the visual element should physically shift in the direction of the shadow, providing immediate, satisfying tactile confirmation.",
      "On mobile viewports, large hard shadows and overlapping stickers can easily cause unwanted horizontal scrollbars or obscure text. The solution is responsive reflow: reducing shadow offsets on small screens, disabling absolute overlapping, and ensuring touch targets remain at least 44x44 pixels.",
      "By anchoring your color palette to semantic tokens and rigorously testing contrast ratios against WCAG 2.2 AA standards, you can create a portfolio or product that is distinctly memorable while remaining completely accessible to all users."
    ]
  },
  {
    id: "event-driven-eventual-consistency",
    slug: "event-driven-eventual-consistency",
    title: "Lessons from Building Event-Driven Data Pipelines Under Peak Load",
    category: "Backend & Systems",
    publishedAt: "2025-11-04",
    readTime: "8 min read",
    excerpt: "Real-world trade-offs between Redis Streams, Kafka, and Postgres transactional outboxes when handling millions of events with zero data loss.",
    tags: ["Distributed Systems", "Kafka", "Redis", "Event Driven"],
    toc: [
      { id: "the-myth-of-instant-consistency", text: "The Myth of Instant Consistency", level: 2 },
      { id: "the-transactional-outbox-pattern", text: "The Transactional Outbox Pattern in Practice", level: 2 },
      { id: "handling-poison-pills", text: "Handling Poison Pills and Backpressure", level: 2 },
      { id: "observability-first", text: "Observability-First Architecture", level: 2 }
    ],
    content: [
      "When scaling web applications beyond a single monolithic database, distributed state consistency is usually where teams struggle first. Two-phase commits (2PC) introduce crippling latency and tight coupling that cripples availability.",
      "The pragmatic answer for high-throughput services is event-driven architecture with eventual consistency. However, eventual consistency requires disciplined patterns to avoid losing data when network partitions or node failures occur.",
      "The Transactional Outbox pattern remains the single most reliable strategy for publishing events without dual-write race conditions. By storing outgoing events in the same relational transaction that mutates business entities, you guarantee that an event is never published unless the database commit actually succeeds.",
      "From there, specialized consumer workers poll or tail the outbox table and stream records into message brokers like Redis Streams or Kafka. Dead-letter queues (DLQ) are critical: when a corrupted event arrives, you must isolate the poison pill into a quarantine topic rather than stalling the entire consumer group.",
      "Lastly, trace context propagation across asynchronous boundaries is non-negotiable. Passing W3C traceparent headers through message metadata allows distributed tracing tools to visualize the entire request journey from the initial HTTP hit to background database persistence."
    ]
  }
];
