import {OcfMachineContext} from '../../ocfMachine';

/*
CURRENT CHECKS:
A stakeholder with a corresponding stakeholder ID must exist
A stock class with corresponding stock class ID must exist
MISSING CHECKS:
If a stock legend ID included, a stock legend with a corresponding stock legend ID must exist
The quantity of the Stock issuance is equal to or less than the current number of shares authorised at class level (If applicable) minus any outstanding Stock issuances
*/

// Refrence for tx_stock_issuance transaction: https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/transactions/issuance/StockIssuance/

const valid_tx_stock_issuance = (context: OcfMachineContext, event: any) => {
  let valid = false;
  const {stakeholders, stockClasses} = context.ocfPackageContent;

  // Check if the stakeholder refernenced by the transaction exists in the stakeholder file.
  let stakeholder_validity = false;
  stakeholders.forEach((ele: any) => {
    if (ele.id === event.data.stakeholder_id) {
      stakeholder_validity = true;
      console.log(
        '\x1b[92m\u2714 The stakeholder for this issuance is in the stakeholder file.\x1b[0m'
      );
    }
  });
  if (!stakeholder_validity) {
    console.log(
      '\x1b[91m\u2718 The stakeholder for this issuance is not in the stakeholder file.\x1b[0m'
    );
  }

  // Check if the stock class refernenced by the transaction exists in the stock class file.
  let stockClass_validity = false;
  stockClasses.forEach((ele: any) => {
    if (ele.id === event.data.stock_class_id) {
      stockClass_validity = true;
      console.log(
        '\x1b[92m\u2714 The stock class of this issuance is in the stock class file.\x1b[0m'
      );
    }
  });
  if (!stockClass_validity) {
    console.log(
      '\x1b[91m\u2718 The stock class of this issuance is not in the stock class file.\x1b[0m'
    );
  }
  if (stockClass_validity && stakeholder_validity) {
    valid = true;
  }

  if (valid) {
    return true;
  } else {
    return false;
  }
};

export default valid_tx_stock_issuance;
