import {
  ShouldBeInExecutionPathStrategy,
  ShouldBeInExecutionPathStrategyConfig,
} from "./strategy";
import type { LaterOfGraphNode } from "types";

export class VestingLaterOfShouldBeInExecutionPath extends ShouldBeInExecutionPathStrategy<LaterOfGraphNode> {
  constructor(config: ShouldBeInExecutionPathStrategyConfig<LaterOfGraphNode>) {
    super(config);
  }

  /**
   * LATER_OF relationships are in the execution path only if both of their parents are in the execution path
   * @returns boolean
   */
  protected evaluate() {
    if (this.parentNodes.length < 2) {
      throw new Error(
        `Vesting condition with id ${this.config.node.id} is a LATER_OF relationship with less than two parents`
      );
    }

    const inputConditionIds = this.config.node.trigger.input_condition_ids;
    const executionStackIds = [...this.config.graph.keys()];
    const bothParentsAreInExecutionStack = inputConditionIds.every((id) =>
      executionStackIds.includes(id)
    );

    const latestParentDate = this.determineLatestParentDate();
    if (!latestParentDate) {
      throw new Error(
        `Vesting condition with id ${this.config.node.id} is a LATER_OF relationship but its \`latestParentDate\` returned \`null\``
      );
    }

    return bothParentsAreInExecutionStack;
  }

  execute() {
    const evaluateResult = this.evaluate();

    if (evaluateResult) {
      const nodeDate = this.determineNodeDate();
      this.setTriggeredDate(nodeDate);

      // set the triggered date of the parent nodes as well, in case they are serving as references to relative node
      // this isn't required for EARLIER_OF relationships because the earlier of vesting condition retains its triggered date
      this.parentNodes.forEach((parentNode) => {
        parentNode.triggeredDate = nodeDate;
      });
    }

    return evaluateResult;
  }

  /**
   * In the case of a LATER_OF relationship, the node date is the later of its parents' triggered dates
   * @returns Date
   */
  protected determineNodeDate(): Date {
    return this.determineLatestParentDate()!;
  }
}
