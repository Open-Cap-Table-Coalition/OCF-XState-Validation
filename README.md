# Open Cap Table Format (OCF) Toolset

Version: 0.1.0

Date: 2 November 2024

## Toolset

This toolset provides a growing toolset to help validate and utilize Open Cap Table Format datasets.

Currently, the dataset includes 6 tools:

1. **Read OCF Package**: This tool creates a workable JSON object of the content of an OCF folder from the path of the directory holding the OCF files.

   ```ts
   const ocfPackage = readOcfPackage(ocfPackageFolderDir);
   ```

2. **Vesting Schedule Generator**: This tool creates a JSON array of the vesting periods for a "time standard" (i.e. a schedule in the form of " 4 years monthly" periods ). The tool also calculates and shows exercise transactions for the equity compensation issuance.

   The tool can handle any `allocation-type`, any `day_of_month` type, and any upfront vesting or cliff periods. If the vesting commencement date or cliff occurs before the grant date, the grant date is treated as a cliff.

   `getFullSchedule()` returns an array of objects:

   ```typescript
   {
      Date: string;
      "Event Type": "Start" | "Cliff" | "Vesting" | "Exercise";
      "Event Quantity": number;
      "Remaining Unvested": number;
      "Cumulative Vested": number;
      "Became Exercisable": number;
      "Cumulative Exercised": number;
      "Available to Exercise": number;
   }
   ```

   ```typescript
   const schedule = new VestingScheduleService(
     vestingTerms,
     transactions,
     equityCompensationIssuanceSecurityId
   ).getFullSchedule();
   ```

   `getVestingStatus(checkDateString)` return the object equal to or first to occur following a given date:

   ```typescript
   const schedule = new VestingScheduleService(
     vestingTerms,
     transactions,
     equityCompensationIssuanceSecurityId
   ).getVestingStatus(checkDateString);
   ```

   Run `npm run print:vesting_schedule.ts`, `npm run print:vesting_status.ts`, and `npm run print:iso_nso_test.ts` in the command line to see the results printed to console.

   **NOTE**: This tool utilizes the concept of a cliff_condition inside the relative time vesting condition which is not in the current released version of OCF as of November 2, 2024.

3. **ISO / NSO Split Calculator**: This tool allows a user to determine the ISO / NSO split for equity compensation issuances for a given stakeholder. This tool shows the split of NSO/ISO for each vesting period of the relative equity compensation issuances. This tool uses the vesting schedule generator under the hood and will only work for vesting schedules that can be generated using that tool.

   ```typescript
   const isoNso = new ISONSOCalculatorService(
     stakeholderId,
     transactions,
     vestingTerms,
     valuations
   ).Results;
   ```

4. **OCF Validator**: This tool tests the logical and structural validity of an OCF package. We are continuing to build out the rules set for validity but have good coverage for stock transactions and basic validations for all other transactions. The tool outputs a JSON object with the variables of `result: string` , `report: string[]` and `snapshots: any[]` . The result shows if the package is valid or what the issue is if it is not. The report shows a list of all the validity checks completed per transaction and snapshots shows an array of end of day captables based on the package.

   ```typescript
   const ocfValidation = ocfValidator(ocfPackageFolderDir);
   ```

5. **OCF Snapshot**: This tool allows the user to see the outstanding captable of a OCF package on a given date.

   ```typescript
   const snapshot = ocfSnapshot(ocfPackageFolderDir, ocfSnapshotDate);
   ```

## Usage

### (before publication to NPM)

Download this repository and run `npm i; npm run build; npm link;`

In the project that you want to use ocf-tools, run `npm link ocf-tools` and add
` const { readOcfPackage, generateSchedule, vestingStatusCheck, isoNsoCalculator, ocfValidator, ocfSnapshot } = require("ocf-tools");`
to the top of the file you want to use the ocf-tools in.
