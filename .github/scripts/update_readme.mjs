/**
 * Automated README Update Script for GitHub Actions (Node.js runtime).
 * Fetches latest repositories and language distributions directly via GitHub API
 * and dynamically injects 100% native Markdown tables and ASCII bar charts.
 * Guaranteed zero downtime and zero broken images.
 */

import fs from 'node:fs';
import path from 'node:path';

const USERNAME = 'muhananaufal';
const API_URL = `https://api.github.com/users/${USERNAME}/repos?sort=updated&direction=desc&per_page=30`;
const README_PATH = path.resolve('README.md');

const PROJECT_START = '<!-- START_SECTION:latest_projects -->';
const PROJECT_END = '<!-- END_SECTION:latest_projects -->';
const LANG_START = '<!-- START_SECTION:language_stats -->';
const LANG_END = '<!-- END_SECTION:language_stats -->';

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

function generateProjectsMarkdown(repos) {
  const validRepos = repos
    .filter(r => r.name.toLowerCase() !== USERNAME.toLowerCase() && !r.archived && !r.private)
    .slice(0, 4);

  if (validRepos.length === 0) return '_No active repositories found._';

  const header = [
    '| Repository & Direct Link | Primary Tech | Overview & Scope | Last Active |',
    '| :--- | :---: | :--- | :---: |'
  ];

  const rows = validRepos.map(repo => {
    const name = repo.name;
    const url = repo.html_url;
    const lang = repo.language ? `\`${repo.language}\`` : '`Config`';
    let desc = repo.description || repo.homepage || '*Core engineering and system codebase*';
    if (desc.length > 75) desc = desc.slice(0, 72) + '...';

    const updatedAt = new Date(repo.updated_at);
    const dateStr = updatedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return `| **[${name}](${url})** | ${lang} | ${desc} | ${dateStr} |`;
  });

  return [...header, ...rows].join('\n');
}

function generateLanguagesMarkdown(langMap, totalBytes) {
  if (totalBytes === 0) return '```text\nNo language activity detected.\n```';

  const sortedLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]);
  const maxNameLen = Math.max(...sortedLangs.slice(0, 6).map(([lang]) => lang.length), 10);

  const lines = ['```text'];
  for (const [lang, bytes] of sortedLangs.slice(0, 6)) {
    const percent = ((bytes / totalBytes) * 100).toFixed(1);
    const barWidth = 22;
    const filled = Math.round((bytes / totalBytes) * barWidth);
    const empty = Math.max(0, barWidth - filled);
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const paddedName = lang.padEnd(maxNameLen, ' ');
    const paddedPercent = `${percent}%`.padStart(6, ' ');
    lines.push(`${paddedName} │ ${bar} │ ${paddedPercent}`);
  }
  lines.push('```');
  return lines.join('\n');
}

function replaceSection(content, startTag, endTag, newContent) {
  const startIdx = content.indexOf(startTag);
  const endIdx = content.indexOf(endTag);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    console.error(`Error: Markers ${startTag} ... ${endTag} malformed or missing in README.md.`);
    return content;
  }

  const prefix = content.slice(0, startIdx + startTag.length);
  const suffix = content.slice(endIdx);
  return `${prefix}\n${newContent}\n${suffix}`;
}

async function main() {
  console.log(`Starting failure-proof metrics update for @${USERNAME}...`);
  const repos = await fetchRepos();
  if (!repos || repos.length === 0) {
    console.error('Aborting: Could not retrieve repositories.');
    process.exit(1);
  }

  // 1. Generate Projects Section
  const projectsMd = generateProjectsMarkdown(repos);

  // 2. Generate Languages Section
  const langMap = {};
  let totalBytes = 0;
  const validRepos = repos.filter(r => r.name.toLowerCase() !== USERNAME.toLowerCase() && !r.archived && !r.private);
  
  await Promise.all(
    validRepos.map(async (repo) => {
      const langs = await fetchLanguages(repo.name);
      for (const [lang, bytes] of Object.entries(langs)) {
        langMap[lang] = (langMap[lang] || 0) + bytes;
        totalBytes += bytes;
      }
    })
  );

  const languagesMd = generateLanguagesMarkdown(langMap, totalBytes);

  if (!fs.existsSync(README_PATH)) {
    console.error(`Error: ${README_PATH} does not exist.`);
    process.exit(1);
  }

  let content = fs.readFileSync(README_PATH, 'utf-8');
  content = replaceSection(content, PROJECT_START, PROJECT_END, projectsMd);
  content = replaceSection(content, LANG_START, LANG_END, languagesMd);

  const oldContent = fs.readFileSync(README_PATH, 'utf-8');
  if (oldContent === content) {
    console.log('README is already up to date. Working tree is clean.');
    return;
  }

  fs.writeFileSync(README_PATH, content, 'utf-8');
  console.log('Successfully updated README.md with native Markdown tables and language bars.');
}

main();
