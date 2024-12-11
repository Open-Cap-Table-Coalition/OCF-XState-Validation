import {
  addDays,
  addMonths,
  compareAsc,
  getDate,
  lastDayOfMonth,
  setDate,
} from "date-fns";
import type {
  Day_Of_Month,
  PreProcessedVestingInstallment,
  RelativeGraphNode,
} from "types";
import { CreateInstallmentConfig, CreateInstallmentStrategy } from "./strategy";
import { determineVestingMode } from "../rounding_service";
import Fraction from "fraction.js";

export class VestingRelativeStrategy extends CreateInstallmentStrategy<RelativeGraphNode> {
  constructor(config: CreateInstallmentConfig<RelativeGraphNode>) {
    super(config);
  }

  getInstallments() {
    const installments = this.createAllInstallments();
    const installmentsWithCliff = this.processCliff(installments);
    const installmentsWithTriggeredDate = this.processTriggeredDate(
      installmentsWithCliff
    );
    return installmentsWithTriggeredDate;
  }

  private createAllInstallments(): PreProcessedVestingInstallment[] {
    const { length, type, occurrences, cliff_installment } =
      this.config.node.trigger.period;

    let cliffInstallment: number;
    if (!cliff_installment) {
      cliffInstallment = 1;
    } else {
      cliffInstallment = Math.min(cliff_installment, occurrences);
    }

    const relativeConditionId =
      this.config.node.trigger.relative_to_condition_id;

    const relativeCondition =
      this.config.executionStack.get(relativeConditionId);

    if (!relativeCondition) {
      throw new Error(
        `Vesting condition with id ${this.config.node.id} is in the execution path but the node it references in its \`relative_to_condition_id\` field is not in the execution path`
      );
    }

    if (!relativeCondition.triggeredDate) {
      throw new Error(
        `vesting condition with id ${this.config.node.id} is in the execution path but the node it references in its \`relative_to_condition_id\` field does not have a triggered date`
      );
    }

    const baseDay = getDate(relativeCondition.triggeredDate);
    let baseDate = setDate(relativeCondition.triggeredDate, baseDay);

    let day_of_month: Day_Of_Month;

    if (type === "MONTHS") {
      day_of_month = this.config.node.trigger.period.day_of_month;
    }

    const sharesVesting = this.getSharesVesting()
      .mul(new Fraction(occurrences))
      .valueOf();

    const vestingMode = determineVestingMode(
      this.config.ocfData.issuanceVestingTerms!.allocation_type
    );

    const installments = Array.from({ length: occurrences }, (_, index) => {
      const newDate = this.incrementTransactionDate(
        baseDate,
        type,
        length,
        day_of_month
      );

      const quantity = vestingMode(index, occurrences, sharesVesting);

      const installment = this.createInstallment({
        date: newDate,
        quantity,
        beforeCliff: index + 1 < cliffInstallment,
        relativeDate: relativeCondition.triggeredDate,
      });

      baseDate = newDate;

      return installment;
    });

    return installments;
  }

  private incrementTransactionDate(
    baseDate: Date,
    type: "DAYS" | "MONTHS",
    length: number,
    day_of_month?: Day_Of_Month
  ) {
    const baseDay = getDate(baseDate);
    let newDate = setDate(baseDate, baseDay);

    if (type === "MONTHS") {
      const nextMonthDate = addMonths(baseDate, length);
      const lastDateOfMonth = lastDayOfMonth(nextMonthDate);
      const lastDay = getDate(lastDateOfMonth);
      let targetDay: number;

      switch (day_of_month) {
        case "29_OR_LAST_DAY_OF_MONTH":
          targetDay = Math.min(29, lastDay);
          newDate = setDate(nextMonthDate, targetDay);
        case "30_OR_LAST_DAY_OF_MONTH":
          targetDay = Math.min(30, lastDay);
          newDate = setDate(nextMonthDate, targetDay);
        case "31_OR_LAST_DAY_OF_MONTH":
          targetDay = Math.min(31, lastDay);
          newDate = setDate(nextMonthDate, targetDay);
          break;
        case "VESTING_START_DAY_OR_LAST_DAY_OF_MONTH":
          targetDay = Math.min(baseDay, lastDay);
          newDate = setDate(nextMonthDate, targetDay);
          break;
        default:
          targetDay = baseDay;
          newDate = setDate(nextMonthDate, targetDay);
          break;
      }
    } else if (type === "DAYS") {
      newDate = addDays(baseDate, length);
    }

    return newDate;
  }

  private processCliff(vestingSchedule: PreProcessedVestingInstallment[]) {
    let accumulatedQuantity = 0;
    let cliffInProgress = true;

    const vestingScheduleWithCliffs = vestingSchedule.reduce(
      (acc, installment) => {
        // if cliffInProgress has already been turned off, then no change is required to the installment
        if (!cliffInProgress) {
          acc.push(installment);
          return acc;
        }

        // if the cliff is still underway, then

        // add the installment's quantity to the accumulated amount
        accumulatedQuantity += installment.quantity;

        // if we're still before the cliff, then move on without creating an installment
        if (installment.beforeCliff) {
          return acc;
        }

        // otherwise this is the cliff installment, so we

        // mark cliffInProgress as false
        cliffInProgress = false;

        // and create an installment with the accumulated amount
        const modInstallment: PreProcessedVestingInstallment = {
          ...installment,
          quantity: accumulatedQuantity,
        };

        acc.push(modInstallment);
        return acc;
      },
      [] as PreProcessedVestingInstallment[]
    );

    return vestingScheduleWithCliffs;
  }

  private processTriggeredDate(
    vestingSchedule: PreProcessedVestingInstallment[]
  ): PreProcessedVestingInstallment[] {
    let accumulatedQuantity = 0;
    const triggeredDate = this.config.node.triggeredDate;

    if (!triggeredDate) {
      throw new Error(
        `Vesting condition with id ${this.config.node.id} is in the execution stack but does not have a triggered date`
      );
    }

    const firstIndexOnOrAfterRelativeDate = vestingSchedule.findIndex(
      (installment) =>
        // this determines whether installment.date is after or equal to the triggered date
        compareAsc(installment.date, triggeredDate) >= 0
    );

    const vestingScheduleWithTriggeredDate = vestingSchedule.reduce(
      (acc, installment, index) => {
        accumulatedQuantity += installment.quantity;

        // Accumulate and move on if the installment is before the firstIndexOnOrAfterRelativeDate
        if (index < firstIndexOnOrAfterRelativeDate) {
          return acc;
        }

        if (index === firstIndexOnOrAfterRelativeDate) {
          const modInstallment: PreProcessedVestingInstallment = {
            ...installment,
            quantity: accumulatedQuantity,
          };

          acc.push(modInstallment);
          return acc;
        }

        acc.push(installment);
        return acc;
      },
      [] as PreProcessedVestingInstallment[]
    );

    return vestingScheduleWithTriggeredDate;
  }
}
