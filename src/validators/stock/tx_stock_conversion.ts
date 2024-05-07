import {OcfMachineContext} from '../../ocfMachine';

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
