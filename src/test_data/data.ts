import * as fs from 'fs';

export const manifest = JSON.parse(
  fs.readFileSync('./src/test_data/Manifest.ocf.json', 'utf8')
);
export const stakeholders = JSON.parse(
  fs.readFileSync('./src/test_data/Stakeholders.ocf.json', 'utf8')
);
export const stockClasses = JSON.parse(
  fs.readFileSync('./src/test_data/StockClasses.ocf.json', 'utf8')
);
export const transactions = JSON.parse(
  fs.readFileSync('./src/test_data/Transactions.ocf.json', 'utf8')
);
