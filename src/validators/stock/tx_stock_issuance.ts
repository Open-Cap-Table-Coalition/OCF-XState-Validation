import {stakeholders, stockClasses} from '../../test_data/data';

const valid_tx_stock_issuance = (context: any, event: any) => {
  let valid = false;

  let stakeholder_validity = false;
  stakeholders.items.forEach((ele: any) => {
    if (ele.id === event.data.stakeholder_id) {
      stakeholder_validity = true;
    }
  });

  let stockClass_validity = false;
  stockClasses.items.forEach((ele: any) => {
    if (ele.id === event.data.stock_class_id) {
      stockClass_validity = true;
    }
  });

  if (!stockClass_validity) {
    console.log(
      `There is an error with the stock class of ${event.data.security_id}`
    );
  }
  if (!stakeholder_validity) {
    console.log(
      `There is an error with the stakeholder of ${event.data.security_id}`
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
