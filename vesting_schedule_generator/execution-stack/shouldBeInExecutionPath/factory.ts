import type { GraphNode } from "types";
import {
  ShouldBeInExecutionPathStrategy,
  ShouldBeInExecutionPathStrategyConfig,
} from "./strategies/strategy";
import { VestingAbsoluteShouldBeInExecutionPath } from "./strategies/vesting_absolute";
import { VestingEarlierOfShouldBeInExecutionPath } from "./strategies/vesting_earlier_of";
import { VestingEventShouldBeInExecutionPath } from "./strategies/vesting_event";
import { VestingLaterOfShouldBeInExecutionPath } from "./strategies/vesting_later_of";
import { VestingRelativeShouldBeInExecutionPath } from "./strategies/vesting_relative";
import { VestingStartShouldBeInExecutionPath } from "./strategies/vesting_start";

export class ShouldBeInExecutionPathStrategyFactory {
  static getStrategy<T extends GraphNode>(node: T) {
    switch (node.trigger.type) {
      case "VESTING_START_DATE":
        return VestingStartShouldBeInExecutionPath as unknown as new (
          config: ShouldBeInExecutionPathStrategyConfig<T>
        ) => ShouldBeInExecutionPathStrategy<T>;
      case "VESTING_EVENT":
        return VestingEventShouldBeInExecutionPath as unknown as new (
          config: ShouldBeInExecutionPathStrategyConfig<T>
        ) => ShouldBeInExecutionPathStrategy<T>;
      case "VESTING_SCHEDULE_ABSOLUTE":
        return VestingAbsoluteShouldBeInExecutionPath as unknown as new (
          config: ShouldBeInExecutionPathStrategyConfig<T>
        ) => ShouldBeInExecutionPathStrategy<T>;
      case "VESTING_SCHEDULE_RELATIVE":
        return VestingRelativeShouldBeInExecutionPath as unknown as new (
          config: ShouldBeInExecutionPathStrategyConfig<T>
        ) => ShouldBeInExecutionPathStrategy<T>;
      case "VESTING_RELATIONSHIP_LATER_OF":
        return VestingLaterOfShouldBeInExecutionPath as unknown as new (
          config: ShouldBeInExecutionPathStrategyConfig<T>
        ) => ShouldBeInExecutionPathStrategy<T>;
      case "VESTING_RELATIONSHIP_EARLIER_OF":
        return VestingEarlierOfShouldBeInExecutionPath as unknown as new (
          config: ShouldBeInExecutionPathStrategyConfig<T>
        ) => ShouldBeInExecutionPathStrategy<T>;
    }
  }
}
