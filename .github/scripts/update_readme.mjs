/**
 * Automated README Update Script for GitHub Actions (Node.js runtime).
 * Fetches the latest updated repositories for @muhananaufal from GitHub API
 * and dynamically injects minimalist repository pin cards into README.md.
 */

import fs from 'node:fs';
import path from 'node:path';

const USERNAME = 'muhananaufal';
const API_URL = `https://api.github.com/users/${USERNAME}/repos?sort=updated&direction=desc&per_page=30`;
const README_PATH = path.resolve('README.md');
const START_COMMENT = '<!-- START_SECTION:latest_projects -->';
const END_COMMENT = '<!-- END_SECTION:latest_projects -->';

async function fetchLatestRepos() {
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

function generateProjectsMarkdown(repos) {
  const validRepos = [];
  for (const repo of repos) {
    if (repo.name.toLowerCase() === USERNAME.toLowerCase()) {
      continue; // Skip profile repository itself
    }
    if (repo.archived || repo.private) {
      continue;
    }
    validRepos.push(repo);
    if (validRepos.length >= 4) {
      break;
    }
  }

  if (validRepos.length === 0) {
    console.error('No valid repositories found to display.');
    return '';
  }

  const lines = [];
  // Group into rows of 2 for clean horizontal layout
  for (let i = 0; i < validRepos.length; i += 2) {
    const chunk = validRepos.slice(i, i + 2);
    const rowContent = ['<p align="left">'];
    for (const repo of chunk) {
      const name = repo.name;
      const url = repo.html_url;
      const cardUrl = `https://github-readme-stats.vercel.app/api/pin/?username=${USERNAME}&repo=${name}&theme=transparent&hide_border=true`;
      rowContent.push(`  <a href="${url}">\n    <img src="${cardUrl}" alt="${name}" />\n  </a>`);
    }
    rowContent.push('</p>');
    lines.push(rowContent.join('\n'));
  }

  return lines.join('\n');
}

function updateReadme(newContent) {
  if (!fs.existsSync(README_PATH)) {
    console.error(`Error: ${README_PATH} does not exist in current working directory.`);
    return false;
  }

  const content = fs.readFileSync(README_PATH, 'utf-8');
  const startIndex = content.indexOf(START_COMMENT);
  const endIndex = content.indexOf(END_COMMENT);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    console.error(`Error: Section markers ${START_COMMENT} ... ${END_COMMENT} not found or malformed in README.md.`);
    return false;
  }

  const prefix = content.slice(0, startIndex + START_COMMENT.length);
  const suffix = content.slice(endIndex);
  const updatedContent = `${prefix}\n${newContent}\n${suffix}`;

  if (content === updatedContent) {
    console.log('README is already up to date. No changes required.');
    return true;
  }

  fs.writeFileSync(README_PATH, updatedContent, 'utf-8');
  console.log('Successfully updated README.md with latest repositories.');
  return true;
}

async function main() {
  console.log(`Starting latest repositories update for @${USERNAME}...`);
  const repos = await fetchLatestRepos();
  if (!repos || repos.length === 0) {
    console.error('Aborting: Could not retrieve repositories.');
    process.exit(1);
  }

  const markdown = generateProjectsMarkdown(repos);
  if (!markdown) {
    console.error('Aborting: Generated markdown is empty.');
    process.exit(1);
  }

  const success = updateReadme(markdown);
  if (!success) {
    process.exit(1);
  }
}

main();
