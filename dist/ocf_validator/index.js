"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocfValidator = void 0;
const xstate_1 = require("xstate");
const read_ocf_package_1 = require("../read_ocf_package");
const constants_1 = __importDefault(require("./constants/constants"));
const ocfMachine_1 = require("./ocfMachine");
const ocfValidator = (packagePath) => {
    const ocfPackage = (0, read_ocf_package_1.readOcfPackage)(packagePath);
    const { manifest, transactions } = ocfPackage;
    const transactionTypes = constants_1.default.transaction_types;
    const sortedTransactions = transactions.sort((a, b) => a.date.localeCompare(b.date) || transactionTypes.indexOf(a.object_type) - transactionTypes.indexOf(b.object_type));
    const ocfXstateMachine = (0, xstate_1.createMachine)(ocfMachine_1.ocfMachine);
    const ocfXstateActor = (0, xstate_1.createActor)(ocfXstateMachine).start();
    let currentDate = null;
    // For the sorted transactions, we run through the set of transactions for a given day and then at the end of the day (EOD), we run the EOD action before moving onto the next day in the record.
    for (let i = 0; i < sortedTransactions.length; i++) {
        const ele = sortedTransactions[i];
        if (ocfXstateActor.getSnapshot().value !== "validationError") {
            // First determine if the date has changed. If it has, then we run the EOD action and then move onto the next day.
            if (ele.date !== currentDate) {
                if (currentDate === null) {
                    ocfXstateActor.send({ type: "START", data: ocfPackage, date: ele.date });
                }
                else {
                    ocfXstateActor.send({ type: "RUN_EOD", date: currentDate });
                }
            }
            currentDate = ele.date;
            ocfXstateActor.send({ type: ele.object_type, data: ele });
        }
    }
    if (ocfXstateActor.getSnapshot().value !== "validationError") {
        ocfXstateActor.send({ type: "RUN_EOD", date: currentDate });
        ocfXstateActor.send({ type: "RUN_END", date: currentDate });
    }
    return (ocfXstateActor.getSnapshot().context);
};
exports.ocfValidator = ocfValidator;
