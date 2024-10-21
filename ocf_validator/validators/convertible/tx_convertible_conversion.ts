import { OcfMachineContext } from "../../ocfMachine";

/*
CURRENT CHECKS:
Check that convertible issuance in incoming security_id referenced by transaction exists in current state.
The date of the convertible issuance referred to in the security_id must have a date equal to or earlier than the date of the convertible conversion
Any stock issuances with corresponding security IDs referred to in the resulting_security_ids array must exist
The security_id of the convertible issuance referred to in the security_id variable must not be the security_id related to any other transactions with the exception of a convertible acceptance transaction.
The dates of any convertible issuances referred to in the resulting_security_ids variables must have a date equal to the date of the convertible conversion
The stakeholder_id of the convertible issuance referred to in the security_id variable must equal the stakeholder_id of any stock issuances referred to in the resulting_security_ids variable

NOT IMPLEMENTED:
The quantity_converted variable must equal the sum of any convertible issuances referred to in the resulting_security_ids variable
*/

const valid_tx_convertible_conversion = (context: OcfMachineContext, event: any, isGuard: Boolean) => {
  let validity = false;
  const { transactions } = context.ocfPackageContent;
  let report: any = { transaction_type: "TX_CONVERTIBLE_CONVERSION", transaction_id: event.data.id, transaction_date: event.data.date };

  // Check that convertible issuance in incoming security_id referenced by transaction exists in current state.
  let incoming_convertibleIssuance_validity = false;
  let incoming_stakeholder = "";
  context.convertibleIssuances.forEach((ele: any) => {
    if (ele.security_id === event.data.security_id && ele.object_type === "TX_CONVERTIBLE_ISSUANCE") {
      incoming_convertibleIssuance_validity = true;
      report.incoming_convertibleIssuance_validity = true;
    }
  });
  if (!incoming_convertibleIssuance_validity) {
    report.incoming_convertibleIssuance_validity = false;
  }

  // The date of the convertible issuance referred to in the security_id must have a date equal to or earlier than the date of the convertible conversion
  let incoming_date_validity = false;
  transactions.forEach((ele: any) => {
    if (ele.security_id === event.data.security_id && ele.object_type === "TX_CONVERTIBLE_ISSUANCE") {
      if (ele.date <= event.data.date) {
        incoming_date_validity = true;
        report.incoming_date_validity = true;
      }
    }
  });
  if (!incoming_date_validity) {
    report.incoming_date_validity = false;
  }

  // Any stock issuances with corresponding security IDs referred to in the resulting_security_ids array must exist
  let resulting_stockIssuances_validity = false;
  for (let i = 0; i < event.data.resulting_security_ids.length; i++) {
    const res = event.data.resulting_security_ids[i];
    resulting_stockIssuances_validity = false;
    transactions.map((ele: any) => {
      if (ele.security_id === res && ele.object_type === "TX_STOCK_ISSUANCE") {
        resulting_stockIssuances_validity = true;
        report.resulting_convertibleIssuances_validity = true;
      }
    });
    if (!resulting_stockIssuances_validity) {
      report.resulting_convertibleIssuances_validity = false;
    }
  }


  // The security_id of the convertible issuance referred to in the security_id variable must not be the security_id related to any other transactions with the exception of a convertible acceptance transaction.
  let only_transaction_validity = true;
  transactions.map((ele: any) => {
    if (ele.security_id === event.data.security_id && ele.object_type !== "TX_CONVERTIBLE_ISSUANCE" && ele.object_type !== "TX_CONVERTIBLE_ACCEPTANCE" && !(ele.object_type === "TX_CONVERTIBLE_CONVERSION" && ele.id === event.data.id)) {
      only_transaction_validity = false;
      report.only_transaction_validity = false;
    }
  });
  if (only_transaction_validity) {
    report.only_transaction_validity = true;
  }

  // The dates of any convertible issuances referred to in the resulting_security_ids must have a date equal to the date of the convertible conversion
  let resulting_dates_validity = false;
  for (let i = 0; i < event.data.resulting_security_ids.length; i++) {
    const res = event.data.resulting_security_ids[i];
    resulting_dates_validity = false;
    transactions.map((ele: any) => {
      if (ele.security_id === res && ele.object_type === "TX_CONVERTIBLE_ISSUANCE" && ele.date === event.data.date) {
        resulting_dates_validity = true;
        report.resulting_dates_validity = true;
      }
    });
    if (!resulting_dates_validity) {
      report.resulting_dates_validity = false;
    }
  }


  // The stakeholder_id of the convertible issuance referred to in the security_id variable must equal the stakeholder_id of any convertible issuances referred to in the resulting_security_ids variable
  let resulting_stakeholder_validity = false;
  for (let i = 0; i < event.data.resulting_security_ids.length; i++) {
    const res = event.data.resulting_security_ids[i];
    resulting_stakeholder_validity = false;
    transactions.map((ele: any) => {
      if (ele.security_id === res && ele.object_type === "TX_STOCK_ISSUANCE") {
        if (ele.stakeholder_id === incoming_stakeholder) {
          resulting_stakeholder_validity = true;
          report.resulting_stakeholder_validity = true;
        }
      }
    });
    if (!resulting_stakeholder_validity) {
      report.resulting_stakeholder_validity = false;
    }
  }

  if (
    incoming_convertibleIssuance_validity &&
    incoming_date_validity &&
    only_transaction_validity &&
    resulting_dates_validity &&
    resulting_stakeholder_validity
  ) {
    validity = true;
  }

  const result = isGuard ? validity : report;

  return result;
};

export default valid_tx_convertible_conversion;
