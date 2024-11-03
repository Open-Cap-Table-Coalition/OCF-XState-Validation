import { VestingSchedule } from ".";
import {
  TX_Equity_Compensation_Issuance,
  TX_Vesting_Start,
  VestingCondition,
  VestingCondition_VestingScheduleRelative,
  VestingCondition_VestingStart,
  VestingTerms,
} from "../read_ocf_package";

export class VestingCalculatorService {
  private vestingMode!: (
    installment: number,
    denominator: string,
    numerator?: string
  ) => number;
  private quantity: number;
  private unvested: number;
  private vested = 0;
  private EARLY_EXERCISABLE: boolean;
  private transactionDate!: Date;
  private vestingConditionId!: string;
  private currentVestingCondition!: VestingCondition;
  private vestingSchedule: VestingSchedule[] = [];
  private hasBeenGenerated: boolean = false;

  constructor(
    private tx_issuance: TX_Equity_Compensation_Issuance,
    private tx_vestingStart: TX_Vesting_Start,
    private issuanceVestingTerms: VestingTerms
  ) {
    this.determineVestingMode(),
      (this.quantity = parseFloat(this.tx_issuance.quantity));
    this.unvested = this.quantity;
    this.EARLY_EXERCISABLE = !!this.tx_issuance.early_exercisable;
  }

  private determineVestingMode() {
    switch (this.issuanceVestingTerms.allocation_type) {
      case "CUMULATIVE_ROUNDING":
        this.vestingMode = (installment: number, denominator: string) => {
          const cumulativePercent = (installment + 1) / parseFloat(denominator);
          if (installment === 0) {
            return Math.ceil(cumulativePercent * this.quantity);
          }
          const lastCumulativePercent = installment / parseFloat(denominator);
          return (
            Math.ceil(cumulativePercent * this.quantity) -
            Math.floor(lastCumulativePercent * this.quantity)
          );
        };
        break;
      case "CUMULATIVE_ROUND_DOWN":
        this.vestingMode = (installment: number, denominator: string) => {
          const cumulativePercent = (installment + 1) / parseFloat(denominator);
          if (installment === 0) {
            return Math.ceil(cumulativePercent * this.quantity);
          }
          const lastCumulativePercent = installment / parseFloat(denominator);
          return (
            Math.ceil(cumulativePercent * this.quantity) -
            Math.floor(lastCumulativePercent * this.quantity)
          );
        };
        break;
      case "FRONT_LOADED":
        this.vestingMode = (installment: number, denominator: string) => {
          const remainder = this.quantity % parseFloat(denominator);
          if (installment < remainder) {
            return Math.ceil(this.quantity / parseFloat(denominator));
          }
          return Math.floor(this.quantity / parseFloat(denominator));
        };
        break;
      case "BACK_LOADED":
        this.vestingMode = (installment: number, denominator: string) => {
          const remainder = this.quantity % parseFloat(denominator);
          if (installment < remainder) {
            return Math.floor(this.quantity / parseFloat(denominator));
          }
          return Math.ceil(this.quantity / parseFloat(denominator));
        };
        break;
      case "FRONT_LOADED_TO_SINGLE_TRANCHE":
        this.vestingMode = (installment: number, denominator: string) => {
          const remainder = this.quantity % parseFloat(denominator);
          if (installment < remainder) {
            return (
              Math.floor(this.quantity / parseFloat(denominator)) + remainder
            );
          }
          return Math.floor(this.quantity / parseFloat(denominator));
        };
        break;
      case "BACK_LOADED_TO_SINGLE_TRANCHE":
        this.vestingMode = (installment: number, denominator: string) => {
          const remainder = this.quantity % parseFloat(denominator);
          if (installment < remainder) {
            return (
              Math.floor(this.quantity / parseFloat(denominator)) + remainder
            );
          }
          return Math.floor(this.quantity / parseFloat(denominator));
        };
        break;
      default:
        this.vestingMode = (installment, denominator, numerator = "0") =>
          (this.quantity * parseFloat(numerator)) / parseFloat(denominator);
        break;
    }
  }

  private handleVestingStartTx() {
    // initialize the first transaction date and the vestingConditionId to the vesting start date
    this.transactionDate = new Date(this.tx_vestingStart.date);
    this.vestingConditionId = this.tx_vestingStart.vesting_condition_id;

    // throw error if no vesting conditions for the provided security id or if the first condition does not have a Vesting_Start_Date trigger
    const currentVestingCondition =
      this.issuanceVestingTerms.vesting_conditions.find(
        (vc): vc is VestingCondition_VestingStart =>
          vc.id === this.vestingConditionId
      );
    if (!currentVestingCondition) {
      throw new Error(
        `Vesting conditions for vesting start id ${this.tx_vestingStart.id} not found`
      );
    } else if (currentVestingCondition.trigger.type !== "VESTING_START_DATE") {
      throw new Error(
        `For this generator, the first condition must have a VESTING_START_DATE trigger.`
      );
    }
    this.currentVestingCondition = currentVestingCondition;

    const { numerator = "0", denominator = "0" } =
      this.currentVestingCondition.portion || {};
    const parsedNumerator = parseFloat(numerator);
    const parsedDenominator = parseFloat(denominator);
    const amountVested =
      parsedDenominator !== 0
        ? (this.quantity * parsedNumerator) / parsedDenominator
        : 0;
    this.vested += amountVested;
    this.unvested - +amountVested;

    // designate the entire option as becoming exercisable as of the "Start" event if the option is early exercisable
    const becameExercisable = this.quantity * +this.EARLY_EXERCISABLE;

    const event: VestingSchedule = {
      Date: this.transactionDate.toISOString().split("T")[0],
      "Event Type": "Start",
      "Event Quantity": amountVested,
      "Remaining Unvested": this.unvested,
      "Cumulative Vested": this.vested,
      "Became Exercisable": becameExercisable,
      "Cumulative Exercised": 0,
      "Available to Exercise": 0, // placeholder to be populated via the exercise service
    };

    this.vestingSchedule.push(event);
    return this;
  }

  private handleCliffCondition(cliffLength: number) {

    const scheduleWithCliff = this.vestingSchedule.map((schedule, index) => {
      const cliffIndex = cliffLength - 1;

      // index 0 is the "Start" event and we leave it alone
      if (index === 0) {
        return schedule;
      }

      // modify the cliff installment
      if (index === cliffIndex) {
        const installment: VestingSchedule = {
          ...schedule,
          "Event Type": "Cliff",
          "Event Quantity": schedule["Cumulative Vested"],
          "Became Exercisable":
            schedule["Cumulative Vested"] * +!this.EARLY_EXERCISABLE, // increment available to exercise only if the option is not early exercisable
        };

        return installment;
      }

      // don't make any changes to installments that follow the cliff installment
      if (index > cliffIndex) {
        return schedule;
      }
    });

    // remove undefined corresponding to the installments prior to the cliff
    this.vestingSchedule = scheduleWithCliff.filter(
      (installment): installment is VestingSchedule => installment !== undefined
    );
  }

  private incrementTransactionDate() {
    // this method is only used for relative vesting schedules
    if (
      this.currentVestingCondition.trigger.type !== "VESTING_SCHEDULE_RELATIVE"
    ) {
      throw new Error(
        `This generator can only calculate for VESTING_SCHEDULE_RELATIVE triggers.`
      );
    }

    const newDate = new Date(this.transactionDate);
    const { type, length } = this.currentVestingCondition.trigger.period;

    if (type === "MONTHS") {
      const currentMonth = newDate.getMonth();
      newDate.setMonth(currentMonth + length);

      // Adjust the day of the month after incrementing the month
      // const day_of_month = this.currentVestingCondition.trigger.period.day_of_month
      // switch (day_of_month) {
      //   case "29_OR_LAST_DAY_OF_MONTH":
      //   case "30_OR_LAST_DAY_OF_MONTH":
      //   case "31_OR_LAST_DAY_OF_MONTH":
      //     this.setDayToLastDayOfMonth(newDate);
      //     break;
      //   case 'VESTING_START_DAY_OR_LAST_DAY_OF_MONTH':
      //     this.setDayToVestingStartOrLast(newDate);
      //     break;
      //   default:
      //     newDate.setDate(parseInt(day_of_month));
      //     break;
      // }
    } else if (type === "DAYS") {
      newDate.setDate(newDate.getDate() + length);
    }

    this.transactionDate = newDate;
  }

  private setDayToLastDayOfMonth(date: Date) {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    date.setDate(nextMonth.getDate());
  }

  private setDayToVestingStartOrLast(date: Date) {
    const vestingDay = this.transactionDate.getDate();
    const lastDayOfNewMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();

    if (vestingDay > lastDayOfNewMonth) {
      date.setDate(lastDayOfNewMonth);
    } else {
      date.setDate(vestingDay);
    }
  }

  private handleNextVestingCondition() {
    // initialize the currentVestingCondition
    // throw error if the trigger is not VESTING_SCHEDULE_RELATIVE
    this.vestingConditionId =
      this.currentVestingCondition?.next_condition_ids[0];
    const currentVestingCondition =
      this.issuanceVestingTerms.vesting_conditions.find(
        (vc): vc is VestingCondition_VestingScheduleRelative =>
          vc.id === this.vestingConditionId
      );

    if (
      !currentVestingCondition ||
      currentVestingCondition.trigger.type !== "VESTING_SCHEDULE_RELATIVE"
    ) {
      throw new Error(
        `This generator can only calculate for VESTING_SCHEDULE_RELATIVE triggers.`
      );
    }
    this.currentVestingCondition = currentVestingCondition;

    // create array of vesting events
    const occurrencesCount = currentVestingCondition.trigger.period.occurrences;
    const { denominator = "0", numerator = "0" } =
      currentVestingCondition.portion || {};

    const events = Array.from({ length: occurrencesCount }, (_, index) => {
      this.incrementTransactionDate();
      const amountVested =
        parseFloat(denominator) !== 0
          ? this.vestingMode(index, denominator, numerator)
          : 0;
      this.vested += amountVested;
      this.unvested -= amountVested;

      // increment becomeExercisable only if the option is not early exercisable
      const becameExercisable = amountVested * +!this.EARLY_EXERCISABLE;

      const event: VestingSchedule = {
        Date: this.transactionDate.toISOString().split("T")[0],
        "Event Type": "Vesting",
        "Event Quantity": amountVested,
        "Remaining Unvested": this.unvested,
        "Cumulative Vested": this.vested,
        "Became Exercisable": becameExercisable,
        "Cumulative Exercised": 0,
        "Available to Exercise": 0, // placeholder to be populated via the exercise service
      };

      return event;
    });

    // add vesting events to vestingSchedule
    this.vestingSchedule.push(...events);

    // handle the cliff condition
    if (currentVestingCondition.cliff_length) {
      console.log("handling cliff condition");
      this.handleCliffCondition(currentVestingCondition.cliff_length);
    }
  }

  generate() {
    if (this.hasBeenGenerated) return this.vestingSchedule;

    this.handleVestingStartTx().handleNextVestingCondition();

    return this.vestingSchedule;
  }
}
