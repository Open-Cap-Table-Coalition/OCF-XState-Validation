import * as xstate from 'xstate';
import constants from './constants/constants';
import {readManifest} from './helpers/manifest';
import ocfMachine, {OcfMachineContext} from './ocfMachine';

const manifestPath =
  process.argv[2] || './src/test_data/test_company/Manifest.ocf.json';

const ocfPackageContent = readManifest(manifestPath);

const {manifest, transactions} = ocfPackageContent;

const transaction_types = constants.transaction_types;

// Sort the transactions in the file by date and then object type. The idea is that the transactions should be processed based on their date and for any given day, the issuance transactions are processed first so the machine can easily reference them in the current state.
const sorted_transactions = transactions.sort(
  (
    a: {date: string; object_type: string},
    b: {date: string; object_type: string}
  ) =>
    a.date.localeCompare(b.date) ||
    transaction_types.indexOf(a.object_type) -
      transaction_types.indexOf(b.object_type)
);

// Create xState machine
const promiseMachine = xstate
  .createMachine<OcfMachineContext>(ocfMachine)
  .withContext({
    stockIssuances: [],
    optionGrants: [],
    convertibleIssuances: [],
    warrantIssuances: [],
    ocfPackageContent: ocfPackageContent,
  });

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
    switch (ele.object_type) {
      case 'TX_STOCK_ISSUANCE':
        console.log(
          `\x1b[93m\nAnalyzing stock issuance with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_STOCK_ISSUANCE', data: ele});
        break;
      case 'TX_STOCK_RETRACTION':
        console.log(
          `\x1b[93m\nAnalyzing stock retraction with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_STOCK_RETRACTION', data: ele});
        break;
      case 'TX_STOCK_ACCEPTANCE':
        console.log(
          `\x1b[93m\nAnalyzing stock acceptance with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_STOCK_ACCEPTANCE', data: ele});
        break;
      case 'TX_STOCK_CANCELLATION':
        console.log(
          `\x1b[93m\nAnalyzing stock cancellation with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_STOCK_CANCELLATION', data: ele});
        break;
      case 'TX_STOCK_CONVERSION':
        console.log(
          `\x1b[93m\nAnalyzing stock conversion with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_STOCK_CONVERSION', data: ele});
        break;
      case 'TX_STOCK_REISSUANCE':
        console.log(
          `\x1b[93m\nAnalyzing stock reissuance with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_STOCK_REISSUANCE', data: ele});
        break;
      case 'TX_STOCK_REPURCHASE':
        console.log(
          `\x1b[93m\nAnalyzing stock repurchase with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_STOCK_REPURCHASE', data: ele});
        break;
      case 'TX_STOCK_TRANSFER':
        console.log(
          `\x1b[93m\nAnalyzing stock transfer with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_STOCK_TRANSFER', data: ele});
        break;
      case 'TX_CONVERTIBLE_ISSUANCE':
        console.log(
          `\x1b[93m\nAnalyzing convertible issuance with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_CONVERTIBLE_ISSUANCE', data: ele});
        break;
      case 'TX_CONVERTIBLE_RETRACTION':
        console.log(
          `\x1b[93m\nAnalyzing convertible retraction with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_CONVERTIBLE_RETRACTION', data: ele});
        break;
      case 'TX_CONVERTIBLE_ACCEPTANCE':
        console.log(
          `\x1b[93m\nAnalyzing convertible acceptance with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_CONVERTIBLE_ACCEPTANCE', data: ele});
        break;
      case 'TX_CONVERTIBLE_CANCELLATION':
        console.log(
          `\x1b[93m\nAnalyzing convertible cancellation with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_CONVERTIBLE_CANCELLATION', data: ele});
        break;
      case 'TX_CONVERTIBLE_TRANSFER':
        console.log(
          `\x1b[93m\nAnalyzing convertible transfer with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_CONVERTIBLE_TRANSFER', data: ele});
        break;
      case 'TX_CONVERTIBLE_CONVERSION':
        console.log(
          `\x1b[93m\nAnalyzing convertible conversion with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_CONVERTIBLE_CONVERSION', data: ele});
        break;
      case 'TX_WARRANT_ISSUANCE':
        console.log(
          `\x1b[93m\nAnalyzing warrant issuance with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_WARRANT_ISSUANCE', data: ele});
        break;
      case 'TX_WARRANT_RETRACTION':
        console.log(
          `\x1b[93m\nAnalyzing warrant retraction with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_WARRANT_RETRACTION', data: ele});
        break;
      case 'TX_WARRANT_ACCEPTANCE':
        console.log(
          `\x1b[93m\nAnalyzing warrant acceptance with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_WARRANT_ACCEPTANCE', data: ele});
        break;
      case 'TX_WARRANT_CANCELLATION':
        console.log(
          `\x1b[93m\nAnalyzing warrant cancellation with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_WARRANT_CANCELLATION', data: ele});
        break;
      case 'TX_WARRANT_TRANSFER':
        console.log(
          `\x1b[93m\nAnalyzing warrant transfer with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_WARRANT_TRANSFER', data: ele});
        break;
      case 'TX_WARRANT_EXERCISE':
        console.log(
          `\x1b[93m\nAnalyzing warrant conversion with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_WARRANT_EXERCISE', data: ele});
        break;
      case 'TX_STOCK_CLASS_CONVERSION_RATIO_ADJUSTMENT':
        console.log(
          `\x1b[93m\nAnalyzing stock class conversion ratio adjustment with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_STOCK_CLASS_CONVERSION_RATIO_ADJUSTMENT',
          data: ele,
        });
        break;
      case 'TX_STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT':
        console.log(
          `\x1b[93m\nAnalyzing stock class authoriszed shares adjustment with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT',
          data: ele,
        });
        break;
      case 'TX_STOCK_CLASS_SPLIT':
        console.log(
          `\x1b[93m\nAnalyzing stock class split with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_STOCK_CLASS_SPLIT', data: ele});
        break;
      case 'TX_STOCK_PLAN_POOL_ADJUSTMENT':
        console.log(
          `\x1b[93m\nAnalyzing stock plan pool adjustment with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_STOCK_PLAN_POOL_ADJUSTMENT', data: ele});
        break;
      case 'TX_STOCK_PLAN_RETURN_TO_POOL':
        console.log(
          `\x1b[93m\nAnalyzing stock plan return to pool with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_STOCK_PLAN_RETURN_TO_POOL', data: ele});
        break;
      case 'TX_VESTING_ACCELERATION':
        console.log(
          `\x1b[93m\nAnalyzing vesting acceleration event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_VESTING_ACCELERATION', data: ele});
        break;
      case 'TX_VESTING_START':
        console.log(
          `\x1b[93m\nAnalyzing vesting start event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_VESTING_START', data: ele});
        break;
      case 'TX_VESTING_EVENT':
        console.log(
          `\x1b[93m\nAnalyzing vesting event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({type: 'TX_VESTING_EVENT', data: ele});
        break;
      case 'TX_EQUITY_COMPENSATION_ISSUANCE':
        console.log(
          `\x1b[93m\nAnalyzing equity compensation issuance event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_EQUITY_COMPENSATION_ISSUANCE',
          data: ele,
        });
        break;
      case 'TX_EQUITY_COMPENSATION_RETRACTION':
        console.log(
          `\x1b[93m\nAnalyzing equity compensation retraction event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_EQUITY_COMPENSATION_RETRACTION',
          data: ele,
        });
        break;
      case 'TX_EQUITY_COMPENSATION_ACCEPTANCE':
        console.log(
          `\x1b[93m\nAnalyzing equity compensation acceptance event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_EQUITY_COMPENSATION_ACCEPTANCE',
          data: ele,
        });
        break;
      case 'TX_EQUITY_COMPENSATION_CANCELLATION':
        console.log(
          `\x1b[93m\nAnalyzing equity compensation cancellation event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_EQUITY_COMPENSATION_CANCELLATION',
          data: ele,
        });
        break;
      case 'TX_EQUITY_COMPENSATION_RELEASE':
        console.log(
          `\x1b[93m\nAnalyzing equity compensation release event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_EQUITY_COMPENSATION_RELEASE',
          data: ele,
        });
        break;
      case 'TX_EQUITY_COMPENSATION_TRANSFER':
        console.log(
          `\x1b[93m\nAnalyzing equity compensation transfer event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_EQUITY_COMPENSATION_TRANSFER',
          data: ele,
        });
        break;
      case 'TX_EQUITY_COMPENSATION_EXERCISE':
        console.log(
          `\x1b[93m\nAnalyzing equity compensation exercise event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_EQUITY_COMPENSATION_EXERCISE',
          data: ele,
        });
        break;
      case 'TX_PLAN_SECURITY_ISSUANCE':
        console.log(
          `\x1b[93m\nAnalyzing plan security issuance event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_PLAN_SECURITY_ISSUANCE',
          data: ele,
        });
        break;
      case 'TX_PLAN_SECURITY_RETRACTION':
        console.log(
          `\x1b[93m\nAnalyzing plan security retraction event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_PLAN_SECURITY_RETRACTION',
          data: ele,
        });
        break;
      case 'TX_PLAN_SECURITY_ACCEPTANCE':
        console.log(
          `\x1b[93m\nAnalyzing plan security acceptance event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_PLAN_SECURITY_ACCEPTANCE',
          data: ele,
        });
        break;
      case 'TX_PLAN_SECURITY_CANCELLATION':
        console.log(
          `\x1b[93m\nAnalyzing plan security cancellation event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_PLAN_SECURITY_CANCELLATION',
          data: ele,
        });
        break;
      case 'TX_PLAN_SECURITY_RELEASE':
        console.log(
          `\x1b[93m\nAnalyzing plan security release event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_PLAN_SECURITY_RELEASE',
          data: ele,
        });
        break;
      case 'TX_PLAN_SECURITY_TRANSFER':
        console.log(
          `\x1b[93m\nAnalyzing plan security transfer event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_PLAN_SECURITY_TRANSFER',
          data: ele,
        });
        break;
      case 'TX_PLAN_SECURITY_EXERCISE':
        console.log(
          `\x1b[93m\nAnalyzing plan security exercise event with id: ${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'TX_PLAN_SECURITY_EXERCISE',
          data: ele,
        });
        break;
      default:
        console.log(
          `\x1b[91m\u2718 ${ele.object_type} is not a valid transaction type for OCF. id:${ele.id}\x1b[0m`
        );
        promiseService.send({
          type: 'INVALID_TX',
          data: ele,
        });
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
