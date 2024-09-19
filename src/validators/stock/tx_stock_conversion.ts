import {OcfMachineContext} from '../../ocfMachine';

/*
CURRENT CHECKS:
1. Check that stock issuance in incoming security_id referenced by transaction exists in current state.
2. The date of the stock issuance referred to in the security_id must have a date equal to or earlier than the date of the stock conversion
MISSING CHECKS:
3. Any stock issuances with corresponding security IDs referred to in the resulting_security_ids array must exist
4. If applicable, a stock issuance with a corresponding security ID must exist for the balance_security_id variable
5. The stock_class_id of the stock issance in the balance_security_id must be the same as the stock_class_id of the stock issuance reffered to in the security_id variable
6. The quantity of the stock issuance referred to in the balance_security_id variable must be equal to the quantity of the stock issuance referred to in the security_id variable minus the quantity_converted variable
7. Check to ensure that the date of conversion is the same day as the date of the balance stock issuance.
8. The security_id of the stock issuance referred to in the security_id variable must not be the security_id related to any other transactions with the exception of a stock acceptance transaction.
9. The dates of any stock issuances referred to in the resulting_security_ids or balance_security_id variables must have a date equal to the date of the stock conversion
10. The quantity_converted variable must be greater than zero and the quantity of the stock_issuance referred to in security_id variable
11. The stock class id of the stock issuances in the resulting_security_id variable must be different from the stock_class_id of the stock issuance referred to in the security_id variable
12. The stakeholder_id of the stock issuance referred to in the security_id variable must equal the stakeholder_id of any stock issuances referred to in the resulting_security_ids variable
13. The stakeholder_id of the stock issuance referred to in the security_id variable must equal the stakeholder_id of the balance_security_id variable
Not implemented:
The quantity_converted variable must equal the sum of any stock issuances referred to in the resulting_security_ids variable
*/

const valid_tx_stock_conversion = (context: OcfMachineContext, event: any) => {
  let valid = false;
  const {transactions} = context.ocfPackageContent;

  // 1. Check that stock issuance in incoming security_id referenced by transaction exists in current state.
  let incoming_stockIssuance_validity = false;
  let incoming_stockClass = '';
  let incoming_quantity=0;
  let incoming_stakeholder='';
  context.stockIssuances.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      incoming_stockIssuance_validity = true;
      incoming_stockClass = ele.stock_class_id;
      incoming_quantity = ele.quantity;
      incoming_stakeholder=ele.stakeholder_id;
      console.log(
        `\x1b[92m\u2714 The incoming security (${event.data.security_id}) for this conversion exists.\x1b[0m`
      );
    }
  });
  if (!incoming_stockIssuance_validity) {
    console.log(
      `\x1b[91m\u2718 The incoming security (${event.data.security_id}) for this conversion does not exist in the current cap table.\x1b[0m`
    );
  }

  // 2. The date of the stock issuance referred to in the security_id must have a date equal to or earlier than the date of the stock conversion
  let incoming_date_validity = false;
  transactions.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      if (ele.date <= event.data.date) {
        incoming_date_validity = true;
        console.log(
          `\x1b[92m\u2714 The date of this conversion is on or after the date of the incoming security (${event.data.security_id}).\x1b[0m`
        );
      }
    }
  });
  if (!incoming_date_validity) {
    console.log(
      `\x1b[91m\u2718 The date of this conversion is not on or after the date of the incoming security (${event.data.security_id}).\x1b[0m`
    );
  }

  // 3. Any stock issuances with corresponding security IDs referred to in the resulting_security_ids array must exist
  let resulting_stockIssuances_validity = false;
  for (let i = 0; i < event.data.resulting_security_ids.length; i++) {
    const res = event.data.resulting_security_ids[i];
    resulting_stockIssuances_validity = false;
    transactions.map((ele: any) => {
      if (ele.security_id === res && ele.object_type === 'TX_STOCK_ISSUANCE') {
        resulting_stockIssuances_validity = true;
        console.log(
          `\x1b[92m\u2714 The resulting security (${res}) for this conversion exists.\x1b[0m`
        );
      }
    });
    if (!resulting_stockIssuances_validity) {
      console.log(
        `\x1b[91m\u2718 The resulting security (${res}) for this conversion does not exist in the current cap table.\x1b[0m`
      );
      break;
    }
  }

  let balance_stockIssuance_validity = true;
  let balance_security_outgoing_date_validity = true;
  let balance_stockClass_validity = true;
  let balance_quantity_validity = true;
  let balance_security_outgoing_validity = true;
  if (event.data.balance_security_id) {
    balance_stockIssuance_validity = false;
    context.stockIssuances.forEach((ele: any) => {
      // 4. If applicable, a stock issuance with a corresponding security ID must exist for the balance_security_id variable"
      if (
        ele.security_id === event.data.balance_security_id &&
        ele.object_type === 'TX_STOCK_ISSUANCE'
      ) {
        balance_stockIssuance_validity = true;
        balance_security_outgoing_date_validity = false;
        balance_stockClass_validity = false;
        balance_quantity_validity = false;
        balance_security_outgoing_validity = false;
        console.log(
          `\x1b[92m\u2714 The balance security (${event.data.balance_security_id}) for this conversion exists.\x1b[0m`
        );
        // 5. The stock_class_id of the stock issance in the balance_security_id must be the same as the stock_class_id of the stock issuance reffered to in the security_id variable
        if (ele.stock_class_id === incoming_stockClass) {
          balance_stockClass_validity = true;
          console.log(
            `\x1b[92m\u2714 The stock class of this conversion is the same as the stock class of the balance security (${event.data.balance_security_id}).\x1b[0m`
          );
        }
        // 6. The quantity of the stock issuance referred to in the balance_security_id variable must be equal to the quantity of the stock issuance referred to in the security_id variable minus the quantity_converted variable
        if (ele.quantity == (incoming_quantity-event.data.quantity_converted)) {
          balance_quantity_validity = true;
          console.log(
            `\x1b[92m\u2714 The quantity of the stock issuance referred to in the balance_security_id (${event.data.balance_security_id}) is equal to the quantity of the stock being converted minus the quantity converted.\x1b[0m`
          );
        }
        // 7. Check to ensure that the date of conversion is the same day as the date of the balance stock issuance.
        if (ele.date === event.data.date) {
          balance_security_outgoing_date_validity = true;
          console.log(
            `\x1b[92m\u2714 The date of this conversion is the same as the date of the balance security (${event.data.balance_security_id}).\x1b[0m`
          );
        }
        //13. The stakeholder_id of the stock issuance referred to in the security_id variable must equal the stakeholder_id of the balance_security_id variable
        if (ele.stakeholder_id === incoming_stakeholder) {
          balance_security_outgoing_validity = true;
          console.log(
            `\x1b[92m\u2714 The stakeholder of this converted stock is the same as the stakeholder of the balance security (${event.data.balance_security_id}).\x1b[0m`
          );
        }
      }
    });
  }
  if (!balance_stockIssuance_validity) {
    console.log(
      `\x1b[91m\u2718 The balance security (${event.data.balance_security_id}) for this conversion does not exist in the current cap table.\x1b[0m`
    );
  }
  if (!balance_stockClass_validity) {
    console.log(
      `\x1b[91m\u2718 The stock class of this conversion is not the same as the stock class of the balance security (${event.data.balance_security_id}).\x1b[0m`
    );
  }
  if (!balance_quantity_validity) {
    console.log(
      `\x1b[91m\u2718 The quantity of the stock issuance referred to in the balance_security_id (${event.data.balance_security_id}) is not equal to the quantity of the stock being converted minus the quantity converted.\x1b[0m`
    );
  }
  if (!balance_security_outgoing_date_validity) {
    console.log(
      `\x1b[91m\u2718 The date of this conversion is not the same as the date of the balance security (${event.data.balance_security_id}).\x1b[0m`
    );
  }
  if (!balance_security_outgoing_validity) {
    console.log(
      `\x1b[91m\u2718 The stakeholder of this converted stock is not the same as the stakeholder of the balance security (${event.data.balance_security_id}).\x1b[0m`
    );
  }
 
  // 8. The security_id of the stock issuance referred to in the security_id variable must not be the security_id related to any other transactions with the exception of a stock acceptance transaction.
  let only_transaction_validity = true;
  transactions.map((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type !== 'TX_STOCK_ISSUANCE' &&
      ele.object_type !== 'TX_STOCK_ACCEPTANCE' &&
      !(ele.object_type === 'TX_STOCK_CONVERSION' && ele.id === event.data.id)
    ) {
      only_transaction_validity = false;
      console.log(
        `\x1b[91m\u2718 The incoming security (${event.data.security_id}) for this conversion is related to another transaction (${ele.object_type}) with id (${ele.id}).\x1b[0m`
      );
    }
  });
  if (only_transaction_validity) {
    console.log(
      `\x1b[92m\u2714 The incoming security (${event.data.security_id}) for this conversion is not related to any other conflicting transaction.\x1b[0m`
    );
  }

  // 9. The dates of any stock issuances referred to in the resulting_security_ids must have a date equal to the date of the stock conversion
  let resulting_dates_validity = false;
  for (let i = 0; i < event.data.resulting_security_ids.length; i++) {
    const res = event.data.resulting_security_ids[i];
    resulting_dates_validity = false;
    transactions.map((ele: any) => {
      if (ele.security_id === res && ele.object_type === 'TX_STOCK_ISSUANCE' && ele.date === event.data.date) {
        resulting_dates_validity = true;
        console.log(
          `\x1b[92m\u2714 The date of this conversion is the same as the date of the resulting security (${res}).\x1b[0m`
        );
      }
    });
    if (!resulting_dates_validity) {
      console.log(
        `\x1b[91m\u2718 The date of this conversion is not the same as the date of the resulting security (${res}).\x1b[0m`
      );
      break;
    }
  }

  // 10. The quantity_converted variable must be greater than zero and the quantity of the stock_issuance referred to in security_id variable
  let conversion_quantity_validity=false
  if (incoming_quantity >= parseFloat(event.data.quantity_converted) && parseFloat(event.data.quantity_converted)>0) {
    conversion_quantity_validity = true;
    console.log(
      `\x1b[92m\u2714 The quantity converted (${event.data.quantity_converted}) of this transaction is greater than 0 and less than or equal to the quantity of the incoming security (${event.data.security_id}).\x1b[0m`
    );
  }
  if (!conversion_quantity_validity) {
    console.log(
      `\x1b[91m\u2718 The quantity converted (${event.data.quantity_converted}) of this transaction is not greater than 0 and less than or equal to the quantity of the incoming security (${event.data.security_id}).\x1b[0m`
    );
  }

  // 11. The stock class id of the stock issuances in the resulting_security_id variable must be different from the stock_class_id of the stock issuance referred to in the security_id variable
  let resulting_stock_class_validity = false;
  for (let i = 0; i < event.data.resulting_security_ids.length; i++) {
    const res = event.data.resulting_security_ids[i];
    resulting_stock_class_validity = false;
    transactions.map((ele: any) => {
      if (ele.security_id === res && ele.object_type === 'TX_STOCK_ISSUANCE' && ele.stock_class_id !== incoming_stockClass) {
        resulting_stock_class_validity = true;
        console.log(
          `\x1b[92m\u2714 The stock class of the resulting security (${res}) is different than stock class of the stock issuance being converted.\x1b[0m`
        );
      }
    });
    if (!resulting_stock_class_validity) {
      console.log(
        `\x1b[91m\u2718 The stock class of the resulting security (${res}) is not different than stock class of the stock issuance being converted.\x1b[0m`
      );
      break;
    }
  }

  // 12. The stakeholder_id of the stock issuance referred to in the security_id variable must equal the stakeholder_id of any stock issuances referred to in the resulting_security_ids variable
  let resulting_stakeholder_validity = false;
  for (let i = 0; i < event.data.resulting_security_ids.length; i++) {
    const res = event.data.resulting_security_ids[i];
    resulting_stakeholder_validity = false;
    transactions.map((ele: any) => {
      if (ele.security_id === res && ele.object_type === 'TX_STOCK_ISSUANCE') {
        if (ele.stakeholder_id == incoming_stakeholder) {
          resulting_stakeholder_validity = true;
          console.log(
            `\x1b[92m\u2714 The stakeholder of this converted stock is the same as the stakeholder of the resulting security (${res}).\x1b[0m`
          );
        }
      }
    });
    if (!resulting_stakeholder_validity) {
      console.log(
        `\x1b[91m\u2718 The stakeholder of this converted stock is not the same as the stakeholder of the resulting security (${res}).\x1b[0m`
      );
      break;
    }
  }

  if (incoming_stockIssuance_validity && 
    incoming_date_validity &&
    resulting_stockIssuances_validity &&
    balance_stockIssuance_validity &&
    balance_stockClass_validity &&
    balance_quantity_validity &&
    balance_security_outgoing_date_validity &&
    only_transaction_validity &&
    resulting_dates_validity &&
    conversion_quantity_validity &&
    resulting_stock_class_validity &&
    resulting_stakeholder_validity &&
    balance_security_outgoing_validity) {
    valid = true;
  }

  if (valid) {
    return true;
  } else {
    return false;
  }
};

export default valid_tx_stock_conversion;
