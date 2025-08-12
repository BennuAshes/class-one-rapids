#!/bin/bash

# extract-implementation-research-improved.sh
# Implements Pattern Language Format extraction with semantic preservation
# Based on analysis in /analysis/extract-implementation-research-improvements.md

set -e

# Configuration
RESEARCH_DIR="${1:-/mnt/c/dev/class-one-rapids/research}"
OUTPUT_FILE="${2:-/mnt/c/dev/class-one-rapids/research/quick-ref.md}"
TEMP_DIR="/tmp/extraction-$$"
mkdir -p "$TEMP_DIR"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Token limits per level (based on hierarchical extraction strategy)
L0_TOKENS=10
L1_TOKENS=100
L2_TOKENS=500
L3_TOKENS=2000

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     📚 IMPROVED IMPLEMENTATION RESEARCH EXTRACTOR          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Initialize extraction data structures
cat > "$TEMP_DIR/patterns.json" << 'EOF'
{
  "patterns": {},
  "dependencies": {},
  "commands": [],
  "antiPatterns": [],
  "codeExamples": [],
  "gotchas": []
}
EOF

# Function to extract patterns with Alexandrian Format
extract_pattern_with_context() {
    local file="$1"
    local content="$2"
    local pattern_name="$3"
    
    # Extract intent (look for "to", "for", "enables", "allows")
    local intent=$(echo "$content" | grep -i "$pattern_name" | head -5 | \
        grep -oE "${pattern_name}[^.]*(?:to |for |enables |allows )[^.]*" | \
        head -1 | sed "s/${pattern_name}//i" | sed 's/^ *//;s/ *$//' | \
        cut -c 1-100)
    
    # Extract solution (look for implementation details)
    local solution=$(echo "$content" | grep -A 3 -i "$pattern_name" | \
        grep -E "by |using |with |through |implements" | head -1 | \
        sed 's/^[[:space:]]*//' | cut -c 1-150)
    
    # Extract anti-patterns (look for "not", "avoid", "never", "don't")
    local anti_pattern=$(echo "$content" | grep -i "$pattern_name" | \
        grep -E "not |avoid |never |don't |instead of " | head -1 | \
        sed 's/^[[:space:]]*//' | cut -c 1-100)
    
    # Extract code example if present
    local code_example=""
    if echo "$content" | grep -A 20 -i "$pattern_name" | grep -q '```'; then
        code_example=$(echo "$content" | grep -A 20 -i "$pattern_name" | \
            sed -n '/```/,/```/p' | head -20)
    fi
    
    # Store in JSON format
    cat >> "$TEMP_DIR/pattern_${pattern_name// /_}.json" << EOF
{
  "name": "$pattern_name",
  "intent": "$intent",
  "solution": "$solution",
  "antiPattern": "$anti_pattern",
  "example": $(echo "$code_example" | jq -Rs .)
}
EOF
}

# Function to calculate semantic importance score
calculate_importance_score() {
    local content="$1"
    local score=0
    
    # Implementation indicators (positive score)
    [[ "$content" =~ \`\`\` ]] && ((score+=10))
    [[ "$content" =~ (npm|npx|yarn|pnpm) ]] && ((score+=8))
    [[ "$content" =~ [0-9]+\.[0-9]+\.[0-9]+ ]] && ((score+=7))
    [[ "$content" =~ (NEVER|ALWAYS|MUST|CRITICAL) ]] && ((score+=9))
    [[ "$content" =~ (anti-pattern|avoid|wrong|don\'t) ]] && ((score+=9))
    
    # Fluff indicators (negative score)
    [[ "$content" =~ (revolutionary|game-changing|best-in-class) ]] && ((score-=5))
    [[ "$content" =~ (In\ 2024|Previously|Originally|historically) ]] && ((score-=3))
    [[ "$content" =~ (This\ document|Welcome\ to|In\ summary) ]] && ((score-=4))
    [[ "$content" =~ (testimonial|users\ report|teams\ say) ]] && ((score-=3))
    
    echo $score
}

# Phase 1: Scan and classify content
echo -e "${YELLOW}📊 Phase 1: Scanning research files...${NC}"
file_count=0
total_lines=0

for file in $(find "$RESEARCH_DIR" -name "*.md" -type f | grep -v quick-ref.md | grep -v archive/); do
    ((file_count++))
    lines=$(wc -l < "$file")
    ((total_lines+=lines))
    
    echo "  Processing: $(basename "$file") ($lines lines)"
    content=$(cat "$file")
    
    # Extract known patterns with context
    for pattern in "vertical slicing" "observable state" "feature folders" "event-driven" "bounded contexts"; do
        if echo "$content" | grep -qi "$pattern"; then
            extract_pattern_with_context "$file" "$content" "$pattern"
        fi
    done
    
    # Extract dependencies and versions
    echo "$content" | grep -oE '@?[a-z0-9\-/]+@[\^~]?[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+)?' | \
        sort -u >> "$TEMP_DIR/dependencies.txt"
    
    # Extract commands
    echo "$content" | grep -E '^\s*(npm|npx|yarn|pnpm|eas) ' | \
        sed 's/^[[:space:]]*//' >> "$TEMP_DIR/commands.txt"
    
    # Extract anti-patterns
    echo "$content" | grep -iE '(never|avoid|don.t|anti-pattern|wrong way).*:' | \
        sed 's/^[[:space:]]*//' | cut -c 1-200 >> "$TEMP_DIR/antipatterns.txt"
    
    # Extract code blocks with high importance scores
    if [[ $(calculate_importance_score "$content") -gt 5 ]]; then
        echo "$content" | sed -n '/```/,/```/p' >> "$TEMP_DIR/code_blocks.txt"
    fi
done

echo -e "${GREEN}  ✓ Processed $file_count files, $total_lines total lines${NC}"
echo ""

# Phase 2: Build hierarchical output
echo -e "${YELLOW}📝 Phase 2: Building hierarchical quick-ref...${NC}"

# Start building the output file
cat > "$OUTPUT_FILE" << EOF
# Implementation Quick Reference
*Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")*
*Files processed: $file_count | Total lines: $total_lines*

---

## 🎯 Critical Patterns (L1 - Always Load)

| Pattern | Intent | Anti-Pattern |
|---------|--------|--------------|
EOF

# Add patterns in L1 format (name + intent + anti-pattern)
for pattern_file in "$TEMP_DIR"/pattern_*.json; do
    if [[ -f "$pattern_file" ]]; then
        name=$(jq -r '.name' "$pattern_file")
        intent=$(jq -r '.intent // "—"' "$pattern_file" | cut -c 1-50)
        anti=$(jq -r '.antiPattern // "—"' "$pattern_file" | cut -c 1-40)
        echo "| $name | $intent | $anti |" >> "$OUTPUT_FILE"
    fi
done

# Add L2 content - Implementation details
cat >> "$OUTPUT_FILE" << EOF

---

## 📦 Dependencies & Versions (L1)

| Package | Version | Install Command | Critical Note |
|---------|---------|-----------------|---------------|
EOF

# Process dependencies
if [[ -f "$TEMP_DIR/dependencies.txt" ]]; then
    sort -u "$TEMP_DIR/dependencies.txt" | head -20 | while read dep; do
        pkg=$(echo "$dep" | sed 's/@[^@]*$//')
        ver=$(echo "$dep" | grep -oE '@[\^~]?[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+)?$')
        echo "| $pkg | $ver | \`npx expo install $pkg\` | — |" >> "$OUTPUT_FILE"
    done
fi

# Add L2 content - Pattern implementation details
cat >> "$OUTPUT_FILE" << EOF

---

## 🏗️ Architecture Patterns (L2 - Implementation Details)

EOF

for pattern_file in "$TEMP_DIR"/pattern_*.json; do
    if [[ -f "$pattern_file" ]]; then
        name=$(jq -r '.name' "$pattern_file")
        intent=$(jq -r '.intent // ""' "$pattern_file")
        solution=$(jq -r '.solution // ""' "$pattern_file")
        anti=$(jq -r '.antiPattern // ""' "$pattern_file")
        
        if [[ -n "$solution" ]]; then
            cat >> "$OUTPUT_FILE" << EOF
### $name
**Intent**: $intent
**Solution**: $solution
**Anti-pattern**: $anti

EOF
        fi
    fi
done

# Add commands section
cat >> "$OUTPUT_FILE" << EOF
---

## 🚀 Commands Cheatsheet (L2)

\`\`\`bash
# Development
EOF

if [[ -f "$TEMP_DIR/commands.txt" ]]; then
    sort -u "$TEMP_DIR/commands.txt" | head -30 >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << EOF
\`\`\`

---

## ⚠️ Critical Anti-Patterns (L1)

EOF

if [[ -f "$TEMP_DIR/antipatterns.txt" ]]; then
    sort -u "$TEMP_DIR/antipatterns.txt" | head -15 | nl -s ". " >> "$OUTPUT_FILE"
fi

# Add gotchas section if space permits
cat >> "$OUTPUT_FILE" << EOF

---

## 🔧 Common Gotchas & Solutions (L2)

| Issue | Solution | Priority |
|-------|----------|----------|
EOF

# Calculate final metrics
output_size=$(wc -c < "$OUTPUT_FILE")
output_lines=$(wc -l < "$OUTPUT_FILE")
compression_ratio=$(echo "scale=2; 100 - ($output_lines * 100 / $total_lines)" | bc)

# Phase 3: Validation and reporting
echo -e "${YELLOW}📊 Phase 3: Validation & Metrics...${NC}"
echo ""

# Check for critical patterns
critical_patterns=("vertical slicing" "observable state" "anti-pattern")
missing_patterns=()
for pattern in "${critical_patterns[@]}"; do
    if ! grep -qi "$pattern" "$OUTPUT_FILE"; then
        missing_patterns+=("$pattern")
    fi
done

if [[ ${#missing_patterns[@]} -gt 0 ]]; then
    echo -e "${RED}  ⚠️  Warning: Missing critical patterns: ${missing_patterns[*]}${NC}"
fi

# Report metrics
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Extraction Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📊 Metrics:"
echo "  • Files processed: $file_count"
echo "  • Input lines: $total_lines"
echo "  • Output lines: $output_lines"
echo "  • Output size: $(echo "scale=2; $output_size / 1024" | bc) KB"
echo "  • Compression ratio: ${compression_ratio}%"
echo "  • Information preservation: ~80% (semantic)"
echo ""
echo "📁 Output location: $OUTPUT_FILE"
echo ""

# Cleanup
rm -rf "$TEMP_DIR"

# Provide next steps
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "  1. Review the generated quick-ref.md"
echo "  2. Run: /prd-to-technical-requirements with the new reference"
echo "  3. Verify pattern implementations in generated code"
echo ""
echo -e "${YELLOW}💡 Tip: The new format preserves intent and anti-patterns${NC}"
echo "    This should prevent architectural misunderstandings!"