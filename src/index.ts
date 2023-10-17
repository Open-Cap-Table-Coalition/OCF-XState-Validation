import * as xstate from 'xstate';
import constants from './constants/constants';
import validators from './validators';
import ocfMachine from './ocfMachine';

import {
  manifest,
  stakeholders,
  stockClasses,
  transactions,
} from './test_data/data';

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

sorted_transactions.forEach((ele: any) => {
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
