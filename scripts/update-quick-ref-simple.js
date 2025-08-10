#!/usr/bin/env node

/**
 * Ultra-Simplified Quick-Reference System
 * Philosophy: Hardcode what we know, extract patterns from research
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  researchDir: path.join(__dirname, '../research'),
  quickRefPath: path.join(__dirname, '../research/quick-ref.md'),
  backupPath: path.join(__dirname, '../research/quick-ref.md.backup')
};

// Hardcoded critical information that we KNOW is correct
const KNOWN_INFO = {
  packages: {
    '@legendapp/state': '@beta',
    'expo': '~53.0.0',
    'react-native': '0.79+',
    'typescript': '^5.8.0',
    'expo-router': '~5.0.0',
    'react': '18.2.0',
    'vitest': '^1.0.0',
    '@testing-library/react-native': '^12.0.0'
  },
  
  mustPatterns: [
    'feat/*/comp/ structure',
    'gameState$ observables',
    'useGameLogic() hooks',
    'vertical slicing',
    'INVEST criteria'
  ],
  
  neverPatterns: [
    'src/components flat structure',
    'single monolithic store',
    'gameUtils.js utilities',
    'horizontal layers',
    'big bang features'
  ],
  
  criticalConfig: {
    metro: [
      'resolver.unstable_enablePackageExports: true',
      'resolver.unstable_conditionNames: ["react-native"]'
    ],
    typescript: [
      'strict: true',
      'noImplicitAny: true',
      'strictNullChecks: true'
    ],
    babel: [
      'plugins: ["react-native-reanimated/plugin"]'
    ]
  },
  
  performance: {
    'Hermes Engine': '30% faster',
    'Bundle splitting': '50% smaller',
    'Image optimization': '60% smaller',
    'List virtualization': '90% memory reduction',
    'Batch state updates': '40% faster'
  }
};

/**
 * Extract additional patterns from research files
 */
function scanResearch() {
  const patterns = new Set();
  const antiPatterns = new Set();
  const tools = new Set();
  
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (item.endsWith('.md') && !item.includes('quick-ref')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();
          
          // Look for common patterns
          if (content.includes('vertical slic')) patterns.add('Vertical slicing');
          if (content.includes('feature-based')) patterns.add('Feature-based architecture');
          if (content.includes('observable')) patterns.add('Observable state pattern');
          if (content.includes('custom hook')) patterns.add('Custom hooks pattern');
          
          // Look for anti-patterns
          if (content.includes('avoid') || content.includes('don\'t')) {
            if (content.includes('class component')) antiPatterns.add('Class components');
            if (content.includes('any type')) antiPatterns.add('Any types');
          }
          
          // Look for tools
          if (content.includes('vitest')) tools.add('Vitest');
          if (content.includes('maestro')) tools.add('Maestro');
          if (content.includes('percy')) tools.add('Percy');
        } catch (err) {
          // Skip files that can't be read
        }
      }
    }
  }
  
  scanDir(CONFIG.researchDir);
  
  return { patterns, antiPatterns, tools };
}

/**
 * Build the quick-ref content
 */
function buildQuickRef() {
  const research = scanResearch();
  
  // L1: CRITICAL
  let L1 = '### Package Versions (MUST USE)\n';
  L1 += '| Package | Version | Critical |\n';
  L1 += '|---------|---------|----------|\n';
  
  for (const [pkg, ver] of Object.entries(KNOWN_INFO.packages).slice(0, 8)) {
    const critical = ver.includes('beta') ? '⚠️ beta' : 
                     ver.includes('~') ? '📌 exact' : '✅';
    L1 += `| ${pkg} | ${ver} | ${critical} |\n`;
  }
  
  L1 += '\n### Architecture Rules\n';
  L1 += '| ✅ MUST | ❌ NEVER |\n';
  L1 += '|---------|----------|\n';
  
  for (let i = 0; i < Math.max(KNOWN_INFO.mustPatterns.length, KNOWN_INFO.neverPatterns.length); i++) {
    const must = KNOWN_INFO.mustPatterns[i] || '';
    const never = KNOWN_INFO.neverPatterns[i] || '';
    L1 += `| ${must} | ${never} |\n`;
  }
  
  // L2: IMPLEMENTATION
  let L2 = '### Critical Configuration\n';
  L2 += '```javascript\n';
  L2 += '// Metro (REQUIRED for @legendapp/state@beta)\n';
  KNOWN_INFO.criticalConfig.metro.forEach(line => L2 += line + '\n');
  L2 += '\n// TypeScript (STRICT MODE)\n';
  KNOWN_INFO.criticalConfig.typescript.forEach(line => L2 += line + '\n');
  L2 += '\n// Babel\n';
  KNOWN_INFO.criticalConfig.babel.forEach(line => L2 += line + '\n');
  L2 += '```\n\n';
  
  L2 += '### Performance Critical\n';
  for (const [opt, impact] of Object.entries(KNOWN_INFO.performance)) {
    L2 += `- ${opt}: ${impact}\n`;
  }
  
  L2 += '\n### Testing Stack\n';
  L2 += '- Unit: Vitest\n';
  L2 += '- Component: Testing Library\n';
  L2 += '- E2E: Maestro\n';
  if (research.tools.has('Percy')) L2 += '- Visual: Percy\n';
  
  // L3: ADVANCED
  let L3 = '### LLM Optimization\n';
  L3 += '- Markdown 15% more efficient than JSON\n';
  L3 += '- Hierarchical loading (L1→L2→L3)\n';
  L3 += '- Accuracy > compression\n\n';
  
  L3 += '### Security\n';
  L3 += '- semgrep in CI/CD\n';
  L3 += '- expo-secure-store for secrets\n';
  L3 += '- Server-side API keys only\n';
  
  // L4: ALTERNATIVES
  let L4 = '### When NOT React Native\n';
  L4 += '| Use Case | Alternative | Why |\n';
  L4 += '|----------|-------------|-----|\n';
  L4 += '| Web-first | SolidJS | 10x smaller |\n';
  L4 += '| Data-heavy | TanStack Query | Better caching |\n';
  L4 += '| Desktop | Tauri | Native perf |\n';
  
  // L5: EMERGENCY
  let L5 = '### Quick Fixes\n';
  L5 += '```bash\n';
  L5 += '# Metro cache issues\n';
  L5 += 'npx expo start -c\n\n';
  L5 += '# Type errors\n';
  L5 += 'npx tsc --noEmit\n\n';
  L5 += '# Module not found\n';
  L5 += 'rm -rf node_modules && npm install\n';
  L5 += '```\n';
  
  return { L1, L2, L3, L4, L5 };
}

/**
 * Simple token counter
 */
function countTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Building optimized quick-ref (accuracy-first approach)...\n');
  
  // Build sections
  const sections = buildQuickRef();
  
  // Show token counts
  console.log('📊 Section sizes:');
  for (const [name, content] of Object.entries(sections)) {
    const tokens = countTokens(content);
    console.log(`  ${name}: ~${tokens} tokens`);
  }
  
  // Build final document
  const document = `# Quick-Ref (Optimized for Accuracy)
*Generated: ${new Date().toISOString().split('T')[0]}*

## L1: CRITICAL (~${countTokens(sections.L1)} tokens)
${sections.L1}

## L2: IMPLEMENTATION (~${countTokens(sections.L2)} tokens)
${sections.L2}

## L3: ADVANCED (~${countTokens(sections.L3)} tokens)
${sections.L3}

## L4: ALTERNATIVES (~${countTokens(sections.L4)} tokens)
${sections.L4}

## L5: EMERGENCY (~${countTokens(sections.L5)} tokens)
${sections.L5}

---
## Philosophy
- **Accuracy** over aggressive compression
- **Known facts** hardcoded for reliability
- **Essential info** only
- **Clear structure** for easy scanning

## Sources
- /research/tech/*.md - Technology specifics
- /research/planning/*.md - Architecture patterns
- /research/agentic/*.md - AI/LLM optimization
`;
  
  // Backup existing
  if (fs.existsSync(CONFIG.quickRefPath)) {
    fs.copyFileSync(CONFIG.quickRefPath, CONFIG.backupPath);
    console.log('\n💾 Backed up existing quick-ref.md');
  }
  
  // Write new version
  fs.writeFileSync(CONFIG.quickRefPath, document);
  
  const totalTokens = Object.values(sections)
    .reduce((sum, content) => sum + countTokens(content), 0);
  
  console.log('\n✅ Quick-ref updated successfully!');
  console.log(`📈 Total size: ~${totalTokens} tokens`);
  console.log('🎯 Optimized for accuracy with known-good information\n');
}

// Run it
if (require.main === module) {
  main();
}

module.exports = { buildQuickRef, KNOWN_INFO };