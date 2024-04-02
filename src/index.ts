import * as xstate from 'xstate';
import constants from './constants/constants';
import ocfMachine from './ocfMachine';

import {manifest, transactions} from './test_data/data';

// Sort the transactions in the file by date and then object type. The idea is that the transactions should be processed based on their date and for any given day, the issuance transactions are processed first so the machine can easily reference them in the current state.
const transaction_types = constants.transaction_types;

const sorted_transactions = transactions.items.sort(
  (
    a: {date: string; object_type: string},
    b: {date: string; object_type: string}
  ) =>
    a.date.localeCompare(b.date) ||
    transaction_types.indexOf(a.object_type) -
      transaction_types.indexOf(b.object_type)
);

// Create xState machine
const promiseMachine = xstate.createMachine<any>(ocfMachine);

const promiseService = xstate.interpret(promiseMachine).onTransition(state => {
  if (state.value === 'validationError') {
    console.log(
      `\n\n\x1b[91mThe validation has stopped because there was an error in the validation of the ${state.event.data.object_type} transaction with id ${state.event.data.id}.\x1b[0m\n\n`
    );
  }
});

// Run interpreter

promiseService.start();

let currentDate: any = null;

// For the sorted transactions, we run through the set of transactions for a given day and then at the end of the day (EOD), we run the EOD action before moving onto the next day in the record.
for (let i = 0; i < sorted_transactions.length; i++) {
  const ele = sorted_transactions[i];
  if (promiseService.getSnapshot().value !== 'validationError') {
    // First determine if the date has changed. If it has, then we run the EOD action and then move onto the next day.
    if (ele.date !== currentDate) {
      if (currentDate === null) {
        console.clear();
        console.log(
          `Starting validation of the OCF package for ${manifest.issuer.legal_name}.\n\n`
        );
        console.log(
          `\x1b[94mStarting analysis of tranascations on ${ele.date}.\x1b[0m`
        );
      } else {
        promiseService.send({type: 'RUN_EOD', date: currentDate});
        console.log(
          `\x1b[94m\nStarting analysis of transactions on ${ele.date}\x1b[0m`
        );
      }
    }
    currentDate = ele.date;
    if (ele.object_type === 'TX_STOCK_ISSUANCE') {
      console.log(
        `\x1b[93m\nAnalyzing stock issuance with id: ${ele.id}.\x1b[0m`
      );
      promiseService.send({type: 'TX_STOCK_ISSUANCE', data: ele});
    } else if (ele.object_type === 'TX_STOCK_TRANSFER') {
      console.log(
        `\x1b[93m\nAnalyzing stock transfer with id: ${ele.id}.\x1b[0m`
      );
      promiseService.send({type: 'TX_STOCK_TRANSFER', data: ele});
    } else if (ele.object_type === 'TX_STOCK_CANCELLATION') {
      console.log(
        `\x1b[93m\nAnalyzing stock cancellation with id: ${ele.id}.\x1b[0m`
      );
      promiseService.send({type: 'TX_STOCK_CANCELLATION', data: ele});
    } else if (ele.object_type === 'TX_STOCK_RETRACTION') {
      promiseService.send({type: 'TX_STOCK_RETRACTION', data: ele});
    } else if (ele.object_type === 'TX_STOCK_ACCEPTANCE') {
      console.log(
        `\x1b[93m\nAnalyzing stock acceptance with id: ${ele.id}.\x1b[0m`
      );
      promiseService.send({type: 'TX_STOCK_ACCEPTANCE', data: ele});
    } else if (ele.object_type === 'TX_STOCK_REISSUANCE') {
      promiseService.send({type: 'TX_STOCK_REISSUANCE', data: ele});
    } else if (ele.object_type === 'TX_STOCK_CONVERSION') {
      promiseService.send({type: 'TX_STOCK_CONVERSION', data: ele});
    } else if (ele.object_type === 'TX_STOCK_REPURCHASE') {
      promiseService.send({type: 'TX_STOCK_REPURCHASE', data: ele});
    }
  } else {
    break;
  }
}

if (promiseService.getSnapshot().value !== 'validationError') {
  promiseService.send({type: 'RUN_EOD', date: currentDate});
  console.log(
    `\x1b[92m\n\nThe validation of the OCF package for ${manifest.issuer.legal_name} is complete and the package appears valid.\x1b[0m\n\n`
  );
}

promiseService.stop();
