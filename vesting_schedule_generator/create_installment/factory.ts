import type { GraphNode } from "types";
import {
  CreateInstallmentConfig,
  CreateInstallmentStrategy,
} from "./strategies/strategy";
import { VestingAbsoluteStrategy } from "./strategies/vesting_absolute";
import { VestingEarlierOfStrategy } from "./strategies/vesting_earlier_of";
import { VestingEventStrategy } from "./strategies/vesting_event";
import { VestingLaterOfStrategy } from "./strategies/vesting_later_of";
import { VestingRelativeStrategy } from "./strategies/vesting_relative";
import { VestingStartStrategy } from "./strategies/vesting_start";

export class InstallmentStrategyFactory {
  static getStrategy<T extends GraphNode>(node: T) {
    switch (node.trigger.type) {
      case "VESTING_START_DATE":
        return VestingStartStrategy as unknown as new (
          config: CreateInstallmentConfig<T>
        ) => CreateInstallmentStrategy<T>;
      case "VESTING_EVENT":
        return VestingEventStrategy as unknown as new (
          config: CreateInstallmentConfig<T>
        ) => CreateInstallmentStrategy<T>;
      case "VESTING_SCHEDULE_ABSOLUTE":
        return VestingAbsoluteStrategy as unknown as new (
          config: CreateInstallmentConfig<T>
        ) => CreateInstallmentStrategy<T>;
      case "VESTING_SCHEDULE_RELATIVE":
        return VestingRelativeStrategy as unknown as new (
          config: CreateInstallmentConfig<T>
        ) => CreateInstallmentStrategy<T>;
      case "VESTING_RELATIONSHIP_LATER_OF":
        return VestingLaterOfStrategy as unknown as new (
          config: CreateInstallmentConfig<T>
        ) => CreateInstallmentStrategy<T>;
      case "VESTING_RELATIONSHIP_EARLIER_OF":
        return VestingEarlierOfStrategy as unknown as new (
          config: CreateInstallmentConfig<T>
        ) => CreateInstallmentStrategy<T>;
    }
  }
}
