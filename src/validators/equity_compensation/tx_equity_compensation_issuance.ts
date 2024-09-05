import generate_vesting_schedule from '../../helpers/vesting_schedule_generator';

const valid_tx_equity_compensation_issuance = (context: any, event: any) => {
  const {stakeholders, transactions, stockClasses, stockPlans, vestingTerms} =
    context.ocfPackageContent;

  const vesting_schedule_table = generate_vesting_schedule(
    vestingTerms,
    transactions,
    event
  );

  console.table(vesting_schedule_table);

  const valid = true;
  // TBC: validation of tx_equity_compensation_issuance

  if (valid) {
    return true;
  } else {
    return false;
  }
};

export default valid_tx_equity_compensation_issuance;
