/**
 * Langfuse Tracing Example - TypeScript/JavaScript
 * Demonstrates how to use Langfuse SDK for direct tracing
 *
 * Prerequisites:
 *   npm install langfuse
 *   npm install @langfuse/node  # For Node.js backend
 *
 * Environment Variables (already set by feature-to-code.sh):
 *   LANGFUSE_PUBLIC_KEY
 *   LANGFUSE_SECRET_KEY
 *   LANGFUSE_HOST
 */

import { Langfuse } from "langfuse";

// Initialize Langfuse client
// Uses environment variables: LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST || "http://localhost:3000",
});

/**
 * Example 1: Manual trace creation
 */
async function featureWorkflowManual(
  featureDescription: string,
  executionId: string
) {
  // Create a trace
  const trace = langfuse.trace({
    name: "feature-to-code-workflow",
    userId: "script-runner",
    sessionId: executionId,
    metadata: {
      execution_id: executionId,
      feature: featureDescription,
    },
    tags: ["workflow", "feature-to-code"],
  });

  // Step 1: PRD Generation
  const prdSpan = trace.span({
    name: "generate-prd",
    metadata: { step: "1/5" },
    tags: ["prd", "documentation"],
  });

  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate work
  const prdResult = `PRD for: ${featureDescription}`;

  prdSpan.end({ output: prdResult });

  // Step 2: Design Generation
  const designSpan = trace.span({
    name: "generate-design",
    metadata: { step: "2/5" },
    tags: ["design", "technical"],
  });

  await new Promise((resolve) => setTimeout(resolve, 500));
  const designResult = `Design for: ${featureDescription}`;

  designSpan.end({ output: designResult });

  // Step 3: Task Generation
  const taskSpan = trace.span({
    name: "generate-tasks",
    metadata: { step: "3/5" },
    tags: ["tasks"],
  });

  await new Promise((resolve) => setTimeout(resolve, 500));
  const tasks = ["Task 1", "Task 2", "Task 3"];

  taskSpan.end({
    output: { tasks, count: tasks.length },
  });

  // Update the trace with final output
  trace.update({
    output: { status: "completed", tasks },
  });

  console.log(`✓ Trace created: ${trace.id}`);
  console.log(`  View at: ${process.env.LANGFUSE_HOST}`);

  return { status: "completed", tasks };
}

/**
 * Example 2: Tracing LLM calls
 */
async function callLLMWithTracing(prompt: string, model: string = "claude-3-5-sonnet") {
  const trace = langfuse.trace({
    name: "llm-call",
    tags: ["llm", "claude"],
  });

  const generation = trace.generation({
    name: "claude-api-call",
    model,
    modelParameters: {
      temperature: 0.7,
      maxTokens: 2000,
    },
    input: prompt,
    metadata: {
      provider: "anthropic",
    },
  });

  // Simulate LLM call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = `Response to: ${prompt.substring(0, 50)}...`;

  // Record the response and token usage
  generation.end({
    output: response,
    usage: {
      input: 100,
      output: 200,
      total: 300,
      unit: "TOKENS",
    },
  });

  return response;
}

/**
 * Example 3: Nested spans for complex workflows
 */
async function complexWorkflow(executionId: string) {
  const trace = langfuse.trace({
    name: "complex-workflow",
    sessionId: executionId,
    tags: ["workflow", "nested"],
  });

  // Parent span
  const parentSpan = trace.span({
    name: "data-processing",
    metadata: { phase: "processing" },
  });

  // Child span 1
  const fetchSpan = parentSpan.span({
    name: "fetch-data",
    metadata: { source: "database" },
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
  fetchSpan.end({ output: { records: 100 } });

  // Child span 2
  const transformSpan = parentSpan.span({
    name: "transform-data",
    metadata: { operation: "normalize" },
  });
  await new Promise((resolve) => setTimeout(resolve, 200));
  transformSpan.end({ output: { transformed: 100 } });

  // End parent span
  parentSpan.end({ output: { status: "completed" } });

  console.log(`✓ Complex workflow traced: ${trace.id}`);
}

/**
 * Example 4: Error tracking
 */
async function workflowWithError(executionId: string) {
  const trace = langfuse.trace({
    name: "workflow-with-error",
    sessionId: executionId,
  });

  const span = trace.span({
    name: "risky-operation",
  });

  try {
    // Simulate an error
    throw new Error("Something went wrong in the workflow");
  } catch (error) {
    // Record the error in Langfuse
    span.end({
      level: "ERROR",
      statusMessage: error.message,
      metadata: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      },
    });

    console.log(`✗ Error traced: ${trace.id}`);
  }
}

/**
 * Example 5: Using with observability from feature-to-code workflow
 */
async function integrateWithWorkflow(executionId: string, featureDescription: string) {
  // This shows how to add Langfuse tracing alongside OTEL
  const trace = langfuse.trace({
    name: "feature-to-code-enhanced",
    sessionId: executionId,
    metadata: {
      execution_id: executionId,
      feature: featureDescription,
      source: "bash-script",
    },
    tags: ["workflow", "automated", "langfuse-sdk"],
  });

  // Simulate the workflow steps
  const steps = [
    { name: "generate-prd", duration: 500 },
    { name: "generate-design", duration: 600 },
    { name: "generate-tasks", duration: 400 },
    { name: "execute-tasks", duration: 1000 },
  ];

  for (const step of steps) {
    const span = trace.span({
      name: step.name,
      metadata: { step: step.name },
    });

    await new Promise((resolve) => setTimeout(resolve, step.duration));

    span.end({
      output: { status: "completed" },
      metadata: { duration_ms: step.duration },
    });

    console.log(`✓ Completed: ${step.name}`);
  }

  trace.update({
    output: { status: "workflow-completed", steps: steps.length },
  });

  console.log(`✓ Enhanced workflow traced: ${trace.id}`);
}

/**
 * Main execution
 */
async function main() {
  const executionId = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
  const feature = "User authentication with OAuth2";

  console.log("=".repeat(50));
  console.log("Langfuse Tracing Examples - TypeScript");
  console.log("=".repeat(50));
  console.log();

  try {
    // Example 1: Manual workflow
    console.log("Running manual workflow...");
    await featureWorkflowManual(feature, executionId);
    console.log();

    // Example 2: LLM call tracing
    console.log("Simulating LLM call...");
    const llmResponse = await callLLMWithTracing(`Generate a PRD for: ${feature}`);
    console.log(`LLM Response: ${llmResponse}`);
    console.log();

    // Example 3: Complex nested workflow
    console.log("Running complex workflow...");
    await complexWorkflow(`${executionId}_complex`);
    console.log();

    // Example 4: Error tracking
    console.log("Demonstrating error tracking...");
    await workflowWithError(`${executionId}_error`);
    console.log();

    // Example 5: Integration with feature-to-code
    console.log("Running enhanced workflow...");
    await integrateWithWorkflow(`${executionId}_enhanced`, feature);
    console.log();

    // Flush all pending traces
    await langfuse.flushAsync();

    console.log("=".repeat(50));
    console.log("✓ All traces sent to Langfuse!");
    console.log(`View at: http://localhost:3000`);
    console.log(`Search for execution_id: ${executionId}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("Error running examples:", error);
  } finally {
    // Always flush and shutdown
    await langfuse.shutdownAsync();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  featureWorkflowManual,
  callLLMWithTracing,
  complexWorkflow,
  workflowWithError,
  integrateWithWorkflow,
};
