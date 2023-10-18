import {transactions} from '../../test_data/data';
// Reference for tx_stock_transfer transaction: https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/transactions/transfer/StockTransfer/

/*
  LOGIC CHECKS:
    1. Does the incoming security_id referenced by transaction exist in current cap table state?
    2. Is the date of transaction the same day or after the date of the incoming issuance?
    3. Is the quantity of transfer equal to or less than the quantity of the incoming issuance?
    4. Do all of resulting security_ids referenced by transaction exist in current cap table state?
    5. Is the date of transaction the same as all of the resulting issuances?
    6. If there is a balance issuance, does the balance security_id referenced by transaction exist in current cap table state?
    7. If there is a balance issuance, is the date of transaction the same day as the date of the balance issuance?
    8. Does the sum of the quantities of the resulting issuances equal to the quantity of the transfer?
    9. Does the sum of the quantities of the resulting issuances (and the balance issuance if it exists) equal the quantity of the incoming issuance?
*/

const valid_tx_stock_transfer = (context: any, event: any) => {
  let valid = false;

  // Check that stock issuance in incoming security_id referenced by transaction exists in current state.
  let incoming_stockIssuance_validity = false;
  context.stockIssuances.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      incoming_stockIssuance_validity = true;
      console.log(
        `\x1b[92m\u2714 The incoming security (${event.data.security_id}) for this transfer exists.\x1b[0m`
      );
    }
  });

  if (!incoming_stockIssuance_validity) {
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
      if (ele.date <= event.data.date) {
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

  // Check that the quantity of the transfer is less or equal to the quantity of the incoming issuance.
  let incoming_quantity_validity = false;
  transactions.items.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      if (parseFloat(ele.quantity) >= parseFloat(event.data.quantity)) {
        incoming_quantity_validity = true;
        console.log(
          `\x1b[92m\u2714 The quantity of this transfer is equal to or less than the quantity of the incoming security (${event.data.security_id}).\x1b[0m`
        );
      }
    }
  });
  if (!incoming_quantity_validity) {
    console.log(
      `\x1b[91m\u2718 The quantity of this transfer is greater than the quantity of the incoming security (${event.data.security_id}).\x1b[0m`
    );
  }

  // Check that the resulting stock issuances exist.
  let resulting_stockIssuances_validity = false;
  for (let i = 0; i < event.data.resulting_security_ids.length; i++) {
    const res = event.data.resulting_security_ids[i];
    resulting_stockIssuances_validity = false;
    transactions.items.forEach((ele: any) => {
      if (ele.security_id === res && ele.object_type === 'TX_STOCK_ISSUANCE') {
        resulting_stockIssuances_validity = true;
        console.log(
          `\x1b[92m\u2714 The resulting security (${res}) for this transfer exists.\x1b[0m`
        );
      }
    });
    if (!resulting_stockIssuances_validity) {
      console.log(
        `\x1b[91m\u2718 The resulting security (${res}) for this transfer does not exist in the current cap table.\x1b[0m`
      );
      break;
    }
  }

  // Check the dates of the resulting stock issuances.
  let resulting_dates_validity = false;
  for (let i = 0; i < event.data.resulting_security_ids.length; i++) {
    const res = event.data.resulting_security_ids[i];
    resulting_dates_validity = false;
    transactions.items.forEach((ele: any) => {
      if (ele.security_id === res && ele.object_type === 'TX_STOCK_ISSUANCE') {
        if (ele.date === event.data.date) {
          resulting_dates_validity = true;
          console.log(
            `\x1b[92m\u2714 The date of this transfer is the same as the date of the resulting security (${res}).\x1b[0m`
          );
        }
      }
    });
    if (!resulting_dates_validity) {
      console.log(
        `\x1b[91m\u2718 The date of this transfer is not the same as the date of the resulting security (${res}).\x1b[0m`
      );
      break;
    }
  }

  let balance_stockIssuance_validity = true;
  let balance_security_outgoing_date_validity = true;

  if (event.data.balance_security_id) {
    // Check that stock issuance for the balance security_id referenced by transaction exists in current state.
    balance_stockIssuance_validity = false;
    context.stockIssuances.forEach((ele: any) => {
      if (
        ele.security_id === event.data.balance_security_id &&
        ele.object_type === 'TX_STOCK_ISSUANCE'
      ) {
        balance_stockIssuance_validity = true;
        console.log(
          `\x1b[92m\u2714 The balance security (${event.data.balance_security_id}) for this transfer exists.\x1b[0m`
        );
      }
    });

    // Check to ensure that the date of transaction is the same day as the date of the balance stock issuance.
    balance_security_outgoing_date_validity = false;
    transactions.items.forEach((ele: any) => {
      if (
        ele.security_id === event.data.balance_security_id &&
        ele.object_type === 'TX_STOCK_ISSUANCE'
      ) {
        if (ele.date === event.data.date) {
          balance_security_outgoing_date_validity = true;
          console.log(
            `\x1b[92m\u2714 The date of this transfer is the same as the date of the balance security (${event.data.balance_security_id}).\x1b[0m`
          );
        }
      }
    });
  }

  if (!balance_stockIssuance_validity) {
    console.log(
      `\x1b[91m\u2718 The balance security (${event.data.balance_security_id}) for this transfer does not exist in the current cap table.\x1b[0m`
    );
  }

  if (!balance_security_outgoing_date_validity) {
    console.log(
      `\x1b[91m\u2718 The date of this transfer is not the same as the date of the incoming security (${event.data.balance_security_id}).\x1b[0m`
    );
  }

  // Check that the sum of the quantities of the resulting issuance (and the balance issuance if it exists) equal to the quantity of the transfer.
  let outgoing_resulting_sum = 0;
  for (let i = 0; i < event.data.resulting_security_ids.length; i++) {
    const res = event.data.resulting_security_ids[i];
    context.stockIssuances.forEach((ele: any) => {
      if (ele.security_id === res && ele.object_type === 'TX_STOCK_ISSUANCE') {
        outgoing_resulting_sum += parseFloat(ele.quantity);
      }
    });
  }

  let outgoing_resulting_sum_validity = false;
  if (outgoing_resulting_sum === parseFloat(event.data.quantity)) {
    outgoing_resulting_sum_validity = true;
    console.log(
      '\x1b[92m\u2714 The sum of the quantities of the resulting issuances is equal to the quantity of transfer.\x1b[0m'
    );
  }

  if (!outgoing_resulting_sum_validity) {
    console.log(
      '\x1b[91m\u2718 The sum of the quantities of the resulting issuances is not equal to the quantity of transfer.\x1b[0m'
    );
  }

  // Check that the sum of the quantities of the resulting issuance (and the balance issuance if it exists) is equal to the quantity of the incoming issuance.
  let outgoing_total_sum = outgoing_resulting_sum;

  if (event.data.balance_security_id) {
    context.stockIssuances.forEach((ele: any) => {
      if (
        ele.security_id === event.data.balance_security_id &&
        ele.object_type === 'TX_STOCK_ISSUANCE'
      ) {
        outgoing_total_sum += parseFloat(ele.quantity);
      }
    });
  }

  let outgoing_total_sum_validity = false;
  context.stockIssuances.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      if (outgoing_total_sum === parseFloat(ele.quantity)) {
        outgoing_total_sum_validity = true;
        console.log(
          '\x1b[92m\u2714 The sum of the quantities of the resulting issuances (and balance issuance if applicable) is equal to the quantity of incoming issuance.\x1b[0m'
        );
      }
    }
  });

  if (!outgoing_total_sum_validity) {
    console.log(
      '\x1b[91m\u2718 The sum of the quantities of the resulting issuances (and balance issuance if applicable) is not equal to the quantity of incoming issuance.\x1b[0m'
    );
  }

  if (
    incoming_stockIssuance_validity &&
    incoming_date_validity &&
    incoming_quantity_validity &&
    resulting_stockIssuances_validity &&
    resulting_dates_validity &&
    balance_stockIssuance_validity &&
    balance_security_outgoing_date_validity &&
    outgoing_resulting_sum_validity &&
    outgoing_total_sum_validity
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
