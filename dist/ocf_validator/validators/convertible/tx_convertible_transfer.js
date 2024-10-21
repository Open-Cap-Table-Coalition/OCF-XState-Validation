"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Reference for tx_convertible_transfer transaction: https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/transactions/transfer/StockTransfer/
/*
  CURRENT CHECKS:
    1. Does the incoming security_id referenced by transaction exist in current cap table state?
    2. Is the date of transaction the same day or after the date of the incoming issuance?
 MISSING CHECKS:
    1. The security_id of the convertible issuance referred to in the security_id variable must not be the security_id related to any other transactions with the exception of a convertible acceptance transaction.
*/
const valid_tx_convertible_transfer = (context, event, isGuard) => {
    let validity = false;
    const { transactions } = context.ocfPackageContent;
    let report = { transaction_type: "TX_CONVERTIBLE_TRANSFER", transaction_id: event.data.id, transaction_date: event.data.date };
    // Check that convertible issuance in incoming security_id referenced by transaction exists in current state.
    let incoming_convertibleIssuance_validity = false;
    context.convertibleIssuances.map((ele) => {
        if (ele.security_id === event.data.security_id &&
            ele.object_type === 'TX_CONVERTIBLE_ISSUANCE') {
            incoming_convertibleIssuance_validity = true;
            report.incoming_convertibleIssuance_validity = true;
        }
    });
    if (!incoming_convertibleIssuance_validity) {
        report.incoming_convertibleIssuance_validity = false;
    }
    // Check to ensure that the date of transaction is the same day or after the date of the incoming convertible issuance.
    let incoming_date_validity = false;
    transactions.map((ele) => {
        if (ele.security_id === event.data.security_id &&
            ele.object_type === 'TX_CONVERTIBLE_ISSUANCE') {
            if (ele.date <= event.data.date) {
                incoming_date_validity = true;
                report.incoming_date_validity = true;
            }
        }
    });
    if (!incoming_date_validity) {
        report.incoming_date_validity = false;
    }
    if (incoming_convertibleIssuance_validity &&
        incoming_date_validity) {
        validity = true;
    }
    const result = isGuard ? validity : report;
    return result;
};
exports.default = valid_tx_convertible_transfer;
