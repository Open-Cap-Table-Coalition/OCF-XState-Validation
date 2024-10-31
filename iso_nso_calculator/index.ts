import { OcfPackageContent, readOcfPackage } from "../read_ocf_package";
import { generateSchedule, VestingSchedule } from "../vesting_schedule_generator";

// Define the interface for the vesting schedule entries
interface VestingScheduleWithYearAndGrantId extends VestingSchedule {
  Year: number; // Represents the year
  Grant: string; // Represents the grant ID
}

const addYearAndGrantId = (vestingSchedule: VestingSchedule[], issuanceId: string): VestingScheduleWithYearAndGrantId[] => {
  return vestingSchedule.map((entry) => {
    const date = new Date(entry.Date);
    return {
      ...entry,
      Year: date.getFullYear(),
      Grant: issuanceId,
    };
  });
};

interface GrantsByYear {
  Grant: string;
  Year: number;
  TotalAmountVested: number;
  FMV: number;
  VestedValue: number;
}
// Function to sum the amounts by year
const sumByYear = (vestingSchedule: VestingScheduleWithYearAndGrantId[]): GrantsByYear[] => {
  // Create an empty object to store the sums by year
  const result: { [key: number]: number } = {};

  // Iterate through the array
  vestingSchedule.forEach((entry) => {
    if (entry["Event Type"] !== "Exercise") {
      const year = entry.Year;
      const amount = entry["Event Quantity"];

      // If the year is already in the result, add the amount
      if (result[year]) {
        result[year] += amount;
      } else {
        // Otherwise, set the initial amount for the year
        result[year] = amount;
      }
    }
  });

  // Convert the result object into an array of objects for displaying
  const resultTable = Object.keys(result).map((yearString) => {
    const year = parseInt(yearString, 10); // Convert the key back to a number
    return {
      Grant: vestingSchedule[0].Grant,
      Year: year,
      TotalAmountVested: result[year],
      FMV: 0,
      VestedValue: 0,
    };
  });

  return resultTable;
};

// Define the interface for the result structure
interface VestingDataWithCapacity extends GrantsByYear {
  CapacityUsed: number;
  CapacityRemaining: number;
}

// Function to calculate capacity
function calculateCapacity(vestingData: GrantsByYear[], capacityPerYear: number): VestingDataWithCapacity[] {
  const result: VestingDataWithCapacity[] = [];
  let remainingCapacity = capacityPerYear;
  let currentYear = vestingData[0].Year; // Initialize the current year to the year of the first row

  vestingData.forEach((row) => {
    // If the year changes, reset the remaining capacity to the full capacity for the new year
    if (row.Year !== currentYear) {
      remainingCapacity = capacityPerYear;
      currentYear = row.Year; // Update the current year
    }

    // Determine how much capacity is used in this row
    const usedCapacity = Math.min(row.VestedValue, remainingCapacity);

    // Update remaining capacity after usage
    remainingCapacity -= usedCapacity;

    // Add Capacity Used and Capacity Remaining to the row
    result.push({
      ...row,
      CapacityUsed: usedCapacity,
      CapacityRemaining: remainingCapacity,
    });
  });

  return result;
}

// Define the interface for the result structure with ISO Shares and NSO Shares
interface VestingDataWithShares extends VestingDataWithCapacity {
  ISOShares: number;
  NSOShares: number;
}

// Function to add ISO Shares and NSO Shares to the vesting data
function addSharesColumns(vestingData: VestingDataWithCapacity[]): VestingDataWithShares[] {
  return vestingData.map((row) => {
    const isoShares = Math.round(row.CapacityUsed / row.FMV);
    const nsoShares = Math.round((row.VestedValue - row.CapacityUsed) / row.FMV);

    return {
      ...row,
      ISOShares: isoShares,
      NSOShares: nsoShares,
    };
  });
}

interface VestingDataWithISO {
  Year: number,
  Grant: string;
  FMV: number;
  Date: string;
  "Event Type": string;
  "ISO Shares": number;
  "NSO Shares": number;
}

// Function to add ISO Used, ISO Remaining, and NSO columns
function addISOColumns(vestingData: VestingScheduleWithYearAndGrantId[], isoData: VestingDataWithShares[]): VestingDataWithISO[] {
  const result: VestingDataWithISO[] = [];
  const isoRemainingByGrantAndYear: { [key: string]: number } = {};

  
  for (let i = 0; i < vestingData.length; i++) {
    // Get the corresponding ISO share information for the grant and year
    const isoInfo = isoData.find((iso) => iso.Grant === vestingData[i].Grant && iso.Year === vestingData[i].Year);

    if (!isoInfo) {
      throw new Error(`ISO data not found for Grant ${vestingData[i].Grant} and Year ${vestingData[i].Year}`);
    }

    const grantYearKey = `${vestingData[i].Grant}-${vestingData[i].Year}`;

    if (vestingData[i]["Event Type"] !== "Exercise") {
      // Initialize ISO Remaining at the start of the year
      if (!(grantYearKey in isoRemainingByGrantAndYear)) {
        isoRemainingByGrantAndYear[grantYearKey] = isoInfo.ISOShares;
      }

      // Calculate ISO Used as the minimum of Amount Vested and ISO Remaining
      const isoUsed = Math.min(vestingData[i]["Event Quantity"], isoRemainingByGrantAndYear[grantYearKey]);

      // Calculate NSO if ISO Remaining is zero
      const nso = isoRemainingByGrantAndYear[grantYearKey] === 0 ? vestingData[i]["Event Quantity"] : Math.max(0, vestingData[i]["Event Quantity"] - isoUsed);

      // Update ISO Remaining
      const isoRemaining = isoRemainingByGrantAndYear[grantYearKey] - isoUsed;

      // Store the updated ISO Remaining for the next rows in the same year
      isoRemainingByGrantAndYear[grantYearKey] = isoRemaining;
      // Add the row with the new ISO and NSO columns
      result.push({
        Year: vestingData[i].Year,
        Grant: vestingData[i].Grant,
        FMV: isoInfo.FMV,
        Date: vestingData[i].Date,
        "Event Type": vestingData[i]["Event Type"],
        "ISO Shares": isoUsed,
        "NSO Shares": nso
      });
    }
  }

  return result;
}

export const isoNsoCalculator = (packagePath: string, stakeholderId: string, capacity: number): any => {
  const ocfPackage: OcfPackageContent = readOcfPackage(packagePath);

  const valuations = ocfPackage.valuations;
  const transactions = ocfPackage.transactions;
  const equityCompensationIssuances: any[] = transactions.filter((transaction: any) => transaction.stakeholder_id === stakeholderId && transaction.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE");

  if (equityCompensationIssuances.length === 0) {
    throw new Error("No equity compensation issuances found for stakeholder");
  }

  const sortedIssuances = equityCompensationIssuances.sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date));

  const combinedYearTable: any[] = [];
  const combinedGrants: any[] = [];
  let vestedByYearTable: any[] = [];

  sortedIssuances.forEach((issuance: any) => {
    const vestingSchedule = generateSchedule(packagePath, issuance.security_id);
    const vestingScheduleWithYearAndGrantId = addYearAndGrantId(vestingSchedule, issuance.id);
    combinedGrants.push(vestingScheduleWithYearAndGrantId);
    vestedByYearTable = sumByYear(vestingScheduleWithYearAndGrantId);

    valuations.forEach((valuation: any) => {
      if (valuation.id === issuance.valuation_id) {
        for (let i = 0; i < vestedByYearTable.length; i++) {
          vestedByYearTable[i]["FMV"] = parseFloat(valuation.price_per_share.amount);
          vestedByYearTable[i]["VestedValue"] = vestedByYearTable[i]["FMV"] * vestedByYearTable[i]["TotalAmountVested"];
        }
      }
    });

    combinedYearTable.push(...vestedByYearTable);
  });

  combinedYearTable.sort((a, b) => a.Year - b.Year);

  const updatedVestingData = calculateCapacity(combinedYearTable, capacity);
  console.table(updatedVestingData);

  // Add ISO and NSO shares
  const updatedVestingDataWithShares = addSharesColumns(updatedVestingData);

  const sortedByGrant = updatedVestingDataWithShares.sort((a: { Grant: string }, b: { Grant: string }) => a.Grant.localeCompare(b.Grant));

  let result: any[][] = [];
  combinedGrants.forEach((grant: any) => {
    const updatedVestingData = addISOColumns(grant, sortedByGrant);

    result.push(updatedVestingData);
  });

  return result;
};
