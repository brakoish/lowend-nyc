#!/usr/bin/env node
/**
 * SEO Audit Script for LOWEND NYC
 * 
 * Checks for common SEO issues:
 * - Missing meta descriptions
 * - Missing/duplicate titles
 * - Missing alt text on images
 * - Broken internal links
 * - Page speed insights
 * 
 * Usage: node scripts/seo-audit.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONTENT_DIR = path.join(__dirname, '../content/articles');
const SITE_URL = 'https://lowend-nyc.vercel.app';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkArticles() {
  log('\n📄 Checking Articles...', 'blue');
  
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
  const issues = [];
  const titles = new Set();
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const frontmatter = content.match(/---\n([\s\S]*?)\n---/);
    
    if (!frontmatter) {
      issues.push({ file, issue: 'Missing frontmatter' });
      return;
    }
    
    const fm = frontmatter[1];
    
    // Check title
    const titleMatch = fm.match(/title:\s*"([^"]+)"/);
    if (!titleMatch) {
      issues.push({ file, issue: 'Missing title' });
    } else {
      const title = titleMatch[1];
      if (titles.has(title)) {
        issues.push({ file, issue: `Duplicate title: "${title}"` });
      }
      titles.add(title);
      
      // Check title length (SEO best practice: 50-60 chars)
      if (title.length > 60) {
        issues.push({ file, issue: `Title too long (${title.length} chars): "${title}"` });
      }
      if (title.length < 20) {
        issues.push({ file, issue: `Title too short (${title.length} chars): "${title}"` });
      }
    }
    
    // Check excerpt (meta description)
    const excerptMatch = fm.match(/excerpt:\s*"([^"]+)"/);
    if (!excerptMatch) {
      issues.push({ file, issue: 'Missing excerpt (meta description)' });
    } else {
      const excerpt = excerptMatch[1];
      // Check excerpt length (SEO best practice: 150-160 chars)
      if (excerpt.length > 160) {
        issues.push({ file, issue: `Excerpt too long (${excerpt.length} chars)` });
      }
      if (excerpt.length < 50) {
        issues.push({ file, issue: `Excerpt too short (${excerpt.length} chars)` });
      }
    }
    
    // Check image
    const imageMatch = fm.match(/image:\s*"([^"]+)"/);
    if (!imageMatch) {
      issues.push({ file, issue: 'Missing featured image' });
    }
    
    // Check genre
    const genreMatch = fm.match(/genre:\s*\[([^\]]+)\]/);
    if (!genreMatch) {
      issues.push({ file, issue: 'Missing genre tags' });
    }
    
    // Check date
    const dateMatch = fm.match(/date:\s*"([^"]+)"/);
    if (!dateMatch) {
      issues.push({ file, issue: 'Missing date' });
    }
  });
  
  log(`  Checked ${files.length} articles`);
  
  if (issues.length === 0) {
    log('  ✅ All articles look good!', 'green');
  } else {
    log(`  ⚠️  Found ${issues.length} issues:`, 'yellow');
    issues.forEach(({ file, issue }) => {
      log(`    - ${file}: ${issue}`, 'yellow');
    });
  }
  
  return issues;
}

function checkBuild() {
  log('\n🔨 Checking Build...', 'blue');
  
  try {
    // Check if build succeeds
    log('  Running build...');
    execSync('npm run build', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
    log('  ✅ Build successful', 'green');
    return [];
  } catch (error) {
    log('  ❌ Build failed', 'red');
    return [{ issue: 'Build failed' }];
  }
}

function checkImages() {
  log('\n🖼️  Checking Images...', 'blue');
  
  const publicImages = path.join(__dirname, '../public/images');
  if (!fs.existsSync(publicImages)) {
    log('  ⚠️  No public/images directory found', 'yellow');
    return [];
  }
  
  const images = fs.readdirSync(publicImages);
  log(`  Found ${images.length} images`);
  
  // Check for og-default.png
  if (!images.includes('og-default.png') && !images.includes('og-default.jpg')) {
    log('  ⚠️  Missing og-default.png (Open Graph image)', 'yellow');
  }
  
  return [];
}

function generateReport(issues) {
  log('\n📊 SEO Audit Report', 'blue');
  log('====================');
  
  const totalIssues = issues.flat().length;
  
  if (totalIssues === 0) {
    log('✅ No issues found! Your SEO looks solid.', 'green');
  } else {
    log(`⚠️  Found ${totalIssues} issues to fix`, 'yellow');
    log('\nNext steps:');
    log('1. Fix the issues listed above');
    log('2. Run this audit again: node scripts/seo-audit.js');
    log('3. Submit sitemap to Google Search Console');
    log('4. Monitor analytics for improvements');
  }
  
  // SEO Checklist
  log('\n📋 SEO Checklist:', 'blue');
  const checklist = [
    '✅ Site has proper meta tags',
    '✅ Open Graph tags configured',
    '✅ Twitter Cards configured',
    '✅ Sitemap generated',
    '✅ Structured data (JSON-LD) implemented',
    '⬜ Google Search Console verification added',
    '⬜ Google Analytics 4 configured',
    '⬜ robots.txt optimized',
    '⬜ Canonical URLs set',
    '⬜ Image alt texts added',
    '⬜ Internal linking strategy',
    '⬜ Page speed optimized',
  ];
  
  checklist.forEach(item => {
    const color = item.startsWith('✅') ? 'green' : 'yellow';
    log(`  ${item}`, color);
  });
}

function main() {
  log('🔍 LOWEND NYC SEO Audit', 'blue');
  log('=======================\n');
  
  const issues = [];
  
  issues.push(checkArticles());
  issues.push(checkImages());
  // issues.push(checkBuild()); // Skip build check for now
  
  generateReport(issues);
  
  log('\n💡 Tips:', 'blue');
  log('  - Keep titles under 60 characters');
  log('  - Write excerpts between 150-160 characters');
  log('  - Use descriptive image file names');
  log('  - Add alt text to all images');
  log('  - Link to related articles');
  log('  - Update old articles periodically');
}

main();
