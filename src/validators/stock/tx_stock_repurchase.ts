// Reference for tx_stock_cancellation: https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/transactions/cancellation/StockCancellation/
/*
  LOGIC CHECKS:
    1. Check that stock issuance in incoming security_id reference by transaction exists in current state.
    2. Check to ensure that the date of transaction is the same day or after the date of the incoming stock issuance.
    3. Check that stock issuance for the balance security_id referenced by transaction exists in current state.
    4. Check to ensure that the date of transaction is the same day as the date of the balance stock issuance.
    5. Check that the stock class of the balance security_id is the sames as the stock class of the incoming security
    6. Check that the quantity of the balance security_id if it exists is greater than 0
    7. Check that the sum of the quantities of the repurchase (and the balance issuance if it exists) is equal to the quantity of the incoming security.
    8. Check repurchase amount is greater than 0 and less than or equal to the incoming security quantity.
    9. Check that the security_id of the stock issuance referred to in the security_id variable must not be the security_id related to any other transactions with the exception of a stock acceptance transaction.
*/
import {OcfMachineContext} from '../../ocfMachine';

/*
CURRENT CHECKS:
A stock issuance with a corresponding security ID must exist for the security_id variable
The date of the stock issuance referred to in the security_id must have a date equal to or earlier than the date of the stock repurchase
If applicable, a stock issuance with a corresponding security ID must exist for the balance_security_id variable
The dates of a stock issuance referred to in the balance_security_id variables must have a date equal to the date of the stock repurchase
The quantity variable must be greater than zero and the quantity of the stock_issuance referred to in security_id variable
The quantity of the stock issuance referred to in the balance_security_id variable must be equal to the quantity of the stock issuance referred to in the security_id variable minus the quantity variable
MISSING CHECKS:
The security_id of the stock issuance referred to in the security_id variable must not be the security_id related to any other transactions with the exception of a stock acceptance transaction.
The stock_class_id of the stock issuance in the balance_security_id variable must be the same as the stock_class_id of the stock issuance reffered to in the security_id variable
*/

const valid_tx_stock_repurchase = (context: OcfMachineContext, event: any) => {
  let valid = false;
  // TBC: validation of tx_stock_repurchase
  const {transactions} = context.ocfPackageContent;
  let incoming_stockClass='';
  // 1. Check that stock issuance in incoming security_id referenced by transaction exists in current state.
  let incoming_stockIssuance_validity = false;
  context.stockIssuances.forEach((ele: any) => {
    if (ele.security_id === event.data.security_id) {
      incoming_stockIssuance_validity = true;
      incoming_stockClass=ele.stock_class_id;
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

  // 2. Check to ensure that the date of transaction is the same day or after the date of the incoming stock issuance.
  let incoming_date_validity = false;
  context.stockIssuances.forEach((ele: any) => {
    if (ele.security_id === event.data.security_id) {
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
  let balance_stockClass_validity = true;
  let balance_quantity_validity=true

  if (event.data.balance_security_id) {
    // 3. Check that stock issuance for the balance security_id referenced by transaction exists in current state.
    balance_stockIssuance_validity = false;
    context.stockIssuances.forEach((ele: any) => {
      if (
        ele.security_id === event.data.balance_security_id &&
        ele.object_type === 'TX_STOCK_ISSUANCE'
      ) {
        balance_stockIssuance_validity = true;
        balance_security_outgoing_date_validity = false;
        balance_stockClass_validity = false;
        balance_quantity_validity=false;
        console.log(
          `\x1b[92m\u2714 The balance security (${event.data.balance_security_id}) for this repurchase exists.\x1b[0m`
        );
        // 4. Check to ensure that the date of transaction is the same day as the date of the balance stock issuance.
        if (ele.date === event.data.date) {
          balance_security_outgoing_date_validity = true;
          console.log(
            `\x1b[92m\u2714 The date of this repurchase is the same as the date of the balance security (${event.data.balance_security_id}).\x1b[0m`
          );
        }
        // 5. Check that the stock class of the balance security_id is the sames as the stock class of the incoming security
        if (ele.stock_class_id === incoming_stockClass) {
          balance_stockClass_validity = true;
          console.log(
            `\x1b[92m\u2714 The stock class of this repurchase is the same as the stock class of the balance security (${event.data.balance_security_id}).\x1b[0m`
          );
        }
        // 6. Check that the quantity of the balance security_id if it exists is greater than 0
        if (parseFloat(ele.quantity)>0) {
          balance_quantity_validity = true;
          console.log(
            `\x1b[92m\u2714 The quantity of the balance security (${event.data.balance_security_id}) is greater than 0.\x1b[0m`
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
  if (!balance_security_outgoing_date_validity) {
    console.log(
      `\x1b[91m\u2718 The date of this repurchase is not the same as the date of the incoming security (${event.data.balance_security_id}).\x1b[0m`
    );
  }
  if (!balance_stockClass_validity) {
    console.log(
      `\x1b[91m\u2718 The stock class of this repurchase is not the same as the stock class of the balance security (${event.data.balance_security_id}).\x1b[0m`
    );
  }
  if (!balance_quantity_validity) {
    console.log(
      `\x1b[91m\u2718 The quantity of the balance security (${event.data.balance_security_id}) is not greater than 0.\x1b[0m`
    );
  }

  //7. Check that the sum of the quantities of the repurchase (and the balance issuance if it exists) is equal to the quantity of the incoming security.
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

  // 8. Check repurchase amount is greater than 0 and less than or equal to the incoming security quantity
  let repurchase_quantity_validity=false
  transactions.map((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      if (parseFloat(ele.quantity) >= parseFloat(event.data.quantity) && parseFloat(event.data.quantity)>0) {
        repurchase_quantity_validity = true;
        console.log(
          `\x1b[92m\u2714 The quantity of this repurchase is greater than 0 and less than or equal to the quantity of the incoming security (${event.data.security_id}).\x1b[0m`
        );
      }
    }
  });
  if (!repurchase_quantity_validity) {
    console.log(
      `\x1b[91m\u2718 The quantity of this repurchase is not greater than 0 and less than or equal to the quantity of the incoming security (${event.data.security_id}).\x1b[0m`
    );
  }

  //9. Check that the security_id of the stock issuance referred to in the security_id variable must not be the security_id related to any other transactions with the exception of a stock acceptance transaction.
  let only_transaction_validity=true;
  transactions.map((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type !== 'TX_STOCK_ISSUANCE' && 
      ele.object_type !== 'TX_STOCK_ACCEPTANCE' && 
      !(ele.object_type === 'TX_STOCK_REPURCHASE' && ele.id===event.data.id))
    {
      only_transaction_validity = false;
      console.log(
        `\x1b[91m\u2718 The incoming security (${event.data.security_id}) for this repurchase is related to another transaction (${ele.object_type}) with id (${ele.id}).\x1b[0m`
      );
    }
  });
  if (only_transaction_validity) {
    console.log(
      `\x1b[92m\u2714 The incoming security (${event.data.security_id}) for this repurchase is not related to any other conflicting transaction.\x1b[0m`
    ); 
  }

  if (
    incoming_stockIssuance_validity &&
    incoming_date_validity &&
    balance_stockIssuance_validity &&
    balance_security_outgoing_date_validity &&
    repurchase_and_balance_sum_validity &&
    repurchase_quantity_validity &&
    balance_stockClass_validity &&
    balance_quantity_validity &&
    only_transaction_validity
  ) {
    valid = true;
  }

  if (valid) {
    return true;
  } else {
    return false;
  }
};

export default valid_tx_stock_repurchase;
