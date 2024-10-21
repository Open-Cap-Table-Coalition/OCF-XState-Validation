"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RUN_EOD = (context, event) => {
    let snapshot = { date: event.date, stockIssuances: [], convertibles: [], warrants: [], equityCompensation: [] };
    context.stockIssuances.forEach((issuance) => {
        snapshot.stockIssuances.push({
            date: issuance.date,
            custom_id: issuance.custom_id,
            stakeholder: issuance.stakeholder_id,
            stock_class: issuance.stock_class_id,
            quantity: issuance.quantity,
        });
    });
    context.convertibleIssuances.forEach((issuance) => {
        snapshot.convertibles.push({
            date: issuance.date,
            custom_id: issuance.custom_id,
            stakeholder: issuance.stakeholder_id,
            purchase_price: issuance.purchase_price,
        });
    });
    context.warrantIssuances.forEach((issuance) => {
        snapshot.warrants.push({
            date: issuance.date,
            custom_id: issuance.custom_id,
            stakeholder: issuance.stakeholder_id,
            purchase_price: issuance.purchase_price,
        });
    });
    context.equityCompensation.forEach((issuance) => {
        snapshot.equityCompensation.push({
            date: issuance.date,
            custom_id: issuance.custom_id,
            stakeholder: issuance.stakeholder_id,
            quantity: issuance.quantity,
            availableToExercise: issuance.availableToExercise,
        });
    });
    return snapshot;
};
exports.default = RUN_EOD;
