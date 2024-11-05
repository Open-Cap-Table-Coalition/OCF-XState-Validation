import { transcode } from "buffer";
import { VestingInstallment, VestingScheduleService } from "../index";
import { OcfPackageContent } from "../../read_ocf_package";
import {
  TX_Equity_Compensation_Issuance,
  TX_Vesting_Start,
  VestingCondition,
  VestingTerms,
} from "../../types";

const vestingConditions: VestingCondition[] = [
  {
    id: "start_condition",
    portion: {
      numerator: "0",
      denominator: "48",
    },
    trigger: {
      type: "VESTING_START_DATE",
    },
    next_condition_ids: ["monthly_vesting_condition"],
  },
  {
    id: "monthly_vesting_condition",
    description: "1/48 payout each month",
    portion: {
      numerator: "1",
      denominator: "48",
    },
    trigger: {
      type: "VESTING_SCHEDULE_RELATIVE",
      period: {
        length: 1,
        type: "MONTHS",
        occurrences: 48,
        day_of_month: "VESTING_START_DAY_OR_LAST_DAY_OF_MONTH",
      },
      relative_to_condition_id: "start_condition",
    },
    cliff_length: 12,
    next_condition_ids: [],
  },
];

const vestingTerms: VestingTerms[] = [
  {
    id: "four_year_monthly_one_year_cliff_cumulative_round_down",
    object_type: "VESTING_TERMS",
    name: "Four Year / One Year Cliff - Cumulative Round Down",
    allocation_type: "CUMULATIVE_ROUND_DOWN",
    vesting_conditions: vestingConditions,
  },
];

const transactions: (TX_Equity_Compensation_Issuance | TX_Vesting_Start)[] = [
  {
    id: "eci_01",
    object_type: "TX_EQUITY_COMPENSATION_ISSUANCE",
    date: "2024-06-01",
    security_id: "equity_compensation_issuance_01",
    custom_id: "EC-1",
    stakeholder_id: "emilyEmployee",
    security_law_exemptions: [],
    quantity: "4800",
    exercise_price: { amount: "1.0", currency: "USD" },
    early_exercisable: false,
    compensation_type: "OPTION",
    option_grant_type: "ISO",
    expiration_date: "2034-05-31",
    termination_exercise_windows: [
      {
        reason: "VOLUNTARY_GOOD_CAUSE",
        period: 3,
        period_type: "MONTHS",
      },
    ],
    vesting_terms_id: "four_year_monthly_one_year_cliff_cumulative_round_down",
    valuation_id: "valuation_01",
  },
  {
    object_type: "TX_VESTING_START",
    id: "eci_vs_01",
    security_id: "equity_compensation_issuance_01",
    vesting_condition_id: "start_condition",
    date: "2024-06-01",
  },
];

const ocfPackage: OcfPackageContent = {
  manifest: [],
  stakeholders: [],
  stockClasses: [],
  transactions: transactions,
  stockLegends: [],
  stockPlans: [],
  vestingTerms: vestingTerms,
  valuations: [],
};

describe("VestingScheduleService", () => {
  let service: VestingScheduleService;
  let fullSchedule: VestingInstallment[];

  beforeEach(() => {
    service = new VestingScheduleService(
      ocfPackage,
      "equity_compensation_issuance_01"
    );

    fullSchedule = service.getFullSchedule();
  });

  test("Should not have a vesting event before 2025-06-01", () => {
    const vestingEventBeforeCliff = fullSchedule.find(
      (schedule) =>
        Date.parse(schedule.Date) <= Date.parse("2025-06-01") &&
        schedule["Event Type"] === "Vesting"
    );
    expect(vestingEventBeforeCliff).toBeUndefined();
  });

  test("Final total vested should equal original quantity", () => {
    console.table(fullSchedule);
    const lastInstallment = fullSchedule[fullSchedule.length - 1];
    const totalVested = lastInstallment["Cumulative Vested"];
    const originalQuantity = 4800;

    expect(totalVested).toEqual(originalQuantity);
  });

  test("Last vesting date should be 2028-05-01", () => {
    const lastInstallment = fullSchedule[fullSchedule.length - 1];
    const lastDate = lastInstallment.Date;
    expect(lastDate).toBe("2028-06-01");
  });
});
