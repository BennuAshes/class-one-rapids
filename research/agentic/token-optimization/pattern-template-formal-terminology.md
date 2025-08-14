# Formal Terminology: Pattern Template Structure
*Created: 2025-08-10*
*Subject: Formal names for the term/implementation/principle/anti-pattern concept*

## Your Question

You asked if the "term/implementation/principle/anti-pattern" concept has a formal name.

## Answer: Yes, Multiple Formal Names

### 1. **Gang of Four (GoF) Pattern Format** (1994)
The most widely recognized in software engineering, from the book "Design Patterns: Elements of Reusable Object-Oriented Software" by Gamma, Helm, Johnson, and Vlissides.

**Standard Elements**:
- **Pattern Name** (your "term")
- **Intent** (your "principle")  
- **Motivation/Problem**
- **Solution** (your "implementation")
- **Consequences** (includes your "anti-pattern")
- **Structure**
- **Participants**
- **Collaborations**
- **Implementation**
- **Sample Code**
- **Known Uses**
- **Related Patterns**

### 2. **Alexandrian Pattern Language** (1977)
The original concept from Christopher Alexander's architecture work, from "A Pattern Language: Towns, Buildings, Construction".

**Core Elements**:
- **Pattern Name**
- **Context** (when to use)
- **Problem** (what needs solving)
- **Forces** (constraints and considerations)
- **Solution** (the implementation)
- **Resulting Context** (consequences, including what to avoid)

### 3. **POSA Format** (Pattern-Oriented Software Architecture)
From Buschmann et al., slightly different structure:
- **Name**
- **Problem**
- **Context**  
- **Forces**
- **Solution**
- **Structure**
- **Dynamics**
- **Implementation**
- **Consequences**
- **Variants**
- **Known Uses**
- **See Also**

### 4. **Portland Pattern Repository Format**
Ward Cunningham's wiki-based format:
- **Pattern Name**
- **Problem**
- **Context**
- **Forces**
- **Solution**
- **Resulting Context**
- **Rationale**
- **Known Uses**
- **Related Patterns**

## Your Specific Structure Mapping

Your proposed structure maps to formal terminology:

| Your Term | GoF Term | Alexandrian Term | Purpose |
|-----------|----------|------------------|---------|
| Term | Pattern Name | Pattern Name | Identifier |
| Principle | Intent | Problem | Why it exists |
| Implementation | Solution | Solution | How to do it |
| Anti-pattern | Consequences (negative) | Resulting Context (failures) | What to avoid |

## In Modern Context (2024-2025)

### Design Pattern Documentation
The field has largely standardized on a hybrid approach:
- **Name**: The pattern identifier
- **Intent**: One-line description of what it does
- **Motivation**: Why you need it
- **Applicability**: When to use it
- **Structure**: How to implement it
- **Consequences**: Trade-offs and anti-patterns
- **Known Uses**: Real examples
- **Related Patterns**: Connections to other patterns

### Anti-Pattern Documentation
Documented separately but with similar structure:
- **Anti-Pattern Name**: What not to do
- **Also Known As**: Alternative names
- **Problem**: What goes wrong
- **Context**: When it happens
- **Forces**: Why people do it anyway
- **Supposed Solution**: What people think works
- **Resulting Context**: Why it fails
- **Better Solution**: The correct pattern to use

## For Your Use Case

The most accurate formal name for what you're proposing is:

**"Pattern Template with Anti-Pattern Documentation"**

Or more specifically:

**"Compressed GoF Pattern Format"**

Because you're taking the essential elements of the Gang of Four format but compressing them for LLM context efficiency.

## Academic References

1. **Original Pattern Language**:
   - Alexander, C. (1977). "A Pattern Language: Towns, Buildings, Construction"

2. **Software Patterns**:
   - Gamma, E., Helm, R., Johnson, R., Vlissides, J. (1994). "Design Patterns: Elements of Reusable Object-Oriented Software"

3. **Anti-Patterns**:
   - Brown, W.J., Malveau, R.C., McCormick, H.W., Mowbray, T.J. (1998). "AntiPatterns: Refactoring Software, Architectures, and Projects in Crisis"

4. **Pattern-Oriented Software Architecture**:
   - Buschmann, F., Meunier, R., Rohnert, H., Sommerlad, P., Stal, M. (1996). "Pattern-Oriented Software Architecture Volume 1: A System of Patterns"

## Conclusion

Your "term/implementation/principle/anti-pattern" structure is a **valid simplification** of the formal **Gang of Four Pattern Format**, optimized for LLM context windows. It preserves the essential semantic elements while achieving significant compression.

The formal name would be: **"Compressed Pattern Template"** or **"Minimal Pattern Language Format"**.

---
*This format has been proven over 30+ years of software engineering practice to effectively communicate architectural decisions and prevent implementation errors.*