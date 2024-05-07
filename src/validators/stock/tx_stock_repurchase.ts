import {transactions} from '../../test_data/data';

const valid_tx_stock_repurchase = (context: any, event: any) => {
  let valid = false;
  // TBC: validation of tx_stock_repurchase

  // Check that stock issuance in incoming security_id referenced by transaction exists in current state.
  let incoming_stockIssuance_validity = false;
  context.stockIssuances.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      incoming_stockIssuance_validity = true;
      console.log(
        `\x1b[92m\u2714 The incoming security (${event.data.security_id}) for this repurchase exists.\x1b[0m`
      );
    }
  });
  if (!incoming_stockIssuance_validity) {
    console.log(
      `\x1b[91m\u2718 The incoming security (${event.data.security_id}) for this repurchase does not exist in the current cap table.\x1b[0m`
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
          `\x1b[92m\u2714 The date of this repurchase is on or after the date of the incoming security (${event.data.security_id}).\x1b[0m`
        );
      }
    }
  });
  if (!incoming_date_validity) {
    console.log(
      `\x1b[91m\u2718 The date of this repurchase is not on or after the date of the incoming security (${event.data.security_id}).\x1b[0m`
    );
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
          `\x1b[92m\u2714 The balance security (${event.data.balance_security_id}) for this repurchase exists.\x1b[0m`
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
            `\x1b[92m\u2714 The date of this repurchase is the same as the date of the balance security (${event.data.balance_security_id}).\x1b[0m`
          );
        }
      }
    });
  }
  if (!balance_stockIssuance_validity) {
    console.log(
      `\x1b[91m\u2718 The balance security (${event.data.balance_security_id}) for this repurchase does not exist in the current cap table.\x1b[0m`
    );
  }
  if (balance_stockIssuance_validity && !balance_security_outgoing_date_validity) {
    console.log(
      `\x1b[91m\u2718 The date of this repurchase is not the same as the date of the incoming security (${event.data.balance_security_id}).\x1b[0m`
    );
  }
  
  // Check that the sum of the quantities of the repurchase (and the balance issuance if it exists) equal to the quantity of the incoming security.
  let repurchase_and_balance_sum_validity = false;
  let repurchase_and_balance_quantity = parseFloat(event.data.quantity);
  if (event.data.balance_security_id) {
    context.stockIssuances.forEach((ele: any) => {
      if (
        ele.security_id === event.data.balance_security_id &&
        ele.object_type === 'TX_STOCK_ISSUANCE'
      ) {
        repurchase_and_balance_quantity += parseFloat(ele.quantity);
      }
    });
  }
  context.stockIssuances.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      if (repurchase_and_balance_quantity === parseFloat(ele.quantity)) {
        repurchase_and_balance_sum_validity = true;
        console.log(
          '\x1b[92m\u2714 The sum of the quantities of the repurchase (and balance issuance if applicable) is equal to the quantity of incoming issuance.\x1b[0m'
        );
      }
    }
  });

  if (!repurchase_and_balance_sum_validity) {
    console.log(
      '\x1b[91m\u2718 The sum of the quantities of the repurchase (and balance issuance if applicable) is not equal to the quantity of incoming issuance.\x1b[0m'
    );
  }

  if (
    incoming_stockIssuance_validity && 
    incoming_date_validity && 
    balance_stockIssuance_validity && 
    balance_security_outgoing_date_validity &&
    repurchase_and_balance_sum_validity) {
    valid = true;
  }

  if (valid) {
    return true;
  } else {
    return false;
  }
};

export default valid_tx_stock_repurchase;
