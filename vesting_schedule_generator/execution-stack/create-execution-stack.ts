import type { GraphNode, OCFDataBySecurityId } from "types";
import { ShouldBeInExecutionPathStrategyFactory } from "./shouldBeInExecutionPath/factory";

interface CreateExecutionStackConfig {
  currentNodeId: string;
  visited: Set<string>;
  executionStack: Map<string, GraphNode>;
  graph: Map<string, GraphNode>;
  recursionStack: Set<string>;
  ocfData: OCFDataBySecurityId;
}

export const createExecutionStack = (
  graph: Map<string, GraphNode>,
  rootNodes: string[],
  ocfData: OCFDataBySecurityId
): Map<string, GraphNode> => {
  const visited = new Set<string>();
  const executionStack = new Map<string, GraphNode>();
  const deferredSet = new Set<string>();

  // Use a queue to manage nodes to process
  const nodesToProcess = [...rootNodes];

  while (nodesToProcess.length > 0) {
    const currentNodeId = nodesToProcess.shift()!;

    const interimResult = traverseNode({
      currentNodeId: currentNodeId,
      visited,
      executionStack,
      graph,
      recursionStack: new Set<string>(),
      ocfData,
    });

    // Re-add deferred nodes
    if (interimResult === "DEFER" && !deferredSet.has(currentNodeId)) {
      nodesToProcess.push(currentNodeId);
      deferredSet.add(currentNodeId);
    }
  }

  return executionStack;
};

const traverseNode = (
  config: CreateExecutionStackConfig
): "DEFER" | "PROCEED" => {
  const {
    currentNodeId,
    visited,
    executionStack,
    graph,
    recursionStack,
    ocfData,
  } = config;

  // Check if there is a cycle
  if (recursionStack.has(currentNodeId)) {
    throw new Error(
      `Cycle detected involving the vesting condition with id ${currentNodeId}`
    );
  }

  // Skip processing if the node has already been visited
  if (visited.has(currentNodeId)) {
    return "PROCEED"; // already processed, no deferral needed
  }

  const currentNode = graph.get(currentNodeId);
  if (!currentNode) {
    throw new Error(
      `Vesting condition with id ${currentNodeId} does not exist`
    );
  }

  // Check if all predecessors have been evaluated
  if (
    currentNode.prior_condition_ids.some(
      (predecessorId) => !visited.has(predecessorId)
    )
  ) {
    // Defer processing if not all predecessors have been evaluated
    return "DEFER";
  }

  // Mark the node as visited and add to the recursion stack
  visited.add(currentNodeId);
  recursionStack.add(currentNodeId);

  // Determine if the current node should be in the execution stack
  const strategy =
    ShouldBeInExecutionPathStrategyFactory.getStrategy(currentNode);
  const shouldBeIncluded = new strategy({
    node: currentNode,
    graph: graph,
    executionStack: executionStack,
    ocfData: ocfData,
  }).execute();

  if (shouldBeIncluded) {
    executionStack.set(currentNodeId, currentNode);

    // Recursively process all next conditions
    for (const nextConditionId of currentNode.next_condition_ids) {
      traverseNode({
        currentNodeId: nextConditionId,
        visited: visited,
        executionStack: executionStack,
        graph: graph,
        recursionStack: recursionStack,
        ocfData: ocfData,
      });
    }
  }

  // Remove from recursion stack
  recursionStack.delete(currentNodeId);

  return "PROCEED"; // Indicate that no deferral is required
};
