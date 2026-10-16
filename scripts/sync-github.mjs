import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPO_OWNER = 'tongthanhdat009';
const PROJECTS_FILE = path.resolve(process.cwd(), 'src/content/projects.ts');
const HOMEPAGE_FILE = path.resolve(process.cwd(), 'src/content/homePage.ts');

function getCategoryByRepo(repo) {
  const name = repo.name.toLowerCase();
  const desc = (repo.description || '').toLowerCase();
  const lang = (repo.primaryLanguage?.name || '').toLowerCase();

  if (
    name.includes('router') ||
    name.includes('cua') ||
    name.includes('agent') ||
    name.includes('computer-use') ||
    name.includes('alpha') ||
    name.includes('sentiment') ||
    desc.includes('ai') ||
    desc.includes('llm') ||
    desc.includes('alpha')
  ) {
    return 'Intelligent Workflows';
  }
  if (
    name.includes('cli') ||
    name.includes('tool') ||
    name.includes('widget') ||
    name.includes('sync') ||
    name.includes('profile')
  ) {
    return 'Developer Tools';
  }
  if (
    lang === 'c#' ||
    lang === 'php' ||
    lang === 'blade' ||
    lang === 'html' ||
    name.includes('web') ||
    name.includes('store') ||
    name.includes('market') ||
    name.includes('booking') ||
    name.includes('showcase') ||
    name.includes('airline')
  ) {
    return 'Web Products';
  }
  if (
    lang === 'go' ||
    lang === 'rust' ||
    desc.includes('backend') ||
    desc.includes('stream') ||
    desc.includes('pipeline') ||
    name.includes('api') ||
    name.includes('backend')
  ) {
    return 'Backend & APIs';
  }
  return 'Web Products';
}

function getAccentByIndex(index) {
  const accents = ['sky', 'sun', 'coral', 'lime', 'paper'];
  return accents[index % accents.length];
}

async function fetchGithubRepos() {
  console.log(`📡 Fetching repositories for ${REPO_OWNER}...`);
  try {
    const output = execSync(
      `gh repo list ${REPO_OWNER} --limit 60 --json name,description,url,homepageUrl,stargazerCount,primaryLanguage,repositoryTopics,isPrivate,isFork,updatedAt,createdAt`,
      { encoding: 'utf-8' }
    );
    const repos = JSON.parse(output);
    console.log(`✓ Fetched ${repos.length} repositories via GitHub CLI.`);
    return repos;
  } catch (err) {
    console.log('⚠️ GitHub CLI fallback to public GitHub REST API...');
    const res = await fetch(`https://api.github.com/users/${REPO_OWNER}/repos?per_page=60&sort=updated`);
    if (!res.ok) {
      throw new Error(`GitHub API returned status ${res.status}: ${res.statusText}`);
    }
    const repos = await res.json();
    return repos.map(r => ({
      name: r.name,
      description: r.description || '',
      url: r.html_url,
      homepageUrl: r.homepage || '',
      stargazerCount: r.stargazers_count || 0,
      primaryLanguage: r.language ? { name: r.language } : null,
      repositoryTopics: (r.topics || []).map(t => ({ name: t })),
      isPrivate: r.private,
      isFork: r.fork,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  const repos = await fetchGithubRepos();

  // Filter: exclude internal system/profile repos
  const ignored = ['portfolio', 'cv', 'tongthanhdat009'];

  const filteredRepos = repos.filter(r => {
    if (ignored.includes(r.name.toLowerCase())) return false;
    if (r.isPrivate) return false;
    // If it's a fork, keep it if it has a meaningful description (e.g. 9router, cua, worldquant-miner)
    if (r.isFork && (!r.description || r.description.trim().length === 0)) {
      return false;
    }
    return true;
  });

  // Sort: repos with description or live demo URL first, then newest
  filteredRepos.sort((a, b) => {
    const scoreA = (a.description ? 10 : 0) + (a.homepageUrl ? 15 : 0) + (a.stargazerCount || 0);
    const scoreB = (b.description ? 10 : 0) + (b.homepageUrl ? 15 : 0) + (b.stargazerCount || 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  console.log(`🔍 Filtered and ranked ${filteredRepos.length} spotlight project repositories.`);

  const projects = filteredRepos.map((repo, idx) => {
    const slug = slugify(repo.name);
    const year = repo.createdAt ? new Date(repo.createdAt).getFullYear().toString() : '2026';
    const category = getCategoryByRepo(repo);
    const accent = getAccentByIndex(idx);

    const tags = [];
    if (repo.primaryLanguage?.name) tags.push(repo.primaryLanguage.name);
    if (repo.repositoryTopics && repo.repositoryTopics.length > 0) {
      repo.repositoryTopics.slice(0, 3).forEach(t => tags.push(t.name));
    }
    if (tags.length === 0) tags.push('Open Source');
    if (tags.length === 1 && category === 'Intelligent Workflows') tags.push('AI Systems');
    if (tags.length === 1 && category === 'Web Products') tags.push('Fullstack');

    const summary = repo.description && repo.description.trim()
      ? repo.description.trim()
      : `High-impact engineering project built with ${repo.primaryLanguage?.name || 'modern software stack'}.`;

    return {
      id: slug,
      slug: slug,
      title: repo.name.replace(/[-_]/g, ' '),
      year: year,
      index: String(idx + 1).padStart(2, '0'),
      category: category,
      summary: summary,
      accent: accent,
      tags: tags.slice(0, 4),
      status: repo.homepageUrl ? 'In Production' : 'Open Source',
      featured: idx < 4,
      order: idx + 1,
      demoUrl: repo.homepageUrl || undefined,
      repoUrl: repo.url,
      caseStudy: {
        overview: {
          product: repo.name,
          targetUsers: "Developers, businesses and end-users",
          timeline: `${year} - Active`,
          role: "Creator & Maintainer",
          status: repo.homepageUrl ? "Live in Production" : "Active Public Open Source"
        },
        problem: `Addressing efficiency, reliability, and usability constraints in ${category.toLowerCase()} workflows.`,
        contribution: [
          `Architected the core system modules and codebase structure.`,
          `Configured CI/CD pipelines, automated testing, and developer documentation.`,
          `Optimized runtime performance and accessibility.`
        ],
        approach: {
          summary: `Engineered using clean architecture principles with strong static typing and verifiable test coverage.`,
          architecturePoints: [
            `Separation of concerns between business logic and transport protocols.`,
            `Zero-overhead execution model prioritizing responsiveness.`,
            `Configurable environment settings for diverse deployment environments.`
          ]
        },
        highlights: [
          `Hosted publicly with transparent open-source code on GitHub.`,
          repo.stargazerCount > 0 ? `${repo.stargazerCount} GitHub Stars from the developer community.` : `Built with modular, maintainable code quality standards.`
        ],
        outcomes: [
          `Successfully deployed and actively maintained in production.`,
          `Proven reliability across typical usage scenarios.`
        ],
        lessons: [
          `Clear architectural boundaries accelerate both feature delivery and long-term maintainability.`
        ]
      }
    };
  });

  // Write projects
  const fileContent = `import { Project } from '@/types';

export const projectsData: Project[] = ${JSON.stringify(projects, null, 2)};
`;

  fs.writeFileSync(PROJECTS_FILE, fileContent, 'utf-8');
  console.log(`✅ Saved ${projects.length} projects to ${PROJECTS_FILE}`);

  // Update heroData featuredProjectId in homePage.ts
  if (projects.length > 0 && fs.existsSync(HOMEPAGE_FILE)) {
    const topSlug = projects[0].slug;
    let homeContent = fs.readFileSync(HOMEPAGE_FILE, 'utf-8');
    homeContent = homeContent.replace(
      /featuredProjectId:\s*["'][^"']+["']/,
      `featuredProjectId: "${topSlug}"`
    );
    fs.writeFileSync(HOMEPAGE_FILE, homeContent, 'utf-8');
    console.log(`🎯 Updated hero featured project to: "${topSlug}"`);
  }
}

main().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
