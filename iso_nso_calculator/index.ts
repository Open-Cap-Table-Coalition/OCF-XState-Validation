import { OcfPackageContent, readOcfPackage, TX_Equity_Compensation_Issuance, Valuation } from "../read_ocf_package";
import { generateSchedule, VestingSchedule } from "../vesting_schedule_generator";

// Hardcoding the $100K annual ISO limit
const ANNUAL_CAPACITY = 100000

// Define the interface for the data supplied to the calculator
interface Installment extends VestingSchedule {
  GrantId: string;
  Grant_Date: string;
  Year: number; // Represents the year of the ISO/NSO test
  FMV: number; // for now we assume that the FMV is the exercise price if there is no valuation.id.  Better approaches to be discussed.
  Grant_Type: 'NSO' | 'ISO' | 'INTL';
}

// creates vesting installments for all of a stockholder's equity issuances
const createInstallments = (packagePath: string, issuance: TX_Equity_Compensation_Issuance, FMV: number): Installment[] => {
  
  // ignore options that are not ISO eligible
  if (issuance.option_grant_type !== 'ISO') return []

  const vestingSchedule = generateSchedule(packagePath, issuance.security_id)

  const result = vestingSchedule.reduce((acc, entry) => {
    
    // ignores Exercise events within the vesting schedule
    if (entry["Event Type"] === 'Exercise') return acc

    const date = new Date(entry.Date);
    acc.push({
      ...entry,
        GrantId: issuance.id,
        Grant_Date: issuance.date,
        Year: date.getFullYear(),
        FMV: FMV,
        Grant_Type: issuance.option_grant_type
    })
    return acc
  }, [] as Installment[])
  
  return result
};

// For now we'll assume that the FMV on the grant date is equal to the exercise price if there is no valuation_id
// Alternative approaches to be discussed
const getFMV = (issuance: TX_Equity_Compensation_Issuance, valuations: Valuation[]) => {
  const valuation = valuations.find(valuation => valuation.id === issuance.valuation_id)
  const FMV = valuation?.price_per_share.amount ?? issuance.exercise_price.amount
  return parseFloat(FMV)
}


// sorts all of the stockholder's vesting installments by grant date, then by vesting date
const sortInstallments = (installments: Installment[]) => {
  const result = installments.sort((a: { Grant_Date: string, Date: string}, b: { Grant_Date: string, Date:string }) => {
    if (a.Grant_Date === b.Grant_Date) {
      return a.Date.localeCompare(b.Date)
    }
    return a.Grant_Date.localeCompare(b.Grant_Date)
  })
  return result
}

// Define the interface for the results of the ISO/NSO test
interface ISONSOTestResult extends Pick<Installment, 'Year' | 'Date' | 'GrantId' | 'Event Type' | 'Became Exercisable' | 'FMV'> {
  StartingCapacity: number,
  ISOShares: number
  NSOShares: number
  CapacityUtilized: number;
  CapacityRemaining: number;
}

// Function to run the ISO test for all of a stockholders' vesting installments
function calculateCapacity(installments: Installment[]): ISONSOTestResult[] {
  let remainingCapacity = ANNUAL_CAPACITY;
  let currentYear = installments[0].Year; // Initialize the current year to the year of the first row

  // First ensure that the installments are sorted in the correct order
  const sortedInstallments = sortInstallments(installments)

  const result = sortedInstallments.reduce((acc, current) => {
    // If the year changes, reset the remaining capacity to the full capacity for the new year
    if (current.Year !== currentYear) {
      remainingCapacity = ANNUAL_CAPACITY;
      currentYear = current.Year; // Update the current year
    }

    const startingCapacity = remainingCapacity

    // Determine how many shares are in included in this iteration of the test
    // options that are not eligible to be ISOs have already been removed in createInstallments
    const ISOEligibleShares = current["Became Exercisable"]
    
    // Determine how many shares can be ISOs based on the remainingCapacity
    const MaxISOShares = Math.floor(remainingCapacity / current.FMV)

    // Determine how many shares are ISOs
    const ISOShares = Math.min(MaxISOShares, ISOEligibleShares);

    // Determine how many shares are NSOs
    const NSOShares = current["Became Exercisable"] - ISOShares

    // Determine how much capacity was utilized
    const utilizedCapacity = ISOShares * current.FMV

    // Update remaining capacity after usage
    remainingCapacity -= utilizedCapacity;

    acc.push({
      Year: current.Year,
      Date: current.Date,
      GrantId: current.GrantId,
      "Event Type": current["Event Type"],
      "Became Exercisable": current["Event Quantity"],
      FMV: current.FMV,
      StartingCapacity: startingCapacity,
      ISOShares: ISOShares,
      NSOShares: NSOShares,
      CapacityUtilized: utilizedCapacity,
      CapacityRemaining: remainingCapacity,
    });

    return acc

  }, [] as ISONSOTestResult[]);

  return result;
}

export const isoNsoCalculator = (packagePath: string, stakeholderId: string): ISONSOTestResult[] => {
  const ocfPackage: OcfPackageContent = readOcfPackage(packagePath);

  const valuations = ocfPackage.valuations;
  const transactions = ocfPackage.transactions;
  const equityCompensationIssuances = transactions.filter((transaction: any) => transaction.stakeholder_id === stakeholderId && (transaction.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE" || transaction.object_type === 'TX_PLAN_SECURITY_ISSUANCE')) as TX_Equity_Compensation_Issuance[] | undefined;

  if (!equityCompensationIssuances || equityCompensationIssuances.length === 0) {
    throw new Error("No equity compensation issuances found for stakeholder");
  }

  const allInstallments = equityCompensationIssuances.reduce((acc, issuance) => {
    const FMV = getFMV(issuance, valuations)
    const installments = createInstallments(packagePath, issuance, FMV)
    acc.push(...installments)
    return acc
  }, [] as Installment[])

  const result = calculateCapacity(allInstallments);

  return result;
};
