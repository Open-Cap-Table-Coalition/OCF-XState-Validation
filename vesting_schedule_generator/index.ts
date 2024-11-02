import type {
  TX_Vesting_Start,
  TX_Equity_Compensation_Issuance,
  TX_Equity_Compensation_Exercise,
  VestingTerms,
  Valuation,
 } from "../read_ocf_package"
import { ExerciseTransactionsService } from "./exercise_transactions";
import { VestingCalculatorService } from "./vesting_calculator";
import { VestingInitializationService } from "./vesting_initialization";

export interface VestingSchedule {
  Date: string;
  "Event Type": 'Start' | 'Cliff' | 'Vesting' | 'Exercise';
  "Event Quantity": number;
  "Remaining Unvested": number;
  "Cumulative Vested": number;
  "Became Exercisable": number;
  "Cumulative Exercised": number;
  "Available to Exercise": number;
};

export class VestingScheduleService {
  private initializationService: VestingInitializationService;
  private calculationService: VestingCalculatorService;
  private exerciseTransactionsService: ExerciseTransactionsService;
  private vestingDetails: VestingSchedule[];
  private vestingDetailsWithExercises: VestingSchedule[];

  constructor (
    private vestingTerms: VestingTerms[],
    private transactions: (TX_Equity_Compensation_Issuance | TX_Vesting_Start | TX_Equity_Compensation_Exercise)[],
    private securityId: string,
  ) {
    
    // initialize vesting data
    this.initializationService = new VestingInitializationService(this.transactions, this.vestingTerms, this.securityId)
    const { issuance, vestingStartTx, issuanceVestingTerms } = this.initializationService.setUpVestingData()

    // calculate vesting schedule
    this.calculationService = new VestingCalculatorService(
      vestingStartTx,
      issuanceVestingTerms,
      parseFloat(issuance.quantity),
      issuance.early_exercisable
    )
    this.vestingDetails = this.calculationService.generate(),

    // add exercise details to vesting schedule
    this.exerciseTransactionsService = new ExerciseTransactionsService(
      transactions.filter((tx): tx is TX_Equity_Compensation_Exercise => tx.object_type === 'TX_EQUITY_COMPENSATION_EXERCISE' && tx.security_id === securityId),
      this.vestingDetails,
      issuance.quantity,
      issuance.early_exercisable,
    )
    this.vestingDetailsWithExercises = this.exerciseTransactionsService.handleExerciseTransactions()

  }

  public getVestingDetails() {
    return this.vestingDetails
  }
  
  public getVestingDetails_WithExerices() {
    return this.vestingDetailsWithExercises
  }

  public getVestingStatus(checkDateString: string) {

    const status = this.vestingDetails.find((schedule) => Date.parse(schedule.Date) >= Date.parse(checkDateString))
    return status
  }

  public getVestingStatus_WithExercises(checkDateString: string) {
    const status = this.vestingDetailsWithExercises.find((schedule) => Date.parse(schedule.Date) >= Date.parse(checkDateString))
    return status
  }
}

// export const generateSchedule = (packagePath: string, equityCompensationIssuanceSecurityId: string): VestingSchedule[] => {
//   const vestingSchedule: VestingSchedule[] = [];

//   const ocfPackage: OcfPackageContent = readOcfPackage(packagePath);
//   const vestingTerms = ocfPackage.vestingTerms;
//   const transactions = ocfPackage.transactions;
//   const equityCompensationIssuance = transactions.find((transaction) => transaction.security_id === equityCompensationIssuanceSecurityId) as TX_Equity_Compensation_Issuance | undefined;

//   if (!equityCompensationIssuance) {
//     throw new Error(`Equity compensation issuance with security id ${equityCompensationIssuanceSecurityId} not found`);
//   }

//   const vestingStartTransaction = transactions.find((transaction: any) => transaction.object_type === "TX_VESTING_START" && transaction.security_id === equityCompensationIssuance.security_id) as TX_Vesting_Start | undefined;

//   if (!vestingStartTransaction) {
//     throw new Error(`For this generator, the transaction must have a TX_VESTING_START object.`)
//   }
//   const equityCompensationVestingTerms = vestingTerms.find((vestingTerm: any) => vestingTerm.id === equityCompensationIssuance.vesting_terms_id);

//   if (!equityCompensationVestingTerms) {
//     throw new Error(`Vesting terms for security.id ${equityCompensationIssuanceSecurityId} not found`)
//   }
//   let transactionDate: Date = new Date(vestingStartTransaction.date);
//   let vestingConditionId: string = vestingStartTransaction.vesting_condition_id;

//   let equityCompensationQuantity: number = parseFloat(equityCompensationIssuance.quantity);
//   let unvested: number = equityCompensationQuantity;
//   let vested: number = 0;

//   const EARLY_EXERCISABLE = equityCompensationIssuance.early_exercisable
//   let availableToExercise: number = equityCompensationQuantity * +EARLY_EXERCISABLE

//   let currentVestingCondition = equityCompensationVestingTerms.vesting_conditions.find((vestingCondition: any) => vestingCondition.id === vestingConditionId);

//   if (!currentVestingCondition) {
//     throw new Error(`Vesting conditions for security.id ${equityCompensationIssuanceSecurityId} not found`)
//   }
//   if (currentVestingCondition.trigger.type !== "VESTING_START_DATE") {
//     throw new Error(`For this generator, the first condition must have a VESTING_START_DATE trigger.`);
//   }

//   let amountVested: number = (equityCompensationQuantity * parseFloat(currentVestingCondition.portion.numerator)) / parseFloat(currentVestingCondition.portion.denominator);

//   vested += amountVested;
//   unvested -= amountVested;

//   // designate entire option as exercisable at the "Start" event if the option is early exercisable
//   const becameExercisable = availableToExercise

//   vestingSchedule.push({
//     Date: transactionDate.toISOString().split("T")[0],
//     "Event Type": "Start",
//     "Event Quantity": amountVested,
//     "Remaining Unvested": unvested,
//     "Cumulative Vested": vested,
//     "Became Exercisable": becameExercisable,
//     "Cumulative Exercised": 0,
//     "Available to Exercise": availableToExercise,
//   });

//   vestingConditionId = currentVestingCondition.next_condition_ids[0];
//   currentVestingCondition = equityCompensationVestingTerms.vesting_conditions.find((vestingCondition: any) => vestingCondition.id === vestingConditionId);
//   if (!currentVestingCondition || currentVestingCondition.trigger.type !== "VESTING_SCHEDULE_RELATIVE") {
//     throw new Error(`This generator can only calculate for VESTING_SCHEDULE_RELATIVE triggers.`);
//   }

//   for (let i = 0; i < currentVestingCondition.trigger.period.occurrences; i++) {
//     transactionDate = new Date(transactionDate.setMonth(transactionDate.getMonth() + currentVestingCondition.trigger.period.length));
//     let cumulativePercent: number;
//     let lastCumulativePercent: number;
//     let remainder: number;
//     const denominator = parseFloat(currentVestingCondition.portion.denominator)
//     switch (equityCompensationVestingTerms.allocation_type) {
//       case "CUMULATIVE_ROUNDING":
//         cumulativePercent = (i + 1) / denominator;
//         if (i === 0) {
//           amountVested = Math.ceil(cumulativePercent * equityCompensationQuantity);
//         } else {
//           lastCumulativePercent = i / denominator;
//           amountVested = Math.ceil(cumulativePercent * equityCompensationQuantity) - Math.ceil(lastCumulativePercent * equityCompensationQuantity);
//         }
//         break;
//       case "CUMULATIVE_ROUND_DOWN":
//         cumulativePercent = (i + 1) / denominator;
//         if (i === 0) {
//           amountVested = Math.floor(cumulativePercent * equityCompensationQuantity);
//         } else {
//           lastCumulativePercent = i / denominator;
//           amountVested = Math.floor(cumulativePercent * equityCompensationQuantity) - Math.floor(lastCumulativePercent * equityCompensationQuantity);
//         }
//         break;
//       case "FRONT_LOADED":
//         remainder = equityCompensationQuantity % denominator;
//         if (i < remainder) {
//           amountVested = Math.ceil(equityCompensationQuantity / denominator);
//         } else {
//           amountVested = Math.floor(equityCompensationQuantity / denominator);
//         }
//         break;
//       case "BACK_LOADED":
//         remainder = equityCompensationQuantity % denominator;
//         if (i < remainder) {
//           amountVested = Math.floor(equityCompensationQuantity / denominator);
//         } else {
//           amountVested = Math.ceil(equityCompensationQuantity / denominator);
//         }
//         break;
//       case "FRONT_LOADED_TO_SINGLE_TRANCHE":
//         remainder = equityCompensationQuantity % denominator;
//         if (i === 0) {
//           amountVested = Math.floor(equityCompensationQuantity / denominator) + remainder;
//         } else {
//           amountVested = Math.floor(equityCompensationQuantity / denominator);
//         }
//         break;
//       case "BACK_LOADED_TO_SINGLE_TRANCHE":
//         remainder = equityCompensationQuantity % denominator;
//         if (i === denominator - 1) {
//           amountVested = Math.floor(equityCompensationQuantity / denominator) + remainder;
//         } else {
//           amountVested = Math.floor(equityCompensationQuantity / denominator);
//         }
//         break;
//       default: // allocation_type set to FRACTIONAL
//         amountVested = (equityCompensationQuantity * parseFloat(currentVestingCondition.portion.numerator)) / parseFloat(currentVestingCondition.portion.denominator);
//     }

//     vested += amountVested;
//     unvested -= amountVested;

//     // increment availableToExercise only if the option is not early exercisable
//     const becameExercisable = amountVested * +!EARLY_EXERCISABLE
//     availableToExercise += becameExercisable  

//     vestingSchedule.push({
//       Date: transactionDate.toISOString().split("T")[0],
//       "Event Type": "Vesting",
//       "Event Quantity": amountVested,
//       "Remaining Unvested": unvested,
//       "Cumulative Vested": vested,
//       "Became Exercisable": becameExercisable,
//       "Cumulative Exercised": 0,
//       "Available to Exercise": availableToExercise,
//     });
//   }

//   if (currentVestingCondition.cliff_condition) {
//     const cliffLength = currentVestingCondition.cliff_condition.period.length

//     for (let i = 1; i <= cliffLength; i++) {

//       // remove all installments prior to the vesting cliff
//       // we start at 1 because 0 is the "Start" event
//       if (i < cliffLength) {
//         vestingSchedule.splice(1, 1);
//       }

//       // convert the cliff installment into a "Cliff" event
//       if (i === cliffLength) {
//         vestingSchedule[1]["Event Type"] = "Cliff";
//         vestingSchedule[1]["Event Quantity"] = vestingSchedule[1]["Cumulative Vested"];

//         // increment available to exercise only if the option is not early exercisable
//         vestingSchedule[1]["Became Exercisable"] = EARLY_EXERCISABLE ? 0 : vestingSchedule[1]["Available to Exercise"]
//       }
//     }
//   }

//   const exerciseTranscations = transactions.filter((transaction: any) => transaction.object_type === "TX_EQUITY_COMPENSATION_EXERCISE" && transaction.security_id === equityCompensationIssuance.security_id);

//   const sortedExerciseTransactions = exerciseTranscations.sort((a: { date: string; object_type: string }, b: { date: string; object_type: string }) => a.date.localeCompare(b.date));

//   let cumulativeExercised = 0;

//   sortedExerciseTransactions.forEach((transaction: any, index: any) => {
//     if (Date.parse(vestingSchedule[vestingSchedule.length - 1].Date) > Date.parse(transaction.date)) {
//       for (let i = 0; i < vestingSchedule.length - 1; i++) {
//         if (
//           Date.parse(vestingSchedule[i + 1].Date) <=
//             Date.parse(transaction.date) &&
//           index === 0
//         ) {
//           vestingSchedule[i]["Cumulative Exercised"] = cumulativeExercised;
//           vestingSchedule[i]['Available to Exercise'] = availableToExercise;
          
//         } else 
//         if (Date.parse(vestingSchedule[i].Date) <= Date.parse(transaction.date) && Date.parse(vestingSchedule[i + 1].Date) > Date.parse(transaction.date) && vestingSchedule[i]["Event Type"] !== "Exercise") {
//           vestingSchedule[i]["Available to Exercise"] = vestingSchedule[i]["Cumulative Vested"] - cumulativeExercised;
//           const amountExercised = parseFloat(transaction.quantity);
//           cumulativeExercised += amountExercised;
//           availableToExercise -= amountExercised
          
//           vestingSchedule.splice(i + 1, 0, {
//             Date: transaction.date,
//             "Event Type": "Exercise",
//             "Event Quantity": parseFloat(transaction.quantity),
//             "Remaining Unvested": vestingSchedule[i]["Remaining Unvested"],
//             "Cumulative Vested": vestingSchedule[i]["Cumulative Vested"],
//             "Became Exercisable": 0,
//             "Cumulative Exercised": cumulativeExercised,
//             "Available to Exercise": availableToExercise,
//           });
//           i++;
//         } else if (
//           Date.parse(vestingSchedule[i].Date) >
//             Date.parse(transaction.date) &&
//             vestingSchedule[i]['Event Type'] !== 'Exercise'
//         ) {
//           vestingSchedule[i]["Cumulative Exercised"] = cumulativeExercised,
//           vestingSchedule[i]['Available to Exercise'] = availableToExercise;
//         }
//       }
//       vestingSchedule[vestingSchedule.length - 1]["Cumulative Exercised"] = cumulativeExercised;

//       vestingSchedule[vestingSchedule.length - 1]["Available to Exercise"] = availableToExercise;
//     } else {
//       cumulativeExercised += parseFloat(transaction.quantity);
//       vestingSchedule.push({
//         Date: transaction.date,
//         "Event Type": "Exercise",
//         "Event Quantity": parseFloat(transaction.quantity),
//         "Remaining Unvested": 0,
//         "Cumulative Vested": vestingSchedule[vestingSchedule.length - 1]["Cumulative Vested"],
//         "Became Exercisable": 0,
//         "Cumulative Exercised": cumulativeExercised,
//         "Available to Exercise": availableToExercise,
//       });
//     }
//   });

//   return vestingSchedule;
// };
