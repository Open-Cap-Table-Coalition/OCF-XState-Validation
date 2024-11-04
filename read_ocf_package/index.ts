import * as fs from "fs";
import * as path from "path";
import {
  TX_Equity_Compensation_Exercise,
  TX_Equity_Compensation_Issuance,
  TX_Vesting_Start,
  Valuation,
  VestingTerms,
} from "../types";

export interface OcfPackageContent {
  manifest: any;
  stakeholders: any;
  stockClasses: any;
  transactions: Array<
    | TX_Equity_Compensation_Issuance
    | TX_Vesting_Start
    | TX_Equity_Compensation_Exercise
  >;
  stockLegends: any;
  stockPlans: any;
  vestingTerms: VestingTerms[];
  valuations: Valuation[];
}

interface file {
  filepath: string;
  md5: string;
}

export const readOcfPackage = (packagePath: string): OcfPackageContent => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(packagePath, "Manifest.ocf.json"), "utf8")
  );

  const stakeholders: any[] = [];
  manifest.stakeholders_files.forEach((file: file) => {
    stakeholders.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const stockClasses: any[] = [];
  manifest.stock_classes_files.forEach((file: file) => {
    stockClasses.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const transactions: TX_Equity_Compensation_Issuance[] = [];
  manifest.transactions_files.forEach((file: file) => {
    transactions.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const vestingTerms: VestingTerms[] = [];
  manifest.vesting_terms_files.forEach((file: file) => {
    vestingTerms.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const stockPlans: any[] = [];
  manifest.stock_plans_files.forEach((file: file) => {
    stockPlans.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const stockLegends: any[] = [];
  manifest.stock_legend_templates_files.forEach((file: file) => {
    stockLegends.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });

  const valuations: Valuation[] = [];
  manifest.valuations_files.forEach((file: file) => {
    valuations.push(
      ...JSON.parse(
        fs.readFileSync(path.join(packagePath, file.filepath), "utf8")
      ).items
    );
  });
  return {
    manifest,
    stakeholders,
    stockClasses,
    transactions,
    stockPlans,
    vestingTerms,
    stockLegends,
    valuations,
  };
};
