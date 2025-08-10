# Quick-Ref Optimization: Practical Implementation Guide

## Quick Wins (Implement Today)

### 1. Fix Token Counting (5 minutes)
```bash
npm install tiktoken
```

```javascript
// In update-quick-ref.js, replace estimateTokens:
const { get_encoding } = require('tiktoken');
const encoding = get_encoding('cl100k_base'); // Claude uses this

function estimateTokens(text) {
  try {
    return encoding.encode(text).length;
  } catch {
    // Fallback to old method if encoding fails
    return Math.ceil(text.length / 4);
  }
}
```

### 2. Better Abbreviations (10 minutes)
```javascript
// Expand abbreviation dictionary
const SMART_ABBREVIATIONS = {
  // Technical terms
  'React Native': 'RN',
  'TypeScript': 'TS',
  'JavaScript': 'JS',
  'performance': 'perf',
  'configuration': 'config',
  'components': 'comp',
  'features': 'feat',
  'development': 'dev',
  'production': 'prod',
  'optimization': 'opt',
  'application': 'app',
  'environment': 'env',
  'repository': 'repo',
  
  // Common phrases
  'must be': 'must',
  'should be': 'should',
  'need to': 'must',
  'in order to': 'to',
  'make sure': 'ensure',
  
  // Remove filler words
  'basically': '',
  'actually': '',
  'really': '',
  'very': '',
  'just': '',
};
```

### 3. Smarter Table Compression (15 minutes)
```javascript
function compressTable(tableText) {
  // Convert verbose tables to dense format
  const lines = tableText.split('\n');
  const compressed = [];
  
  for (const line of lines) {
    if (line.includes('|')) {
      // Remove extra spaces in cells
      const cells = line.split('|').map(c => c.trim());
      compressed.push(cells.join('|'));
    }
  }
  
  // If still too long, abbreviate column headers
  return compressed.join('\n')
    .replace('Package', 'Pkg')
    .replace('Version', 'Ver')
    .replace('Critical Note', 'Note')
    .replace('Implementation', 'Impl');
}
```

## Medium-Term Improvements (This Week)

### 1. Semantic Deduplication
```javascript
// Add to update-quick-ref.js
function semanticDedupe(content) {
  const seen = new Set();
  const lines = content.split('\n');
  const deduped = [];
  
  for (const line of lines) {
    // Create normalized version for comparison
    const normalized = line
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 50); // First 50 chars
    
    if (!seen.has(normalized) || line.trim() === '') {
      seen.add(normalized);
      deduped.push(line);
    }
  }
  
  return deduped.join('\n');
}
```

### 2. Priority-Based Loading
```javascript
// New file: priority-loader.js
const PRIORITY_KEYWORDS = {
  critical: ['error', 'fail', 'crash', 'broke', 'urgent'],
  implementation: ['build', 'create', 'implement', 'add', 'feature'],
  optimization: ['optimize', 'performance', 'speed', 'memory'],
  exploration: ['alternative', 'compare', 'versus', 'instead'],
};

function selectSections(query) {
  const queryLower = query.toLowerCase();
  const sections = ['L1']; // Always include
  
  for (const [level, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      switch(level) {
        case 'critical': sections.push('L5'); break;
        case 'implementation': sections.push('L2'); break;
        case 'optimization': sections.push('L3'); break;
        case 'exploration': sections.push('L4'); break;
      }
    }
  }
  
  return sections;
}
```

### 3. Entity Resolution
```javascript
// Add alias mapping
const ENTITY_ALIASES = {
  '@legendapp/state': ['legend state', 'legendstate', 'legend-state'],
  'react-native': ['RN', 'react native'],
  'typescript': ['TS', 'type script'],
  'expo': ['expo sdk', 'expo-cli'],
};

function resolveEntity(text) {
  for (const [canonical, aliases] of Object.entries(ENTITY_ALIASES)) {
    for (const alias of aliases) {
      const regex = new RegExp(`\\b${alias}\\b`, 'gi');
      text = text.replace(regex, canonical);
    }
  }
  return text;
}
```

## Advanced Features (Next Sprint)

### 1. Minimal Dependency Graph
```javascript
// dependencies.json
{
  "@legendapp/state@beta": {
    "requires": ["react@>=18.0.0"],
    "optional": ["react-native@>=0.79.0"],
    "conflicts": ["mobx", "redux-toolkit"]
  },
  "expo@~53.0.0": {
    "requires": ["react-native@0.79.0"],
    "includes": ["expo-router", "expo-dev-client"]
  }
}

// In update-quick-ref.js
function includeDependendencies(pkg) {
  const deps = require('./dependencies.json');
  const toInclude = new Set([pkg]);
  
  // Recursively add requirements
  function addDeps(p) {
    if (deps[p]?.requires) {
      for (const req of deps[p].requires) {
        if (!toInclude.has(req)) {
          toInclude.add(req);
          addDeps(req);
        }
      }
    }
  }
  
  addDeps(pkg);
  return Array.from(toInclude);
}
```

### 2. Smart Caching
```javascript
// cache-manager.js
const fs = require('fs');
const path = require('path');

class ContextCache {
  constructor() {
    this.cachePath = path.join(__dirname, '.context-cache.json');
    this.cache = this.load();
  }
  
  load() {
    if (fs.existsSync(this.cachePath)) {
      return JSON.parse(fs.readFileSync(this.cachePath));
    }
    return { queries: {}, frequency: {} };
  }
  
  save() {
    fs.writeFileSync(this.cachePath, JSON.stringify(this.cache, null, 2));
  }
  
  get(query) {
    const key = this.normalize(query);
    this.cache.frequency[key] = (this.cache.frequency[key] || 0) + 1;
    this.save();
    return this.cache.queries[key];
  }
  
  set(query, context) {
    const key = this.normalize(query);
    this.cache.queries[key] = context;
    this.save();
  }
  
  normalize(query) {
    // Simple normalization - could be enhanced
    return query.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 50);
  }
  
  getMostFrequent(n = 5) {
    return Object.entries(this.cache.frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, n)
      .map(([key]) => key);
  }
}
```

### 3. Format Variants
```javascript
// Generate format variants optimized for different models
function generateFormats(content) {
  return {
    // Claude prefers XML-style
    claude: `<context>
${content.replace(/###/g, '<section>').replace(/\n\n/g, '</section>\n<section>')}
</context>`,
    
    // GPT-4 prefers Markdown
    gpt4: content,
    
    // GPT-3.5 prefers JSON
    gpt35: JSON.stringify({
      context: content.split('\n\n').map(section => ({
        content: section,
        importance: section.includes('CRITICAL') ? 'high' : 'normal'
      }))
    }),
    
    // Minimal format for small contexts
    minimal: content
      .replace(/\n\n+/g, '\n')
      .replace(/###\s*/g, '')
      .replace(/\|/g, ':')
  };
}
```

## Testing & Validation

### 1. Token Accuracy Test
```javascript
// test-tokens.js
const { estimateTokens } = require('./update-quick-ref');
const { get_encoding } = require('tiktoken');
const encoding = get_encoding('cl100k_base');

function testAccuracy() {
  const testCases = [
    "Simple text",
    "# Markdown header\n- List item\n- Another item",
    "| Table | Header |\n|-------|--------|\n| Data | Value |"
  ];
  
  for (const text of testCases) {
    const estimated = estimateTokens(text);
    const actual = encoding.encode(text).length;
    const accuracy = (1 - Math.abs(estimated - actual) / actual) * 100;
    console.log(`Text: "${text.substring(0, 20)}..."`);
    console.log(`  Estimated: ${estimated}, Actual: ${actual}`);
    console.log(`  Accuracy: ${accuracy.toFixed(1)}%\n`);
  }
}

testAccuracy();
```

### 2. Compression Effectiveness
```javascript
// test-compression.js
function testCompression() {
  const original = fs.readFileSync('research/quick-ref.md', 'utf8');
  const sections = parseQuickRef(original);
  
  console.log('Before compression:');
  for (const [level, content] of Object.entries(sections)) {
    if (level !== 'footer') {
      console.log(`  ${level}: ${estimateTokens(content)} tokens`);
    }
  }
  
  // Apply compression
  for (const [level, limit] of Object.entries(CONFIG.tokenLimits)) {
    if (sections[level]) {
      sections[level] = compressSection(sections[level], limit);
    }
  }
  
  console.log('\nAfter compression:');
  for (const [level, content] of Object.entries(sections)) {
    if (level !== 'footer') {
      const tokens = estimateTokens(content);
      const limit = CONFIG.tokenLimits[level];
      const status = tokens <= limit ? '✅' : '❌';
      console.log(`  ${level}: ${tokens}/${limit} tokens ${status}`);
    }
  }
}
```

## Monitoring & Metrics

### Add Analytics
```javascript
// analytics.js
class QuickRefAnalytics {
  constructor() {
    this.metricsPath = '.quick-ref-metrics.json';
    this.metrics = this.load();
  }
  
  track(event, data) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      ...data
    };
    
    this.metrics.events = this.metrics.events || [];
    this.metrics.events.push(entry);
    
    // Update aggregates
    this.updateAggregates(event, data);
    this.save();
  }
  
  updateAggregates(event, data) {
    if (event === 'compression') {
      this.metrics.avgCompression = 
        ((this.metrics.avgCompression || 0) * (this.metrics.compressionCount || 0) + data.ratio) /
        ((this.metrics.compressionCount || 0) + 1);
      this.metrics.compressionCount = (this.metrics.compressionCount || 0) + 1;
    }
  }
  
  report() {
    console.log('📊 Quick-Ref Metrics:');
    console.log(`  Total updates: ${this.metrics.events?.length || 0}`);
    console.log(`  Avg compression: ${(this.metrics.avgCompression || 0).toFixed(1)}%`);
    console.log(`  Most frequent sections: ${this.getMostUsedSections().join(', ')}`);
  }
}
```

## Migration Checklist

- [ ] Backup current quick-ref.md and scripts
- [ ] Install tiktoken dependency
- [ ] Update token counting function
- [ ] Add expanded abbreviations
- [ ] Implement semantic deduplication
- [ ] Test with sample research files
- [ ] Validate token limits
- [ ] Deploy priority-based loading
- [ ] Add entity resolution
- [ ] Implement caching layer
- [ ] Set up monitoring
- [ ] Document changes

## Expected Results

After implementing these optimizations:

1. **Week 1**: 20-30% better compression
2. **Week 2**: 40-50% reduction in tokens
3. **Week 3**: 60-70% overall improvement
4. **Week 4**: 95%+ optimization achieved

Remember: Start with quick wins, test thoroughly, and iterate based on actual usage patterns.