# Open Cap Table Format (OCF) Toolset

Version: 0.1.0

Date: 2 November 2024

This toolset provides a growing toolset to help validate and utilize Open Cap Table Format datasets.

Currently, the dataset includes 5 tools:

## Read OCF Package

This tool creates a workable JSON object of the content of an OCF folder from the path of the directory holding the OCF files.

```ts
const ocfPackage = readOcfPackage(ocfPackageFolderDir);
```

## Vesting Schedule Generator

This tool creates a JSON array of the vesting periods for a "time standard" (i.e. a schedule in the form of " 4 years monthly" periods ).The tool also calculates and shows exercise transactions for the equity compensation issuance.

The tool can handle any [allocation-type](https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/VestingTerms/#object-vesting-terms), any [day_of_month](https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/types/vesting/VestingPeriodInMonths/#type-vesting-period-in-months) designation, and any upfront vesting or cliff periods.

### 📝 Notes

This tool utilizes a `cliff_length` field within the `Vesting_Conditions` object, which is not in the current released version of OCF as of November 2, 2024. [Open-Cap-Table-Format-OCT Issue #514](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/issues/514#issue-2468182057)

### 💡Conventions

If the vesting commencement date or cliff occurs before the grant date, the grant date is treated as a cliff. [OCF-Tools PR #112](https://github.com/Open-Cap-Table-Coalition/OCF-Tools/pull/112)

If both `vestings` and `vesting_terms_id` are present, `vestings` takes precedence. [Open-Cap_Format-OCF PR #515](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/pull/515)

If neither `vestings` nor `vesting_terms_id` are present, then the shares are treated as fully vested on issuance. [Open-Cap_Format-OCF PR #515](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/pull/515)

### 🔧 Usage

The `VestingScheduleService` takes the `ocfPackage` returned from `readOcfPackage` and an equity compensation issuance [`security_id`](https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/transactions/issuance/EquityCompensationIssuance/#object-equity-compensation-issuance-transaction) as parameters.

```typescript
const vestingScheduleService = new VestingScheduleService(
  ocfPackage,
  equityCompensationIssuanceSecurityId
);
```

`.getFullSchedule()` returns an array of the following objects:

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

`.getVestingStatus(checkDateString)` provides the above as of a given date.

### 🔍 Examples

Run `npm run print:vesting_schedule.ts`, `npm run print:vesting_status.ts`, and `npm run print:iso_nso_test.ts` in the command line to see example results printed to console.

## ISO / NSO Split Calculator

This tool allows a user to determine the ISO / NSO split for equity compensation issuances for a given stakeholder. This tool shows the split of NSO/ISO for each vesting period of the relative equity compensation issuances.

### ⚠️ **Warning**

> This tool is in development and should not be relied on for legal purposes.

### 📝 Notes

This tool uses the vesting schedule generator under the hood and will only work for vesting schedules that can be generated using that tool.

This tool utilizes a `valuation_id` within the `Equity_Compensation_Issuance` object, which is not in the current released version of OCF as of November 2, 2024. [Open-Cap-Table-Format-OCT Issue #535](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/issues/535#issue-2595216527)

### 💡Conventions

If one or more `valuation_id`s are provided, the fair market value as of the grant date is assumed to be last valuation prior to the grant date. Otherwise, the fair market value as of the grant date is assumed to be the `exercise-price`.

This tool throws an error if neither a `valuation_id` nor an `exercise_price` is provided.

### 🔧 Usage

The `ISONSOCalculatorService` takes the `ocfPackage` returned from `readOcfPackage` and an equity compensation issuance [`stakeholder_id`](https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/transactions/issuance/EquityCompensationIssuance/#object-equity-compensation-issuance-transaction) as parameters.

```typescript
const isoNsoService = new ISONSOCalculatorService(ocfPackage, valuations);
```

`.Results` returns an array of the following objects:

```typescript
{
  Year: number;
  Date: string;
  "Security Id": string;
  "Event Type": "Start" | "Cliff" | "Vesting" | "Exercise";
  "Became Exercisable": number;
  "FMV": number;
  StartingCapacity: number;
  ISOShares: number;
  NSOShares: number;
  CapacityUtilized: number;
  CapacityRemaining: number;
}
```

## OCF Validator

This tool tests the logical and structural validity of an OCF package. We are continuing to build out the rules set for validity but have good coverage for stock transactions and basic validations for all other transactions. The tool outputs a JSON object with the variables of `result: string` , `report: string[]` and `snapshots: any[]` . The result shows if the package is valid or what the issue is if it is not. The report shows a list of all the validity checks completed per transaction and snapshots shows an array of end of day captables based on the package.

```typescript
const ocfValidation = ocfValidator(ocfPackageFolderDir);
```

## OCF Snapshot

This tool allows the user to see the outstanding captable of a OCF package on a given date.

```typescript
const snapshot = ocfSnapshot(ocfPackageFolderDir, ocfSnapshotDate);
```

## How to use the toolset

### (before publication to NPM)

Download this repository and run `npm i; npm run build; npm link;`

In the project that you want to use ocf-tools, run `npm link ocf-tools` and add
` const { readOcfPackage, generateSchedule, vestingStatusCheck, isoNsoCalculator, ocfValidator, ocfSnapshot } = require("ocf-tools");`
to the top of the file you want to use the ocf-tools in.
