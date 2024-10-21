"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocfMachine = void 0;
const xstate_1 = require("xstate");
const validators_1 = __importDefault(require("./validators"));
const eod_1 = __importDefault(require("./eod"));
exports.ocfMachine = {
    predictableActionArguments: true,
    id: "OCF-xstate",
    initial: "capTable",
    context: {
        stockIssuances: [],
        equityCompensation: [],
        convertibleIssuances: [],
        warrantIssuances: [],
        ocfPackageContent: {},
        report: [],
        snapshots: [],
        result: 'Incomplete'
    },
    states: {
        capTable: {
            on: {
                START: [
                    {
                        target: "capTable",
                        actions: [
                            (0, xstate_1.assign)({
                                ocfPackageContent: ({ event }) => event.data,
                            }),
                        ],
                    },
                ],
                TX_STOCK_ISSUANCE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_stock_issuance(context, event, true);
                        },
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_issuance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                stockIssuances: ({ context, event }) => [...context.stockIssuances, event.data],
                            }),
                        ],
                        target: "capTable",
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_issuance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_stock_issuance(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_STOCK_RETRACTION: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_stock_retraction(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_issuance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                stockIssuances: ({ context, event }) => context.stockIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_retraction(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_stock_retraction(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_STOCK_ACCEPTANCE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_stock_acceptance(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_acceptance(context, event, false)]
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_acceptance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_stock_acceptance(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_STOCK_CANCELLATION: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_stock_cancellation(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_cancellation(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                stockIssuances: ({ context, event }) => context.stockIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_cancellation(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_stock_cancellation(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_STOCK_TRANSFER: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_stock_transfer(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_transfer(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                stockIssuances: ({ context, event }) => context.stockIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_transfer(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_stock_transfer(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_STOCK_CONVERSION: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_stock_conversion(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_conversion(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                stockIssuances: ({ context, event }) => context.stockIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_conversion(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_stock_conversion(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_STOCK_REISSUANCE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_stock_reissuance(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_reissuance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                stockIssuances: ({ context, event }) => context.stockIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_reissuance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_stock_reissuance(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_STOCK_REPURCHASE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_stock_repurchase(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_repurchase(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                stockIssuances: ({ context, event }) => context.stockIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_stock_repurchase(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_stock_repurchase(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_CONVERTIBLE_ISSUANCE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_convertible_issuance(context, event, true);
                        },
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_issuance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                convertibleIssuances: ({ context, event }) => [...context.stockIssuances, event.data],
                            }),
                        ],
                        target: "capTable",
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_issuance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_convertible_issuance(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_CONVERTIBLE_RETRACTION: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_convertible_retraction(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_retraction(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                convertibleIssuances: ({ context, event }) => context.convertibleIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_retraction(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_convertible_retraction(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_CONVERTIBLE_ACCEPTANCE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_convertible_acceptance(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_acceptance(context, event, false)]
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_acceptance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_convertible_acceptance(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_CONVERTIBLE_CANCELLATION: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_convertible_cancellation(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_cancellation(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                convertibleIssuances: ({ context, event }) => context.convertibleIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_cancellation(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_convertible_cancellation(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_CONVERTIBLE_TRANSFER: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_convertible_transfer(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_transfer(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                convertibleIssuances: ({ context, event }) => context.convertibleIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_transfer(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_convertible_transfer(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_CONVERTIBLE_CONVERSION: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_convertible_conversion(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_conversion(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                convertibleIssuances: ({ context, event }) => context.convertibleIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_convertible_conversion(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_convertible_conversion(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_WARRANT_ISSUANCE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_warrant_issuance(context, event, true);
                        },
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_issuance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                warrantIssuances: ({ context, event }) => [...context.stockIssuances, event.data],
                            }),
                        ],
                        target: "capTable",
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_issuance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_warrant_issuance(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_WARRANT_RETRACTION: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_warrant_retraction(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_retraction(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                warrantIssuances: ({ context, event }) => context.warrantIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_retraction(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_warrant_retraction(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_WARRANT_ACCEPTANCE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_warrant_acceptance(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_acceptance(context, event, false)]
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_acceptance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_warrant_acceptance(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_WARRANT_CANCELLATION: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_warrant_cancellation(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_cancellation(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                warrantIssuances: ({ context, event }) => context.warrantIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_cancellation(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_warrant_cancellation(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_WARRANT_TRANSFER: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_warrant_transfer(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_transfer(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                warrantIssuances: ({ context, event }) => context.warrantIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_transfer(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_warrant_transfer(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_WARRANT_EXERCISE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_warrant_exercise(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_exercise(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                warrantIssuances: ({ context, event }) => context.warrantIssuances.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_warrant_exercise(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_warrant_exercise(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_EQUITY_COMPENSATION_ISSUANCE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_equity_compensation_issuance(context, event, true);
                        },
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_issuance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                equityCompensation: ({ context, event }) => [...context.stockIssuances, event.data],
                            }),
                        ],
                        target: "capTable",
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_issuance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_equity_compensation_issuance(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_EQUITY_COMPENSATION_RETRACTION: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_equity_compensation_retraction(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_retraction(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                equityCompensation: ({ context, event }) => context.equityCompensation.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_retraction(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_equity_compensation_retraction(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_EQUITY_COMPENSATION_ACCEPTANCE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_equity_compensation_acceptance(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_acceptance(context, event, false)]
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_acceptance(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_equity_compensation_acceptance(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_EQUITY_COMPENSATION_CANCELLATION: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_equity_compensation_cancellation(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_cancellation(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                equityCompensation: ({ context, event }) => context.equityCompensation.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_cancellation(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_equity_compensation_cancellation(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_EQUITY_COMPENSATION_TRANSFER: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_equity_compensation_transfer(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_transfer(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                equityCompensation: ({ context, event }) => context.equityCompensation.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_transfer(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_equity_compensation_transfer(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                TX_EQUITY_COMPENSATION_EXERCISE: [
                    {
                        guard: ({ context, event }) => {
                            return validators_1.default.valid_tx_equity_compensation_exercise(context, event, true);
                        },
                        target: 'capTable',
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_exercise(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                equityCompensation: ({ context, event }) => context.equityCompensation.filter((obj) => { return obj.security_id !== event.data.security_id; }),
                            }),
                        ],
                    },
                    {
                        target: "validationError",
                        actions: [
                            (0, xstate_1.assign)({
                                report: ({ context, event }) => [...context.report, validators_1.default.valid_tx_equity_compensation_exercise(context, event, false)]
                            }),
                            (0, xstate_1.assign)({
                                result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id}: ${JSON.stringify(validators_1.default.valid_tx_equity_compensation_exercise(context, event, false), null, 2)}`
                            }),
                        ],
                    },
                ],
                INVALID_TX: [
                    {
                        target: "validationError",
                        actions: (0, xstate_1.assign)({
                            result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} failed on ${event.data.id} because it is not a valid TX type.`
                        }),
                    },
                ],
                RUN_EOD: {
                    taget: "capTable",
                    actions: (0, xstate_1.assign)({
                        snapshots: ({ context, event }) => [...context.snapshots, (0, eod_1.default)(context, event)]
                    }),
                },
                RUN_END: {
                    taget: "capTable",
                    actions: [
                        (0, xstate_1.assign)({
                            result: ({ context, event }) => `The validation of the OCF package for ${context.ocfPackageContent.manifest.issuer.legal_name} is complete and the package appears valid.`
                        })
                    ]
                },
            },
        },
        validationError: {
            type: "final",
        },
    },
};
