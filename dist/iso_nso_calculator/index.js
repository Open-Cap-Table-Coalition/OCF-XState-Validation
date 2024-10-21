"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isoNsoCalculator = void 0;
const read_ocf_package_1 = require("../read_ocf_package");
const vesting_schedule_generator_1 = require("../vesting_schedule_generator");
const addYearAndGrantId = (vestingSchedule, issuanceId) => {
    return vestingSchedule.map((entry) => {
        const date = new Date(entry.Date);
        return Object.assign(Object.assign({}, entry), { Grant: issuanceId, Year: date.getFullYear() });
    });
};
// Function to sum the amounts by year
const sumByYear = (vestingSchedule) => {
    // Create an empty object to store the sums by year
    const result = {};
    // Iterate through the array
    vestingSchedule.forEach((entry) => {
        if (entry["Event Type"] !== "Exercise") {
            const year = entry.Year;
            const amount = entry["Event Quantity"];
            // If the year is already in the result, add the amount
            if (result[year]) {
                result[year] += amount;
            }
            else {
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
// Function to calculate capacity
function calculateCapacity(vestingData, capacityPerYear) {
    const result = [];
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
        result.push(Object.assign(Object.assign({}, row), { CapacityUsed: usedCapacity, CapacityRemaining: remainingCapacity }));
    });
    return result;
}
// Function to add ISO Shares and NSO Shares to the vesting data
function addSharesColumns(vestingData) {
    return vestingData.map((row) => {
        const isoShares = Math.round(row.CapacityUsed / row.FMV);
        const nsoShares = Math.round((row.VestedValue - row.CapacityUsed) / row.FMV);
        return Object.assign(Object.assign({}, row), { ISOShares: isoShares, NSOShares: nsoShares });
    });
}
// Function to add ISO Used, ISO Remaining, and NSO columns
function addISOColumns(vestingData, isoData) {
    const result = [];
    const isoRemainingByGrantAndYear = {};
    for (let i = 0; i < vestingData.length; i++) {
        // Get the corresponding ISO share information for the grant and year
        const isoInfo = isoData.find((iso) => iso.Grant === vestingData[i].Grant && iso.Year === vestingData[i].Year);
        if (!isoInfo) {
            throw new Error(`ISO data not found for Grant ${vestingData[i].Grant} and Year ${vestingData[i].Year}`);
        }
        const grantYearKey = `${vestingData[i].Grant}-${vestingData[i].Year}`;
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
        result.push(Object.assign(Object.assign({}, vestingData[i]), { ISO: isoUsed, NSO: nso, ISORemaining: isoRemaining }));
    }
    return result;
}
const isoNsoCalculator = (packagePath, stakeholderId, capacity) => {
    const ocfPackage = (0, read_ocf_package_1.readOcfPackage)(packagePath);
    const valuations = ocfPackage.valuations;
    const transactions = ocfPackage.transactions;
    const equityCompensationIssuances = transactions.filter((transaction) => transaction.stakeholder_id === stakeholderId && transaction.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE");
    if (equityCompensationIssuances.length === 0) {
        throw new Error("No equity compensation issuances found for stakeholder");
    }
    const sortedIssuances = equityCompensationIssuances.sort((a, b) => a.date.localeCompare(b.date));
    const combinedYearTable = [];
    const combinedGrants = [];
    let vestedByYearTable = [];
    sortedIssuances.forEach((issuance) => {
        const vestingSchedule = (0, vesting_schedule_generator_1.generateSchedule)(packagePath, issuance.security_id);
        const vestingScheduleWithYearAndGrantId = addYearAndGrantId(vestingSchedule, issuance.id);
        combinedGrants.push(vestingScheduleWithYearAndGrantId);
        vestedByYearTable = sumByYear(vestingScheduleWithYearAndGrantId);
        valuations.forEach((valuation) => {
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
    // Add ISO and NSO shares
    const updatedVestingDataWithShares = addSharesColumns(updatedVestingData);
    const sortedByGrant = updatedVestingDataWithShares.sort((a, b) => a.Grant.localeCompare(b.Grant));
    let result = [];
    combinedGrants.forEach((grant) => {
        const updatedVestingData = addISOColumns(grant, sortedByGrant);
        result.push(updatedVestingData);
    });
    return result;
};
exports.isoNsoCalculator = isoNsoCalculator;
