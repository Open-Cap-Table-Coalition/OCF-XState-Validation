import { GraphNode } from "types";

export const createVestingGraph = (graphNodes: GraphNode[]) => {
  // Create graph
  const graph = new Map(graphNodes.map((node) => [node.id, node]));

  // Calculate in-degrees of all nodes
  const inDegree = new Map<string, number>();
  for (const node of graph.values()) {
    inDegree.set(node.id, 0);
  }
  for (const node of graph.values()) {
    for (const nextConditionId of node.next_condition_ids) {
      inDegree.set(nextConditionId, (inDegree.get(nextConditionId) || 0) + 1);
    }
  }

  // Find root nodes
  const rootNodes = Array.from(inDegree.entries())
    .filter(([_, degree]) => degree === 0)
    .map(([nodeId]) => nodeId);

  if (rootNodes.length === 0) {
    throw new Error(`The graph does not have any root nodes`);
  }

  // Populate the prior_condition_ids array

  const stack = [...rootNodes];

  while (stack.length > 0) {
    const currentNodeId = stack.pop()!;
    const currentNode = graph.get(currentNodeId);
    if (!currentNode) {
      throw new Error(
        `Vesting condition with id ${currentNodeId} does not exist`
      );
    }

    for (const nextConditionId of currentNode.next_condition_ids) {
      const nextCondition = graph.get(nextConditionId);
      if (!nextCondition) {
        throw new Error(
          `Vesting condition with id ${nextConditionId} does not exist`
        );
      }

      if (
        nextCondition.trigger.type === "VESTING_RELATIONSHIP_EARLIER_OF" ||
        nextCondition.trigger.type === "VESTING_RELATIONSHIP_LATER_OF"
      ) {
        currentNode.part_of_relationship = true;
      }

      // Add the current node as a predecessor of the next node
      nextCondition.prior_condition_ids.push(currentNode.id);

      // Reduce the in-degree and push to the stack if it becomes 0
      inDegree.set(nextConditionId, (inDegree.get(nextConditionId) || 1) - 1);
      if (inDegree.get(nextConditionId) === 0) {
        stack.push(nextConditionId);
      }
    }
  }

  return { graph, rootNodes };
};
