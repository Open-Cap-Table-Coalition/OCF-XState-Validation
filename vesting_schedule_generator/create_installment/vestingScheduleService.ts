import type {
  GraphNode,
  PreProcessedVestingInstallment,
  VestingInstallment,
  OCFDataBySecurityId,
} from "types";
import { InstallmentStrategyFactory } from "./factory";

export class VestingScheduleService {
  public vestingSchedule: PreProcessedVestingInstallment[] = [];
  private vestedCount = 0;
  constructor(
    private ocfData: OCFDataBySecurityId,
    private executionStack: Map<string, GraphNode>
  ) {}

  public addToVestingSchedule(installments: VestingInstallment[]) {
    const totalVested = installments.reduce((acc, installment) => {
      return (acc += installment.quantity);
    }, 0);

    this.vestedCount += totalVested;

    this.vestingSchedule.push(...installments);
  }

  public createInstallments(node: GraphNode) {
    const Strategy = InstallmentStrategyFactory.getStrategy(node);

    const installments = new Strategy({
      node,
      vestedCount: this.vestedCount,
      ocfData: this.ocfData,
      executionStack: this.executionStack,
    }).getInstallments();

    return installments;
  }
}
