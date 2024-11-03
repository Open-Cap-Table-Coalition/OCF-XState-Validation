import * as fs from "fs";
import * as path from "path";

// ideally we'll eventually import these from OCF
interface VestingConditionTrigger_VestingStart {
  type: "VESTING_START_DATE";
}

interface VestingConditionTrigger_VestingScheduleAbsolute {
  type: "VESTING_SCHEDULE_ABSOLUTE";
  date: string;
}

interface VestingConditionTrigger_VestingScheduleRelative {
  type: "VESTING_SCHEDULE_RELATIVE";
  period:
    | {
        length: number;
        type: "DAYS";
        occurrences: number;
      }
    | {
        length: number;
        type: "MONTHS";
        occurrences: number;
        day_of_month:
          | "01"
          | "02"
          | "03"
          | "04"
          | "05"
          | "06"
          | "07"
          | "08"
          | "09"
          | "10"
          | "11"
          | "12"
          | "13"
          | "14"
          | "15"
          | "16"
          | "17"
          | "18"
          | "19"
          | "20"
          | "21"
          | "22"
          | "23"
          | "24"
          | "25"
          | "26"
          | "27"
          | "28"
          | "29_OR_LAST_DAY_OF_MONTH"
          | "30_OR_LAST_DAY_OF_MONTH"
          | "31_OR_LAST_DAY_OF_MONTH"
          | "VESTING_START_DAY_OR_LAST_DAY_OF_MONTH";
      };
  relative_to_condition_id: string;
}

interface VestingConditionTrigger_VestingEvent {
  type: "VESTING_EVENT";
}

interface VestingConditionBase {
  id: string;
  description?: string;
  portion?: {
    numerator: string;
    denominator: string;
    remainder?: boolean;
  };
  quantity?: string;
  next_condition_ids: string[];
  // cliff_condition isn't part of the schema yet
  cliff_length?: number;
}

export interface VestingCondition_VestingStart extends VestingConditionBase {
  trigger: VestingConditionTrigger_VestingStart;
}

export interface VestingCondition_VestingScheduleRelative
  extends VestingConditionBase {
  trigger: VestingConditionTrigger_VestingScheduleRelative;
}

export interface VestingCondition_VestingScheduleAbsolute
  extends VestingConditionBase {
  trigger: VestingConditionTrigger_VestingScheduleAbsolute;
}

export interface VestingCondition_VestingEvent extends VestingConditionBase {
  trigger: VestingConditionTrigger_VestingEvent;
}

export type VestingCondition =
  | VestingCondition_VestingStart
  | VestingCondition_VestingScheduleAbsolute
  | VestingCondition_VestingScheduleRelative
  | VestingCondition_VestingEvent;

// export interface VestingCondition {
//   id: string;
//   description?: string;
//   portion?: {
//     numerator: string
//     denominator: string
//     remainder?: boolean
//   };
//   quantity?: string;
//   trigger: VestingConditionTrigger_VestingStart | VesingConditionTrigger_VestingScheduleAbsolute | VestingConditionTrigger_VestingScheduleRelative | VestingConditionTrigger_VestingEvent
//   next_condition_ids: string[];
//   cliff_condition?: {
//     id: string;
//     description: string;
//     period: {
//       type: string;
//       length: number;
//     }
//   } // cliff_condition isn't part of the schema yet
// }

export interface VestingTerms {
  id: string;
  comments?: string[];
  object_type: "VESTING_TERMS";
  name: string;
  allocation_type:
    | "CUMULATIVE_ROUNDING"
    | "CUMULATIVE_ROUND_DOWN"
    | "FRONT_LOADED"
    | "BACK_LOADED"
    | "FRONT_LOADED_TO_SINGLE_TRANCHE"
    | "BACK_LOADED_TO_SINGLE_TRANCHE"
    | "FRACTIONAL";
  vesting_conditions: VestingCondition[];
}

export interface TX_Vesting_Start {
  id: string;
  comments?: string[];
  object_type: "TX_VESTING_START";
  date: string;
  security_id: string;
  vesting_condition_id: string;
}

export interface Valuation {
  id: string;
  comments: string[];
  object_type: "VALUATION";
  provider: string;
  board_approval_date: string;
  stockholder_approval_date: string;
  price_per_share: {
    amount: string;
    currency: string;
  };
  effective_date: string;
  stock_class_id: string;
  valuation_type: "409A";
}

export interface TX_Equity_Compensation_Issuance {
  id: string;
  comments?: string[];
  object_type: "TX_PLAN_SECURITY_ISSUANCE" | "TX_EQUITY_COMPENSATION_ISSUANCE";
  date: string;
  security_id: string;
  custom_id: string;
  stakeholder_id: string;
  board_approval_date?: string;
  stockholder_approval_date?: string;
  consideration_text?: string;
  security_law_exemptions: {
    description: string;
    jurisdiction: string;
  }[];
  stock_plan_id?: string;
  stock_class_id?: string;
  compensation_type:
    | "OPTION_NSO"
    | "OPTION_ISO"
    | "OPTION"
    | "RSU"
    | "CSAR"
    | "SSAR";
  option_grant_type: "NSO" | "ISO" | "INTL";
  quantity: string;
  exercise_price?: {
    amount: string;
    currency: string;
  };
  base_price?: {
    amount: string;
    currency: string;
  };
  early_exercisable?: boolean;
  vesting_terms_id?: string;
  vestings?: {
    date: string;
    amount: string;
  }[];
  expiration_date: string | null;
  termination_exercise_windows: {
    reason:
      | "VOLUNTARY_OTHER"
      | "VOLUNTARY_GOOD_CAUSE"
      | "VOLUNTARY_RETIREMENT"
      | "INVOLUNTARY_OTHER"
      | "INVOLUNTARY_DEATH"
      | "INVOLUNTARY_DISABILITY"
      | "INVOLUNTARY_WITH_CAUSE";
    period: number;
    period_type: "DAYS" | "MONTHS" | "YEARS";
  }[];
  valuation_id?: string; // this isn't part of the schema yet
}

export interface TX_Equity_Compensation_Exercise {
  id: string;
  comments: string[];
  object_type: "TX_EQUITY_COMPENSATION_EXERCISE";
  date: string;
  security_id: string;
  consideration_text: string;
  resulting_security_ids: string[];
  quantity: string;
}

export interface OcfPackageContent {
  manifest: any;
  stakeholders: any;
  stockClasses: any;
  transactions: Array<
    | TX_Equity_Compensation_Issuance
    | TX_Vesting_Start
    | TX_Equity_Compensation_Exercise
  >;
  stockLegends: any;
  stockPlans: any;
  vestingTerms: VestingTerms[];
  valuations: Valuation[];
}

interface file {
  filepath: string;
  md5: string;
}

export const readOcfPackage = (packagePath: string): OcfPackageContent => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(packagePath, "Manifest.ocf.json"), "utf8")
  );

  const stakeholders: any[] = [];
  manifest.stakeholders_files.forEach((file: file) => {
    stakeholders.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const stockClasses: any[] = [];
  manifest.stock_classes_files.forEach((file: file) => {
    stockClasses.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const transactions: TX_Equity_Compensation_Issuance[] = [];
  manifest.transactions_files.forEach((file: file) => {
    transactions.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const vestingTerms: VestingTerms[] = [];
  manifest.vesting_terms_files.forEach((file: file) => {
    vestingTerms.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const stockPlans: any[] = [];
  manifest.stock_plans_files.forEach((file: file) => {
    stockPlans.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const stockLegends: any[] = [];
  manifest.stock_legend_templates_files.forEach((file: file) => {
    stockLegends.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const valuations: Valuation[] = [];
  manifest.valuations_files.forEach((file: file) => {
    valuations.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });
  return {
    manifest,
    stakeholders,
    stockClasses,
    transactions,
    stockPlans,
    vestingTerms,
    stockLegends,
    valuations,
  };
};
