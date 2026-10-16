import { Project } from '@/types';

export const projectsData: Project[] = [
  {
    id: "hyperflow-orchestrator",
    slug: "hyperflow-orchestrator",
    title: "HyperFlow Workflow Engine",
    year: "2026",
    index: "01",
    category: "Intelligent Workflows",
    summary: "Event-driven workflow orchestration engine with deterministic execution, replayable state machines, and real-time inspector UI.",
    accent: "sky",
    tags: ["TypeScript", "Next.js", "Redis Streams", "Temporal", "Docker"],
    status: "Shipped",
    featured: true,
    order: 1,
    demoUrl: "https://hyperflow-demo.datnguyen.dev",
    repoUrl: "https://github.com/datnguyen/hyperflow",
    caseStudy: {
      overview: {
        product: "HyperFlow Orchestrator",
        targetUsers: "Backend & Platform Engineers managing multi-step asynchronous business workflows",
        timeline: "6 months (Design to Production Deployment)",
        role: "Lead Systems Architect & Core Developer",
        status: "In active production use"
      },
      problem: "Multi-step asynchronous distributed tasks frequently encountered transient network hiccups, silent step timeouts, and opaque intermediate states. Operators had no unified visibility into where a process stalled or how to safely retry individual sub-tasks without triggering side-effect duplications.",
      contribution: [
        "Architected the Directed Acyclic Graph (DAG) state model supporting step-level idempotency tokens.",
        "Implemented the Redis Streams event consumer with backpressure and graceful dead-letter queuing.",
        "Built the interactive inspection visualizer enabling engineers to rewind, examine payload diffs, and resume workflows.",
        "Authored the TypeScript SDK with strict type inference for pipeline step schemas."
      ],
      approach: {
        summary: "Leveraged durable execution semantics where every state transition is recorded as an immutable append-only event before external operations execute.",
        architecturePoints: [
          "Immutable event log ensures deterministic state recovery upon worker crashes.",
          "Partitioned event queues prevent single-tenant traffic spikes from starving other pipelines.",
          "Pluggable telemetry exporters compatible with OpenTelemetry collector pipelines."
        ]
      },
      highlights: [
        "Zero state drift across over 2.4 million executed pipeline jobs.",
        "Sub-15ms overhead per step transition under high concurrent load.",
        "Integrated playground allows local verification of complex DAG edge conditions before staging."
      ],
      outcomes: [
        "Reduced mean-time-to-resolution (MTTR) for failed operational workflows from 45 minutes to under 3 minutes.",
        "Eliminated duplicate transaction incidents through cryptographic step-deduplication keys.",
        "Adopted by 8 internal product teams as the primary asynchronous orchestration standard."
      ],
      lessons: [
        "Overly complex distributed locks introduce subtle deadlock vulnerabilities; partitioned single-writer queues are far more robust.",
        "Visual debugging tools built alongside the engine cut testing time by more than half compared to reading raw logs."
      ]
    }
  },
  {
    id: "pulse-metric-hub",
    slug: "pulse-metric-hub",
    title: "Pulse Telemetry Hub",
    year: "2025",
    index: "02",
    category: "Backend & APIs",
    summary: "High-throughput metric ingestion service and real-time anomaly detector for microservice architectures.",
    accent: "sun",
    tags: ["Go", "Kafka", "ClickHouse", "OpenTelemetry", "Grafana"],
    status: "In Production",
    featured: true,
    order: 2,
    demoUrl: "https://pulse-demo.datnguyen.dev",
    repoUrl: "https://github.com/datnguyen/pulse-hub",
    caseStudy: {
      overview: {
        product: "Pulse Telemetry Hub",
        targetUsers: "SREs and Infrastructure Teams monitoring distributed services",
        timeline: "4 months",
        role: "Backend & Data Infrastructure Engineer",
        status: "Production"
      },
      problem: "Existing monitoring agents incurred excessive memory overhead on lightweight containers, and central metric aggregation struggled to ingest sudden spike events during traffic surges.",
      contribution: [
        "Developed a streaming buffer in Go using zero-allocation buffer pools.",
        "Configured ClickHouse time-series compression tables achieving 8:1 storage compression ratio.",
        "Created an anomaly scoring daemon analyzing rolling z-score distributions across microservice latency streams."
      ],
      approach: {
        summary: "Separated ingestion path from analytical query paths using Kafka buffering and columnar ClickHouse storage.",
        architecturePoints: [
          "Zero-allocation serialization path using protocol buffers.",
          "Vectorized aggregation queries allowing multi-billion row scans in sub-second timeframes."
        ]
      },
      highlights: [
        "Ingests up to 120,000 metrics per second per single worker node.",
        "Under 40MB steady-state RAM consumption on ingestion workers."
      ],
      outcomes: [
        "Replaced a legacy time-series cluster, reducing cloud infrastructure spend by 42%.",
        "Decreased detection time for latency regressions from minutes to 10-second windows."
      ],
      lessons: [
        "Premature aggregation loses valuable tail latency distributions; store raw histograms with smart compression whenever possible."
      ]
    }
  },
  {
    id: "syntax-kit-ui",
    slug: "syntax-kit-ui",
    title: "SyntaxKit Design System",
    year: "2025",
    index: "03",
    category: "Web Products",
    summary: "Modular, accessible component library engineered specifically for developer tooling with high-contrast themes and keyboard shortcuts.",
    accent: "coral",
    tags: ["React", "TypeScript", "Tailwind CSS", "Radix UI", "Accessibility"],
    status: "Open Source",
    featured: true,
    order: 3,
    demoUrl: "https://syntaxkit.datnguyen.dev",
    repoUrl: "https://github.com/datnguyen/syntax-kit",
    caseStudy: {
      overview: {
        product: "SyntaxKit Design System",
        targetUsers: "Frontend engineers building developer dashboards and technical tooling",
        timeline: "5 months",
        role: "Design System Engineer & Maintainer",
        status: "Published NPM Package"
      },
      problem: "Many UI libraries focus solely on marketing websites, lacking specialized technical components like log viewers, JSON diff inspectors, command palettes, and keyboard navigation rings.",
      contribution: [
        "Crafted 34 accessible React components strictly tested with screen readers and keyboard navigation.",
        "Designed token architecture with high-contrast neo-brutal aesthetics and customizable spacing scales.",
        "Implemented virtualized log viewer component handling 100,000+ line outputs smoothly."
      ],
      approach: {
        summary: "Headless primitives wrapped with purposeful neo-brutal styling and strict accessibility compliance.",
        architecturePoints: [
          "Compound component patterns providing intuitive APIs.",
          "Zero bundle penalty when tree-shaking unused primitives."
        ]
      },
      highlights: [
        "100% WCAG 2.2 AA compliant contrast and keyboard accessibility audits.",
        "Over 12,000 monthly downloads on npm."
      ],
      outcomes: [
        "Standardized UI consistency across 5 distinct internal developer portals.",
        "Cut new internal tool frontend development time from weeks to days."
      ],
      lessons: [
        "Accessibility is vastly simpler to implement when baked into low-level tokens rather than retrofitted onto complete pages."
      ]
    }
  },
  {
    id: "agent-lens-debugger",
    slug: "agent-lens-debugger",
    title: "AgentLens Trace Visualizer",
    year: "2026",
    index: "04",
    category: "Developer Tools",
    summary: "Interactive trace visualizer for inspecting LLM agent reasoning loops, tool call arguments, token spend, and latency waterfalls.",
    accent: "lime",
    tags: ["Next.js", "WebSockets", "D3.js", "Python", "FastAPI"],
    status: "Shipped",
    featured: true,
    order: 4,
    demoUrl: "https://agentlens.datnguyen.dev",
    repoUrl: "https://github.com/datnguyen/agent-lens",
    caseStudy: {
      overview: {
        product: "AgentLens Trace Visualizer",
        targetUsers: "AI Engineers and Prompt Developers debugging autonomous agents",
        timeline: "3 months",
        role: "Fullstack Engineer",
        status: "Live & Maintained"
      },
      problem: "Debugging autonomous agents by scrolling through JSON terminal logs is painful and hides circular tool loops, context window bloat, and costly token regressions.",
      contribution: [
        "Engineered live WebSocket trace streaming protocol for capturing multi-agent interactions.",
        "Built interactive visual timeline depicting thought steps, tool calls, and LLM completions.",
        "Developed token budget breakdown view to identify prompt inflation points."
      ],
      approach: {
        summary: "Lightweight Python/TypeScript SDK hooks emit lightweight OpenTelemetry-style events to a local visualizer.",
        architecturePoints: [
          "Local-first architecture requiring zero external SaaS dependency for private enterprise codebases.",
          "Efficient D3-based graph rendering capable of displaying recursive subagent invocations."
        ]
      },
      highlights: [
        "Instant replay and stepping through complex 20+ step agent trajectories.",
        "Token optimization analysis highlighting unnecessary prompt repetitions."
      ],
      outcomes: [
        "Helped users identify and fix prompt loops, reducing median agent execution costs by 35%.",
        "Used regularly by dozens of developers building agentic workflows."
      ],
      lessons: [
        "Making the debugging loop visible in real-time dramatically speeds up iteration compared to post-mortem analysis."
      ]
    }
  },
  {
    id: "dataplane-sync",
    slug: "dataplane-sync",
    title: "DataPlane Schema Synchronizer",
    year: "2024",
    index: "05",
    category: "Systems & Architecture",
    summary: "Bidirectional database schema migration validator and drift detection pipeline with automated pull request warnings.",
    accent: "paper",
    tags: ["PostgreSQL", "Node.js", "Prisma", "GitHub Actions", "CLI"],
    status: "Open Source",
    featured: false,
    order: 5,
    demoUrl: "https://dataplane.datnguyen.dev",
    repoUrl: "https://github.com/datnguyen/dataplane-sync",
    caseStudy: {
      overview: {
        product: "DataPlane Schema Synchronizer",
        targetUsers: "DevOps teams and Database Administrators",
        timeline: "3 months",
        role: "Systems Developer",
        status: "Open Source Tool"
      },
      problem: "Branch merges frequently introduced schema drift between staging and production databases, leading to runtime failures during deploys.",
      contribution: [
        "Created an AST parser to compare declared Prisma/SQL schemas against live database introspection.",
        "Built GitHub Action bot posting visual diff tables on pull requests with potential breaking change alerts."
      ],
      approach: {
        summary: "Declarative diff engine comparing normalized schema ASTs rather than raw strings.",
        architecturePoints: [
          "Safe migration dry-run checks executed inside disposable containerized databases."
        ]
      },
      highlights: [
        "Detected 100% of destructive column drops in CI before merge.",
        "Zero false-positive alarms on harmless index changes."
      ],
      outcomes: [
        "Completely eliminated deploy-time schema mismatch incidents across active deployments."
      ],
      lessons: [
        "Automating preventive guardrails in CI generates far higher developer happiness than reactive firefighting."
      ]
    }
  }
];
