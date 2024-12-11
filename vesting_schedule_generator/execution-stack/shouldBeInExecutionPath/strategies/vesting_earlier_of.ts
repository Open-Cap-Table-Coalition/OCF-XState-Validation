import {
  ShouldBeInExecutionPathStrategy,
  ShouldBeInExecutionPathStrategyConfig,
} from "./strategy";
import type { EarlierOfGraphNode, GraphNode } from "types";
import { isBefore, isEqual } from "date-fns";

export class VestingEarlierOfShouldBeInExecutionPath extends ShouldBeInExecutionPathStrategy<EarlierOfGraphNode> {
  private earliestParent!: GraphNode;
  constructor(
    config: ShouldBeInExecutionPathStrategyConfig<EarlierOfGraphNode>
  ) {
    super(config);
  }

  /**
   * EARLIER_OF relationships select the earlier of their parents to be in the execution graph
   * Evaluates to true only if at least one parent is in the execution graph with a triggeredDate.
   * @returns boolean
   */
  protected evaluate(): boolean {
    // Find parents in execution stack
    const inputConditionIds = this.config.node.trigger.input_condition_ids;
    const executionStackIds = [...this.config.graph.keys()];
    const parentIsInExecutionStack = inputConditionIds.some((id) =>
      executionStackIds.includes(id)
    );

    if (!parentIsInExecutionStack) {
      return false;
    }

    // Determine earliest parent in execution stack
    let earliestParent: GraphNode | undefined;
    this.parentNodes.forEach((parentNode) => {
      if (
        !earliestParent || // No earliestNode selected yet
        isBefore(parentNode.triggeredDate!, earliestParent.triggeredDate!) || // Found an earlier node
        (isEqual(parentNode.triggeredDate!, earliestParent.triggeredDate!) &&
          this.parentNodes.indexOf(parentNode) <
            this.parentNodes.indexOf(earliestParent)) // Tie-breaker based on insertion order
      ) {
        earliestParent = parentNode;
      }
    });

    // Return an error if the earliestParent does not have a triggered date
    if (!earliestParent || !earliestParent.triggeredDate) {
      // TODO
      // Consider throwing a warning or error here because this should not happen
      // throw new Error(`EARLIER_OF relationship with id ${this.config.node.id} does not have a parent condition in the execution graph with a triggered date`)

      return false;
    }

    this.earliestParent = earliestParent;
    return true;
  }

  execute() {
    const evaluateResult = this.evaluate();

    if (evaluateResult) {
      // Set the triggeredDate of this node to the trigger date of the earliestParent
      this.config.node.triggeredDate = this.determineNodeDate();

      // Remove any parents that are not the earliest parent from the execution stack
      const parentsToDelete = [...this.parentNodes].reduce(
        (acc, parentNode) => {
          if (parentNode !== this.earliestParent) {
            acc.push(parentNode);
          }
          return acc;
        },
        [] as GraphNode[]
      );

      parentsToDelete.forEach((parentNode) =>
        this.config.executionStack.delete(parentNode.id)
      );

      // Add the next_condition_ids of the earliest parent to the
      // next_condition_ids array of this EARLIER_OF relationship,
      // other than the reference to this EARLIER_OF relationship
      this.earliestParent.next_condition_ids.forEach((id) => {
        if (id !== this.config.node.id) {
          this.config.node.next_condition_ids.push(id);
        }
      });
    }

    return evaluateResult;
  }

  protected determineNodeDate(): Date {
    return this.earliestParent.triggeredDate!;
  }
}
