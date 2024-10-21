const valid_tx_warrant_issuance = (context: any, event: any, isGuard: any) => {
  let validity = false;
  const { stakeholders } = context.ocfPackageContent;
  let report: any = {transaction_type: "TX_WARRANT_ISSUANCE", transaction_id: event.data.id, transaction_date: event.data.date};
  
  // Check if the stakeholder referenced by the transaction exists in the stakeholder file.
  let stakeholder_validity = false;
  stakeholders.forEach((ele: any) => {
    if (ele.id === event.data.stakeholder_id) {
      stakeholder_validity = true;
      report.stakeholder_validity = true
    }
  });
  if (!stakeholder_validity) {
    report.stakeholder_validity = false
  }

  if (stakeholder_validity) {
    validity = true;
  }

  const result = isGuard ? validity : report;
  
  return result;
};

export default valid_tx_warrant_issuance;
