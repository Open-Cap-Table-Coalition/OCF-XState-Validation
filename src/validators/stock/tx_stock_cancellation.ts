// Reference for tx_stock_cancellation: https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/transactions/cancellation/StockCancellation/
/*
  LOGIC CHECKS:
    1. Check that stock issuance in incoming security_id reference by transaction exists in current state.
    2. Check to ensure that the date of transaction is the same day or after the date of the incoming stock issuance.
    3. Check that stock issuance for the balance security_id referenced by transaction exists in current state.
    4. Check to ensure that the date of transaction is the same day as the date of the balance stock issuance.
    5. Check that the stock class of the balance security_id is the sames as the stock class of the incoming security
    6. Check that the quantity of the balance security_id if it exists is greater than 0
    7. Check that the sum of the quantities of the cancellation (and the balance issuance if it exists) is equal to the quantity of the incoming security.
    8. Check cancellation amount is greater than 0 and less than or equal to the incoming security quantity

    9. The security_id of the stock issuance referred to in the security_id variable must not be the security_id related to any other transactions with the exception of a stock acceptance transaction.
*/
import {OcfMachineContext} from '../../ocfMachine';

const valid_tx_stock_cancellation = (
  context: OcfMachineContext,
  event: any
) => {
  let valid = false;
  const {transactions} = context.ocfPackageContent;
  let incoming_stockClass='';
  // 1. Check that stock issuance in incoming security_id reference by transaction exists in current state.
  let incoming_stockIssuance_validity = false;
  context.stockIssuances.forEach((ele: any) => {
    if (ele.security_id === event.data.security_id) {
      incoming_stockClass=ele.stock_class_id;
      incoming_stockIssuance_validity = true;
      console.log(
        `\x1b[92m\u2714 The incoming security (${event.data.security_id}) for this cancellation exists.\x1b[0m`
      );
    }
  });

  if (!incoming_stockIssuance_validity) {
    console.log(
      `\x1b[91m\u2718 The incoming security (${event.data.security_id}) for this cancellation does not exist in the current cap table.\x1b[0m`
    );
  }

  // 2. Check to ensure that the date of transaction is the same day or after the date of the incoming stock issuance.
  let incoming_date_validity = false;
  transactions.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      if (ele.date <= event.data.date) {
        incoming_date_validity = true;
        console.log(
          `\x1b[92m\u2714 The date of this cancellation is on or after the date of the incoming security (${event.data.security_id}).\x1b[0m`
        );
      }
    }
  });
  if (!incoming_date_validity) {
    console.log(
      `\x1b[91m\u2718 The date of this cancellation is not on or after the date of the incoming security (${event.data.security_id}).\x1b[0m`
    );
  }
  let balance_stockIssuance_validity = true;
  let balance_security_outgoing_date_validity = true;
  let balance_stockClass_validity = true;
  let balance_quantity_validity=true

  if (event.data.balance_security_id) {
    balance_stockIssuance_validity = false;
    context.stockIssuances.forEach((ele: any) => {
      // 3. Check that stock issuance for the balance security_id referenced by transaction exists in current state.
      if (
        ele.security_id === event.data.balance_security_id &&
        ele.object_type === 'TX_STOCK_ISSUANCE'
      ) {
        balance_stockIssuance_validity = true;
        balance_security_outgoing_date_validity = false;
        balance_stockClass_validity = false;
        balance_quantity_validity=false;
        console.log(
          `\x1b[92m\u2714 The balance security (${event.data.balance_security_id}) for this cancellation exists.\x1b[0m`
        );
        // 4. Check to ensure that the date of transaction is the same day as the date of the balance stock issuance.
        if (ele.date === event.data.date) {
          balance_security_outgoing_date_validity = true;
          console.log(
            `\x1b[92m\u2714 The date of this cancellation is the same as the date of the balance security (${event.data.balance_security_id}).\x1b[0m`
          );
        }
        //5. Check that the stock class of the balance security_id is the sames as the stock class of the incoming security
        if (ele.stock_class_id === incoming_stockClass) {
          balance_stockClass_validity = true;
          console.log(
            `\x1b[92m\u2714 The stock class of this cancellation is the same as the stock class of the balance security (${event.data.balance_security_id}).\x1b[0m`
          );
        }
        //6. Check that the quantity of the balance security_id if it exists is greater than 0
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
      `\x1b[91m\u2718 The balance security (${event.data.balance_security_id}) for this cancellation does not exist in the current cap table.\x1b[0m`
    );
  }
  if (!balance_security_outgoing_date_validity) {
    console.log(
      `\x1b[91m\u2718 The date of this cancellation is not the same as the date of the balance security (${event.data.balance_security_id}).\x1b[0m`
    );
  }
  if (!balance_stockClass_validity) {
    console.log(
      `\x1b[91m\u2718 The stock class of this cancellation is not the same as the stock class of the balance security (${event.data.balance_security_id}).\x1b[0m`
    );
  }
  if (!balance_quantity_validity) {
    console.log(
      `\x1b[91m\u2718 The quantity of the balance security (${event.data.balance_security_id}) is not greater than 0.\x1b[0m`
    );
  }
  // 7. Check that the sum of the quantities of the cancellation (and the balance issuance if it exists) is equal to the quantity of the incoming security.
  let cancel_and_balance_sum_validity = false;
  let cancel_and_balance_quantity = parseFloat(event.data.quantity);
  if (event.data.balance_security_id) {
    context.stockIssuances.forEach((ele: any) => {
      if (
        ele.security_id === event.data.balance_security_id &&
        ele.object_type === 'TX_STOCK_ISSUANCE'
      ) {
        cancel_and_balance_quantity += parseFloat(ele.quantity);
      }
    });
  }
  context.stockIssuances.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      if (cancel_and_balance_quantity === parseFloat(ele.quantity)) {
        cancel_and_balance_sum_validity = true;
        console.log(
          '\x1b[92m\u2714 The sum of the quantities of the cancellation (and balance issuance if applicable) is equal to the quantity of incoming issuance.\x1b[0m'
        );
      }
    }
  });

  if (!cancel_and_balance_sum_validity) {
    console.log(
      '\x1b[91m\u2718 The sum of the quantities of the cancellation (and balance issuance if applicable) is not equal to the quantity of incoming issuance.\x1b[0m'
    );
  }
  //8. Check cancellation amount is greater than 0 and less than or equal to the incoming security quantity
  let cancel_quantity_validity=false
  transactions.map((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      if (parseFloat(ele.quantity) >= parseFloat(event.data.quantity) && parseFloat(event.data.quantity)>0) {
        cancel_quantity_validity = true;
        console.log(
          `\x1b[92m\u2714 The quantity of this cancel is greater than 0 and less than or equal to the quantity of the incoming security (${event.data.security_id}).\x1b[0m`
        );
      }
    }
  });
  if (!cancel_quantity_validity) {
    console.log(
      `\x1b[91m\u2718 The quantity of this cancel is not greater than 0 and less than or equal to the quantity of the incoming security (${event.data.security_id}).\x1b[0m`
    );
  }

  //
  let only_transaction_validity=true;
  transactions.map((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type !== 'TX_STOCK_ISSUANCE' && 
      ele.object_type !== 'TX_STOCK_ACCEPTANCE' && 
      !(ele.object_type === 'TX_STOCK_CANCELLATION' && ele.id===event.data.id))
    {
      only_transaction_validity = false;
      console.log(
        `\x1b[91m\u2718 The incoming security (${event.data.security_id}) for this cancellation is related to another transaction (${ele.object_type}) with id (${ele.id}).\x1b[0m`
      );
    }
  });
  if (only_transaction_validity) {
    console.log(
      `\x1b[92m\u2714 The incoming security (${event.data.security_id}) for this cancellation is not related to any other conflicting transaction.\x1b[0m`
    ); 
  }


  if (incoming_stockIssuance_validity && 
    incoming_date_validity && 
    balance_stockIssuance_validity &&
    balance_security_outgoing_date_validity &&
    cancel_and_balance_sum_validity &&
    cancel_quantity_validity &&
    balance_stockClass_validity &&
    balance_quantity_validity &&
    only_transaction_validity) {
    valid = true;
  }

  if (valid) {
    return true;
  } else {
    return false;
  }
};

export default valid_tx_stock_cancellation;
