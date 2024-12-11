import {
  ShouldBeInExecutionPathStrategy,
  ShouldBeInExecutionPathStrategyConfig,
} from "./strategy";
import type { AbsoluteGraphNode } from "types";
import { parse, parseISO } from "date-fns";

export class VestingAbsoluteShouldBeInExecutionPath extends ShouldBeInExecutionPathStrategy<AbsoluteGraphNode> {
  constructor(
    config: ShouldBeInExecutionPathStrategyConfig<AbsoluteGraphNode>
  ) {
    super(config);
  }

  protected evaluate() {
    // Absolute conditions are deemed to be in the execution path
    return true;
  }

  execute() {
    const evaluateResult = this.evaluate();

    if (evaluateResult) {
      const nodeDate = this.determineNodeDate();
      this.setTriggeredDate(nodeDate);
    }

    return evaluateResult;
  }

  protected determineNodeDate(): Date {
    return parseISO(this.config.node.trigger.date);
  }
}
