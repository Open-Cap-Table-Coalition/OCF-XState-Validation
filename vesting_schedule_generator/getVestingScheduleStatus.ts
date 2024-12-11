import { compareAsc, parseISO } from "date-fns";
import type {
  VestingInstallment,
  VestingScheduleStatus,
  OCFDataBySecurityId,
} from "types";

export const getVestingScheduleStatus = (
  vestingSchedule: VestingInstallment[],
  ocfData: OCFDataBySecurityId
) => {
  const EARLY_EXERCISABLE = !!ocfData.issuanceTransaction.early_exercisable;
  const totalQuantity = parseFloat(ocfData.issuanceTransaction.quantity);

  // sort by vesting date
  vestingSchedule.sort((a, b) => compareAsc(a.date, b.date));

  let totalVested = 0;
  let totalUnvested = totalQuantity;

  const vestingScheduleWithStatus = vestingSchedule.map((installment) => {
    totalVested += installment.quantity;
    totalUnvested -= installment.quantity;

    const status: VestingScheduleStatus = {
      ...installment,
      becameVested: installment.quantity,
      totalVested,
      totalUnvested,
      becameExercisable: EARLY_EXERCISABLE ? 0 : installment.quantity,
    };

    return status;
  });

  // Add an installment for the grant date if the option is EARLY_EXERCISABLE and not fully vested on the grant date

  if (
    (ocfData.issuanceVestingTerms || ocfData.vestingObjects) &&
    EARLY_EXERCISABLE
  ) {
    vestingScheduleWithStatus.unshift({
      date: parseISO(ocfData.issuanceTransaction.date),
      quantity: 0,
      becameVested: 0,
      totalVested: 0,
      totalUnvested: totalQuantity,
      becameExercisable: EARLY_EXERCISABLE ? totalQuantity : 0,
    });
  }

  return vestingScheduleWithStatus;
};

// import {
//   PreProcessedVestingInstallment,
//   VestingStatusSnapshot,
// } from "../../../../types";

// export interface VestingStatusSnapshotServiceConfig {
//   roundedVestingSchedule: PreProcessedVestingInstallment[];
//   totalQuantity: number;
//   EARLY_EXERCISABLE: boolean;
// }

// export class VestingStatusSnapshotService {
//   private roundedVestingSchedule: PreProcessedVestingInstallment[];
//   private totalQuantity: number;
//   private vested: number;
//   private unvested: number;
//   private EARLY_EXERCISABLE: boolean;
//   public snapshots!: VestingStatusSnapshot[];

//   constructor(config: VestingStatusSnapshotServiceConfig) {
//     this.roundedVestingSchedule = config.roundedVestingSchedule;
//     this.totalQuantity = config.totalQuantity;
//     this.vested = 0;
//     this.unvested = this.totalQuantity;
//     this.EARLY_EXERCISABLE = config.EARLY_EXERCISABLE;
//   }

//   private createSnapshots() {
//     const snapshots = this.roundedVestingSchedule.map((installment) => {
//       const { id, quantity } = installment;

//       this.vested += quantity;
//       this.unvested -= quantity;

//       const becameExercisable = this.EARLY_EXERCISABLE ? 0 : quantity;

//       const snapshot: VestingStatusSnapshot = {
//         id: id,
//         remainingUnvested: this.unvested,
//         cumulativeVested: this.vested,
//         becameExercisable: becameExercisable,
//         cumulativeExercised: 0,
//         availableToExercise: 0, // placeholder to be populated via the exercise service
//       };

//       return snapshot;
//     });

//     this.snapshots = snapshots;
//   }
// }
