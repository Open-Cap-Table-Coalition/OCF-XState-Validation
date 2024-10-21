"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readOcfPackage = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
;
;
const readOcfPackage = (packagePath) => {
    const manifest = JSON.parse(fs.readFileSync(path.join(packagePath, "Manifest.ocf.json"), "utf8"));
    const stakeholders = [];
    manifest.stakeholders_files.forEach((file) => {
        stakeholders.push(...JSON.parse(fs.readFileSync(path.join(packagePath, file.filepath), "utf8")).items);
    });
    const stockClasses = [];
    manifest.stock_classes_files.forEach((file) => {
        stockClasses.push(...JSON.parse(fs.readFileSync(path.join(packagePath, file.filepath), "utf8")).items);
    });
    const transactions = [];
    manifest.transactions_files.forEach((file) => {
        transactions.push(...JSON.parse(fs.readFileSync(path.join(packagePath, file.filepath), "utf8")).items);
    });
    const vestingTerms = [];
    manifest.vesting_terms_files.forEach((file) => {
        vestingTerms.push(...JSON.parse(fs.readFileSync(path.join(packagePath, file.filepath), "utf8")).items);
    });
    const stockPlans = [];
    manifest.stock_plans_files.forEach((file) => {
        stockPlans.push(...JSON.parse(fs.readFileSync(path.join(packagePath, file.filepath), "utf8")).items);
    });
    const stockLegends = [];
    manifest.stock_legend_templates_files.forEach((file) => {
        stockLegends.push(...JSON.parse(fs.readFileSync(path.join(packagePath, file.filepath), "utf8")).items);
    });
    const valuations = [];
    manifest.valuations_files.forEach((file) => {
        valuations.push(...JSON.parse(fs.readFileSync(path.join(packagePath, file.filepath), "utf8")).items);
    });
    return {
        manifest,
        stakeholders,
        stockClasses,
        transactions,
        stockPlans,
        vestingTerms,
        stockLegends,
        valuations
    };
};
exports.readOcfPackage = readOcfPackage;
