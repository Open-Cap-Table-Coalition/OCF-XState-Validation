import { VestingSchedule } from ".";
import { TX_Equity_Compensation_Exercise } from "../types";

export class ExerciseTransactionsService {
  private cumulativeExercised = 0;
  private availableToExercise = 0;

  constructor(
    private exerciseTransactions: TX_Equity_Compensation_Exercise[],
    private vestingSchedule: VestingSchedule[]
  ) {
    this.sortTransactions();
    this.sortVestingSchedule();
  }

  private sortTransactions() {
    this.exerciseTransactions.sort((a: { date: string }, b: { date: string }) =>
      a.date.localeCompare(b.date)
    );
  }

  private sortVestingSchedule() {
    this.vestingSchedule.sort((a: { Date: string }, b: { Date: string }) =>
      a.Date.localeCompare(b.Date)
    );
  }

  private getLastVestingEventBeforeExercise(dateString: string) {
    const tx_date = new Date(dateString);

    // filter out exercise transactions
    const filteredSchedule = this.vestingSchedule.filter(
      (schedule) => schedule["Event Type"] !== "Exercise"
    );

    // binary search
    let left = 0;
    let right = filteredSchedule.length - 1;
    let result = {
      lastVestingEventBeforeExercise: {} as VestingSchedule,
      index: 0,
    };

    while (left <= right) {
      let mid = Math.floor((left + right) / 2);
      const midEvent = filteredSchedule[mid];
      const midDate = new Date(midEvent.Date);

      if (midDate <= tx_date) {
        result = {
          lastVestingEventBeforeExercise: midEvent,
          index: mid,
        };
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  }

  private processExerciseTx(
    tx: TX_Equity_Compensation_Exercise,
    installment: VestingSchedule,
    index: number
  ) {
    const quantityExercised = parseFloat(tx.quantity);
    this.cumulativeExercised += quantityExercised;

    const event: VestingSchedule = {
      Date: tx.date,
      "Event Type": "Exercise",
      "Event Quantity": quantityExercised,
      "Remaining Unvested": installment["Remaining Unvested"],
      "Cumulative Vested": installment["Cumulative Vested"],
      "Became Exercisable": 0,
      "Cumulative Exercised": this.cumulativeExercised,
      "Available to Exercise": 0,
    };

    this.vestingSchedule.splice(index + 1, 0, event);
  }

  private populateAvailableToExercise() {
    const populatedSchedule = this.vestingSchedule.map((installment) => {
      if (installment["Event Type"] !== "Exercise") {
        this.availableToExercise += installment["Became Exercisable"];
        return {
          ...installment,
          "Available to Exercise": this.availableToExercise,
        };
      } else {
        this.availableToExercise -= installment["Event Quantity"];
        return {
          ...installment,
          "Available to Exercise": this.availableToExercise,
        };
      }
    });

    this.vestingSchedule = populatedSchedule;
  }

  public handleExerciseTransactions() {
    this.exerciseTransactions.forEach((tx) => {
      const lastVestingEvent = this.getLastVestingEventBeforeExercise(tx.date);

      if (!lastVestingEvent) {
        throw new Error("Invalid exercise prior to the Start event");
      }

      const { lastVestingEventBeforeExercise, index } = lastVestingEvent;

      this.processExerciseTx(tx, lastVestingEventBeforeExercise, index);
    });
    this.populateAvailableToExercise();
    return this.vestingSchedule;
  }
}
