import {
  ShouldBeInExecutionPathStrategy,
  ShouldBeInExecutionPathStrategyConfig,
} from "./strategy";
import type { GraphNode, RelativeGraphNode } from "types";

export class VestingRelativeShouldBeInExecutionPath extends ShouldBeInExecutionPathStrategy<RelativeGraphNode> {
  private relativeCondition: GraphNode | undefined;
  constructor(
    config: ShouldBeInExecutionPathStrategyConfig<RelativeGraphNode>
  ) {
    super(config);
    this.relativeCondition = this.config.executionStack.get(
      this.config.node.trigger.relative_to_condition_id
    );
  }

  protected evaluate() {
    if (!this.relativeCondition) {
      return false;
    }

    if (!this.relativeCondition.triggeredDate) {
      throw new Error(
        `Vesting condition with id ${this.relativeCondition?.id} is in the execution stack but does not have a triggered date`
      );
    }

    return true;
  }

  execute() {
    const result = this.evaluate();

    if (result) {
      const nodeDate = this.determineNodeDate();
      this.setTriggeredDate(nodeDate);
    }

    return result;
  }

  protected determineNodeDate(): Date {
    return this.relativeCondition!.triggeredDate!;
  }
}
