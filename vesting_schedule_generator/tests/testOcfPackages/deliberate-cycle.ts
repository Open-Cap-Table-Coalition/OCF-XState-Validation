import { formatISO } from "date-fns";
import { OcfPackageContent } from "../../../read_ocf_package";
import type {
  TX_Equity_Compensation_Issuance,
  TX_Vesting_Event,
  TX_Vesting_Start,
  VestingCondition,
  VestingTerms,
} from "types";

const vestingConditions: VestingCondition[] = [
  {
    id: "1",
    description: "1",
    quantity: "0",
    trigger: {
      type: "VESTING_START_DATE",
    },
    next_condition_ids: ["2"],
  },
  {
    id: "2",
    description: "2",
    portion: {
      numerator: "1",
      denominator: "1",
    },
    trigger: {
      type: "VESTING_SCHEDULE_ABSOLUTE",
      date: "2025-01-01",
    },
    next_condition_ids: ["3"],
  },
  {
    id: "3",
    description: "3",
    quantity: "0",
    trigger: {
      type: "VESTING_SCHEDULE_ABSOLUTE",
      date: "2026-01-01",
    },
    next_condition_ids: ["4"],
  },
  {
    id: "4",
    description: "4",
    trigger: {
      type: "VESTING_SCHEDULE_ABSOLUTE",
      date: "2026-05-01",
    },
    next_condition_ids: ["2"],
  },
];

const vestingTerms: VestingTerms[] = [
  {
    id: "deliberate_cycle",
    object_type: "VESTING_TERMS",
    name: "Deliberate cycle",
    description: "Deliberate cycle",
    allocation_type: "CUMULATIVE_ROUND_DOWN",
    vesting_conditions: vestingConditions,
  },
];

const transactions: (
  | TX_Equity_Compensation_Issuance
  | TX_Vesting_Start
  | TX_Vesting_Event
)[] = [
  {
    id: "eci_01",
    object_type: "TX_EQUITY_COMPENSATION_ISSUANCE",
    date: "2025-01-01",
    security_id: "equity_compensation_issuance_01",
    custom_id: "EC-1",
    stakeholder_id: "emilyEmployee",
    security_law_exemptions: [],
    quantity: "4800",
    exercise_price: { amount: "1.0", currency: "USD" },
    early_exercisable: false,
    compensation_type: "OPTION",
    option_grant_type: "ISO",
    expiration_date: "2034-12-31",
    termination_exercise_windows: [
      {
        reason: "VOLUNTARY_GOOD_CAUSE",
        period: 3,
        period_type: "MONTHS",
      },
    ],
    vesting_terms_id: "deliberate_cycle",
    valuation_id: "valuation_01",
  },
  {
    object_type: "TX_VESTING_START",
    id: "eci_vs_01",
    security_id: "equity_compensation_issuance_01",
    vesting_condition_id: "1",
    date: "2024-01-01",
  },
];

export const ocfPackage: OcfPackageContent = {
  manifest: [],
  stakeholders: [],
  stockClasses: [],
  transactions: transactions,
  stockLegends: [],
  stockPlans: [],
  vestingTerms: vestingTerms,
  valuations: [],
};
