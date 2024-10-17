const isoCalculator = () => {
  // 1. Grab the incoming data from the file

  const dataPath = process.argv[2] || '../test_data/iso-calculation-data.ts';
  const {
    equity_compensation_issuances,
    vesting_starts,
    vesting_terms,
    valuations,
  } = require(dataPath);

  if (equity_compensation_issuances.length > 0) {
    const sorted_issuances = equity_compensation_issuances.sort(
      (
        a: {date: string; object_type: string},
        b: {date: string; object_type: string}
      ) => a.date.localeCompare(b.date)
    );

    const combinedYearTable: any[] = [];
    const combinedGrants: any[] = [];
    sorted_issuances.forEach((issuance: any) => {
      const vesting_schedule_table: any[] = [];
      let vestingTermsData: any;
      vesting_terms.forEach((ele: any) => {
        if (ele.id === issuance.vesting_terms_id) {
          vestingTermsData = ele;
        }
      });

      let nextVestingCondition: any;

      let eventDate: any;
      let vestingConditionId: any;
      vesting_starts.forEach((start: any) => {
        if (start.security_id === issuance.security_id) {
          eventDate = new Date(start.date);
          vestingConditionId = start.vesting_condition_id;
        }
      });

      vestingTermsData.vesting_conditions.forEach((vestingCondition: any) => {
        if (vestingCondition.id === vestingConditionId) {
          if (vestingCondition.portion.numerator) {
            const amountVested =
              (parseFloat(issuance.quantity) *
                parseFloat(vestingCondition.portion.numerator)) /
              parseFloat(vestingCondition.portion.denominator);

            vesting_schedule_table.push({
              Grant: issuance.security_id,
              Date: eventDate.toISOString().split('T')[0],
              Year: eventDate.getFullYear(),
              'Amount Vested': amountVested,
            });
          }
          nextVestingCondition = vestingCondition.next_condition_ids[0];
        }
      });

      vestingConditionId = nextVestingCondition;

      vestingTermsData.vesting_conditions.forEach((vestingCondition: any) => {
        if (vestingCondition.id === vestingConditionId) {
          if (vestingCondition.trigger.type === 'VESTING_SCHEDULE_RELATIVE') {
            for (
              let i = 0;
              i < vestingCondition.trigger.period.occurrences;
              i++
            ) {
              eventDate = new Date(
                eventDate.setMonth(
                  eventDate.getMonth() + vestingCondition.trigger.period.length
                )
              );
              if (vestingCondition.portion.numerator) {
                if (
                  vestingTermsData.allocation_type === 'CUMULATIVE_ROUNDING'
                ) {
                  const cumulativePercent =
                    (i + 1) / vestingCondition.portion.denominator;
                  let amountVested = -1;
                  if (i === 0) {
                    amountVested = Math.ceil(
                      cumulativePercent * parseFloat(issuance.quantity)
                    );
                  } else {
                    const lastCumulativePercent =
                      i / vestingCondition.portion.denominator;
                    amountVested =
                      Math.ceil(
                        cumulativePercent * parseFloat(issuance.quantity)
                      ) -
                      Math.ceil(
                        lastCumulativePercent * parseFloat(issuance.quantity)
                      );
                  }

                  vesting_schedule_table.push({
                    Grant: issuance.security_id,
                    Date: eventDate.toISOString().split('T')[0],
                    Year: eventDate.getFullYear(),
                    'Amount Vested': amountVested,
                  });
                } else if (
                  vestingTermsData.allocation_type === 'CUMULATIVE_ROUND_DOWN'
                ) {
                  const cumulativePercent =
                    (i + 1) / vestingCondition.portion.denominator;
                  let amountVested = -1;
                  if (i === 0) {
                    amountVested = Math.floor(
                      cumulativePercent * parseFloat(issuance.quantity)
                    );
                  } else {
                    const lastCumulativePercent =
                      i / vestingCondition.portion.denominator;
                    amountVested =
                      Math.floor(
                        cumulativePercent * parseFloat(issuance.quantity)
                      ) -
                      Math.floor(
                        lastCumulativePercent * parseFloat(issuance.quantity)
                      );
                  }

                  vesting_schedule_table.push({
                    Grant: issuance.security_id,
                    Date: eventDate.toISOString().split('T')[0],
                    Year: eventDate.getFullYear(),

                    'Amount Vested': amountVested,
                  });
                } else if (
                  vestingTermsData.allocation_type === 'FRONT_LOADED'
                ) {
                  const remainder =
                    parseFloat(issuance.quantity) %
                    vestingCondition.portion.denominator;
                  let amountVested = -1;
                  if (i < remainder) {
                    amountVested = Math.ceil(
                      parseFloat(issuance.quantity) /
                        vestingCondition.portion.denominator
                    );
                  } else {
                    amountVested = Math.floor(
                      parseFloat(issuance.quantity) /
                        vestingCondition.portion.denominator
                    );
                  }

                  vesting_schedule_table.push({
                    Grant: issuance.security_id,
                    Date: eventDate.toISOString().split('T')[0],
                    Year: eventDate.getFullYear(),

                    'Amount Vested': amountVested,
                  });
                } else if (vestingTermsData.allocation_type === 'BACK_LOADED') {
                  const remainder =
                    parseFloat(issuance.quantity) %
                    vestingCondition.portion.denominator;
                  let amountVested = -1;
                  if (i < remainder) {
                    amountVested = Math.floor(
                      parseFloat(issuance.quantity) /
                        vestingCondition.portion.denominator
                    );
                  } else {
                    amountVested = Math.ceil(
                      parseFloat(issuance.quantity) /
                        vestingCondition.portion.denominator
                    );
                  }

                  vesting_schedule_table.push({
                    Grant: issuance.security_id,
                    Date: eventDate.toISOString().split('T')[0],
                    Year: eventDate.getFullYear(),
                    'Amount Vested': amountVested,
                  });
                } else if (
                  vestingTermsData.allocation_type ===
                  'FRONT_LOADED_TO_SINGLE_TRANCHE'
                ) {
                  const remainder =
                    parseFloat(issuance.quantity) %
                    vestingCondition.portion.denominator;
                  let amountVested = -1;
                  if (i === 0) {
                    amountVested =
                      Math.floor(
                        parseFloat(issuance.quantity) /
                          vestingCondition.portion.denominator
                      ) + remainder;
                  } else {
                    amountVested = Math.floor(
                      parseFloat(issuance.quantity) /
                        vestingCondition.portion.denominator
                    );
                  }

                  vesting_schedule_table.push({
                    Grant: issuance.security_id,
                    Date: eventDate.toISOString().split('T')[0],
                    Year: eventDate.getFullYear(),

                    'Amount Vested': amountVested,
                  });
                } else if (
                  vestingTermsData.allocation_type ===
                  'BACK_LOADED_TO_SINGLE_TRANCHE'
                ) {
                  const remainder =
                    parseFloat(issuance.quantity) %
                    vestingCondition.portion.denominator;
                  let amountVested = -1;
                  if (i === vestingCondition.portion.denominator - 1) {
                    amountVested =
                      Math.floor(
                        parseFloat(issuance.quantity) /
                          vestingCondition.portion.denominator
                      ) + remainder;
                  } else {
                    amountVested = Math.floor(
                      parseFloat(issuance.quantity) /
                        vestingCondition.portion.denominator
                    );
                  }

                  vesting_schedule_table.push({
                    Grant: issuance.security_id,
                    Date: eventDate.toISOString().split('T')[0],
                    Year: eventDate.getFullYear(),

                    'Amount Vested': amountVested,
                  });
                } else {
                  const amountVested =
                    (parseFloat(issuance.quantity) *
                      parseFloat(vestingCondition.portion.numerator)) /
                    parseFloat(vestingCondition.portion.denominator);

                  vesting_schedule_table.push({
                    Grant: issuance.security_id,
                    Date: eventDate.toISOString().split('T')[0],
                    Year: eventDate.getFullYear(),
                    'Amount Vested': amountVested,
                  });
                }
              }
            }

            // Check if there is a cliff and update the vesting schedule accordingly.
            if (vestingCondition.cliff_condition) {
              let cliffAmount = vesting_schedule_table[1]['Amount Vested'];
              for (
                let i = 1;
                i <= vestingCondition.cliff_condition.period.length;
                i++
              ) {
                if (i < vestingCondition.cliff_condition.period.length) {
                  cliffAmount += vesting_schedule_table[i]['Amount Vested'];
                  vesting_schedule_table.splice(1, 1);
                  vesting_schedule_table[1]['Amount Vested'] = cliffAmount;
                }
              }
            }
          }
          nextVestingCondition = vestingCondition.next_condition_ids[0];
          vestingConditionId = nextVestingCondition;
        }
      });

      console.log(
        'This is the vesting schedule for grant: ',
        issuance.security_id
      );
      console.table(vesting_schedule_table);

      combinedGrants.push(vesting_schedule_table);
      const vestedByYearTable = sumByYear(vesting_schedule_table);

      valuations.forEach((valuation: any) => {
        if (valuation.id === issuance.valuation_id) {
          for (let i = 0; i < vestedByYearTable.length; i++) {
            vestedByYearTable[i]['FMV'] = parseFloat(
              valuation.price_per_share.amount
            );
            vestedByYearTable[i]['VestedValue'] =
              vestedByYearTable[i]['FMV'] *
              vestedByYearTable[i]['TotalAmountVested'];
          }
        }
      });

      console.log(
        'This is the vesting schedule grouped by years instead of vesting dates for grant: ',
        issuance.security_id
      );
      console.table(vestedByYearTable);
      combinedYearTable.push(...vestedByYearTable);
    });

    combinedYearTable.sort((a, b) => a.Year - b.Year);

    console.log(
      'This is the combined vesting schedules for all grants based on years instead of vesting dates SORTED BY YEAR'
    );

    console.table(combinedYearTable);

    // Calculate the new table with capacity information
    const updatedVestingData = calculateCapacity(combinedYearTable, 100000);

    console.log(
      'This is the combined vesting schedules for all grants based on years showing capacity used SORTED BY YEAR'
    );

    console.table(updatedVestingData);

    // Add ISO and NSO shares
    const updatedVestingDataWithShares = addSharesColumns(updatedVestingData);

    // Output the updated data with ISO and NSO shares

    console.log(
      'This is the combined vesting schedules for all grants based on years showing ISO/NSO share splits used SORTED BY YEAR'
    );

    console.table(updatedVestingDataWithShares);

    const sortedByGrant = updatedVestingDataWithShares.sort(
      (a: {Grant: string}, b: {Grant: string}) => a.Grant.localeCompare(b.Grant)
    );

    console.log(
      'This is the combined vesting schedules for all grants based on years showing ISO/NSO share splits used SORTED BY GRANT'
    );

    console.table(sortedByGrant);

    // Add the ISO columns

    combinedGrants.forEach((grant: any) => {
      const updatedVestingData = addISOColumns(grant, sortedByGrant);

      // Display the updated data

      console.log(
        'This is the vesting schedule showing ISO/NSO Split by vesting period for grant:',
        grant[0].Grant
      );
      console.table(updatedVestingData);
    });
  }
};

// Define interfaces for both tables
interface VestingData {
  Grant: string;
  Date: string;
  Year: number;
  'Amount Vested': number;
}

interface GrantISOData {
  Grant: string;
  Year: number;
  TotalAmountVested: number;
  FMV: number;
  VestedValue: number;
  CapacityUsed: number;
  CapacityRemaining: number;
  ISOShares: number;
  NSOShares: number;
}

interface VestingDataWithISO extends VestingData {
  ISO: number;
  ISORemaining: number;
  NSO: number;
}

// Function to add ISO Used, ISO Remaining, and NSO columns
function addISOColumns(
  vestingData: VestingData[],
  isoData: GrantISOData[]
): VestingDataWithISO[] {
  const result: VestingDataWithISO[] = [];
  const isoRemainingByGrantAndYear: {[key: string]: number} = {};

  for (let i = 0; i < vestingData.length; i++) {
    // Get the corresponding ISO share information for the grant and year
    const isoInfo = isoData.find(
      iso =>
        iso.Grant === vestingData[i].Grant && iso.Year === vestingData[i].Year
    );

    if (!isoInfo) {
      throw new Error(
        `ISO data not found for Grant ${vestingData[i].Grant} and Year ${vestingData[i].Year}`
      );
    }

    const grantYearKey = `${vestingData[i].Grant}-${vestingData[i].Year}`;

    // Initialize ISO Remaining at the start of the year
    if (!(grantYearKey in isoRemainingByGrantAndYear)) {
      isoRemainingByGrantAndYear[grantYearKey] = isoInfo.ISOShares;
    }

    // Calculate ISO Used as the minimum of Amount Vested and ISO Remaining
    const isoUsed = Math.min(
      vestingData[i]['Amount Vested'],
      isoRemainingByGrantAndYear[grantYearKey]
    );

    // Calculate NSO if ISO Remaining is zero
    const nso =
      isoRemainingByGrantAndYear[grantYearKey] === 0
        ? vestingData[i]['Amount Vested']
        : Math.max(0, vestingData[i]['Amount Vested'] - isoUsed);

    // Update ISO Remaining
    const isoRemaining = isoRemainingByGrantAndYear[grantYearKey] - isoUsed;

    // Store the updated ISO Remaining for the next rows in the same year
    isoRemainingByGrantAndYear[grantYearKey] = isoRemaining;

    // Add the row with the new ISO and NSO columns
    result.push({
      ...vestingData[i],
      ISO: isoUsed,
      NSO: nso,
      ISORemaining: isoRemaining,
    });
  }

  return result;
}

// Define the interface for the vesting data structure, including CapacityUsed and CapacityRemaining
interface VestingDataWithCapacity {
  Grant: string;
  Year: number;
  TotalAmountVested: number;
  FMV: number;
  VestedValue: number;
  CapacityUsed: number;
  CapacityRemaining: number;
}

// Define the interface for the result structure with ISO Shares and NSO Shares
interface VestingDataWithShares extends VestingDataWithCapacity {
  ISOShares: number;
  NSOShares: number;
}

// Function to add ISO Shares and NSO Shares to the vesting data
function addSharesColumns(
  vestingData: VestingDataWithCapacity[]
): VestingDataWithShares[] {
  return vestingData.map(row => {
    const isoShares = Math.round(row.CapacityUsed / row.FMV);
    const nsoShares = Math.round(
      (row.VestedValue - row.CapacityUsed) / row.FMV
    );

    return {
      ...row,
      ISOShares: isoShares,
      NSOShares: nsoShares,
    };
  });
}

// Define the interface for the vesting data structure
interface VestingData {
  Grant: string;
  Year: number;
  TotalAmountVested: number;
  FMV: number;
  VestedValue: number;
}

// Define the interface for the result structure
interface VestingDataWithCapacity extends VestingData {
  CapacityUsed: number;
  CapacityRemaining: number;
}

// Function to calculate capacity
function calculateCapacity(
  vestingData: VestingData[],
  capacityPerYear: number
): VestingDataWithCapacity[] {
  const result: VestingDataWithCapacity[] = [];
  let remainingCapacity = capacityPerYear;
  let currentYear = vestingData[0].Year; // Initialize the current year to the year of the first row

  vestingData.forEach(row => {
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

// Define the interface for the vesting schedule entries
interface VestingScheduleEntry {
  Grant: string; // Represents the grant ID
  Date: string; // Represents the date of the entry
  Year: number; // Represents the year
  'Amount Vested': number; // Represents the vested amount for that year
}

// Function to sum the amounts by year
function sumByYear(vestingSchedule: VestingScheduleEntry[]): {
  Grant: string;
  Year: number;
  TotalAmountVested: number;
  FMV: number;
  VestedValue: number;
}[] {
  // Create an empty object to store the sums by year
  const result: {[key: number]: number} = {};

  // Iterate through the array
  vestingSchedule.forEach(entry => {
    const year = entry.Year;
    const amount = entry['Amount Vested'];

    // If the year is already in the result, add the amount
    if (result[year]) {
      result[year] += amount;
    } else {
      // Otherwise, set the initial amount for the year
      result[year] = amount;
    }
  });

  // Convert the result object into an array of objects for displaying
  const resultTable = Object.keys(result).map(yearString => {
    const year = parseInt(yearString, 10); // Convert the key back to a number
    return {
      Grant: vestingSchedule[0].Grant,
      Year: year,
      TotalAmountVested: result[year], // TypeScript is happy now, as the key is treated as a number
      FMV: 0,
      VestedValue: 0,
    };
  });

  return resultTable;
}

isoCalculator();
