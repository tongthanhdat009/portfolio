import { ExperienceItem } from '@/types';

export const experienceData: ExperienceItem[] = [
  {
    id: "exp-2025-present",
    year: "2025 — Present",
    startDate: "2025",
    endDate: "Present",
    type: "Work",
    organization: "Independent Systems & Product Lab",
    roleAtTime: "Principal Builder & Software Engineer",
    description: "Designing end-to-end web products, distributed orchestration tools, and applied AI infrastructure for teams and open-source communities.",
    highlights: [
      "Built HyperFlow and AgentLens, serving millions of task transitions with zero state corruption.",
      "Collaborated with engineering founders on developer tools, UI architectures, and robust telemetry.",
      "Authored technical field notes on agentic determinism, neo-brutal aesthetics, and system ergonomics."
    ],
    accent: "sky",
  },
  {
    id: "exp-2023-2025",
    year: "2023 — 2025",
    startDate: "2023",
    endDate: "2025",
    type: "Work",
    organization: "Nexus Cloud Technologies",
    roleAtTime: "Senior Fullstack Engineer",
    description: "Led development of core developer dashboard services, observability integrations, and public APIs.",
    highlights: [
      "Spearheaded redesign of cloud configuration dashboard, cutting user time-to-first-deployment by 40%.",
      "Architected real-time WebSocket metrics feed processing 80,000 events/sec with sub-second browser rendering.",
      "Standardized UI component system across multiple engineering teams with strict accessibility testing."
    ],
    accent: "sun",
  },
  {
    id: "exp-2022-2023",
    year: "2022 — 2023",
    startDate: "2022",
    endDate: "2023",
    type: "Research",
    organization: "Distributed Systems Lab",
    roleAtTime: "Research Associate",
    description: "Investigated fault-tolerant consensus models and event-driven state replication in heterogeneous microservice clusters.",
    highlights: [
      "Benchmarked Kafka vs. Redis Streams latency distributions under partial network partitioning scenarios.",
      "Co-authored technical analysis on idempotent retry protocols in high-concurrency environments."
    ],
    accent: "lime",
  },
  {
    id: "exp-2020-2022",
    year: "2020 — 2022",
    startDate: "2020",
    endDate: "2022",
    type: "Education",
    organization: "University of Information Technology",
    roleAtTime: "B.S. in Computer Science",
    description: "Focused on operating systems, algorithm design, software architecture, and distributed databases.",
    highlights: [
      "Graduated with honors; conducted capstone on decentralized data verification protocols.",
      "Led university developer club organizing weekly open-source workshops and hackathons."
    ],
    accent: "paper",
  },
  {
    id: "exp-2021-open-source",
    year: "2021 — Ongoing",
    startDate: "2021",
    endDate: "Present",
    type: "Community",
    organization: "Open Source & Developer Ecosystem",
    roleAtTime: "Contributor & Maintainer",
    description: "Active contributor to developer tooling, accessible component libraries, and local developer meetups.",
    highlights: [
      "Published npm packages with over 50,000 collective downloads.",
      "Regular technical speaker on pragmatic software architecture and accessible interface design."
    ],
    accent: "coral",
  },
];
