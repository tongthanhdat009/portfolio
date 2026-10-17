import { Experiment } from '@/types';

export const experimentsData: Experiment[] = [
  {
    id: "canvas-graph-rag",
    slug: "canvas-graph-rag",
    title: "CanvasGraph RAG Visualizer",
    summary: "Visualizing semantic clusters and entity relationships in RAG retrieval graphs using hardware-accelerated canvas.",
    status: "Prototype",
    accent: "lime",
    tags: ["Canvas", "TypeScript", "Vector Search", "Graph Math"],
    isWide: true,
    demoUrl: "https://canvasgraph-demo.datnguyen.dev",
    repoUrl: "https://github.com/datnguyen/canvas-graph-rag",
    objective: "To create an intuitive visual interface for observing how vector similarity thresholds impact sub-graph connectivity during RAG chunk retrieval.",
    howItWorks: "Converts high-dimensional vector embeddings into 2D force-directed node coordinates using t-SNE approximations in a Web Worker, rendering real-time connectivity edges onto HTML5 Canvas.",
    limitations: "Large graphs (>5,000 nodes) still induce frame drops on low-power mobile devices without WebGL instancing.",
    takeaways: "Visualizing retrieval paths immediately reveals dead clusters and false-positive entity connections that would remain invisible in raw JSON scores."
  },
  {
    id: "prompt-stream-eval",
    slug: "prompt-stream-eval",
    title: "PromptStream Real-time Benchmark",
    summary: "A lightweight utility calculating token generation velocity, time-to-first-token (TTFT), and latency jitter across LLM endpoints.",
    status: "Shipped",
    accent: "sun",
    tags: ["SSE", "Next.js", "Web Crypto", "Benchmarks"],
    isWide: false,
    demoUrl: "https://promptstream-eval.datnguyen.dev",
    repoUrl: "https://github.com/datnguyen/prompt-stream-eval",
    objective: "Accurately benchmark token streaming jitter across different providers and model quantization levels under varying network profiles.",
    howItWorks: "Uses High Resolution Time API (`performance.now()`) to measure inter-chunk delta arrival times over Server-Sent Events (SSE) connections, plotting histogram curves in real-time.",
    limitations: "Browser buffering on certain proxies can artificially bundle chunks together, requiring raw TCP socket verification on native servers.",
    takeaways: "Time-to-first-token matters significantly more for perceived UI snappiness than total generation tokens per second."
  },
  {
    id: "sqlite-edge-cache",
    slug: "sqlite-edge-cache",
    title: "SQLite Edge Micro-Cache",
    summary: "Exploring embedded SQLite databases as ephemeral, queryable read caches for serverless edge functions.",
    status: "Exploring",
    accent: "sky",
    tags: ["SQLite", "Edge Workers", "WASM", "Caching"],
    isWide: false,
    demoUrl: "https://sqlite-edge.datnguyen.dev",
    repoUrl: "https://github.com/datnguyen/sqlite-edge-cache",
    objective: "Test whether in-memory SQLite compiled to WebAssembly can provide ultra-fast SQL relational querying on edge nodes without round-tripping to a central database.",
    howItWorks: "Pre-seeds a read-only SQLite database file into edge worker memory, allowing edge requests to execute complex SQL filters and joins locally in under 2ms.",
    limitations: "Cache invalidation synchronization across 200+ global edge locations requires careful version tagging and eventual consistency allowances.",
    takeaways: "For semi-static catalogs or configuration tables, local SQLite at the edge completely outperforms remote key-value lookups."
  },
  {
    id: "terminal-palette-gen",
    slug: "terminal-palette-gen",
    title: "Terminal Contrast Palette Generator",
    summary: "A focused tool generating mathematically sound, high-contrast ANSI 16-color themes adhering to strict WCAG 2.2 rules.",
    status: "Shipped",
    accent: "coral",
    tags: ["Color Math", "WCAG 2.2", "ANSI", "CLI"],
    isWide: false,
    demoUrl: "https://terminalpalette.datnguyen.dev",
    repoUrl: "https://github.com/datnguyen/terminal-palette-gen",
    objective: "Solve low legibility in command-line environments by algorithmically adjusting saturation and lightness curves to guarantee 4.5:1 contrast on both dark and light terminal backgrounds.",
    howItWorks: "Calculates APCA (Accessible Perceptual Contrast Algorithm) lightness values and outputs compatible color profiles for Alacritty, Kitty, iTerm2, and Windows Terminal.",
    limitations: "User-configured monitor color gamut profiles and ambient lighting can alter subjective perception.",
    takeaways: "Formulaic contrast checks remove subjective guesswork from theme creation and guarantee consistent readability."
  }
];
