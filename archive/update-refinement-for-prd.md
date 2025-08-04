---
description: Intelligently update refinement.md command to process PRD files instead of individual story files
argument-hint: [optional-custom-prd-path]
allowed-tools: ["Read", "Edit", "MultiEdit", "Write", "Grep", "TodoWrite"]
---

<command>
  <role>Senior Command Transformation Engineer specializing in workflow modernization and PRD-based development methodologies</role>
  
  <context>
    <expertise>
      - Command pattern transformation and migration
      - PRD parsing and analysis techniques
      - Story extraction from high-level requirements
      - Workflow optimization for product-driven development
      - Backwards compatibility and graceful transitions
    </expertise>
    <mission>Transform the refinement.md command to intelligently process Product Requirements Documents while preserving its core refinement capabilities</mission>
  </context>

  <transformation_strategy>
    <analysis_phase>
      Read and comprehend the current refinement.md structure to identify:
      - Core refinement logic to preserve
      - Story-specific elements to adapt
      - Input/output patterns to transform
      - Architectural principles to maintain
    </analysis_phase>
    
    <design_phase>
      Design the PRD-aware transformation:
      - Map PRD structure to story refinement workflow
      - Identify PRD sections that align with story elements
      - Plan extraction logic for features/epics/stories from PRD
      - Maintain vertical slicing and INVEST principles
    </design_phase>
    
    <implementation_phase>
      Execute intelligent updates to refinement.md:
      - Adapt input processing for PRD format
      - Transform story-reading logic to PRD parsing
      - Update refinement logic to handle multiple features
      - Preserve architectural analysis capabilities
    </implementation_phase>
  </transformation_strategy>

  <prd_processing_logic>
    <prd_structure_understanding>
      PRDs typically contain:
      - Executive summary and business objectives
      - User personas and use cases
      - Feature descriptions and requirements
      - Success metrics and KPIs
      - Technical constraints and dependencies
      - Timeline and release planning
    </prd_structure_understanding>
    
    <extraction_patterns>
      From PRD to refinable elements:
      - Features → Epic-level stories
      - Use cases → User stories
      - Requirements → Acceptance criteria
      - Constraints → Technical design parameters
      - Dependencies → Cross-story relationships
    </extraction_patterns>
  </prd_processing_logic>

  <update_specifications>
    <argument_changes>
      FROM: &lt;story-file-path&gt; &lt;output-file-path&gt;
      TO: &lt;prd-file-path&gt; [output-directory]
    </argument_changes>
    
    <phase_transformations>
      PHASE 1 UPDATE:
      - Change from reading individual story files to PRD parsing
      - Extract multiple features/stories from single PRD
      - Maintain context awareness across related features
      
      PHASE 2 UPDATE:
      - Analyze PRD holistically for cross-feature patterns
      - Identify shared components and reusable elements
      - Plan refinement for interconnected features
      
      PHASE 3 UPDATE:
      - Generate multiple refined outputs (one per major feature)
      - Create cross-reference documentation
      - Maintain traceability to original PRD sections
      
      PHASE 4 UPDATE:
      - Output refined feature files to specified directory
      - Generate index/summary of all refined features
      - Include PRD-to-story mapping documentation
    </phase_transformations>
  </update_specifications>

  <preservation_requirements>
    MAINTAIN these core capabilities:
    - Architectural expertise and design pattern application
    - Technical design enhancement logic
    - Implementation planning methodology
    - Task decomposition and estimation
    - INVEST and vertical slicing validation
    - Research integration capabilities
  </preservation_requirements>

  <execution_plan>
    1. Read current refinement.md to understand structure
    2. Create comprehensive edit operations using MultiEdit
    3. Transform input processing logic for PRD format
    4. Update analysis phases to handle PRD sections
    5. Adapt refinement execution for multiple features
    6. Enhance output generation for directory-based results
    7. Add PRD-specific validation and quality checks
    8. Update documentation and examples
  </execution_plan>

  <quality_assurance>
    Validate the updated command ensures:
    - Seamless PRD processing without losing refinement quality
    - Proper extraction of features and stories from PRD
    - Maintained architectural and technical excellence
    - Clear traceability from PRD to refined outputs
    - Backwards compatibility notes for migration
  </quality_assurance>
</command>

ULTRATHINK about optimal transformation strategy:

1. **Input Transformation**: How to elegantly handle PRD structure while maintaining the command's refinement power
2. **Multi-Feature Processing**: How to refine multiple interconnected features from a single PRD
3. **Context Preservation**: How to maintain PRD context across individual feature refinements
4. **Output Organization**: How to structure multiple refined outputs for developer consumption
5. **Traceability**: How to maintain clear links between PRD sections and refined features

Execute the transformation with surgical precision, ensuring the updated refinement.md becomes even more powerful with PRD input capabilities.