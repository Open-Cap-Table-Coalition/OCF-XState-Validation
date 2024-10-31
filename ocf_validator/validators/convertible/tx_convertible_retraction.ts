const valid_tx_convertible_retraction = (context: any, event: any, isGuard: Boolean = false) => {
  let validity = false;

  let report: any = {transaction_type: "TX_CONVERTIBLE_RETRACTION", transaction_id: event.data.id, transaction_date: event.data.date};

  // TBC: validation of tx_convertible_retraction
  const {transactions} = context.ocfPackageContent;
  // Check that convertible issuance in incoming security_id referenced by transaction exists in current state.
  let incoming_convertibleIssuance_validity = false;
  context.convertibleIssuances.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_CONVERTIBLE_ISSUANCE'
    ) {
      incoming_convertibleIssuance_validity = true;
      report.incoming_convertibleIssuance_validity = true
    }
  });
  if (!incoming_convertibleIssuance_validity) {
    report.incoming_convertibleIssuance_validity = false

  }

  // Check to ensure that the date of transaction is the same day or after the date of the incoming convertible issuance.
  let incoming_date_validity = false;
  transactions.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_CONVERTIBLE_ISSUANCE'
    ) {
      if (ele.date <= event.data.date) {
        incoming_date_validity = true;
        report.incoming_date_validity = true;
      }
    }
  });
  if (!incoming_date_validity) {
    report.incoming_date_validity = false;

  }

  // Check that convertible issuance in incoming security_id does not have a convertible acceptance transaction associated with it.
  let no_convertible_acceptance_validity = false;
  let convertible_acceptance_exists = false;
  transactions.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_CONVERTIBLE_ACCEPTANCE'
    ) {
      convertible_acceptance_exists = true;
    }
  });

  if (!convertible_acceptance_exists) {
    no_convertible_acceptance_validity = true;
    report.no_convertible_acceptance_validity = true;
  }
  if (!no_convertible_acceptance_validity) {
    report.no_convertible_acceptance_validity = false;
  }

  if (
    incoming_convertibleIssuance_validity &&
    incoming_date_validity &&
    no_convertible_acceptance_validity
  ) {
    validity = true;
  }

  const result = isGuard ? validity : report;
  
  return result;
};

export default valid_tx_convertible_retraction;
