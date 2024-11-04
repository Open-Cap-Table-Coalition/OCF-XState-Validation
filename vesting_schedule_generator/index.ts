import type {
  TX_Vesting_Start,
  TX_Equity_Compensation_Issuance,
  TX_Equity_Compensation_Exercise,
  VestingTerms,
  Valuation,
} from "../types";
import { ExerciseTransactionsService } from "./exercise_transactions";
import { VestingCalculatorService } from "./vesting_calculator";
import { VestingInitializationService } from "./vesting_initialization";

export interface VestingSchedule {
  Date: string;
  "Event Type": "Start" | "Cliff" | "Vesting" | "Exercise";
  "Event Quantity": number;
  "Remaining Unvested": number;
  "Cumulative Vested": number;
  "Became Exercisable": number;
  "Cumulative Exercised": number;
  "Available to Exercise": number;
}

export class VestingScheduleService {
  private initializationService: VestingInitializationService;
  private calculationService: VestingCalculatorService;
  private exerciseTransactionsService: ExerciseTransactionsService;
  private vestingSchedule: VestingSchedule[];

  constructor(
    private vestingTerms: VestingTerms[],
    private transactions: (
      | TX_Equity_Compensation_Issuance
      | TX_Vesting_Start
      | TX_Equity_Compensation_Exercise
    )[],
    private securityId: string
  ) {
    // initialize vesting data
    this.initializationService = new VestingInitializationService(
      this.transactions,
      this.vestingTerms,
      this.securityId
    );
    const { tx_issuance, tx_vestingStart, issuanceVestingTerms } =
      this.initializationService.setUpVestingData();

    // calculate vesting schedule
    this.calculationService = new VestingCalculatorService(
      tx_issuance,
      tx_vestingStart,
      issuanceVestingTerms
    );
    (this.vestingSchedule = this.calculationService.generate()),
      // add exercise details to vesting schedule
      (this.exerciseTransactionsService = new ExerciseTransactionsService(
        transactions.filter(
          (tx): tx is TX_Equity_Compensation_Exercise =>
            tx.object_type === "TX_EQUITY_COMPENSATION_EXERCISE" &&
            tx.security_id === securityId
        ),
        this.vestingSchedule
      ));
    this.vestingSchedule =
      this.exerciseTransactionsService.handleExerciseTransactions();
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
