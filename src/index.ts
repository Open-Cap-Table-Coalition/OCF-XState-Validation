import * as xstate from 'xstate';
import constants from './constants/constants';
import ocfMachine from './ocfMachine';

import {transactions} from './test_data/data';

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
    console.log('Validation stopped...');
  }
});

// Run interpreter

promiseService.start();

let currentDate: any = null;

// For the sorted transactions, we run through the set of transactions for a given day and then at the end of the day (EOD), we run the EOD action before moving onto the next day in the record.
sorted_transactions.forEach((ele: any) => {
  // First determine if the date has changed. If it has, then we run the EOD action and then move onto the next day.
  if (ele.date !== currentDate) {
    if (currentDate === null) {
      console.log('Start transaction validation...');
    } else {
      promiseService.send({type: 'RUN_EOD', date: currentDate});
    }
  }
  currentDate = ele.date;
  if (ele.object_type === 'TX_STOCK_ISSUANCE') {
    promiseService.send({type: 'TX_STOCK_ISSUANCE', data: ele});
  } else if (ele.object_type === 'TX_STOCK_TRANSFER') {
    promiseService.send({type: 'TX_STOCK_TRANSFER', data: ele});
  } else if (ele.object_type === 'TX_STOCK_CANCELLATION') {
    promiseService.send({type: 'TX_STOCK_CANCELLATION', data: ele});
  } else if (ele.object_type === 'TX_STOCK_RETRACTION') {
    promiseService.send({type: 'TX_STOCK_RETRACTION', data: ele});
  } else if (ele.object_type === 'TX_STOCK_ACCEPTANCE') {
    promiseService.send({type: 'TX_STOCK_ACCEPTANCE', data: ele});
  } else if (ele.object_type === 'TX_STOCK_REISSUANCE') {
    promiseService.send({type: 'TX_STOCK_REISSUANCE', data: ele});
  } else if (ele.object_type === 'TX_STOCK_CONVERSION') {
    promiseService.send({type: 'TX_STOCK_CONVERSION', data: ele});
  } else if (ele.object_type === 'TX_STOCK_REPURCHASE') {
    promiseService.send({type: 'TX_STOCK_REPURCHASE', data: ele});
  }
});

promiseService.send({type: 'RUN_EOD', date: currentDate});

promiseService.stop();
