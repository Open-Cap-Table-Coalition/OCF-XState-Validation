const valid_tx_equity_compensation_issuance = (context: any, event: any) => {
  const {stakeholders, transactions, stockClasses, stockPlans, vestingTerms} =
    context.ocfPackageContent;
  console.log(event);

  let vestingTermsData: any;
  vestingTerms.forEach((ele: any) => {
    if (ele.id === event.data.vesting_terms_id) {
      console.log(ele);
      vestingTermsData = ele;
    }
  });

  let nextVestingCondition: any;
  transactions.forEach((ele: any) => {
    if (
      ele.object_type === 'TX_VESTING_START' &&
      ele.security_id === event.data.security_id
    ) {
      console.log(ele);
      vestingTermsData.vesting_conditions.forEach((vestingCondition: any) => {
        if (vestingCondition.id === ele.vesting_condition_id) {
          console.log(vestingCondition);
          nextVestingCondition = vestingCondition.next_condition_id[0];
          if (vestingCondition.portion.numerator) {
            console.log(
              `${ele.date} : ${
                (parseFloat(event.data.quantity) *
                  parseFloat(vestingCondition.portion.numerator)) /
                parseFloat(vestingCondition.portion.denominator)
              }`
            );
          }
        }
      });
    }
  }); 
  const valid = false;
  // TBC: validation of tx_equity_compensation_issuance

  if (valid) {
    return true;
  } else {
    return false;
  }
};

export default valid_tx_equity_compensation_issuance;
