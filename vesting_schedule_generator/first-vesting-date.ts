import { compareAsc } from "date-fns";
import type { PreProcessedVestingInstallment, VestingInstallment } from "types";

export const processFirstVestingDate = (
  vestingSchedule: PreProcessedVestingInstallment[],
  grantDate: Date
) => {
  const firstIndexOnOrAfterGrantDate = vestingSchedule.findIndex(
    (installment) =>
      // this determines whether installment.date is after or equal to grantDate
      compareAsc(installment.date, grantDate) >= 0
  );

  let accumulatedQuantity = 0;

  const processedVestingSchedule = vestingSchedule.reduce(
    (acc, installment, index) => {
      accumulatedQuantity += installment.quantity;

      // accumulate and move on if the installment is before the firstVestingDateIndex
      if (index < firstIndexOnOrAfterGrantDate) {
        return acc;
      }

      if (index === firstIndexOnOrAfterGrantDate) {
        const modInstallment: VestingInstallment = {
          date: installment.date,
          quantity: accumulatedQuantity,
        };

        acc.push(modInstallment);
        return acc;
      }

      const modInstallment: VestingInstallment = {
        date: installment.date,
        quantity: installment.quantity,
      };

      acc.push(modInstallment);
      return acc;
    },
    [] as VestingInstallment[]
  );

  return processedVestingSchedule;
};
