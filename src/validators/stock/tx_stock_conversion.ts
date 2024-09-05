import {OcfMachineContext} from '../../ocfMachine';

/*
CURRENT CHECKS:
A stock issuance with a corresponding security ID must exist for the security_id variable
The date of the stock issuance referred to in the security_id must have a date equal to or earlier than the date of the stock conversion
MISSING CHECKS:
Any stock issuances with corresponding security IDs referred to in the resulting_security_ids array must exist
If applicable, a stock issuance with a corresponding security ID must exist for the balance_security_id variable"
The security_id of the stock issuance referred to in the security_id variable must not be the security_id related to any other transactions with the exception of a stock acceptance transaction.
The dates of any stock issuances referred to in the resulting_security_ids or balance_security_id variables must have a date equal to the date of the stock conversion
The quantity_converted variable must be greater than zero and the quantity of the stock_issuance referred to in security_id variable
The quantity_converted variable must equal the sum of any stock issuances referred to in the resulting_security_ids variable
The quantity of the stock issuance referred to in the balance_security_id variable must be equal to the quantity of the stock issuance referred to in the security_id variable minus the quantity_converted variable
The stock class id of the stock issuances in the resulting_security_id variable must be different from the stock_class_id of the stock issuance referred to in the security_id variable
The stock_class_id of the stock issance in the balance_security_id must be the same as the stock_class_id of the stock issuance reffered to in the security_id variable
*/

const valid_tx_stock_conversion = (context: OcfMachineContext, event: any) => {
  let valid = false;
  const {transactions} = context.ocfPackageContent;
  // TBC: validation of tx_stock_conversion

  // Check that stock issuance in incoming security_id referenced by transaction exists in current state.
  let incoming_stockIssuance_validity = false;
  context.stockIssuances.forEach((ele: any) => {
    if (
      ele.security_id === event.data.security_id &&
      ele.object_type === 'TX_STOCK_ISSUANCE'
    ) {
      incoming_stockIssuance_validity = true;
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

  // Check to ensure that the date of transaction is the same day or after the date of the incoming stock issuance.
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

  if (incoming_stockIssuance_validity && incoming_date_validity) {
    valid = true;
  }

  if (valid) {
    return true;
  } else {
    return false;
  }
};

export default valid_tx_stock_conversion;
