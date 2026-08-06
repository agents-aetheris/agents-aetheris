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

function generateRepoSvg(repo, index) {
  const name = escapeXml(repo.name);
  const rawDesc = repo.description || repo.homepage || 'Core system engineering and cloud infrastructure architecture codebase.';
  const desc = escapeXml(rawDesc.length > 80 ? rawDesc.slice(0, 77) + '...' : rawDesc);
  
  // Word wrap description to 2 lines max
  const words = desc.split(' ');
  let line1 = '';
  let line2 = '';
  for (const word of words) {
    if ((line1 + ' ' + word).length < 42 && !line2) {
      line1 += (line1 ? ' ' : '') + word;
    } else if ((line2 + ' ' + word).length < 40) {
      line2 += (line2 ? ' ' : '') + word;
    } else if (!line2.endsWith('...')) {
      line2 += '...';
      break;
    }
  }

  const lang = repo.language || 'Config';
  const color = LANG_COLORS[lang] || LANG_COLORS.Default;
  const stars = repo.stargazers_count || 0;
  const updatedAt = new Date(repo.updated_at);
  const dateStr = updatedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const svg = `<svg width="410" height="135" viewBox="0 0 410 135" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGlow_${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#161b22" />
      <stop offset="100%" stop-color="#0d1117" />
    </linearGradient>
    <linearGradient id="borderGlow_${index}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#58a6ff" />
      <stop offset="100%" stop-color="#00e676" />
    </linearGradient>
  </defs>
  <style>
    .title { font: 600 16px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #58a6ff; }
    .desc { font: 400 13px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #8b949e; }
    .meta { font: 500 12px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #c9d1d9; }
    .date { font: 400 11px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #6e7681; }
  </style>
  <rect x="1" y="1" width="408" height="133" rx="10" fill="url(#cardGlow_${index})" stroke="#30363d" stroke-width="1.5" />
  <path d="M 2 10 A 8 8 0 0 1 10 2 L 400 2 A 8 8 0 0 1 408 10 L 408 12 L 2 12 Z" fill="url(#borderGlow_${index})" opacity="0.8" />
  
  <!-- Repo Icon -->
  <path fill="none" stroke="#58a6ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M 22 36 L 27 31 L 34 31 L 34 43 L 22 43 Z" />
  
  <text x="42" y="40" class="title">${name}</text>
  
  <text x="22" y="68" class="desc">${line1}</text>
  ${line2 ? `<text x="22" y="86" class="desc">${line2}</text>` : ''}
  
  <circle cx="26" cy="113" r="5" fill="${color}" />
  <text x="36" y="117" class="meta">${escapeXml(lang)}</text>
  
  <text x="110" y="117" class="meta">★ ${stars}</text>
  <text x="388" y="117" text-anchor="end" class="date">Updated: ${dateStr}</text>
</svg>`;

  const fileName = `repo-${index}.svg`;
  fs.writeFileSync(path.join(ASSETS_DIR, fileName), svg, 'utf-8');
  return fileName;
}

function generateLanguagesSvg(langMap, totalBytes) {
  const sortedLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (totalBytes === 0) return '';

  let barSegments = '';
  let currentX = 20;
  const totalBarWidth = 780;

  for (const [lang, bytes] of sortedLangs) {
    const percent = bytes / totalBytes;
    const segWidth = Math.max(percent * totalBarWidth, 4);
    const color = LANG_COLORS[lang] || LANG_COLORS.Default;
    barSegments += `<rect x="${currentX}" y="52" width="${segWidth}" height="14" fill="${color}" />\n`;
    currentX += segWidth;
  }

  // Generate legend items (3 columns, 2 rows)
  let legendItems = '';
  sortedLangs.forEach(([lang, bytes], idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 30 + col * 270;
    const y = 100 + row * 40;
    const color = LANG_COLORS[lang] || LANG_COLORS.Default;
    const pct = ((bytes / totalBytes) * 100).toFixed(1);

    legendItems += `
    <circle cx="${x}" cy="${y - 4}" r="6" fill="${color}" />
    <text x="${x + 15}" y="${y}" class="langName">${escapeXml(lang)}</text>
    <text x="${x + 130}" y="${y}" class="langPct">${pct}%</text>`;
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
    .title { font: 700 18px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #ffffff; }
    .langName { font: 600 14px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #c9d1d9; }
    .langPct { font: 400 14px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: #8b949e; }
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

  const fileName = 'language-stats.svg';
  fs.writeFileSync(path.join(ASSETS_DIR, fileName), svg, 'utf-8');
  return fileName;
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

  let projectsMd = '<p align="center">\n';
  validRepos.forEach((repo, idx) => {
    const fileName = generateRepoSvg(repo, idx);
    projectsMd += `  <a href="${repo.html_url}"><img src="./assets/${fileName}" width="410" alt="${escapeXml(repo.name)}" /></a>\n`;
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
  const languagesMd = langSvgName ? `<p align="center">\n  <img src="./assets/${langSvgName}" width="820" alt="Language Metrics" />\n</p>` : '_No metrics available._';

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
