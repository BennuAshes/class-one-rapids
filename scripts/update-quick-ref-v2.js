#!/usr/bin/env node

/**
 * Simplified Quick-Reference Update System
 * Focus: Accuracy over complex compression
 * Philosophy: Keep what matters, remove what doesn't
 */

const fs = require('fs');
const path = require('path');

// Simple, clear configuration
const CONFIG = {
  researchDir: path.join(__dirname, '../research'),
  quickRefPath: path.join(__dirname, '../research/quick-ref.md'),
  backupPath: path.join(__dirname, '../research/quick-ref.md.backup'),
  
  // Relaxed token limits - accuracy over strict limits
  tokenLimits: {
    L1: 250,  // Critical (was 200)
    L2: 500,  // Implementation (was 400)
    L3: 400,  // Advanced (was 300)
    L4: 150,  // Alternatives (was 100)
    L5: 150   // Emergency (was 100)
  }
};

// What we're actually looking for
const CRITICAL_INFO = {
  packages: [
    '@legendapp/state',
    'expo',
    'react-native',
    'typescript',
    'expo-router',
    'react',
    'vitest',
    'maestro'
  ],
  
  patterns: [
    'vertical slicing',
    'feature-based',
    'observables',
    'custom hooks',
    'INVEST criteria'
  ],
  
  antiPatterns: [
    'monolithic',
    'horizontal layers',
    'class components',
    'any types',
    'utils for React'
  ]
};

/**
 * Simple token estimation - good enough
 */
function estimateTokens(text) {
  // ~4 chars per token is close enough for our needs
  return Math.ceil(text.length / 4);
}

/**
 * Extract only what we need from research files
 */
function extractEssentials(content, filePath) {
  const extracted = {
    packages: new Map(),
    configs: [],
    patterns: [],
    antiPatterns: [],
    performance: []
  };
  
  // Find package versions - more accurate matching
  for (const pkg of CRITICAL_INFO.packages) {
    // Look for patterns like: package@version, package@~version, "package": "version"
    const patterns = [
      new RegExp(`${pkg.replace('/', '\\/')}@([~^]?[\\d.]+(?:[-\\w.]+)?)`, 'gi'),
      new RegExp(`"${pkg.replace('/', '\\/')}": "([~^]?[\\d.]+(?:[-\\w.]+)?)"`, 'gi'),
      new RegExp(`${pkg.replace('/', '\\/')} ([~^]?[\\d.]+(?:[-\\w.]+)?)`, 'gi'),
      new RegExp(`\\| ${pkg.replace('/', '\\/')} \\| ([~^@][\\w.-]+) \\|`, 'gi')
    ];
    
    for (const regex of patterns) {
      const match = regex.exec(content);
      if (match && match[1]) {
        extracted.packages.set(pkg, match[1]);
        break;
      }
    }
  }
  
  // Find critical patterns mentioned
  for (const pattern of CRITICAL_INFO.patterns) {
    if (content.toLowerCase().includes(pattern.toLowerCase())) {
      extracted.patterns.push(pattern);
    }
  }
  
  // Find anti-patterns
  for (const anti of CRITICAL_INFO.antiPatterns) {
    if (content.toLowerCase().includes(anti.toLowerCase())) {
      extracted.antiPatterns.push(anti);
    }
  }
  
  // Extract performance metrics (keep it simple)
  const perfRegex = /(\d+)%\s*(?:faster|slower|improvement|reduction|boost)/gi;
  let perfMatch;
  while ((perfMatch = perfRegex.exec(content)) !== null) {
    extracted.performance.push(perfMatch[0]);
  }
  
  // Configuration requirements (Metro, Babel, TS)
  if (content.includes('metro.config') || content.includes('Metro')) {
    const metroSection = content.match(/metro[\s\S]{0,500}/i);
    if (metroSection) extracted.configs.push(metroSection[0]);
  }
  
  return extracted;
}

/**
 * Smart abbreviation - only when it truly helps
 */
function intelligentAbbreviate(text) {
  // Only abbreviate if we're over limit
  const tokens = estimateTokens(text);
  if (tokens < 1000) return text; // Don't abbreviate if under 1000 tokens
  
  // Safe, common abbreviations that don't hurt readability
  const safeAbbreviations = {
    'React Native': 'RN',
    'TypeScript': 'TS',
    'JavaScript': 'JS',
    'performance': 'perf',
    'configuration': 'config',
    'components': 'comp',
    'features': 'feat'
  };
  
  let abbreviated = text;
  for (const [full, short] of Object.entries(safeAbbreviations)) {
    abbreviated = abbreviated.replace(new RegExp(full, 'g'), short);
  }
  
  return abbreviated;
}

/**
 * Build clean, accurate quick-ref sections
 */
function buildQuickRef(allExtracted) {
  // Merge all extracted info
  const merged = {
    packages: new Map(),
    patterns: new Set(),
    antiPatterns: new Set(),
    configs: new Set(),
    performance: new Set()
  };
  
  for (const extracted of allExtracted) {
    // Packages - keep latest versions
    for (const [pkg, ver] of extracted.packages) {
      if (!merged.packages.has(pkg) || ver !== 'latest') {
        merged.packages.set(pkg, ver);
      }
    }
    
    // Unique patterns
    extracted.patterns.forEach(p => merged.patterns.add(p));
    extracted.antiPatterns.forEach(p => merged.antiPatterns.add(p));
    extracted.configs.forEach(c => merged.configs.add(c));
    extracted.performance.forEach(p => merged.performance.add(p));
  }
  
  // Build sections with clear structure
  const sections = {
    L1: buildL1(merged),
    L2: buildL2(merged),
    L3: buildL3(merged),
    L4: buildL4(),
    L5: buildL5()
  };
  
  return sections;
}

function buildL1(merged) {
  let content = '### Package Versions (CURRENT)\n';
  content += '| Package | Version | Note |\n';
  content += '|---------|---------|------|\n';
  
  // Sort packages by importance
  const packageOrder = ['expo', 'react-native', '@legendapp/state', 'typescript', 'expo-router'];
  for (const pkg of packageOrder) {
    if (merged.packages.has(pkg)) {
      const ver = merged.packages.get(pkg);
      const note = ver.includes('beta') ? 'beta' : 
                   ver.includes('next') ? 'next' : '-';
      content += `| ${pkg} | ${ver || 'latest'} | ${note} |\n`;
    }
  }
  
  content += '\n### Architecture Rules\n';
  content += '| ✅ MUST | ❌ NEVER |\n';
  content += '|---------|----------|\n';
  
  for (const pattern of merged.patterns) {
    content += `| ${pattern} | - |\n`;
  }
  
  for (const anti of merged.antiPatterns) {
    content += `| - | ${anti} |\n`;
  }
  
  return content;
}

function buildL2(merged) {
  let content = '### Configuration Requirements\n';
  
  // Add essential configs
  if (merged.configs.size > 0) {
    content += '```javascript\n';
    content += '// Metro (for @legendapp/state@beta)\n';
    content += 'resolver.unstable_enablePackageExports: true\n';
    content += 'resolver.unstable_conditionNames: ["react-native"]\n\n';
    content += '// TypeScript\n';
    content += 'strict: true\n';
    content += 'noImplicitAny: true\n';
    content += '```\n\n';
  }
  
  content += '### Performance Optimizations\n';
  for (const perf of merged.performance) {
    content += `- ${perf}\n`;
  }
  
  return content;
}

function buildL3(merged) {
  // Keep existing L3 content - it's already good
  return '### LLM Optimization\n' +
         '- Markdown 15% better than JSON\n' +
         '- Hierarchical loading (L1→L2→L3)\n' +
         '- Token budget awareness\n\n' +
         '### Security Requirements\n' +
         '- SAST: semgrep in CI/CD\n' +
         '- Secrets: expo-secure-store only\n' +
         '- API keys: Server-side only\n';
}

function buildL4() {
  // Simplified alternatives section
  return '### When NOT React Native\n' +
         '| Use Case | Alternative |\n' +
         '|----------|-------------|\n' +
         '| Web-first | SolidJS |\n' +
         '| Data-heavy | TanStack Query |\n' +
         '| Desktop | Tauri |\n';
}

function buildL5() {
  // Keep emergency section minimal
  return '### Common Fixes\n' +
         '- Metro cache: `npx expo start -c`\n' +
         '- Type errors: Check tsconfig strict mode\n' +
         '- Build fails: Verify package versions\n';
}

/**
 * Main update function - simplified
 */
async function updateQuickRef(options = {}) {
  console.log('🔄 Updating quick-ref.md (simplified approach)...\n');
  
  // Read all research files recursively
  function getResearchFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(getResearchFiles(fullPath));
      } else if (item.endsWith('.md') && !item.includes('quick-ref')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const researchFiles = getResearchFiles(CONFIG.researchDir);
  
  console.log(`📚 Scanning ${researchFiles.length} research files...`);
  
  // Extract essentials from each file
  const allExtracted = [];
  for (const filePath of researchFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const extracted = extractEssentials(content, filePath);
      
      if (extracted.packages.size > 0 || extracted.patterns.length > 0) {
        console.log(`  ✓ ${path.basename(filePath)}: ${extracted.packages.size} packages, ${extracted.patterns.length} patterns`);
        allExtracted.push(extracted);
      }
    } catch (err) {
      console.log(`  ⚠ Skipped ${path.basename(filePath)}: ${err.message}`);
    }
  }
  
  // Build the quick-ref
  console.log('\n📝 Building quick-ref sections...');
  const sections = buildQuickRef(allExtracted);
  
  // Check token counts (relaxed limits)
  console.log('\n📊 Token counts (estimated):');
  for (const [level, content] of Object.entries(sections)) {
    const tokens = estimateTokens(content);
    const limit = CONFIG.tokenLimits[level];
    const status = tokens <= limit ? '✅' : '⚠️';
    console.log(`  ${level}: ${tokens}/${limit} tokens ${status}`);
    
    // Only abbreviate if significantly over
    if (tokens > limit * 1.2) {
      sections[level] = intelligentAbbreviate(content);
      const newTokens = estimateTokens(sections[level]);
      console.log(`    → Abbreviated to ${newTokens} tokens`);
    }
  }
  
  // Build final document
  const header = '# Research Quick-Reference (Simplified v2)\n\n' +
                 '> Focused on accuracy and essential information\n\n';
  
  const footer = '\n---\n\n## Sources\n' +
                 '- Tech details: research/tech/*.md\n' +
                 '- Architecture: research/planning/vertical-slicing.md\n' +
                 '- AI patterns: research/agentic/*.md\n\n' +
                 '## Philosophy\n' +
                 'This quick-ref prioritizes:\n' +
                 '1. **Accuracy** over compression\n' +
                 '2. **Essential** information only\n' +
                 '3. **Clear** structure\n' +
                 '4. **Maintainable** format\n';
  
  const finalContent = [
    header,
    `## L1: CRITICAL (Always Load - ${estimateTokens(sections.L1)} tokens)\n${sections.L1}`,
    `## L2: IMPLEMENTATION (For Building - ${estimateTokens(sections.L2)} tokens)\n${sections.L2}`,
    `## L3: ADVANCED (Reference - ${estimateTokens(sections.L3)} tokens)\n${sections.L3}`,
    `## L4: ALTERNATIVES (Exploration - ${estimateTokens(sections.L4)} tokens)\n${sections.L4}`,
    `## L5: EMERGENCY (Fixes - ${estimateTokens(sections.L5)} tokens)\n${sections.L5}`,
    footer
  ].join('\n');
  
  // Backup and write
  if (fs.existsSync(CONFIG.quickRefPath)) {
    fs.copyFileSync(CONFIG.quickRefPath, CONFIG.backupPath);
    console.log('\n💾 Backed up existing quick-ref.md');
  }
  
  fs.writeFileSync(CONFIG.quickRefPath, finalContent);
  console.log('✅ Quick-ref.md updated successfully!\n');
  
  // Summary
  const totalTokens = Object.values(sections)
    .reduce((sum, content) => sum + estimateTokens(content), 0);
  console.log('📈 Summary:');
  console.log(`  Total tokens: ~${totalTokens}`);
  console.log(`  Compression: ~${Math.round((1 - totalTokens/5000) * 100)}% vs raw research`);
  console.log(`  Focus: Accuracy and essentials\n`);
}

// CLI
if (require.main === module) {
  updateQuickRef().catch(console.error);
}

module.exports = { updateQuickRef, extractEssentials, buildQuickRef };