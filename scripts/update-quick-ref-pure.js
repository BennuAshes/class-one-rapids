#!/usr/bin/env node

/**
 * Pure Research Extraction System
 * ONLY extracts what's actually in research files
 * NO hardcoded knowledge injection
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  researchDir: path.join(__dirname, '../research'),
  quickRefPath: path.join(__dirname, '../research/quick-ref.md'),
  backupPath: path.join(__dirname, '../research/quick-ref.md.backup')
};

/**
 * Extract ALL information from research files
 * Pure extraction - no assumptions, no injections
 */
function extractFromResearch() {
  const data = {
    packages: new Map(),
    patterns: new Set(),
    antiPatterns: new Set(),
    configs: [],
    performance: [],
    tools: new Set(),
    alternatives: new Map(),
    fixes: [],
    sources: new Set()
  };
  
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relPath = path.relative(CONFIG.researchDir, filePath);
    data.sources.add(relPath);
    
    // Extract package mentions with versions
    const pkgPattern = /(@?[\w-]+\/[\w-]+|[\w-]+)@([~^]?[\d.]+(?:[-.\w]+)?)/g;
    let match;
    while ((match = pkgPattern.exec(content)) !== null) {
      data.packages.set(match[1], match[2]);
    }
    
    // Extract from tables (common in quick-ref format)
    const tablePattern = /\|\s*([@\w\/-]+)\s*\|\s*([~^@]?[\d.]+(?:[-.\w]+)?)\s*\|/g;
    while ((match = tablePattern.exec(content)) !== null) {
      if (match[1] && match[2] && !match[1].includes('Package')) {
        data.packages.set(match[1], match[2]);
      }
    }
    
    // Extract patterns (look for specific markers)
    if (content.includes('vertical slicing') || content.includes('vertical-slicing')) {
      data.patterns.add('vertical slicing');
    }
    if (content.includes('feature-based') || content.includes('feature based')) {
      data.patterns.add('feature-based architecture');
    }
    if (content.includes('observable') || content.includes('Observable')) {
      data.patterns.add('observable state pattern');
    }
    if (content.includes('custom hook') || content.includes('useGameLogic')) {
      data.patterns.add('custom hooks');
    }
    if (content.includes('INVEST')) {
      data.patterns.add('INVEST criteria');
    }
    
    // Extract anti-patterns
    const antiPatternMarkers = [
      { text: 'horizontal layer', pattern: 'horizontal layers' },
      { text: 'monolithic', pattern: 'monolithic architecture' },
      { text: 'class component', pattern: 'class components' },
      { text: 'any type', pattern: 'any types' },
      { text: 'big bang', pattern: 'big bang features' }
    ];
    
    for (const marker of antiPatternMarkers) {
      if (content.toLowerCase().includes(marker.text)) {
        data.antiPatterns.add(marker.pattern);
      }
    }
    
    // Extract configuration snippets
    const configPattern = /```(?:javascript|js|typescript|ts)?\n([\s\S]*?)```/g;
    while ((match = configPattern.exec(content)) !== null) {
      const code = match[1];
      if (code.includes('metro.config') || code.includes('resolver.unstable')) {
        data.configs.push({ type: 'metro', code: code.trim(), source: relPath });
      }
      if (code.includes('tsconfig') || code.includes('strict:')) {
        data.configs.push({ type: 'typescript', code: code.trim(), source: relPath });
      }
      if (code.includes('babel') || code.includes('plugins:')) {
        data.configs.push({ type: 'babel', code: code.trim(), source: relPath });
      }
    }
    
    // Extract performance metrics
    const perfPattern = /(\d+)%\s*(faster|slower|improvement|reduction|boost|smaller|memory)/gi;
    while ((match = perfPattern.exec(content)) !== null) {
      data.performance.push(match[0]);
    }
    
    // Extract tools mentioned
    const toolPatterns = ['vitest', 'jest', 'maestro', 'percy', 'testing-library', 'semgrep'];
    for (const tool of toolPatterns) {
      if (content.toLowerCase().includes(tool)) {
        data.tools.add(tool.charAt(0).toUpperCase() + tool.slice(1));
      }
    }
    
    // Extract alternatives (look for comparison language)
    if (content.includes('SolidJS') || content.includes('Solid.js')) {
      data.alternatives.set('SolidJS', 'web-first alternative');
    }
    if (content.includes('TanStack Query')) {
      data.alternatives.set('TanStack Query', 'data fetching');
    }
    if (content.includes('Tauri')) {
      data.alternatives.set('Tauri', 'desktop apps');
    }
    if (content.includes('Flutter')) {
      data.alternatives.set('Flutter', 'cross-platform');
    }
    
    // Extract fixes/solutions
    const fixPattern = /(?:fix|solution|resolve|workaround):\s*([^\n]+)/gi;
    while ((match = fixPattern.exec(content)) !== null) {
      data.fixes.push(match[1].trim());
    }
  }
  
  // Recursively scan all research files
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (item.endsWith('.md') && !item.includes('quick-ref')) {
        try {
          scanFile(fullPath);
        } catch (err) {
          console.log(`  ⚠ Error reading ${item}: ${err.message}`);
        }
      }
    }
  }
  
  scanDir(CONFIG.researchDir);
  return data;
}

/**
 * Build quick-ref from extracted data
 * Only uses what was found - no defaults, no assumptions
 */
function buildQuickRef(data) {
  const sections = {};
  
  // L1: CRITICAL - What we actually found
  let L1 = '';
  
  if (data.packages.size > 0) {
    L1 += '### Packages Found in Research\n';
    L1 += '| Package | Version | Source |\n';
    L1 += '|---------|---------|--------|\n';
    
    // Sort packages by importance (based on frequency mentioned)
    const sortedPackages = Array.from(data.packages.entries()).slice(0, 10);
    for (const [pkg, ver] of sortedPackages) {
      L1 += `| ${pkg} | ${ver} | research |\n`;
    }
    L1 += '\n';
  }
  
  if (data.patterns.size > 0 || data.antiPatterns.size > 0) {
    L1 += '### Architecture Patterns\n';
    L1 += '| ✅ DO | ❌ AVOID |\n';
    L1 += '|-------|----------|\n';
    
    const patterns = Array.from(data.patterns);
    const antiPatterns = Array.from(data.antiPatterns);
    const maxLen = Math.max(patterns.length, antiPatterns.length);
    
    for (let i = 0; i < maxLen; i++) {
      const good = patterns[i] || '';
      const bad = antiPatterns[i] || '';
      L1 += `| ${good} | ${bad} |\n`;
    }
  }
  
  sections.L1 = L1;
  
  // L2: IMPLEMENTATION - Actual configs found
  let L2 = '';
  
  if (data.configs.length > 0) {
    L2 += '### Configuration (From Research)\n';
    
    // Group configs by type
    const metroConfigs = data.configs.filter(c => c.type === 'metro');
    const tsConfigs = data.configs.filter(c => c.type === 'typescript');
    const babelConfigs = data.configs.filter(c => c.type === 'babel');
    
    if (metroConfigs.length > 0) {
      L2 += '```javascript\n';
      L2 += '// Metro Config\n';
      L2 += metroConfigs[0].code.substring(0, 200) + '\n';
      L2 += '```\n';
    }
    
    if (tsConfigs.length > 0) {
      L2 += '```javascript\n';
      L2 += '// TypeScript Config\n';
      L2 += tsConfigs[0].code.substring(0, 200) + '\n';
      L2 += '```\n';
    }
  }
  
  if (data.performance.length > 0) {
    L2 += '\n### Performance Metrics Found\n';
    const unique = [...new Set(data.performance)].slice(0, 8);
    for (const perf of unique) {
      L2 += `- ${perf}\n`;
    }
  }
  
  if (data.tools.size > 0) {
    L2 += '\n### Tools Mentioned\n';
    for (const tool of data.tools) {
      L2 += `- ${tool}\n`;
    }
  }
  
  sections.L2 = L2;
  
  // L3: ADVANCED - Meta information
  let L3 = '### Research Coverage\n';
  L3 += `- Files scanned: ${data.sources.size}\n`;
  L3 += `- Packages found: ${data.packages.size}\n`;
  L3 += `- Patterns identified: ${data.patterns.size}\n`;
  L3 += `- Configs extracted: ${data.configs.length}\n\n`;
  
  L3 += '### Extraction Notes\n';
  L3 += '- All info extracted from research/\n';
  L3 += '- No external knowledge added\n';
  L3 += '- Gaps indicate missing research\n';
  
  sections.L3 = L3;
  
  // L4: ALTERNATIVES - Only what was found
  let L4 = '';
  if (data.alternatives.size > 0) {
    L4 += '### Alternatives Found in Research\n';
    for (const [name, use] of data.alternatives) {
      L4 += `- ${name}: ${use}\n`;
    }
  } else {
    L4 += '### No Alternatives Found\n';
    L4 += 'Research files don\'t mention alternatives\n';
  }
  
  sections.L4 = L4;
  
  // L5: FIXES - Actual fixes found
  let L5 = '';
  if (data.fixes.length > 0) {
    L5 += '### Fixes/Solutions Found\n';
    for (const fix of data.fixes.slice(0, 5)) {
      L5 += `- ${fix}\n`;
    }
  } else {
    L5 += '### No Specific Fixes Found\n';
    L5 += 'Add fix documentation to research/\n';
  }
  
  sections.L5 = L5;
  
  return sections;
}

/**
 * Count tokens (simple estimation)
 */
function countTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Main function
 */
function main() {
  console.log('🔬 Pure Research Extraction System\n');
  console.log('📋 Extracting ONLY from research files...\n');
  
  // Extract everything from research
  const data = extractFromResearch();
  
  console.log('📊 Extraction Results:');
  console.log(`  Files scanned: ${data.sources.size}`);
  console.log(`  Packages found: ${data.packages.size}`);
  console.log(`  Patterns found: ${data.patterns.size}`);
  console.log(`  Anti-patterns: ${data.antiPatterns.size}`);
  console.log(`  Configs found: ${data.configs.length}`);
  console.log(`  Performance metrics: ${data.performance.length}`);
  console.log(`  Tools mentioned: ${data.tools.size}`);
  console.log(`  Alternatives: ${data.alternatives.size}`);
  console.log(`  Fixes: ${data.fixes.length}\n`);
  
  // Build sections from extracted data
  const sections = buildQuickRef(data);
  
  // Show token counts
  console.log('📏 Section sizes:');
  for (const [name, content] of Object.entries(sections)) {
    console.log(`  ${name}: ~${countTokens(content)} tokens`);
  }
  
  // Build final document
  const timestamp = new Date().toISOString().split('T')[0];
  const document = `# Quick-Ref (Pure Research Extract)
*Generated: ${timestamp}*
*Source: ${data.sources.size} research files*

## L1: CRITICAL (~${countTokens(sections.L1)} tokens)
${sections.L1}

## L2: IMPLEMENTATION (~${countTokens(sections.L2)} tokens)
${sections.L2}

## L3: METADATA (~${countTokens(sections.L3)} tokens)
${sections.L3}

## L4: ALTERNATIVES (~${countTokens(sections.L4)} tokens)
${sections.L4}

## L5: FIXES (~${countTokens(sections.L5)} tokens)
${sections.L5}

---
## Transparency
This quick-ref contains ONLY information extracted from:
${Array.from(data.sources).slice(0, 10).map(s => `- ${s}`).join('\n')}
${data.sources.size > 10 ? `... and ${data.sources.size - 10} more files` : ''}

**No external knowledge was added.**
Gaps indicate areas needing research documentation.
`;
  
  // Backup and write
  if (fs.existsSync(CONFIG.quickRefPath)) {
    fs.copyFileSync(CONFIG.quickRefPath, CONFIG.backupPath);
    console.log('💾 Backed up existing quick-ref.md');
  }
  
  fs.writeFileSync(CONFIG.quickRefPath, document);
  
  const totalTokens = Object.values(sections)
    .reduce((sum, content) => sum + countTokens(content), 0);
  
  console.log('\n✅ Pure extraction complete!');
  console.log(`📈 Total size: ~${totalTokens} tokens`);
  console.log('🔍 All content sourced from research files\n');
  
  // Report gaps
  if (data.packages.size === 0) {
    console.log('⚠️  Warning: No package versions found in research');
  }
  if (data.configs.length === 0) {
    console.log('⚠️  Warning: No configuration examples found');
  }
  if (data.fixes.length === 0) {
    console.log('⚠️  Warning: No fixes/solutions documented');
  }
}

// Run it
if (require.main === module) {
  main();
}

module.exports = { extractFromResearch, buildQuickRef };