import * as fs from 'fs';
import * as path from 'path';

export type OcfPackageContent = {
  manifest: any;
  stakeholders: any;
  stockClasses: any;
  transactions: any;
};

type file = {
  filepath: string;
  md5: string;
};

export const readManifest = (manifestPath: string): OcfPackageContent => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const manifestDir = path.dirname(manifestPath);

  const stakeholders: any[] = [];
  manifest.stakeholders_files.forEach((file: file) => {
    stakeholders.push(
      ...JSON.parse(
        fs.readFileSync(path.join(manifestDir, file.filepath), 'utf8')
      ).items
    );
  });

  const stockClasses: any[] = [];
  manifest.stock_classes_files.forEach((file: file) => {
    stockClasses.push(
      ...JSON.parse(
        fs.readFileSync(path.join(manifestDir, file.filepath), 'utf8')
      ).items
    );
  });

  const transactions: any[] = [];
  manifest.transactions_files.forEach((file: file) => {
    transactions.push(
      ...JSON.parse(
        fs.readFileSync(path.join(manifestDir, file.filepath), 'utf8')
      ).items
    );
  });

  return {
    manifest,
    stakeholders,
    stockClasses,
    transactions,
  };
};
