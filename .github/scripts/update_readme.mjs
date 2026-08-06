/**
 * DIY Pro Custom SVG & Automation Engine for GitHub Actions.
 * Generates bespoke, high-performance, dark-mode glassmorphic SVG cards for repositories and language stats.
 * Guaranteed zero third-party image dependencies, zero rate-limits, and ultra-cool visual styling.
 */

import fs from 'node:fs';
import path from 'node:path';

const USERNAME = 'muhananaufal';
const API_URL = `https://api.github.com/users/${USERNAME}/repos?sort=updated&direction=desc&per_page=30`;
const README_PATH = path.resolve('README.md');
const ASSETS_DIR = path.resolve('assets');

const PROJECT_START = '<!-- START_SECTION:latest_projects -->';
const PROJECT_END = '<!-- END_SECTION:latest_projects -->';
const LANG_START = '<!-- START_SECTION:language_stats -->';
const LANG_END = '<!-- END_SECTION:language_stats -->';

const LANG_COLORS = {
  PHP: '#4F5D95',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Blade: '#f7523f',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  PowerShell: '#012456',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  Vue: '#41b883',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  Default: '#58a6ff'
};

function ensureAssetsDir() {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }
}

async function fetchRepos() {
  const headers = {
    'User-Agent': `readme-bot-${USERNAME}`,
    'Accept': 'application/vnd.github.v3+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  try {
    const response = await fetch(API_URL, { headers });
    if (!response.ok) {
      console.error(`Failed to fetch repositories: HTTP ${response.status}`);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching repositories from GitHub API:', error);
    return [];
  }
}

async function fetchLanguages(repoName) {
  const url = `https://api.github.com/repos/${USERNAME}/${repoName}/languages`;
  const headers = {
    'User-Agent': `readme-bot-${USERNAME}`,
    'Accept': 'application/vnd.github.v3+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function generateDividerSvg() {
  const svg = `<svg width="840" height="4" viewBox="0 0 840 4" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0d1117" stop-opacity="0" />
      <stop offset="25%" stop-color="#00f2fe" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#4facfe" stop-opacity="1" />
      <stop offset="75%" stop-color="#00e676" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect x="0" y="1" width="840" height="2" rx="1" fill="url(#glow)" />
</svg>`;
  fs.writeFileSync(path.join(ASSETS_DIR, 'divider.svg'), svg, 'utf-8');
}

function generateHeaderSvg() {
  const svg = `<svg width="820" height="200" viewBox="0 0 820 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1117" />
      <stop offset="100%" stop-color="#010409" />
    </linearGradient>
    <linearGradient id="textGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#58a6ff" />
      <stop offset="50%" stop-color="#00e676" />
      <stop offset="100%" stop-color="#58a6ff" />
    </linearGradient>
    
    <!-- Grid Pattern -->
    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#30363d" stroke-width="1" opacity="0.3"/>
    </pattern>
  </defs>
  <style>
    @keyframes typing {
      from { width: 0 }
      to { width: 440px }
    }
    @keyframes blink-caret {
      from, to { border-color: transparent }
      50% { border-color: #00e676 }
    }
    @keyframes float-orb {
      0% { transform: translateY(0) scale(1); opacity: 0.2; }
      50% { transform: translateY(-20px) scale(1.2); opacity: 0.5; }
      100% { transform: translateY(0) scale(1); opacity: 0.2; }
    }
    @keyframes panGrid {
      from { transform: translateY(-40px); }
      to { transform: translateY(0); }
    }
    @keyframes gradientShift {
      0% { stop-color: #58a6ff; }
      50% { stop-color: #00e676; }
      100% { stop-color: #58a6ff; }
    }
    
    .grid-anim { animation: panGrid 4s linear infinite; }
    .orb-1 { animation: float-orb 6s infinite ease-in-out; }
    .orb-2 { animation: float-orb 8s infinite ease-in-out; animation-delay: 2s; }
    .orb-3 { animation: float-orb 7s infinite ease-in-out; animation-delay: 4s; }
    
    .name { font: 800 42px 'Inter', -apple-system, sans-serif; fill: url(#textGlow); letter-spacing: 1px; }
  </style>
  
  <rect width="820" height="200" rx="15" fill="url(#bgGlow)" stroke="#30363d" stroke-width="2" />
  
  <!-- Infinite Scrolling Cyber Grid -->
  <g clip-path="url(#gridClip)">
    <clipPath id="gridClip"><rect width="820" height="200" rx="15"/></clipPath>
    <rect width="820" height="240" fill="url(#gridPattern)" class="grid-anim" />
  </g>
  
  <!-- Floating Orbs -->
  <circle cx="700" cy="80" r="30" fill="#00e676" filter="blur(20px)" class="orb-1" />
  <circle cx="600" cy="150" r="20" fill="#58a6ff" filter="blur(15px)" class="orb-2" />
  <circle cx="780" cy="120" r="40" fill="#ff007f" filter="blur(25px)" class="orb-3" opacity="0.15" />
  
  <!-- Content -->
  <text x="22" y="80" class="name">MUHANA NAUFAL</text>
  
  <!-- CSS Typewriter effect -->
  <foreignObject x="22" y="100" width="700" height="50">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Fira Code', 'Courier New', monospace; font-size: 18px; color: #8b949e; display: inline-block; overflow: hidden; white-space: nowrap; border-right: 3px solid #00e676; animation: typing 3.5s steps(40, end), blink-caret .75s step-end infinite;">
      > Backend Developer &amp; Cloud Architect_
    </div>
  </foreignObject>
</svg>`;

  fs.writeFileSync(path.join(ASSETS_DIR, `header-banner.svg`), svg);
  return `header-banner.svg`;
}

function generateRepoSvg(repo, index) {
  const cacheBuster = Date.now();
  const repoName = escapeXml(repo.name);
  const repoDesc = escapeXml(repo.description || 'No description provided.');
  const repoLang = escapeXml(repo.language || 'Unknown');
  const repoStars = repo.stargazers_count;
  const dateUpdated = new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  const descWords = repoDesc.split(' ');
  let line1 = repoDesc;
  let line2 = '';
  if (descWords.length > 5) {
    const mid = Math.ceil(descWords.length / 2);
    line1 = descWords.slice(0, mid).join(' ');
    line2 = descWords.slice(mid).join(' ');
  }

  const animDelay = index * 0.2;

  const svg = `<svg width="410" height="135" viewBox="0 0 410 135" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGlow_${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#161b22" />
      <stop offset="100%" stop-color="#0d1117" />
    </linearGradient>
    <linearGradient id="borderGlow_${index}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#58a6ff" />
      <stop offset="50%" stop-color="#00e676" />
      <stop offset="100%" stop-color="#58a6ff" />
    </linearGradient>
  </defs>
  <style>
    @keyframes pulse-dot {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.6; }
    }
    @keyframes float-icon {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    @keyframes dash-border {
      to { stroke-dashoffset: -400; }
    }
    
    .title { font: 600 16px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #58a6ff; }
    .desc { font: 400 13px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #8b949e; }
    .meta { font: 500 12px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #c9d1d9; }
    .date { font: 400 11px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #6e7681; }
    
    .dot-anim { transform-origin: 26px 113px; animation: pulse-dot 2s infinite ease-in-out; animation-delay: ${animDelay}s; }
    .icon-anim { animation: float-icon 3s infinite ease-in-out; animation-delay: ${animDelay}s; }
    .border-anim { stroke-dasharray: 150 250; stroke-dashoffset: 0; animation: dash-border 6s linear infinite; }
  </style>
  
  <rect x="1" y="1" width="408" height="133" rx="10" fill="url(#cardGlow_${index})" stroke="#30363d" stroke-width="1.5" />
  
  <!-- Animated Border Dash -->
  <rect x="1" y="1" width="408" height="133" rx="10" fill="none" stroke="url(#borderGlow_${index})" stroke-width="1.5" class="border-anim" opacity="0.7" />
  
  <!-- Repo Icon -->
  <g class="icon-anim">
    <path fill="none" stroke="#58a6ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M 22 36 L 27 31 L 34 31 L 34 43 L 22 43 Z" />
  </g>
  
  <text x="42" y="40" class="title">${repoName}</text>
  
  <text x="22" y="68" class="desc">${line1}</text>
  <text x="22" y="86" class="desc">${line2}</text>
  
  <circle cx="26" cy="113" r="5" fill="${LANG_COLORS[repoLang] || '#8b949e'}" class="dot-anim" />
  <text x="36" y="117" class="meta">${repoLang}</text>
  
  <text x="110" y="117" class="meta">★ ${repoStars}</text>
  <text x="388" y="117" text-anchor="end" class="date">Updated: ${dateUpdated}</text>
</svg>`;

  fs.writeFileSync(path.join(ASSETS_DIR, `repo-${index}.svg`), svg);
  return `repo-${index}.svg`;
}

function generateLanguagesSvg(langMap, totalBytes) {
  const sortedLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (totalBytes === 0) return '';

  let barSegments = '';
  let legendItems = '';
  let currentX = 20;

  sortedLangs.forEach(([lang, bytes], i) => {
    const pct = ((bytes / totalBytes) * 100).toFixed(1);
    const w = (bytes / totalBytes) * 780;
    const color = LANG_COLORS[lang] || '#8b949e';

    barSegments += `<rect x="${currentX}" y="52" width="${w}" height="14" fill="${color}" class="bar-grow" style="animation-delay: ${i * 0.1}s;" />\n`;
    currentX += w;

    const row = Math.floor(i / 4);
    const col = i % 4;
    const lx = 20 + col * 195;
    const ly = 100 + row * 40;

    legendItems += `
      <circle cx="${lx + 5}" cy="${ly - 5}" r="4" fill="${color}" class="legend-fade" style="animation-delay: ${(i * 0.1) + 0.5}s;" />
      <text x="${lx + 15}" y="${ly}" class="langName legend-fade" style="animation-delay: ${(i * 0.1) + 0.5}s;">${lang}</text>
      <text x="${lx + 100}" y="${ly}" class="langPct legend-fade" style="animation-delay: ${(i * 0.1) + 0.5}s;">${pct}%</text>
    `;
  });

  const svg = `<svg width="820" height="170" viewBox="0 0 820 170" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="metricsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#161b22" />
      <stop offset="100%" stop-color="#0d1117" />
    </linearGradient>
    <clipPath id="barClip">
      <rect x="20" y="52" width="780" height="14" rx="7" />
    </clipPath>
  </defs>
  <style>
    @keyframes slide-in-bar {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
    @keyframes fade-in-legend {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .title { font: 700 18px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #ffffff; }
    .langName { font: 600 14px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #c9d1d9; }
    .langPct { font: 400 14px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #8b949e; }
    
    .bar-grow { transform-origin: left; animation: slide-in-bar 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    .legend-fade { animation: fade-in-legend 0.8s ease-out both; }
  </style>
  <rect x="1" y="1" width="818" height="168" rx="12" fill="url(#metricsBg)" stroke="#30363d" stroke-width="1.5" />
  
  <text x="22" y="34" class="title">⚡ Real-Time Codebase and Language Distribution</text>
  
  <g clip-path="url(#barClip)">
    <rect x="20" y="52" width="780" height="14" fill="#21262d" />
    ${barSegments}
  </g>
  
  <g>
    ${legendItems}
  </g>
</svg>`;

  fs.writeFileSync(path.join(ASSETS_DIR, `language-stats.svg`), svg);
  return `language-stats.svg`;
}

function replaceSection(content, startTag, endTag, newContent) {
  const startIdx = content.indexOf(startTag);
  const endIdx = content.indexOf(endTag);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return content;
  return content.slice(0, startIdx + startTag.length) + '\n' + newContent + '\n' + content.slice(endIdx);
}

async function main() {
  console.log(`Starting DIY custom SVG generator engine for @${USERNAME}...`);
  ensureAssetsDir();
  generateDividerSvg();

  const repos = await fetchRepos();
  if (!repos || repos.length === 0) {
    console.error('Aborting: Could not retrieve repositories.');
    process.exit(1);
  }

  const validRepos = repos
    .filter(r => r.name.toLowerCase() !== USERNAME.toLowerCase() && !r.archived && !r.private)
    .slice(0, 4);

  const cacheBuster = Date.now();
  let projectsMd = '<p align="center">\n';
  validRepos.forEach((repo, idx) => {
    const fileName = generateRepoSvg(repo, idx);
    projectsMd += `  <a href="${repo.html_url}"><img src="./assets/${fileName}?v=${cacheBuster}" width="410" alt="${escapeXml(repo.name)}" /></a>\n`;
    if (idx === 1 && validRepos.length > 2) {
      projectsMd += '</p>\n<p align="center">\n';
    }
  });
  projectsMd += '</p>';

  // Languages calculations
  const langMap = {};
  let totalBytes = 0;
  const allValid = repos.filter(r => r.name.toLowerCase() !== USERNAME.toLowerCase() && !r.archived && !r.private);
  await Promise.all(
    allValid.map(async (repo) => {
      const langs = await fetchLanguages(repo.name);
      for (const [lang, bytes] of Object.entries(langs)) {
        langMap[lang] = (langMap[lang] || 0) + bytes;
        totalBytes += bytes;
      }
    })
  );

  const langSvgName = generateLanguagesSvg(langMap, totalBytes);
  const languagesMd = langSvgName ? `<p align="center">\n  <img src="./assets/${langSvgName}?v=${cacheBuster}" width="820" alt="Language Metrics" />\n</p>` : '_No metrics available._';

  if (!fs.existsSync(README_PATH)) {
    console.error('Error: README.md does not exist.');
    process.exit(1);
  }

  let content = fs.readFileSync(README_PATH, 'utf-8');
  content = replaceSection(content, PROJECT_START, PROJECT_END, projectsMd);
  content = replaceSection(content, LANG_START, LANG_END, languagesMd);

  fs.writeFileSync(README_PATH, content, 'utf-8');
  console.log('Successfully generated DIY custom SVGs and updated README.md.');
}

main();
