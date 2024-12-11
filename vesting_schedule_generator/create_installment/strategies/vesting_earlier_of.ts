import type { EarlierOfGraphNode, GraphNode } from "types";
import { InstallmentStrategyFactory } from "../factory";
import { CreateInstallmentConfig, CreateInstallmentStrategy } from "./strategy";

export class VestingEarlierOfStrategy extends CreateInstallmentStrategy<EarlierOfGraphNode> {
  constructor(config: CreateInstallmentConfig<EarlierOfGraphNode>) {
    super(config);
  }

  private getParentNode(): GraphNode {
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

    if (parentNodes.length !== 1) {
      /*
      TODO
      Consider throwing an error here
      throw new Error(`Vesting condition with id ${this.config.node.id} is an EARLIER_OF relationship with more than one predecessor in the execution stack`)
      */
      return parentNodes[0];
    }

    return parentNodes[0];
  }

  getInstallments() {
    // create the installments for the parent, because it was skipped
    const { vestedCount, ocfData, executionStack } = this.config;

    const parentNode = this.getParentNode();

    if (!parentNode) {
      /*
      TODO
      Consider throwing an error here
      */
      return [];
    }

    const strategy = InstallmentStrategyFactory.getStrategy(parentNode);

    const installments = new strategy({
      node: parentNode,
      vestedCount,
      ocfData,
      executionStack,
    }).getInstallments();

    return installments;
  }
}
