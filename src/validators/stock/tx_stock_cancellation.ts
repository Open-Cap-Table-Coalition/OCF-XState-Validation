// Reference for tx_stock_cancellation: https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/transactions/cancellation/PlanSecurityCancellation/

const valid_tx_stock_cancellation = (context: any, event: any) => {
  let valid = false;

  // Check that stock issuance in incoming security_id reference by transaction exists in current state.
  let stockIssuance_validity = false;
  context.stockIssuances.forEach((ele: any) => {
    if (ele.security_id === event.data.security_id) {
      stockIssuance_validity = true;
      console.log(
        `\x1b[92m\u2714 The incoming security (${event.data.security_id}) for this cancellation exists.\x1b[0m`
      );
    }
  });

  if (!stockIssuance_validity) {
    console.log(
      `\x1b[91m\u2718 The incoming security (${event.data.security_id}) for this cancellation does not exist in the current cap table.\x1b[0m`
    );
  }

  if (stockIssuance_validity) {
    valid = true;
  }

  if (valid) {
    return true;
  } else {
    return false;
  }
};

export default valid_tx_stock_cancellation;
