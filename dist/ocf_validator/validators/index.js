"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tx_stock_issuance_1 = __importDefault(require("./stock/tx_stock_issuance"));
const tx_stock_retraction_1 = __importDefault(require("./stock/tx_stock_retraction"));
const tx_stock_acceptance_1 = __importDefault(require("./stock/tx_stock_acceptance"));
const tx_stock_cancellation_1 = __importDefault(require("./stock/tx_stock_cancellation"));
const tx_stock_conversion_1 = __importDefault(require("./stock/tx_stock_conversion"));
const tx_stock_reissuance_1 = __importDefault(require("./stock/tx_stock_reissuance"));
const tx_stock_repurchase_1 = __importDefault(require("./stock/tx_stock_repurchase"));
const tx_stock_transfer_1 = __importDefault(require("./stock/tx_stock_transfer"));
const tx_convertible_issuance_1 = __importDefault(require("./convertible/tx_convertible_issuance"));
const tx_convertible_retraction_1 = __importDefault(require("./convertible/tx_convertible_retraction"));
const tx_convertible_acceptance_1 = __importDefault(require("./convertible/tx_convertible_acceptance"));
const tx_convertible_cancellation_1 = __importDefault(require("./convertible/tx_convertible_cancellation"));
const tx_convertible_transfer_1 = __importDefault(require("./convertible/tx_convertible_transfer"));
const tx_convertible_conversion_1 = __importDefault(require("./convertible/tx_convertible_conversion"));
const tx_warrant_issuance_1 = __importDefault(require("./warrant/tx_warrant_issuance"));
const tx_warrant_retraction_1 = __importDefault(require("./warrant/tx_warrant_retraction"));
const tx_warrant_acceptance_1 = __importDefault(require("./warrant/tx_warrant_acceptance"));
const tx_warrant_cancellation_1 = __importDefault(require("./warrant/tx_warrant_cancellation"));
const tx_warrant_transfer_1 = __importDefault(require("./warrant/tx_warrant_transfer"));
const tx_warrant_exercise_1 = __importDefault(require("./warrant/tx_warrant_exercise"));
const tx_equity_compensation_issuance_1 = __importDefault(require("./equity_compensation/tx_equity_compensation_issuance"));
const tx_equity_compensation_retraction_1 = __importDefault(require("./equity_compensation/tx_equity_compensation_retraction"));
const tx_equity_compensation_acceptance_1 = __importDefault(require("./equity_compensation/tx_equity_compensation_acceptance"));
const tx_equity_compensation_cancellation_1 = __importDefault(require("./equity_compensation/tx_equity_compensation_cancellation"));
const tx_equity_compensation_release_1 = __importDefault(require("./equity_compensation/tx_equity_compensation_release"));
const tx_equity_compensation_transfer_1 = __importDefault(require("./equity_compensation/tx_equity_compensation_transfer"));
const tx_equity_compensation_exercise_1 = __importDefault(require("./equity_compensation/tx_equity_compensation_exercise"));
const tx_plan_security_issuance_1 = __importDefault(require("./plan_security/tx_plan_security_issuance"));
const tx_plan_security_retraction_1 = __importDefault(require("./plan_security/tx_plan_security_retraction"));
const tx_plan_security_acceptance_1 = __importDefault(require("./plan_security/tx_plan_security_acceptance"));
const tx_plan_security_cancellation_1 = __importDefault(require("./plan_security/tx_plan_security_cancellation"));
const tx_plan_security_release_1 = __importDefault(require("./plan_security/tx_plan_security_release"));
const tx_plan_security_transfer_1 = __importDefault(require("./plan_security/tx_plan_security_transfer"));
const tx_plan_security_exercise_1 = __importDefault(require("./plan_security/tx_plan_security_exercise"));
const tx_stock_class_authorized_shares_adjustment_1 = __importDefault(require("./stock_class/tx_stock_class_authorized_shares_adjustment"));
const tx_stock_class_conversion_ratio_adjustment_1 = __importDefault(require("./stock_class/tx_stock_class_conversion_ratio_adjustment"));
const tx_stock_class_split_1 = __importDefault(require("./stock_class/tx_stock_class_split"));
const tx_stock_plan_pool_adjustment_1 = __importDefault(require("./stock_plan/tx_stock_plan_pool_adjustment"));
const tx_stock_plan_return_to_pool_1 = __importDefault(require("./stock_plan/tx_stock_plan_return_to_pool"));
const ts_vesting_acceleration_1 = __importDefault(require("./vesting/ts_vesting_acceleration"));
const ts_vesting_start_1 = __importDefault(require("./vesting/ts_vesting_start"));
const ts_vesting_event_1 = __importDefault(require("./vesting/ts_vesting_event"));
const validators = {
    valid_tx_stock_issuance: tx_stock_issuance_1.default,
    valid_tx_stock_retraction: tx_stock_retraction_1.default,
    valid_tx_stock_acceptance: tx_stock_acceptance_1.default,
    valid_tx_stock_cancellation: tx_stock_cancellation_1.default,
    valid_tx_stock_conversion: tx_stock_conversion_1.default,
    valid_tx_stock_reissuance: tx_stock_reissuance_1.default,
    valid_tx_stock_repurchase: tx_stock_repurchase_1.default,
    valid_tx_stock_transfer: tx_stock_transfer_1.default,
    valid_tx_convertible_issuance: tx_convertible_issuance_1.default,
    valid_tx_convertible_retraction: tx_convertible_retraction_1.default,
    valid_tx_convertible_acceptance: tx_convertible_acceptance_1.default,
    valid_tx_convertible_cancellation: tx_convertible_cancellation_1.default,
    valid_tx_convertible_transfer: tx_convertible_transfer_1.default,
    valid_tx_convertible_conversion: tx_convertible_conversion_1.default,
    valid_tx_warrant_issuance: tx_warrant_issuance_1.default,
    valid_tx_warrant_retraction: tx_warrant_retraction_1.default,
    valid_tx_warrant_acceptance: tx_warrant_acceptance_1.default,
    valid_tx_warrant_cancellation: tx_warrant_cancellation_1.default,
    valid_tx_warrant_transfer: tx_warrant_transfer_1.default,
    valid_tx_warrant_exercise: tx_warrant_exercise_1.default,
    valid_tx_equity_compensation_issuance: tx_equity_compensation_issuance_1.default,
    valid_tx_equity_compensation_retraction: tx_equity_compensation_retraction_1.default,
    valid_tx_equity_compensation_acceptance: tx_equity_compensation_acceptance_1.default,
    valid_tx_equity_compensation_cancellation: tx_equity_compensation_cancellation_1.default,
    valid_tx_equity_compensation_release: tx_equity_compensation_release_1.default,
    valid_tx_equity_compensation_transfer: tx_equity_compensation_transfer_1.default,
    valid_tx_equity_compensation_exercise: tx_equity_compensation_exercise_1.default,
    valid_tx_plan_security_issuance: tx_plan_security_issuance_1.default,
    valid_tx_plan_security_retraction: tx_plan_security_retraction_1.default,
    valid_tx_plan_security_acceptance: tx_plan_security_acceptance_1.default,
    valid_tx_plan_security_cancellation: tx_plan_security_cancellation_1.default,
    valid_tx_plan_security_release: tx_plan_security_release_1.default,
    valid_tx_plan_security_transfer: tx_plan_security_transfer_1.default,
    valid_tx_plan_security_exercise: tx_plan_security_exercise_1.default,
    valid_tx_stock_class_authorized_shares_adjustment: tx_stock_class_authorized_shares_adjustment_1.default,
    valid_tx_stock_class_conversion_ratio_adjustment: tx_stock_class_conversion_ratio_adjustment_1.default,
    valid_tx_stock_class_split: tx_stock_class_split_1.default,
    valid_tx_stock_plan_pool_adjustment: tx_stock_plan_pool_adjustment_1.default,
    valid_tx_stock_plan_return_to_pool: tx_stock_plan_return_to_pool_1.default,
    valid_tx_vesting_acceleration: ts_vesting_acceleration_1.default,
    valid_tx_vesting_start: ts_vesting_start_1.default,
    valid_tx_vesting_event: ts_vesting_event_1.default,
};
exports.default = validators;
