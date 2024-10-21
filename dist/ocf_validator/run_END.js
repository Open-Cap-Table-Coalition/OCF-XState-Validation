"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const run_END = (context, event) => {
    let report = [`The cap table as of the end of day on ${event.date}`];
    const stock_table = [];
    context.stockIssuances.forEach((issuance) => {
        stock_table.push({
            "Equity type": "Stock",
            "Issue date": issuance.date,
            "Custom ID": issuance.custom_id,
            Stockholder: issuance.stakeholder_id,
            "Stock class": issuance.stock_class_id,
            Quantity: issuance.quantity,
        });
    });
    if (stock_table.length > 0) {
        report.push(...stock_table);
    }
    else {
        report.push("No outstanding stock positions.");
    }
    const convertible_table = [];
    context.convertibleIssuances.forEach((issuance) => {
        convertible_table.push({
            "Equity type": "Convertible",
            "Custom ID": issuance.custom_id,
            "Convertible holder": issuance.stakeholder_id,
            "Issue Date": issuance.date,
            "Investment Amount": `${issuance.purchase_price.amount} ${issuance.purchase_price.currency}`,
        });
    });
    if (convertible_table.length > 0) {
        report.push(...convertible_table);
    }
    else {
        report.push("No outstanding convertibles.");
    }
    const warrant_table = [];
    context.warrantIssuances.forEach((issuance) => {
        warrant_table.push({
            "Equity type": "Warrant",
            "Custom ID": issuance.custom_id,
            "Warrant holder": issuance.stakeholder_id,
            "Issue Date": issuance.date,
            "Investment Amount": `${issuance.purchase_price.amount} ${issuance.purchase_price.currency}`,
        });
    });
    if (warrant_table.length > 0) {
        report.push(...warrant_table);
    }
    else {
        report.push("No outstanding warrants.");
    }
    const equity_compensation_table = [];
    context.optionGrants.forEach((issuance) => {
        equity_compensation_table.push({
            "Equity type": "Equity Compensation",
            "Custom ID": issuance.custom_id,
            "Warrant holder": issuance.stakeholder_id,
            "Issue Date": issuance.date,
            Quantity: `${issuance.quantity}`,
            "Available to Exercise (including unvested)": `${issuance.availableToExercise}`,
        });
    });
    if (equity_compensation_table.length > 0) {
        report.push(...equity_compensation_table);
    }
    else {
        report.push("No outstanding equity compensation.");
    }
    return report;
};
exports.default = run_END;
