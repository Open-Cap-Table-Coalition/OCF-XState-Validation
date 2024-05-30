# This is the main repository for the OCF-XState-Validation project.

Run `npm install` to install dependencies.

This project is a work-in-progress.

The goal of this project is to create the tooling to logically and structually validate an OCF package using xstate. A side-product of this process is that the xstate machince will hopefully be able to create end-of-day (EOD) snapshots from an OCF package.

To run the project, you can use the command `npm start` to run `src/index.ts`.

To run the validator for a specific manifest run the command with the path to the manifest as an argument. Example:
`npm start ./src/test_data/company_valid/manifest.ocf.json`


The system takes the desired ocf package (located in `src/test_data`) and runs it through an xstate machine (located at `src/ocfMachine.ts`) and applies the validators for OCF transactions located in the `src/validators` folder.

As of Oct 17, 2023, the ocfMachine only checks stock related transactions and the validators for 'tx_stock_issuance', 'tx_stock_transfer', and 'tx_stock_cancellation' have been partially implemented. (All other validators are just placeholder code).

Work needs to be done to update each individual validator function and to add the non-stock related transactions to the state machine. Additionally, more robust test_data could be developed to include all transaction types.

