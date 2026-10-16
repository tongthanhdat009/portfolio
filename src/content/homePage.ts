import { HeroData, ManifestoData } from '@/types';

export const heroData: HeroData = {
  eyebrow: "INDEPENDENT DEVELOPER / DIGITAL BUILDER",
  headlineLines: [
    "I BUILD",
    "THINGS THAT",
    "WORK."
  ],
  intro: "Products, tools, systems & experiments — from idea to something people can actually use. Curious by default, practical by design.",
  primaryCta: {
    label: "Explore My Work ↗",
    href: "#work",
  },
  secondaryCta: {
    label: "More About Me",
    href: "/about",
  },
  statusLabel: "Building / Exploring / Open to ideas",
  bottomKeywords: [
    "01 / WORK",
    "WEB SYSTEMS",
    "AI WORKFLOWS",
    "DEV TOOLS",
    "SCROLL TO EXPLORE ↓"
  ],
  heroAccent: "sky",
  featuredProjectId: "hyperflow-orchestrator",
  featuredProjectEnabled: true,
};

export const marqueeKeywords: string[] = [
  "WEB APPS",
  "BACKEND SYSTEMS",
  "AI WORKFLOWS",
  "AUTOMATION",
  "DEVELOPER TOOLS",
  "SYSTEM ARCHITECTURE",
  "RELIABLE EXPERIMENTS",
  "OPEN SOURCE"
];

export const manifestoData: ManifestoData = {
  sectionLabel: "WHO I AM",
  headline: "Curious by default. Practical by design.",
  body: "I like turning complicated engineering challenges into reliable, useful digital experiences. I move between responsive interfaces, distributed services, event pipelines, and applied AI workflows depending on what the problem demands — without dogmatic labels.",
  chips: [
    "Think in systems",
    "Make it usable",
    "Keep learning",
    "Ship with conviction"
  ],
  ctaText: "Read my background & story →",
  ctaHref: "/about",
};
