import { isBefore, isEqual } from "date-fns";
import type {
  GraphNode,
  LaterOfGraphNode,
  PreProcessedVestingInstallment,
} from "types";
import { InstallmentStrategyFactory } from "../factory";
import { CreateInstallmentConfig, CreateInstallmentStrategy } from "./strategy";

export class VestingLaterOfStrategy extends CreateInstallmentStrategy<LaterOfGraphNode> {
  constructor(config: CreateInstallmentConfig<LaterOfGraphNode>) {
    super(config);
  }

  private getParentNodes() {
    let parentNodes: GraphNode[] = [];

    const parentNodeIds = this.config.node.prior_condition_ids;
    for (const [id, node] of this.config.executionStack.entries()) {
      if (parentNodeIds.includes(id)) {
        parentNodes.push(node);
        if (parentNodes.length === parentNodeIds.length) {
          // stop early if all parentNodeIds have been found
          break;
        }
      }
    }

    return parentNodes;
  }

  private getParentInstallments(): PreProcessedVestingInstallment[][] {
    // create the installments for the parents, because they were skipped

    const { vestedCount, ocfData, executionStack } = this.config;

    const parentNodes = this.getParentNodes();

    const parentInstallmentArray: PreProcessedVestingInstallment[][] = [[]];
    for (const parentNode of parentNodes) {
      const Strategy = InstallmentStrategyFactory.getStrategy(parentNode);

      const installments = new Strategy({
        node: parentNode,
        vestedCount,
        ocfData,
        executionStack,
      }).getInstallments();

      parentInstallmentArray.push(installments);
    }

    return parentInstallmentArray;
  }

  protected getTotalQuantity(): number {
    const calculation_type = this.config.node.trigger.calculation_type;
    const latestDate = this.config.node.triggeredDate!;

    const parentInstallmentsArray = this.getParentInstallments();

    // accumulate until the latest date
    const amountsArray = parentInstallmentsArray.map((parentInstallments) => {
      if (parentInstallments.length === 0) {
        return 0;
      }

      if (parentInstallments.length === 1) {
        return parentInstallments[0].quantity;
      }

      const accumulatedAmount = parentInstallments.reduce(
        (acc, installment) => {
          const installmentDate = installment.date;
          if (
            isBefore(installmentDate, latestDate) ||
            isEqual(installmentDate, latestDate)
          ) {
            return acc + installment.quantity;
          }
          return acc;
        },
        0
      );

      return accumulatedAmount;
    });

    // TODO: call out in documentation that MEAN rounds down?

    let amount: number;
    switch (calculation_type) {
      case "SUM":
        amount = amountsArray.reduce((acc, amount) => {
          return acc + amount;
        }, 0);
        break;
      case "MAX":
        amount = amountsArray.reduce((acc, amount) => {
          return Math.max(acc, amount);
        }, 0);
        break;
      case "MIN":
        amount = amountsArray.reduce((acc, amount) => {
          return Math.min(acc, amount);
        }, Infinity);
        break;
      case "MEAN":
        const count = amountsArray.length;
        const sum = amountsArray.reduce((acc, amount) => {
          return acc + amount;
        }, 0);
        amount = Math.floor(sum / count);
        break;
      case "MODE":
        const frequency = amountsArray.reduce(
          (acc, amount) => {
            acc[amount] = (acc[amount] || 0) + 1;
            return acc;
          },
          {} as Record<number, number>
        );

        let mode = 0;
        let maxCount = 0;

        for (const amount in frequency) {
          if (frequency[amount] > maxCount) {
            maxCount = frequency[amount];
            mode = Number(amount);
          }
        }

        amount = mode;
        break;
    }

    return amount;
  }

  getInstallments() {
    const totalQuantity = this.getTotalQuantity();

    const installment = this.createInstallment({
      date: this.config.node.triggeredDate!,
      quantity: totalQuantity,
      beforeCliff: false,
    });

    return [installment];
  }
}
