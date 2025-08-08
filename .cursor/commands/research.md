---
alwaysApply: false
---
Research Workflow (GPT-5 Optimized)

Purpose

- Convert the legacy `.claude/commands/research.md` into a Cursor-native workflow.
- Create a high-quality research document using GPT-5 best practices.

Inputs

- topic: What to research.
- objective: Why the research is needed and for whom.
- output-filename (optional): Path like `research/<slug>.md`. If omitted, derive: `research/<topic-slug>-<YYYY-MM-DD>.md`.

Usage Examples

- Minimal: "@research Investigate: Vector DBs for RAG; Objective: pick one for our TypeScript stack"
- Explicit: "@research topic: 'Cursor Rules best practices' objective: 'Adopt rules in this repo' output: 'research/cursor-rules-best-practices.md'"

Execution Policy (GPT-5 Prompt Best Practices)

1. Plan First

   - Internally create a short step-by-step plan (do not reveal chain-of-thought).
   - Confirm required inputs are present; if output filename missing, derive as above.

2. Web Research

   - Use Web Search to find authoritative, current sources (docs, standards, vendor posts, academic, reputable blogs, forums). Prefer recency for fast-evolving topics.
   - Extract key points, note dates, and capture proper citations as markdown links with descriptive anchors.

3. Synthesis & Structuring

   - Organize findings into clear sections per the template. Provide a 3-bullet Executive Summary focusing on key findings, actionable insights, and next steps.
   - Include best practices, pitfalls, trade-offs, and a practical, staged implementation plan.
   - Where relevant, add model-specific guidance for GPT-5-era workflows.

4. Document Creation

   - Ensure `research/` exists; then create or overwrite `output-filename`.
   - Use `@research/templates/research-doc-template.md` as a structural guide.
   - Write one complete markdown file. Do not split content across multiple files unless asked.
   - Include a small metadata block at the top (topic, objective, date, model, version).

5. Quality Bar
   - Clarity and specificity; avoid filler.
   - Provide concrete recommendations with decisive language.
   - Include references at the end with 1–2 sentence relevance notes.
   - Keep the doc self-contained and skimmable with headings and lists.

Output Requirements

- Path: `research/<derived-or-provided>.md`
- Sections (at minimum):
  1. Executive Summary (exactly 3 bullets)
  2. Key Findings & Insights
  3. Best Practices & Recommendations
  4. Detailed Implementation Plan (phased, with validation)
  5. Tools & Resources (if applicable)
  6. References & Sources (markdown links, no bare URLs)

Notes

- Perform internal planning but output only the final document (no chain-of-thought).
- If the topic is broad, constrain scope aligned to the stated objective.

Referenced Template
@research/templates/research-doc-template.md
