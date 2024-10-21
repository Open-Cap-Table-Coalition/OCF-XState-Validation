import { OcfPackageContent, readOcfPackage } from "../read_ocf_package";

export interface VestingSchedule {
  Date: string;
  "Event Type": string;
  "Event Quantity": number;
  "Remaining Unvested": number;
  "Cumulative Vested": number;
  "Cumulative Exercised": number;
  "Available to Exercise": number;
};

export const generateSchedule = (packagePath: string, equityCompensationIssuanceSecurityId: string): VestingSchedule[] => {
  const vestingSchedule: VestingSchedule[] = [];

  const ocfPackage: OcfPackageContent = readOcfPackage(packagePath);
  const vestingTerms = ocfPackage.vestingTerms;
  const transactions = ocfPackage.transactions;
  const equityCompensationIssuance = transactions.find((transaction: any) => transaction.security_id === equityCompensationIssuanceSecurityId);

  if (!equityCompensationIssuance) {
    throw new Error(`Equity compensation issuance with security id ${equityCompensationIssuanceSecurityId} not found`);
  }

  const vestingStartTransaction = transactions.find((transaction: any) => transaction.object_type === "TX_VESTING_START" && transaction.security_id === equityCompensationIssuance.security_id);

  const equityCompensationVestingTerms = vestingTerms.find((vestingTerm: any) => vestingTerm.id === equityCompensationIssuance.vesting_terms_id);

  let transactionDate: Date = new Date(vestingStartTransaction.date);
  let vestingConditionId: string = vestingStartTransaction.vesting_condition_id;

  let equityCompensationQuantity: number = parseFloat(equityCompensationIssuance.quantity);
  let unvested: number = equityCompensationQuantity;
  let vested: number = 0;

  let currentVestingCondition = equityCompensationVestingTerms.vesting_conditions.find((vestingCondition: any) => vestingCondition.id === vestingConditionId);

  if (currentVestingCondition.trigger.type !== "VESTING_START_DATE") {
    throw new Error(`For this generator, the first condition must have a VESTING_START_DATE trigger.`);
  }

  let amountVested: number = (equityCompensationQuantity * parseFloat(currentVestingCondition.portion.numerator)) / parseFloat(currentVestingCondition.portion.denominator);

  vested += amountVested;
  unvested -= amountVested;

  vestingSchedule.push({
    Date: transactionDate.toISOString().split("T")[0],
    "Event Type": "Start",
    "Event Quantity": amountVested,
    "Remaining Unvested": unvested,
    "Cumulative Vested": vested,
    "Cumulative Exercised": 0,
    "Available to Exercise": vested,
  });

  vestingConditionId = currentVestingCondition.next_condition_ids[0];
  currentVestingCondition = equityCompensationVestingTerms.vesting_conditions.find((vestingCondition: any) => vestingCondition.id === vestingConditionId);
  if (currentVestingCondition.trigger.type !== "VESTING_SCHEDULE_RELATIVE") {
    throw new Error(`This generator can only calculate for VESTING_SCHEDULE_RELATIVE triggers.`);
  }

  for (let i = 0; i < currentVestingCondition.trigger.period.occurrences; i++) {
    transactionDate = new Date(transactionDate.setMonth(transactionDate.getMonth() + currentVestingCondition.trigger.period.length));
    let cumulativePercent: number;
    let lastCumulativePercent: number;
    let remainder: number;
    switch (equityCompensationVestingTerms.allocation_type) {
      case "CUMULATIVE_ROUNDING":
        cumulativePercent = (i + 1) / currentVestingCondition.portion.denominator;
        if (i === 0) {
          amountVested = Math.ceil(cumulativePercent * equityCompensationQuantity);
        } else {
          lastCumulativePercent = i / currentVestingCondition.portion.denominator;
          amountVested = Math.ceil(cumulativePercent * equityCompensationQuantity) - Math.ceil(lastCumulativePercent * equityCompensationQuantity);
        }
        break;
      case "CUMULATIVE_ROUND_DOWN":
        cumulativePercent = (i + 1) / currentVestingCondition.portion.denominator;
        if (i === 0) {
          amountVested = Math.floor(cumulativePercent * equityCompensationQuantity);
        } else {
          lastCumulativePercent = i / currentVestingCondition.portion.denominator;
          amountVested = Math.floor(cumulativePercent * equityCompensationQuantity) - Math.floor(lastCumulativePercent * equityCompensationQuantity);
        }
        break;
      case "FRONT_LOADED":
        remainder = equityCompensationQuantity % currentVestingCondition.portion.denominator;
        if (i < remainder) {
          amountVested = Math.ceil(equityCompensationQuantity / currentVestingCondition.portion.denominator);
        } else {
          amountVested = Math.floor(equityCompensationQuantity / currentVestingCondition.portion.denominator);
        }
        break;
      case "BACK_LOADED":
        remainder = equityCompensationQuantity % currentVestingCondition.portion.denominator;
        if (i < remainder) {
          amountVested = Math.floor(equityCompensationQuantity / currentVestingCondition.portion.denominator);
        } else {
          amountVested = Math.ceil(equityCompensationQuantity / currentVestingCondition.portion.denominator);
        }
        break;
      case "FRONT_LOADED_TO_SINGLE_TRANCHE":
        remainder = equityCompensationQuantity % currentVestingCondition.portion.denominator;
        if (i === 0) {
          amountVested = Math.floor(equityCompensationQuantity / currentVestingCondition.portion.denominator) + remainder;
        } else {
          amountVested = Math.floor(equityCompensationQuantity / currentVestingCondition.portion.denominator);
        }
        break;
      case "BACK_LOADED_TO_SINGLE_TRANCHE":
        remainder = equityCompensationQuantity % currentVestingCondition.portion.denominator;
        if (i === currentVestingCondition.portion.denominator - 1) {
          amountVested = Math.floor(equityCompensationQuantity / currentVestingCondition.portion.denominator) + remainder;
        } else {
          amountVested = Math.floor(equityCompensationQuantity / currentVestingCondition.portion.denominator);
        }
        break;
      default: // allocation_type set to FRACTIONAL
        amountVested = (equityCompensationQuantity * parseFloat(currentVestingCondition.portion.numerator)) / parseFloat(currentVestingCondition.portion.denominator);
    }

    vested += amountVested;
    unvested -= amountVested;

    vestingSchedule.push({
      Date: transactionDate.toISOString().split("T")[0],
      "Event Type": "Vesting",
      "Event Quantity": amountVested,
      "Remaining Unvested": unvested,
      "Cumulative Vested": vested,
      "Cumulative Exercised": 0,
      "Available to Exercise": vested,
    });
  }

  if (currentVestingCondition.cliff_condition) {
    for (let i = 1; i <= currentVestingCondition.cliff_condition.period.length; i++) {
      let cliffAmountVested: number = 0;
      if (i < currentVestingCondition.cliff_condition.period.length) {
        vestingSchedule.splice(1, 1);

        vestingSchedule[1]["Event Type"] = "Cliff";
        vestingSchedule[1]["Event Quantity"] = vestingSchedule[1]["Cumulative Vested"];
      }
    }
  }

  const exerciseTranscations = transactions.filter((transaction: any) => transaction.object_type === "TX_EQUITY_COMPENSATION_EXERCISE" && transaction.security_id === equityCompensationIssuance.security_id);

  const sortedExerciseTransactions = exerciseTranscations.sort((a: { date: string; object_type: string }, b: { date: string; object_type: string }) => a.date.localeCompare(b.date));

  let cumulativeExercised = 0;

  sortedExerciseTransactions.forEach((transaction: any, index: any) => {
    if (Date.parse(vestingSchedule[vestingSchedule.length - 1].Date) > Date.parse(transaction.date)) {
      for (let i = 0; i < vestingSchedule.length - 1; i++) {
        if (
          Date.parse(vestingSchedule[i + 1].Date) <=
            Date.parse(transaction.date) &&
          index === 0
        ) {
          vestingSchedule[i]["Cumulative Exercised"] = cumulativeExercised;
          vestingSchedule[i]['Available to Exercise'] =
          vestingSchedule[i]['Cumulative Vested'] -
          vestingSchedule[i]['Cumulative Exercised'];
        } else 
        if (Date.parse(vestingSchedule[i].Date) <= Date.parse(transaction.date) && Date.parse(vestingSchedule[i + 1].Date) > Date.parse(transaction.date) && vestingSchedule[i]["Event Type"] !== "Exercise Event") {
          vestingSchedule[i]["Available to Exercise"] = vestingSchedule[i]["Cumulative Vested"] - cumulativeExercised;
          cumulativeExercised += parseFloat(transaction.quantity);
          vestingSchedule.splice(i + 1, 0, {
            Date: transaction.date,
            "Event Type": "Exercise",
            "Event Quantity": parseFloat(transaction.quantity),
            "Remaining Unvested": vestingSchedule[i]["Remaining Unvested"],
            "Cumulative Vested": vestingSchedule[i]["Cumulative Vested"],
            "Cumulative Exercised": cumulativeExercised,
            "Available to Exercise": vestingSchedule[i]["Cumulative Vested"] - cumulativeExercised,
          });
          i++;
        } else if (
          Date.parse(vestingSchedule[i].Date) >
            Date.parse(transaction.date) &&
            vestingSchedule[i]['Event Type'] !== 'Exercise'
        ) {
          vestingSchedule[i]["Cumulative Exercised"] = cumulativeExercised,
          vestingSchedule[i]['Available to Exercise'] =
          vestingSchedule[i]['Cumulative Vested'] -
            cumulativeExercised;
        }
      }
      vestingSchedule[vestingSchedule.length - 1]["Cumulative Exercised"] = cumulativeExercised;

      vestingSchedule[vestingSchedule.length - 1]["Available to Exercise"] = vestingSchedule[vestingSchedule.length - 1]["Cumulative Vested"] - cumulativeExercised;
    } else {
      cumulativeExercised += parseFloat(transaction.quantity);
      vestingSchedule.push({
        Date: transaction.date,
        "Event Type": "Exercise",
        "Event Quantity": parseFloat(transaction.quantity),
        "Remaining Unvested": 0,
        "Cumulative Vested": vestingSchedule[vestingSchedule.length - 1]["Cumulative Vested"],
        "Cumulative Exercised": cumulativeExercised,
        "Available to Exercise": vestingSchedule[vestingSchedule.length - 1]["Cumulative Vested"] - cumulativeExercised,
      });
    }
  });

  return vestingSchedule;
};
