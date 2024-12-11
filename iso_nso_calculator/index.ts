import { compareAsc, compareDesc, isBefore, isEqual, parseISO } from "date-fns";
import { OcfPackageContent } from "../read_ocf_package";
import type { VestingScheduleStatus, OCFDataBySecurityId } from "types";
import { generateVestingSchedule } from "../vesting_schedule_generator/index.ts";
import { getVestingScheduleStatus } from "../vesting_schedule_generator/getVestingScheduleStatus.ts";
import { getOCFDataBySecurityId } from "../vesting_schedule_generator/get-ocf-data-by-security-id.ts";

// Define the interface for the data supplied to the calculator
interface Installment extends VestingScheduleStatus {
  securityId: string;
  grantDate: string;
  Year: number; // Represents the year of the ISO/NSO test
  FMV: number; // for now we assume that the FMV is the exercise price if there is no valuation.id.  Better approaches to be discussed.
  Grant_Type: "NSO" | "ISO" | "INTL";
  CancelledDate?: Date;
}

// Define the interface for the results of the ISO/NSO test
export interface ISONSOTestResult
  extends Pick<
    Installment,
    | "Year"
    | "date"
    | "quantity"
    | "grantDate"
    | "securityId"
    | "becameExercisable"
    | "FMV"
  > {
  StartingCapacity: number;
  ISOShares: number;
  NSOShares: number;
  CapacityUtilized: number;
  CapacityRemaining: number;
}

export class ISOCalculator {
  constructor(private ocfPackage: OcfPackageContent) {}

  private securityIds(stakeholderId: string) {
    return this.ocfPackage.transactions
      .filter(
        (tx) =>
          tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE" &&
          tx.stakeholder_id === stakeholderId
      )
      .map((issuance) => issuance.security_id);
  }

  public prepareVestingInstallments(stakeholderId: string): Installment[] {
    const securityIds = this.securityIds(stakeholderId);
    const result = securityIds.map((securityId) => {
      /***************************************
       * generate vesting the vesting schedule
       ***************************************/

      const schedule = generateVestingSchedule(this.ocfPackage, securityId);

      /*************************************************************************************
       * Get the relevant ocfData
       *
       *
       * We know that getOCFDataBySecurityId will not return any issues
       * because if it did they would have been returned when calling generateVestingSchedule
       **************************************************************************************/

      const ocfData = getOCFDataBySecurityId(this.ocfPackage, securityId);

      /*********************************************************
       * Add details regarding quantity that became exercisable
       *********************************************************/

      const vestingScheduleWithStatus = getVestingScheduleStatus(
        schedule,
        ocfData
      );

      /**************************************************************
       * Add additional information required for the ISO calculation
       **************************************************************/

      const installments: Installment[] = vestingScheduleWithStatus.map(
        (status) => ({
          ...status,
          securityId,
          grantDate: ocfData.issuanceTransaction.date,
          Year: status.date.getFullYear(),
          FMV: this.getFMV(ocfData),
          Grant_Type: ocfData.issuanceTransaction.option_grant_type,
        })
      );

      return installments;
    });

    return result.flat();
  }

  public execute(stakeholderId: string): ISONSOTestResult[] {
    /**************************************************
     * Prepare vesting installments for ISO calculation
     **************************************************/

    const vestingInstallments = this.prepareVestingInstallments(stakeholderId);

    /*******************************************
     * Calculate ISO / NSO splits for each year
     *******************************************/
    const result = this.calculate(vestingInstallments);

    return result;
  }

  /**
   * Assumes that the FMV on the grant date is equal to the exercise price if there is no valuation_id
   * @param issuanceTX
   */
  private getFMV(ocfData: OCFDataBySecurityId): number {
    const issuanceTransaction = ocfData.issuanceTransaction;
    const valuations = ocfData.valuations;
    if (valuations.length === 0) {
      if (
        !issuanceTransaction.exercise_price ||
        !issuanceTransaction.exercise_price.amount
      ) {
        throw new Error(
          `Neither a valuation or exercise price is available for equity issuance with security id ${ocfData.issuanceTransaction.id}`
        );
      } else {
        return parseFloat(issuanceTransaction.exercise_price.amount);
      }
    }

    const grantDate = issuanceTransaction.date;
    valuations.sort((a, b) =>
      compareDesc(parseISO(a.effective_date), parseISO(b.effective_date))
    );
    const relevantValuation = valuations.find((valuation) =>
      isBefore(parseISO(valuation.effective_date), grantDate)
    );
    if (!relevantValuation) {
      throw new Error(
        `Neither a valuation or exercise price is available for equity issuance with security id ${ocfData.issuanceTransaction.id}`
      );
    }
    return parseFloat(relevantValuation.price_per_share.amount);
  }

  /**
   * Sorts installments - first by grant date, then by vesting date
   */
  private sortVestingInstallments(vestingInstallments: Installment[]) {
    return vestingInstallments.sort((a, b) => {
      if (isEqual(a.grantDate, b.grantDate)) {
        return compareAsc(a.date, b.date);
      }
      return compareAsc(a.grantDate, b.grantDate);
    });
  }

  private isIncludedInTest(
    installment: Installment,
    year: number,
    cancelledDate?: Date
  ) {
    return (
      installment.Grant_Type === "ISO" &&
      (cancelledDate === undefined || cancelledDate.getFullYear() >= year)
    );
  }

  private getCancelledDate(securityId: string) {
    const cancellationTransactions = this.ocfPackage.transactions.filter(
      (tx) =>
        tx.object_type === "TX_EQUITY_COMPENSATION_CANCELLATION" &&
        tx.security_id === securityId
    );

    // assumes each securityId would only have a single cancellation transaction

    if (cancellationTransactions.length === 0) return;
    const cancellationDate = cancellationTransactions.map((tx) =>
      parseISO(tx.date)
    );
    return cancellationDate[0];
  }

  private calculate(installments: Installment[]) {
    let currentYear = installments[0].Year;
    const ANNUAL_CAPACITY = 100000;
    let CapacityRemaining = ANNUAL_CAPACITY;

    const sortedInstallments = this.sortVestingInstallments(installments);

    const result = sortedInstallments.reduce((acc, current) => {
      const {
        Year,
        date,
        quantity,
        grantDate,
        securityId,
        becameExercisable,
        FMV,
      } = current;

      // If the year changes, reset the remaining capacity to 100,000 and reset the current Year,
      if (Year !== currentYear) {
        CapacityRemaining = ANNUAL_CAPACITY;
        currentYear = Year;
      }

      const StartingCapacity = CapacityRemaining;

      // Determine how many shares in included in this iteration of the test
      const ISOEligibleShares = this.isIncludedInTest(
        current,
        currentYear,
        this.getCancelledDate(current.securityId)
      )
        ? becameExercisable
        : 0;

      // Determine how many shares can be ISOs based on the remainingCapacity
      const MaxISOShares = Math.floor(CapacityRemaining / FMV);

      // Determine how many shares are ISOs
      const ISOShares = Math.min(MaxISOShares, ISOEligibleShares);

      // Determine how many shares are NSOs
      const NSOShares = becameExercisable - ISOShares;

      // Determine how much capacity was utilized
      const CapacityUtilized = ISOShares * FMV;

      // Update remaining capacity after usage
      CapacityRemaining -= CapacityUtilized;

      const interim: ISONSOTestResult = {
        Year,
        date,
        quantity,
        grantDate,
        securityId,
        becameExercisable,
        FMV,
        StartingCapacity,
        ISOShares,
        NSOShares,
        CapacityUtilized,
        CapacityRemaining,
      };

      acc.push(interim);
      return acc;
    }, [] as ISONSOTestResult[]);

    return result;
  }
}

// const getSecurityIds = (
//   stakeholderId: string,
//   OcfPackage: OcfPackageContent
// ) => {
//   const issuances = OcfPackage.transactions.filter(
//     (tx) =>
//       tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE" &&
//       tx.stakeholder_id === stakeholderId
//   );
//   const securityIds = issuances.map((issuance) => issuance.security_id);
//   return securityIds;
// };

// const addISONSODetailsToVestingInstallments = (
//   vestingSchedule: VestingScheduleStatus[],
//   securityId: string,
//   ocfData: OCFDataBySecurityId
// ) => {
//   return vestingSchedule.map((vestingScheduleStatus) => {
//     const FMV = getFMV(ocfData);
//     const installment: Installment = {
//       ...vestingScheduleStatus,
//       securityId,
//       grantDate: ocfData.issuanceTransaction.date,
//       Year: vestingScheduleStatus.date.getFullYear(),
//       FMV,
//       Grant_Type: ocfData.issuanceTransaction.option_grant_type,
//     };

//     return installment;
//   });
// };

// const getSortedVestingScheduleMap = (vestingSchedules: Installment[][]) => {
//   const flatSchedule = vestingSchedules.flat();
//   const map = new Map<number, Installment[]>();
//   flatSchedule.forEach((installment) => {
//     const year = installment.Year;
//     if (!map.has(year)) {
//       map.set(year, []);
//     }
//     map.get(year)!.push(installment);
//   });

//   [...map.values()].forEach((installments) => {
//     installments.sort((a, b) => {
//       if (isEqual(a.grantDate, b.grantDate)) {
//         return compareAsc(a.date, b.date);
//       }
//       return compareAsc(a.grantDate, b.grantDate);
//     });
//   });

//   return map;
// };

// export const getISONSOSplits = (
//   stakeholderId: string,
//   ocfPackage: OcfPackageContent
// ) => {
//   const securityIds = getSecurityIds(stakeholderId, ocfPackage);

//   const vestingSchedules = securityIds.map((securityId) => {
//     const schedule = generateVestingSchedule(ocfPackage, securityId);
//     if (!schedule.result) {
//       return schedule.issues;
//     }

//     const ocfData = getOCFDataBySecurityId(ocfPackage, securityId, []);
//     if (!ocfData.result) {
//       return ocfData.issues;
//     }
//     const vestingScheduleWithStatus = getVestingScheduleStatus(
//       schedule.result,
//       ocfData.result
//     );
//     const installments = addISONSODetailsToVestingInstallments(
//       vestingScheduleWithStatus,
//       securityId,
//       ocfData.result
//     );
//     return installments;
//   });

//   // sort installments by grant date and then by vesting date
//   const sortedVestingScheduleMap =
//     getSortedVestingScheduleMap(vestingSchedules);

//   const results = [...sortedVestingScheduleMap.values()]
//     .map((installments) => calculate(installments, ocfPackage))
//     .flat();

//   return results;
// };

// const isIncludedInTest = (
//   installment: Installment,
//   year: number,
//   ocfPackage: OcfPackageContent
// ) => {
//   const cancelledYear = getCancelledDate(
//     installment.securityId,
//     ocfPackage
//   )?.getFullYear();
//   return (
//     installment.Grant_Type === "ISO" &&
//     (cancelledYear === undefined || cancelledYear >= year)
//   );
// };

// const getCancelledDate = (
//   securityId: string,
//   ocfPackage: OcfPackageContent
// ) => {
//   const ocfData = getOCFDataBySecurityId(ocfPackage, securityId);
//   // assumes each securityId would only have a single cancellation transaction
//   const cancellationTransactions = ocfData.cancellationTransactions;
//   if (cancellationTransactions.length === 0) return;
//   const cancellationDate = cancellationTransactions.map((tx) =>
//     parseISO(tx.date)
//   );
//   return cancellationDate[0];
// };

/**
 * Assumes that the FMV on the grant date is equal to the exercise price if there is no valuation_id
 * @param issuanceTX
 */
// const getFMV = (ocfData: OCFDataBySecurityId) => {
//   const issuanceTransaction = ocfData.issuanceTransaction;
//   const valuations = ocfData.valuations;
//   if (valuations.length === 0) {
//     if (
//       !issuanceTransaction.exercise_price ||
//       !issuanceTransaction.exercise_price.amount
//     ) {
//       throw new Error(
//         `Cannot run the ISO test unless either a valuation or exercise price is provided`
//       );
//     } else {
//       return parseFloat(issuanceTransaction.exercise_price.amount);
//     }
//   }

//   const grantDate = issuanceTransaction.date;
//   valuations.sort((a, b) =>
//     compareDesc(parseISO(a.effective_date), parseISO(b.effective_date))
//   );
//   const relevantValuation = valuations.find((valuation) =>
//     isBefore(parseISO(valuation.effective_date), grantDate)
//   );
//   if (!relevantValuation) {
//     throw new Error(
//       `Cannot run the ISO test unless either a valuation or exercise price is provided`
//     );
//   }
//   return parseFloat(relevantValuation.price_per_share.amount);
// };

// const calculate = (
//   installments: Installment[],
//   ocfPackage: OcfPackageContent
// ) => {
//   let currentYear = installments[0].Year;
//   const ANNUAL_CAPACITY = 100000;
//   let CapacityRemaining = ANNUAL_CAPACITY;

//   const result = installments.reduce((acc, current) => {
//     const {
//       Year,
//       date,
//       quantity,
//       grantDate,
//       securityId,
//       becameExercisable,
//       FMV,
//     } = current;

//     // If the year changes, reset the remaining capacity to 100,000 and reset the current Year,
//     if (Year !== currentYear) {
//       CapacityRemaining = ANNUAL_CAPACITY;
//       currentYear = Year;
//     }

//     const StartingCapacity = CapacityRemaining;

//     // Determine how many shares in included in this iteration of the test
//     const ISOEligibleShares = isIncludedInTest(current, currentYear, ocfPackage)
//       ? becameExercisable
//       : 0;

//     // Determine how many shares can be ISOs based on the remainingCapacity
//     const MaxISOShares = Math.floor(CapacityRemaining / FMV);

//     // Determine how many shares are ISOs
//     const ISOShares = Math.min(MaxISOShares, ISOEligibleShares);

//     // Determine how many shares are NSOs
//     const NSOShares = becameExercisable - ISOShares;

//     // Determine how much capacity was utilized
//     const CapacityUtilized = ISOShares * FMV;

//     // Update remaining capacity after usage
//     CapacityRemaining -= CapacityUtilized;

//     const interim: ISONSOTestResult = {
//       Year,
//       date,
//       quantity,
//       grantDate,
//       securityId,
//       becameExercisable,
//       FMV,
//       StartingCapacity,
//       ISOShares,
//       NSOShares,
//       CapacityUtilized,
//       CapacityRemaining,
//     };

//     acc.push(interim);
//     return acc;
//   }, [] as ISONSOTestResult[]);

//   return result;
// };

// export class ISONSOCalculatorService {
//   private transactions!: Transaction[];
//   private valuations!: Valuation[];
//   private issuances!: TX_Equity_Compensation_Issuance[];
//   private installments!: Installment[];
//   private ANNUAL_CAPACITY = 100000;
//   private remainingCapacity: number;
//   private results: ISONSOTestResult[];

//   constructor(
//     private ocfPackage: OcfPackageContent,
//     private stakeholderId: string
//   ) {
//     this.deconstructOCFPackage();
//     this.getIssuances();
//     this.createInstallments();
//     this.sortInstallments();
//     this.remainingCapacity = this.ANNUAL_CAPACITY;
//     this.results = this.calculate();
//   }

//   private deconstructOCFPackage() {
//     const { transactions, valuations } = this.ocfPackage;
//     this.transactions = transactions;
//     this.valuations = valuations;
//   }

//   private getIssuances() {
//     const issuances = this.transactions.filter(
//       (tx): tx is TX_Equity_Compensation_Issuance =>
//         tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE" &&
//         tx.stakeholder_id === this.stakeholderId
//     );

//     this.issuances = issuances;
//   }

//   private createInstallments() {
//     // create a vesting schedule for each issuance
//     const allInstallments = this.issuances.reduce((acc, issuance) => {
//       const schedule = new VestingScheduleGenerator(
//         this.ocfPackage,
//         issuance.security_id
//       ).getFullSchedule();

//       const installments = schedule.reduce((acc, entry) => {
//         // ignore exercise events within the vesting schedule
//         if (entry["Event Type"] === "Exercise") return acc;

//         const date = parse(entry.Date, "yyyy-MM-dd", new Date());
//         acc.push({
//           ...entry,
//           "Security Id": issuance.security_id,
//           "Grant Date": issuance.date,
//           Year: date.getFullYear(),
//           FMV: this.getFMV(issuance),
//           Grant_Type: issuance.option_grant_type,
//         });
//         return acc;
//       }, [] as Installment[]);

//       acc.push(...installments);
//       return acc;
//     }, [] as Installment[]);

//     this.installments = allInstallments;
//   }

//   // sort installments by grant date and then by vesting date
//   private sortInstallments() {
//     this.installments.sort(
//       (
//         a: { "Grant Date": string; Date: string },
//         b: { "Grant Date": string; Date: string }
//       ) => {
//         if (a["Grant Date"] === b["Grant Date"]) {
//           return a.Date.localeCompare(b.Date);
//         }
//         return a["Grant Date"].localeCompare(b["Grant Date"]);
//       }
//     );
//   }

//   /**
//    * Exclude options that are not eligible to be ISOs
//    * and options that were cancelled prior to the tested year
//    */
//   private isIncludedInTest(installment: Installment, year: number) {
//     const cancelledYear = this.getCancelledDate(
//       installment["Security Id"]
//     )?.getFullYear();

//     return (
//       installment.Grant_Type === "ISO" &&
//       (cancelledYear === undefined || cancelledYear >= year)
//     );
//   }

//   private getCancelledDate(securityId: string) {
//     const cancelTransactions = this.transactions.filter(
//       (tx): tx is TX_Equity_Compensation_Cancellation =>
//         tx.object_type === "TX_EQUITY_COMPENSATION_CANCELLATION" &&
//         tx.security_id === securityId
//     );

//     // assumes each securityId would only have a single cancel transaction
//     if (cancelTransactions.length === 0) {
//       return null;
//     }

//     return parse(cancelTransactions[0].date, "yyyy-MM-dd", new Date());
//   }

//   // For now we'll assume that the FMV on the grant date is equal to the exercise price if there is no valuation_id
//   // Alternative approaches to be discussed
//   private getFMV(issuance: TX_Equity_Compensation_Issuance) {
//     let FMV;

//     const valuation = this.valuations?.find(
//       (valuation) => valuation.id === issuance.valuation_id
//     );

//     if (!valuation) {
//       if (!issuance.exercise_price || !issuance.exercise_price.amount) {
//         throw new Error(
//           `Cannot run the ISO test unless either a valuation or exercies price is provided`
//         );
//       } else {
//         FMV = issuance.exercise_price.amount;
//       }
//     } else {
//       FMV = valuation.price_per_share.amount;
//     }

//     return parseFloat(FMV);
//   }

//   private calculate() {
//     let currentYear = this.installments[0].Year; // Initialize the current year to the year of the first installment

//     const result = this.installments.reduce((acc, current) => {
//       /**
//        * If the year changes, reset the remaining capacity to 100,000,
//        * reset the current year, and
//        * get a new array of filtered installments
//        */
//       if (current.Year !== currentYear) {
//         this.remainingCapacity = this.ANNUAL_CAPACITY;
//         currentYear = current.Year;
//       }

//       const startingCapacity = this.remainingCapacity;

//       // Determine how many shares are in included in this iteration of the test
//       // options that are not eligible to be ISOs have already been removed in createInstallments
//       const ISOEligibleShares = this.isIncludedInTest(current, currentYear)
//         ? current["Became Exercisable"]
//         : 0;

//       // Determine how many shares can be ISOs based on the remainingCapacity
//       const MaxISOShares = Math.floor(this.remainingCapacity / current.FMV);

//       // Determine how many shares are ISOs
//       const ISOShares = Math.min(MaxISOShares, ISOEligibleShares);

//       // Determine how many shares are NSOs
//       const NSOShares = current["Became Exercisable"] - ISOShares;

//       // Determine how much capacity was utilized
//       const utilizedCapacity = ISOShares * current.FMV;

//       // Update remaining capacity after usage
//       this.remainingCapacity -= utilizedCapacity;

//       acc.push({
//         Year: current.Year,
//         Date: current.Date,
//         "Security Id": current["Security Id"],
//         "Event Type": current["Event Type"],
//         "Became Exercisable": current["Event Quantity"],
//         FMV: current.FMV,
//         StartingCapacity: startingCapacity,
//         ISOShares: ISOShares,
//         NSOShares: NSOShares,
//         CapacityUtilized: utilizedCapacity,
//         CapacityRemaining: this.remainingCapacity,
//       });

//       return acc;
//     }, [] as ISONSOTestResult[]);

//     return result;
//   }

//   get Results() {
//     return this.results;
//   }
// }
