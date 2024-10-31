Open Cap Table Format (OCF) Toolset

Version: 0.1.0

Date: 21 October 2024

This toolset provides a growing toolset to help validate and utilize Open Cap Table Format datasets.

Currently, the dataset includes 6 tools:

1. Read OCF Package: This tool creates a workable JSON object of the content of an OCF folder from the path of the directory holding the OCF files.
   `constocfPackage = readOcfPackage(ocfPackageFolderDir);`
2. Vesting Schedule Generator: This tool creates a JSON array of the vesting periods for a "time standard" (i.e. a schedule in the form of " 4 years monthly" periods ). The tool also calculates and shows exercise transactions for the equity compensation issuance. The tool can handle any type of allocation type and any upfront vesting or cliff periods. (NOTE: This tool utilizes the concept of a cliff_condition inside the relative time vesting condition which is not in the current released version of OCF as of Oct 21, 2024).
   `constschedule = generateSchedule(ocfPackageFolderDir, equityCompensationIssuanceSecurityId);`
3. Vesting Status Check: Building on the Vesting Schedule Generator, this tool allows a user to find the exact status of unvested, vested, and exercise options at a given time.
   `conststatus = vestingStatusCheck(ocfPackageFolderDir,equityCompensationIssuanceSecurityId, vestingStatusDate);`
4. ISO / NSO Split Calculator: This tool allows a user to determine the ISO / NSO split for equity compensation issuances for a given stakeholder. This tool shows the split of NSO/ISO for each vesting period of the relative equity compensation issuances. This tool uses the vesting schedule generator under the hood and will only work for vesting schedules that can be generated using that tool.
   `constisoNso = isoNsoCalculator(ocfPackageFolderDir, isoCheckStakeholder, isoCapacity);`
5. OCF Validator: This tool tests the logical and structural validity of an OCF package. We are continuing to build out the rules set for validity but have good coverage for stock transactions and basic validations for all other transactions. The tool outputs a JSON object with the varibles of `result: string` , `report: string[]` and `snapshots: any[]` . The result shows if the package is valid or what the issue is if it is not. The report shows a list of all the validity checks completed per transaction and snapshots shows an array of end of day captables based on the package.
   `constocfValidation = ocfValidator(ocfPackageFolderDir);`
6. OCF Snapshot: This tool allows the user to see the outstanding captable of a OCF package on a given date.
   `constsnapshot = ocfSnapshot(ocfPackageFolderDir, ocfSnapshotDate);`

Usage: (before publication to NPM)

Download this repository and run `npm i; npm run build; npm link;`

In the project that you want to use ocf-tools, run `npm link ocf-tools` and add
 ` const { readOcfPackage, generateSchedule, vestingStatusCheck, isoNsoCalculator, ocfValidator, ocfSnapshot } = require("ocf-tools");`
to the top of the file you want to use the ocf-tools in.
