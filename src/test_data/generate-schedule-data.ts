export const equity_compensation_issuance = {
  id: 'eci_01',
  object_type: 'TX_EQUITY_COMPENSATION_ISSUANCE',
  date: '2020-06-01',
  security_id: 'equity_compensation_issuance_01',
  custom_id: 'EC-1',
  stakeholder_id: 'emilyEmployee',
  security_law_exemptions: [],
  stock_class_id: 'ordinaryB',
  stock_plan_id: 'stock_plan_01',
  quantity: '2000',
  exercise_price: {amount: '0.1', currency: 'USD'},
  compensation_type: 'OPTION',
  option_grant_type: 'INTL',
  expiration_date: '2030-05-31',
  termination_exercise_windows: [
    {
      reason: 'VOLUNTARY_GOOD_CAUSE',
      period: 3,
      period_type: 'MONTHS',
    },
  ],
  vesting_terms_id: 'four_year_monthly_one_year_cliff_cumulative_round_down',
};

export const vestingTermsData = {
  id: 'four_year_monthly_one_year_cliff_cumulative_round_down',
  object_type: 'VESTING_TERMS',
  name: 'Four Year / One Year Cliff - Cumulative Round Down',
  description:
    '25% of the total number of shares shall vest on the one-year anniversary of this Agreement, and an additional 1/48th of the total number of Shares shall then vest on the corresponding day of each month thereafter, until all of the Shares have been released on the fourth anniversary of this Agreement.',
  allocation_type: 'CUMULATIVE_ROUND_DOWN',
  vesting_conditions: [
    {
      id: 'start_condition',
      portion: {
        numerator: '0',
        denominator: '48',
      },
      trigger: {
        type: 'VESTING_START_DATE',
      },
      next_condition_ids: ['monthly_vesting_condition'],
    },
    {
      id: 'monthly_vesting_condition',
      description: '1/48 payout each month',
      portion: {
        numerator: '1',
        denominator: '48',
      },
      trigger: {
        type: 'VESTING_SCHEDULE_RELATIVE',
        period: {
          length: 1,
          type: 'MONTHS',
          occurrences: 48,
          day_of_month: 'VESTING_START_DAY_OR_LAST_DAY_OF_MONTH',
        },
        relative_to_condition_id: 'start_condition',
      },
      // cliff_condition variable is not in current OCF schema and is recommended as a non-breaking change to correctly calculate the vesting schedule
      cliff_condition: {
        id: 'cliff_condition',
        description: 'Cliff payout at 12 month',
        period: {
          type: 'MONTHS',
          length: 12,
        },
      },
      next_condition_ids: [],
    },
  ],
};

export const vesting_start = {
  object_type: 'TX_VESTING_START',
  id: 'eci_vs_01',
  security_id: 'equity_compensation_issuance_01',
  vesting_condition_id: 'start_condition',
  date: '2019-06-01',
};

export const exercise_transactions = [
  {
    id: 'EXERCISE_01',
    object_type: 'TX_EQUITY_COMPENSATION_EXERCISE',
    date: '2020-06-15',
    security_id: 'equity_compensation_issuance_01',
    resulting_security_ids: ['share_issuance_01'],
    quantity: '500',
  },
  {
    id: 'EXERCISE_02',
    object_type: 'TX_EQUITY_COMPENSATION_EXERCISE',
    date: '2021-05-15',
    security_id: 'equity_compensation_issuance_01',
    resulting_security_ids: ['share_issuance_02'],
    quantity: '400',
  },
  {
    id: 'EXERCISE_03',
    object_type: 'TX_EQUITY_COMPENSATION_EXERCISE',
    date: '2023-06-01',
    security_id: 'equity_compensation_issuance_01',
    resulting_security_ids: ['share_issuance_03'],
    quantity: '750',
  },
  {
    id: 'EXERCISE_04',
    object_type: 'TX_EQUITY_COMPENSATION_EXERCISE',
    date: '2023-06-15',
    security_id: 'equity_compensation_issuance_01',
    resulting_security_ids: ['share_issuance_04'],
    quantity: '350',
  },
];
