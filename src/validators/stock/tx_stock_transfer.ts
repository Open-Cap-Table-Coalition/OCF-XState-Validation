const valid_tx_stock_transfer = (context: any, event: any) => {
  let valid = false;

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

export default valid_tx_stock_transfer;
