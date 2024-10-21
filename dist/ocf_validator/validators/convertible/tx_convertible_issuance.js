"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const valid_tx_convertible_issuance = (context, event, isGuard) => {
    let validity = false;
    const { stakeholders } = context.ocfPackageContent;
    let report = { transaction_type: "TX_CONVERTIBLE_ISSUANCE", transaction_id: event.data.id, transaction_date: event.data.date };
    // Check if the stakeholder referenced by the transaction exists in the stakeholder file.
    let stakeholder_validity = false;
    stakeholders.forEach((ele) => {
        if (ele.id === event.data.stakeholder_id) {
            stakeholder_validity = true;
            report.stakeholder_validity = true;
        }
    });
    if (!stakeholder_validity) {
        report.stakeholder_validity = false;
    }
    if (stakeholder_validity) {
        validity = true;
    }
    const result = isGuard ? validity : report;
    return result;
};
exports.default = valid_tx_convertible_issuance;
