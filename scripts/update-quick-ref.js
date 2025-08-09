#!/usr/bin/env node

/**
 * Automatic Quick-Reference Update System
 * Monitors research files and intelligently updates quick-ref.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  researchDir: path.join(__dirname, '../research'),
  quickRefPath: path.join(__dirname, '../research/quick-ref.md'),
  cacheFile: path.join(__dirname, '.quick-ref-cache.json'),
  tokenLimits: {
    L1: 200,
    L2: 400,
    L3: 300,
    L4: 100,
    L5: 100
  }
};

// Pattern definitions for extraction
const PATTERNS = {
  packages: {
    // Matches: @scope/package@version or package@version
    regex: /(?:^|\s)((?:@[\w-]+\/)?[\w-]+)(?:@([~^]?[\d.]+(?:[-.\w]+)?))?\b/gm,
    category: 'L1'
  },
  architecture: {
    // Matches: features/, src/, components/ patterns
    regex: /\b(features?\/\*?(?:\/\w+)*|src\/\w+|components?\/)/gm,
    category: 'L1'
  },
  performance: {
    // Matches: X% performance/faster/slower
    regex: /(\d+)%\s*(?:performance|faster|slower|improvement|reduction|boost)/gi,
    category: 'L2'
  },
  configuration: {
    // Matches: config blocks, tsconfig, babel, metro
    regex: /(?:tsconfig|babel|metro|webpack)\.(?:config\.)?(?:js|json)/gi,
    category: 'L2'
  },
  antiPatterns: {
    // Matches: don't, never, avoid, anti-pattern
    regex: /(?:don't|never|avoid|anti-pattern|bad practice|deprecated)/gi,
    category: 'L1'
  }
};

/**
 * Extract semantic information from research file changes
 */
function extractSemanticInfo(content, filePath) {
  const extracted = {
    packages: new Map(),
    architecture: new Set(),
    performance: [],
    configuration: new Set(),
    antiPatterns: []
  };

  // Extract packages with versions
  let match;
  while ((match = PATTERNS.packages.regex.exec(content)) !== null) {
    const [, packageName, version] = match;
    if (packageName && !packageName.includes('/')) {
      // Filter out path-like matches
      if (version || packageName.startsWith('@')) {
        extracted.packages.set(packageName, version || 'latest');
      }
    }
  }

  // Extract architecture patterns
  while ((match = PATTERNS.architecture.regex.exec(content)) !== null) {
    extracted.architecture.add(match[1]);
  }

  // Extract performance metrics
  while ((match = PATTERNS.performance.regex.exec(content)) !== null) {
    extracted.performance.push(match[0]);
  }

  // Track source file
  extracted.source = path.relative(CONFIG.researchDir, filePath);

  return extracted;
}

/**
 * Calculate token count (rough estimation)
 * More accurate would use tiktoken, but this is sufficient for our needs
 */
function estimateTokens(text) {
  // Rough estimation: ~4 characters per token on average
  return Math.ceil(text.length / 4);
}

/**
 * Parse quick-ref.md into sections
 */
function parseQuickRef(content) {
  const sections = {
    L1: '',
    L2: '',
    L3: '',
    L4: '',
    L5: '',
    footer: ''
  };

  const sectionRegex = /## L(\d): [\w\s]+(?:\([\w\s-]+\))?/g;
  const parts = content.split(sectionRegex);
  
  let currentLevel = null;
  for (let i = 0; i < parts.length; i++) {
    if (/^\d$/.test(parts[i])) {
      currentLevel = `L${parts[i]}`;
    } else if (currentLevel && sections[currentLevel] !== undefined) {
      sections[currentLevel] = parts[i];
    }
  }

  // Extract footer (everything after the last L section)
  const footerMatch = content.match(/---\n\n## Research Sources[\s\S]*$/);
  if (footerMatch) {
    sections.footer = footerMatch[0];
  }

  return sections;
}

/**
 * Merge new information into appropriate L-level
 */
function mergeIntoSection(sections, newInfo) {
  // Update package versions in L1
  if (newInfo.packages.size > 0) {
    const packageTable = Array.from(newInfo.packages.entries())
      .map(([pkg, ver]) => `| ${pkg} | ${ver} | auto-updated |`)
      .join('\n');
    
    // Find and update package table in L1
    const tableRegex = /\| Package \| Version \| Critical Note \|[\s\S]*?\n(?=\n|###)/;
    if (tableRegex.test(sections.L1)) {
      // Merge with existing table
      sections.L1 = sections.L1.replace(tableRegex, (match) => {
        const existingRows = match.split('\n').filter(row => row.includes('|'));
        const header = existingRows.slice(0, 2); // Keep header and separator
        const body = existingRows.slice(2);
        
        // Merge logic: Update existing, add new
        const merged = new Map();
        body.forEach(row => {
          const parts = row.split('|').map(p => p.trim());
          if (parts[1]) merged.set(parts[1], row);
        });
        
        // Update with new versions
        newInfo.packages.forEach((ver, pkg) => {
          const note = ver.includes('beta') ? 'beta version' : 
                      ver.includes('next') ? 'next version' :
                      'updated';
          merged.set(pkg, `| ${pkg} | ${ver} | ${note} |`);
        });
        
        return [...header, ...Array.from(merged.values())].join('\n');
      });
    }
  }

  // Update architecture patterns in L1
  if (newInfo.architecture.size > 0) {
    const archPatterns = Array.from(newInfo.architecture)
      .map(pattern => {
        const isCorrect = pattern.startsWith('features/');
        return isCorrect ? 
          `| ${pattern} | - | ✅ |` :
          `| - | ${pattern} | mv to features |`;
      });
    
    // Update architecture table
    // ... similar merge logic
  }

  // Add performance metrics to L2
  if (newInfo.performance.length > 0) {
    const perfSection = '\n### Performance Updates\n' +
      newInfo.performance.map(p => `- ${p}`).join('\n');
    
    if (!sections.L2.includes('### Performance Updates')) {
      sections.L2 += perfSection;
    }
  }

  return sections;
}

/**
 * Validate token limits for each section
 */
function validateTokenLimits(sections) {
  const violations = [];
  
  for (const [level, content] of Object.entries(sections)) {
    if (level === 'footer') continue;
    
    const tokens = estimateTokens(content);
    const limit = CONFIG.tokenLimits[level];
    
    if (limit && tokens > limit) {
      violations.push({
        level,
        tokens,
        limit,
        excess: tokens - limit
      });
    }
  }
  
  return violations;
}

/**
 * Compress section if it exceeds token limit
 */
function compressSection(content, targetTokens) {
  // Strategy 1: Remove extra whitespace
  let compressed = content.replace(/\s+/g, ' ').trim();
  
  // Strategy 2: Abbreviate common terms
  const abbreviations = {
    'React Native': 'RN',
    'TypeScript': 'TS',
    'performance': 'perf',
    'configuration': 'config',
    'components': 'comp',
    'features': 'feat'
  };
  
  for (const [full, abbr] of Object.entries(abbreviations)) {
    compressed = compressed.replace(new RegExp(full, 'gi'), abbr);
  }
  
  // Strategy 3: Remove examples if still too long
  if (estimateTokens(compressed) > targetTokens) {
    compressed = compressed.replace(/```[\s\S]*?```/g, '');
  }
  
  return compressed;
}

/**
 * Generate hash of research files for change detection
 */
function generateResearchHash() {
  const researchFiles = fs.readdirSync(CONFIG.researchDir)
    .filter(f => f.endsWith('.md') && f !== 'quick-ref.md');
  
  const hashes = {};
  for (const file of researchFiles) {
    const filePath = path.join(CONFIG.researchDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    hashes[file] = crypto.createHash('md5').update(content).digest('hex');
  }
  
  return hashes;
}

/**
 * Detect which files changed since last update
 */
function detectChangedFiles() {
  const currentHashes = generateResearchHash();
  
  // Load cached hashes
  let cachedHashes = {};
  if (fs.existsSync(CONFIG.cacheFile)) {
    cachedHashes = JSON.parse(fs.readFileSync(CONFIG.cacheFile, 'utf8'));
  }
  
  const changed = [];
  for (const [file, hash] of Object.entries(currentHashes)) {
    if (cachedHashes[file] !== hash) {
      changed.push(path.join(CONFIG.researchDir, file));
    }
  }
  
  // Save current hashes
  fs.writeFileSync(CONFIG.cacheFile, JSON.stringify(currentHashes, null, 2));
  
  return changed;
}

/**
 * Main update function
 */
async function updateQuickRef(options = {}) {
  console.log('🔄 Starting quick-ref update process...');
  
  // Detect changed files
  const changedFiles = detectChangedFiles();
  if (changedFiles.length === 0 && !options.force) {
    console.log('✅ No changes detected in research files');
    return;
  }
  
  console.log(`📝 Processing ${changedFiles.length} changed files...`);
  
  // Extract semantic information from changed files
  const extractedInfo = [];
  for (const filePath of changedFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const info = extractSemanticInfo(content, filePath);
    extractedInfo.push(info);
    console.log(`  - Extracted from ${path.basename(filePath)}: ${info.packages.size} packages, ${info.architecture.size} patterns`);
  }
  
  // Read current quick-ref
  const currentContent = fs.readFileSync(CONFIG.quickRefPath, 'utf8');
  const sections = parseQuickRef(currentContent);
  
  // Merge new information
  for (const info of extractedInfo) {
    mergeIntoSection(sections, info);
  }
  
  // Validate token limits
  const violations = validateTokenLimits(sections);
  if (violations.length > 0) {
    console.warn('⚠️  Token limit violations detected:');
    for (const v of violations) {
      console.warn(`   ${v.level}: ${v.tokens} tokens (limit: ${v.limit})`);
      // Attempt compression
      sections[v.level] = compressSection(sections[v.level], v.limit);
    }
  }
  
  // Reconstruct quick-ref
  const newContent = [
    '# Research Quick-Reference (Ultimate Edition)',
    '',
    `## L1: CRITICAL (Always Load - ${estimateTokens(sections.L1)} tokens)`,
    sections.L1,
    `## L2: IMPLEMENTATION (Load for Tasks - ${estimateTokens(sections.L2)} tokens)`,
    sections.L2,
    `## L3: ADVANCED (Reference - ${estimateTokens(sections.L3)} tokens)`,
    sections.L3,
    `## L4: FRAMEWORK ALTERNATIVES (Deep Dive - ${estimateTokens(sections.L4)} tokens)`,
    sections.L4,
    `## L5: EMERGENCY FIXES (As Needed)`,
    sections.L5,
    sections.footer
  ].join('\n');
  
  // Backup current version
  const backupPath = CONFIG.quickRefPath + '.backup';
  fs.copyFileSync(CONFIG.quickRefPath, backupPath);
  
  // Write updated quick-ref
  fs.writeFileSync(CONFIG.quickRefPath, newContent);
  
  // Validate the update
  if (options.validate) {
    try {
      execSync(`node ${path.join(__dirname, 'validate-quick-ref.js')}`, { stdio: 'inherit' });
      console.log('✅ Quick-ref updated and validated successfully!');
    } catch (error) {
      console.error('❌ Validation failed, rolling back...');
      fs.copyFileSync(backupPath, CONFIG.quickRefPath);
      throw error;
    }
  } else {
    console.log('✅ Quick-ref updated successfully!');
  }
  
  // Show summary
  console.log('\n📊 Update Summary:');
  console.log(`  - Files processed: ${changedFiles.length}`);
  console.log(`  - L1 tokens: ${estimateTokens(sections.L1)}`);
  console.log(`  - L2 tokens: ${estimateTokens(sections.L2)}`);
  console.log(`  - Total tokens (L1+L2): ${estimateTokens(sections.L1) + estimateTokens(sections.L2)}`);
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    validate: args.includes('--validate'),
    force: args.includes('--force'),
    background: args.includes('--background')
  };
  
  updateQuickRef(options).catch(console.error);
}

module.exports = { updateQuickRef, extractSemanticInfo, validateTokenLimits };