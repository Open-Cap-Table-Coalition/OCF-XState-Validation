import { VestingSchedule, VestingScheduleService } from ".";
import {
  TX_Equity_Compensation_Issuance,
  TX_Vesting_Start,
  VestingCondition,
  VestingTerms,
} from "../read_ocf_package";

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

describe("VestingScheduleService", () => {
  let service: VestingScheduleService;
  let fullSchedule: VestingSchedule[];

  beforeEach(() => {
    service = new VestingScheduleService(
      vestingTerms,
      transactions,
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
});
