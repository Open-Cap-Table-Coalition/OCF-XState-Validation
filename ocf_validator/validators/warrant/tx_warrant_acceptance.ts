const valid_tx_warrant_acceptance = (context: any, event: any, isGuard: Boolean) => {
  const {transactions} = context.ocfPackageContent;

  let validity = false;
  let report: any = {transaction_type: "TX_WARRANT_ACCEPTANCE", transaction_id: event.data.id, transaction_date: event.data.date};

  // Check that warrant issuance in incoming security_id referenced by transaction exists in current state.
  let incoming_warrantIssuance_validity = false;
  context.warrantIssuances.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_WARRANT_ISSUANCE'
    ) {
      incoming_warrantIssuance_validity = true;
      report.incoming_warrantIssuance_validity = true;
    }
  });
  if (!incoming_warrantIssuance_validity) {
    report.incoming_warrantIssuance_validity = false;
  }

  // Check to ensure that the date of transaction is the same day or after the date of the incoming warrant issuance.
  let incoming_date_validity = false;
  transactions.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_WARRANT_ISSUANCE'
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

  // Check that warrant issuance in incoming security_id does not have a warrant retraction transaction associated with it.
  let no_warrant_retraction_validity = false;
  let warrant_retraction_exists = false;
  transactions.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_WARRANT_RETRACTION'
    ) {
      warrant_retraction_exists = true;
    }
  });

  if (!warrant_retraction_exists) {
    no_warrant_retraction_validity = true;
    report.no_warrant_retraction_validity = true;
  }
  if (!no_warrant_retraction_validity) {
    report.no_warrant_retraction_validity = false;
  }

  if (
    incoming_warrantIssuance_validity &&
    incoming_date_validity &&
    no_warrant_retraction_validity
  ) {
    validity = true;
  }

  const result = isGuard ? validity : report;
  
  return result;
};

export default valid_tx_warrant_acceptance;
