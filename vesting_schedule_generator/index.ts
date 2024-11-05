import { OcfPackageContent } from "../read_ocf_package";
import type {
  TX_Equity_Compensation_Exercise,
  VestingTerms,
  Transaction,
} from "../types";
import { ExerciseTransactionsService } from "./exercise_transactions";
import { VestingCalculatorService } from "./vesting_calculator";
import { VestingInitializationService } from "./vesting_initialization";

export type VestingInstallmentEventType =
  | "Grant Date"
  | "Start"
  | "Cliff"
  | "Vesting"
  | "Exercise";

export interface VestingInstallment {
  Date: string;
  "Event Type": VestingInstallmentEventType;
  "Event Quantity": number;
  "Remaining Unvested": number;
  "Cumulative Vested": number;
  "Became Exercisable": number;
  "Cumulative Exercised": number;
  "Available to Exercise": number;
}

export class VestingScheduleService {
  private vestingTerms!: VestingTerms[];
  private transactions!: Transaction[];
  private vestingSchedule!: VestingInstallment[];

  constructor(
    private ocfPackage: OcfPackageContent,
    private securityId: string
  ) {
    this.deconstructOCFPackage();
    this.generateVestingSchedule();
    this.addExerciseDetailsToVestingSchedule();
  }

  private deconstructOCFPackage() {
    const { vestingTerms, transactions } = this.ocfPackage;
    this.vestingTerms = vestingTerms;
    this.transactions = transactions;
  }

  private generateVestingSchedule() {
    const initializationService = new VestingInitializationService(
      this.transactions,
      this.vestingTerms,
      this.securityId
    );

    const { tx_issuance, tx_vestingStart, issuanceVestingTerms } =
      initializationService.setUpVestingData();

    const calculationService = new VestingCalculatorService(
      tx_issuance,
      tx_vestingStart,
      issuanceVestingTerms
    );
    this.vestingSchedule = calculationService.vestingSchedule;
  }

  private addExerciseDetailsToVestingSchedule() {
    const exerciseTransactions = this.transactions.filter(
      (tx): tx is TX_Equity_Compensation_Exercise =>
        tx.object_type === "TX_EQUITY_COMPENSATION_EXERCISE" &&
        tx.security_id === this.securityId
    );

    const exerciseTransactionsService = new ExerciseTransactionsService(
      exerciseTransactions,
      this.vestingSchedule
    );
    this.vestingSchedule =
      exerciseTransactionsService.handleExerciseTransactions();
  }

  public getFullSchedule() {
    return this.vestingSchedule;
  }

  public getVestingStatus(checkDateString: string) {
    const status = this.vestingSchedule.find(
      (schedule) =>
        Date.parse(schedule.Date) >= Date.parse(checkDateString) &&
        schedule["Event Type"] !== "Exercise"
    );
    return status;
  }
}
