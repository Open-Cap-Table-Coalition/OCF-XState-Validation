import { OcfPackageContent, readOcfPackage, TX_Equity_Compensation_Issuance } from "../read_ocf_package";
import { generateSchedule, VestingSchedule } from "../vesting_schedule_generator";

const ANNUAL_CAPACITY = 100000

// Define the interface for the vesting schedule entries
interface Installment extends VestingSchedule {
  GrantId: string; // Represents the grant ID
  Year: number; // Represents the year
  FMV: number; // for now we assume that the FMV is the exercise price if there is no valuation.id.  Better approaches to be discussed.
  Grant_Type: 'NSO' | 'ISO' | 'INTL';
}

const createInstallment = (vestingSchedule: VestingSchedule[], issuanceId: string, FMV: number, grantType: 'NSO' | 'ISO' | 'INTL'): Installment[] => {
  return vestingSchedule.map((entry) => {
    const date = new Date(entry.Date);
    return {
      ...entry,
      GrantId: issuanceId,
      Year: date.getFullYear(),
      FMV: FMV,
      Grant_Type: grantType
    };
  });
};

// Define the interface for the result structure
interface ISONSOTestResult extends Installment {
  ISOShares: number
  NSOShares: number
  CapacityUsed: number;
  CapacityRemaining: number;
}

// Function to run the ISO test for each vesting installment
function calculateCapacity(installments: Installment[]): ISONSOTestResult[] {
  let remainingCapacity = ANNUAL_CAPACITY;
  let currentYear = installments[0].Year; // Initialize the current year to the year of the first row


  const result = installments.reduce((acc, current) => {
    // If the year changes, reset the remaining capacity to the full capacity for the new year
    if (current.Year !== currentYear) {
      remainingCapacity = ANNUAL_CAPACITY;
      currentYear = current.Year; // Update the current year
    }

    // Determine how many shares that first became exercisable are ISO eligible
    const ISOEligibleShares = current.Grant_Type === 'ISO' ? current["Became Exercisable"] : 0
    
    // Determine how many shares can be ISOs based on the remainingCapacity
    const MaxISOShares = Math.floor(remainingCapacity / current.FMV)

    // Determine how many shares are ISOs
    const ISOShares = Math.min(MaxISOShares, ISOEligibleShares);

    // Determine how many shares are NSOs
    const NSOShares = current["Became Exercisable"] - ISOShares

    // Determine how much capacity was utilized
    const usedCapacity = ISOShares * current.FMV

    // Update remaining capacity after usage
    remainingCapacity -= usedCapacity;


    acc.push({
      ...current,
      ISOShares: ISOShares,
      NSOShares: NSOShares,
      CapacityUsed: usedCapacity,
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

  const sortedIssuances = equityCompensationIssuances.sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date));

  const installmentsTable = sortedIssuances.reduce((acc, current) => {
    const vestingSchedule = generateSchedule(packagePath, current.security_id)
    const valuation = valuations.find(valuation => valuation.id === current.valuation_id)
    const FMV = valuation?.price_per_share.amount ?? current.exercise_price.amount // for now we'll assume the exercise price is the FMV if there is no valuation.  Better approaches to be discussed.
    const grant_type = current.option_grant_type
    const installments = createInstallment(vestingSchedule, current.id, parseFloat(FMV), grant_type)
    acc.push(...installments)
    return acc
  }, [] as Installment[])


  const result = calculateCapacity(installmentsTable);

  return result;
};
