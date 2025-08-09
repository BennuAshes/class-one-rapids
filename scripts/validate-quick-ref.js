#!/usr/bin/env node

/**
 * Quick-Reference Validation System
 * Ensures quick-ref.md maintains quality and token limits
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  quickRefPath: path.join(__dirname, '../research/quick-ref.md'),
  researchDir: path.join(__dirname, '../research'),
  tokenLimits: {
    L1: 200,
    L2: 400,
    L3: 300,
    L4: 100,
    L5: 100,
    total: 1200
  }
};

/**
 * Estimate token count (rough approximation)
 */
function estimateTokens(text) {
  // More accurate estimation based on common patterns
  // Average English word ≈ 1.3 tokens
  // Code/technical content ≈ 1.5 tokens per word
  const words = text.split(/\s+/).length;
  const codeBlocks = (text.match(/```/g) || []).length / 2;
  const tables = (text.match(/\|/g) || []).length / 10; // Rough table detection
  
  // Adjust for technical content
  const multiplier = 1.3 + (codeBlocks * 0.1) + (tables * 0.05);
  return Math.ceil(words * multiplier);
}

/**
 * Parse sections from quick-ref
 */
function parseSections(content) {
  const sections = {};
  const sectionRegex = /## L(\d): [\w\s]+\([\w\s-]+- (\d+) tokens\)/g;
  
  let lastIndex = 0;
  let lastLevel = null;
  let match;
  
  while ((match = sectionRegex.exec(content)) !== null) {
    if (lastLevel) {
      sections[lastLevel] = content.substring(lastIndex, match.index).trim();
    }
    lastLevel = `L${match[1]}`;
    lastIndex = match.index;
  }
  
  // Get the last section
  if (lastLevel) {
    const footerStart = content.indexOf('---\n\n## Research Sources');
    const endIndex = footerStart > lastIndex ? footerStart : content.length;
    sections[lastLevel] = content.substring(lastIndex, endIndex).trim();
  }
  
  return sections;
}

/**
 * Check for duplicate information across sections
 */
function checkDuplicates(sections) {
  const duplicates = [];
  const seen = new Map();
  
  // Extract meaningful chunks (packages, patterns, etc.)
  const extractChunks = (text) => {
    const chunks = [];
    
    // Extract package names
    const packages = text.match(/@?[\w-]+(?:\/[\w-]+)?@[\w.-]+/g) || [];
    chunks.push(...packages);
    
    // Extract patterns
    const patterns = text.match(/features\/\*|components\/\*|src\/\w+/g) || [];
    chunks.push(...patterns);
    
    return chunks;
  };
  
  for (const [level, content] of Object.entries(sections)) {
    const chunks = extractChunks(content);
    for (const chunk of chunks) {
      if (seen.has(chunk)) {
        duplicates.push({
          item: chunk,
          found: [seen.get(chunk), level]
        });
      } else {
        seen.set(chunk, level);
      }
    }
  }
  
  return duplicates;
}

/**
 * Verify critical information is present
 */
function checkCompleteness(sections) {
  const required = {
    L1: [
      '@legendapp/state',
      'expo',
      'react-native',
      'features/',
      '✅',
      '❌'
    ],
    L2: [
      'Metro',
      'Babel',
      'TypeScript',
      'Performance'
    ]
  };
  
  const missing = {};
  
  for (const [level, items] of Object.entries(required)) {
    const content = sections[level] || '';
    const missingItems = items.filter(item => !content.includes(item));
    if (missingItems.length > 0) {
      missing[level] = missingItems;
    }
  }
  
  return missing;
}

/**
 * Check structural integrity
 */
function validateStructure(content) {
  const issues = [];
  
  // Check for required headers
  const requiredHeaders = [
    '## L1: CRITICAL',
    '## L2: IMPLEMENTATION',
    '## L3: ADVANCED',
    '## L4: FRAMEWORK ALTERNATIVES',
    '## L5: EMERGENCY'
  ];
  
  for (const header of requiredHeaders) {
    if (!content.includes(header)) {
      issues.push(`Missing required header: ${header}`);
    }
  }
  
  // Check table formatting
  const tableRegex = /\|[^|]+\|[^|]+\|/;
  const tables = content.match(/\|.*\|.*\|/g) || [];
  for (const table of tables) {
    const columns = table.split('|').filter(c => c.trim());
    if (columns.length < 2) {
      issues.push(`Malformed table: ${table.substring(0, 50)}...`);
    }
  }
  
  // Check code block closure
  const codeBlocks = content.split('```').length - 1;
  if (codeBlocks % 2 !== 0) {
    issues.push('Unclosed code block detected');
  }
  
  return issues;
}

/**
 * Compare with source research files
 */
function crossReferenceWithSources(sections) {
  const issues = [];
  
  // Check if mentioned source files exist
  const sourceReferences = sections.L5 || '';
  const fileRefs = sourceReferences.match(/research\/[\w\/]+\.md/g) || [];
  
  for (const ref of fileRefs) {
    const fullPath = path.join(__dirname, '..', ref);
    if (!fs.existsSync(fullPath)) {
      issues.push(`Referenced file does not exist: ${ref}`);
    }
  }
  
  return issues;
}

/**
 * Main validation function
 */
function validateQuickRef() {
  console.log('🔍 Validating quick-ref.md...\n');
  
  // Read quick-ref
  if (!fs.existsSync(CONFIG.quickRefPath)) {
    console.error('❌ quick-ref.md not found!');
    process.exit(1);
  }
  
  const content = fs.readFileSync(CONFIG.quickRefPath, 'utf8');
  const sections = parseSections(content);
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // 1. Check token limits
  console.log('📏 Checking token limits...');
  let totalTokens = 0;
  for (const [level, text] of Object.entries(sections)) {
    const tokens = estimateTokens(text);
    totalTokens += tokens;
    const limit = CONFIG.tokenLimits[level];
    
    if (limit && tokens > limit) {
      console.error(`  ❌ ${level}: ${tokens} tokens (limit: ${limit}) - EXCEEDS by ${tokens - limit}`);
      hasErrors = true;
    } else if (limit) {
      const usage = Math.round((tokens / limit) * 100);
      const icon = usage > 80 ? '⚠️' : '✅';
      console.log(`  ${icon} ${level}: ${tokens}/${limit} tokens (${usage}% used)`);
      if (usage > 80) hasWarnings = true;
    }
  }
  
  if (totalTokens > CONFIG.tokenLimits.total) {
    console.error(`  ❌ Total: ${totalTokens} tokens (limit: ${CONFIG.tokenLimits.total})`);
    hasErrors = true;
  } else {
    console.log(`  ✅ Total: ${totalTokens}/${CONFIG.tokenLimits.total} tokens`);
  }
  
  // 2. Check for duplicates
  console.log('\n🔄 Checking for duplicates...');
  const duplicates = checkDuplicates(sections);
  if (duplicates.length > 0) {
    console.warn('  ⚠️  Duplicate information found:');
    for (const dup of duplicates) {
      console.warn(`     - "${dup.item}" in ${dup.found.join(' and ')}`);
    }
    hasWarnings = true;
  } else {
    console.log('  ✅ No duplicates found');
  }
  
  // 3. Check completeness
  console.log('\n📋 Checking completeness...');
  const missing = checkCompleteness(sections);
  if (Object.keys(missing).length > 0) {
    console.error('  ❌ Missing required information:');
    for (const [level, items] of Object.entries(missing)) {
      console.error(`     ${level}: ${items.join(', ')}`);
    }
    hasErrors = true;
  } else {
    console.log('  ✅ All required information present');
  }
  
  // 4. Validate structure
  console.log('\n🏗️  Validating structure...');
  const structureIssues = validateStructure(content);
  if (structureIssues.length > 0) {
    console.error('  ❌ Structure issues:');
    for (const issue of structureIssues) {
      console.error(`     - ${issue}`);
    }
    hasErrors = true;
  } else {
    console.log('  ✅ Structure is valid');
  }
  
  // 5. Cross-reference with sources
  console.log('\n🔗 Cross-referencing with sources...');
  const sourceIssues = crossReferenceWithSources(sections);
  if (sourceIssues.length > 0) {
    console.warn('  ⚠️  Source reference issues:');
    for (const issue of sourceIssues) {
      console.warn(`     - ${issue}`);
    }
    hasWarnings = true;
  } else {
    console.log('  ✅ All source references valid');
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.error('❌ VALIDATION FAILED - Errors must be fixed');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn('⚠️  VALIDATION PASSED WITH WARNINGS');
    console.log('   Consider addressing warnings for optimal performance');
  } else {
    console.log('✅ VALIDATION PASSED - All checks successful!');
  }
  
  // Performance tips
  console.log('\n💡 Quick Stats:');
  console.log(`   - Total sections: ${Object.keys(sections).length}`);
  console.log(`   - Total tokens: ${totalTokens}`);
  console.log(`   - Efficiency rating: ${totalTokens < 800 ? 'Excellent' : totalTokens < 1000 ? 'Good' : 'Needs optimization'}`);
}

// Run validation
if (require.main === module) {
  validateQuickRef();
}

module.exports = { validateQuickRef, estimateTokens, parseSections };