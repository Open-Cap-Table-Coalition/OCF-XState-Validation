"use strict";
// Reference for tx_convertible_cancellation: https://open-cap-table-coalition.github.io/Open-Cap-Format-OCF/schema_markdown/schema/objects/transactions/cancellation/StockCancellation/
/*
  CURRENT CHECKS:
    1. Check that convertible issuance in incoming security_id reference by transaction exists in current state.
    2. Check to ensure that the date of transaction is the same day or after the date of the incoming convertible issuance.
    3. The security_id of the convertible issuance referred to in the security_id variable must not be the security_id related to any other transactions with the exception of a convertible acceptance transaction.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const valid_tx_convertible_cancellation = (context, event, isGuard = false) => {
    let validity = false;
    let report = { transaction_type: "TX_CONVERTIBLE_CANCELLATION", transaction_id: event.data.id, transaction_date: event.data.date };
    const { transactions } = context.ocfPackageContent;
    // 1. Check that convertible issuance in incoming security_id reference by transaction exists in current state.
    let incoming_convertibleIssuance_validity = false;
    context.convertibleIssuances.forEach((ele) => {
        if (ele.security_id === event.data.security_id) {
            incoming_convertibleIssuance_validity = true;
            report.incoming_convertibleIssuance_validity = true;
        }
    });
    if (!incoming_convertibleIssuance_validity) {
        report.incoming_convertibleIssuance_validity = false;
    }
    // 2. Check to ensure that the date of transaction is the same day or after the date of the incoming convertible issuance.
    let incoming_date_validity = false;
    transactions.forEach((ele) => {
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
    let only_transaction_validity = true;
    transactions.map((ele) => {
        if (ele.security_id === event.data.security_id &&
            ele.object_type !== 'TX_CONVERTIBLE_ISSUANCE' &&
            ele.object_type !== 'TX_CONVERTIBLE_ACCEPTANCE' &&
            !(ele.object_type === 'TX_CONVERTIBLE_CANCELLATION' && ele.id === event.data.id)) {
            only_transaction_validity = false;
            report.only_transaction_validity = false;
        }
    });
    if (only_transaction_validity) {
        report.only_transaction_validity = true;
    }
    if (incoming_convertibleIssuance_validity &&
        incoming_date_validity &&
        only_transaction_validity) {
        validity = true;
    }
    const result = isGuard ? validity : report;
    return result;
};
exports.default = valid_tx_convertible_cancellation;
