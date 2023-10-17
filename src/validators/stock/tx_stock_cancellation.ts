// Reference for tx_stock_cancellation: https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/transactions/cancellation/PlanSecurityCancellation/

const valid_tx_stock_cancellation = (context: any, event: any) => {
  let valid = false;

  // Check that stock issuance in incoming security_id reference by transaction exists in current state.
  context.stockIssuances.forEach((ele: any) => {
    if (ele.security_id === event.data.security_id) {
      valid = true;
    }
  });

  if (valid) {
    return true;
  } else {
    return false;
  }
};

export default valid_tx_stock_cancellation;
