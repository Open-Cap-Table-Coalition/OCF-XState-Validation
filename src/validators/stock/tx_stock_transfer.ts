import {transactions} from '../../test_data/data';
// Reference for tx_stock_transfer transaction: https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/transactions/transfer/StockTransfer/

const valid_tx_stock_transfer = (context: any, event: any) => {
  let valid = false;

  // Check that stock issuance in incoming security_id reference by transaction exists in current state.
  let stockIssuance_validity = false;
  context.stockIssuances.forEach((ele: any) => {
    if (ele.security_id === event.data.security_id) {
      stockIssuance_validity = true;
      console.log(
        `\x1b[92m\u2714 The incoming security (${event.data.security_id}) for this transfer exists.\x1b[0m`
      );
    }
  });

  if (!stockIssuance_validity) {
    console.log(
      `\x1b[91m\u2718 The incoming security (${event.data.security_id}) for this transfer does not exist in the current cap table.\x1b[0m`
    );
  }
  // Check to ensure that the date of transaction is the same day or after the date of the incoming stock issuance.
  let incoming_date_validity = false;
  transactions.items.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      if (
        ele.date <= event.data.date &&
        ele.object_type === 'TX_STOCK_ISSUANCE'
      ) {
        incoming_date_validity = true;
        console.log(
          `\x1b[92m\u2714 The date of this transfer is on or after the date of the incoming security (${event.data.security_id}).\x1b[0m`
        );
      }
    }
  });
  if (!incoming_date_validity) {
    console.log(
      `\x1b[91m\u2718 The date of this transfer is not on or after the date of the incoming security (${event.data.security_id}).\x1b[0m`
    );
  }
  // Check to ensure that the date of transaction is the same day or after the date of the incoming stock issuance.
  let outgoing_date_validity = false;
  transactions.items.forEach((ele: any) => {
    if (ele.security_id === event.data.balance_security_id) {
      if (ele.date === event.data.date) {
        outgoing_date_validity = true;
        console.log(
          `\x1b[92m\u2714 The date of this transfer is the same as the date of the balance security (${event.data.balance_security_id}).\x1b[0m`
        );
      }
    }
  });
  if (!outgoing_date_validity) {
    console.log(
      `\x1b[91m\u2718 The date of this transfer is not the same as the date of the incoming security (${event.data.balance_security_id}).\x1b[0m`
    );
  }

  if (
    stockIssuance_validity &&
    incoming_date_validity &&
    outgoing_date_validity
  ) {
    valid = true;
  }

  if (valid) {
    return true;
  } else {
    return false;
  }
};

export default valid_tx_stock_transfer;
