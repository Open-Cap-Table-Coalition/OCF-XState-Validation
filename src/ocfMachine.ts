import validators from './validators';

const ocfMachine: any = {
  predictableActionArguments: true,
  id: 'OCF-xstate',
  initial: 'capTable',
  context: {stockIssuances: []},
  states: {
    capTable: {
      on: {
        TX_STOCK_ISSUANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_issuance,
            actions: (context: any, event: any) => {
              console.log(`TX_STOCK_ISSUANCE ${event.data.id} is valid`);
              context.stockIssuances.push(event.data);
            },
          },
          {
            target: 'validationError',
            actions: (context: any, event: any) => {
              console.log(`Error validating ${event.data.security_id}`);
            },
          },
        ],
        TX_STOCK_TRANSFER: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_transfer,
            actions: (context: any, event: any) => {
              console.log(`TX_STOCK_TRANSFER ${event.data.id} is valid`);
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
            actions: (context: any, event: any) => {
              console.log(
                `Error validating ${event.data.object_type} with id: ${event.data.id}`
              );
            },
          },
        ],
        TX_STOCK_CANCELLATION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_cancellation,
            actions: (context: any, event: any) => {
              console.log(`TX_STOCK_CANCELLATION ${event.data.id} is valid`);
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
            actions: (context: any, event: any) => {
              console.log(
                `Error validating ${event.data.object_type} with id: ${event.data.id}`
              );
            },
          },
        ],
        TX_STOCK_RETRACTION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_retraction,
            actions: (context: any, event: any) => {
              console.log(`TX_STOCK_RETRACTION ${event.data.id} is valid`);
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
            actions: (context: any, event: any) => {
              console.log(
                `Error validating ${event.data.object_type} with id: ${event.data.id}`
              );
            },
          },
        ],
        TX_STOCK_ACCEPTANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_acceptance,
            actions: (context: any, event: any) => {
              console.log(`TX_STOCK_ACCEPTANCE ${event.data.id} is valid`);
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
            actions: (context: any, event: any) => {
              console.log(
                `Error validating ${event.data.object_type} with id: ${event.data.id}`
              );
            },
          },
        ],
        TX_STOCK_REISSUANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_reissuance,
            actions: (context: any, event: any) => {
              console.log(`TX_STOCK_REISSUANCE ${event.data.id} is valid`);
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
            actions: (context: any, event: any) => {
              console.log(
                `Error validating ${event.data.object_type} with id: ${event.data.id}`
              );
            },
          },
        ],
        TX_STOCK_CONVERSION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_conversion,
            actions: (context: any, event: any) => {
              console.log(`TX_STOCK_CONVERSION ${event.data.id} is valid`);
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
            actions: (context: any, event: any) => {
              console.log(
                `Error validating ${event.data.object_type} with id: ${event.data.id}`
              );
            },
          },
        ],
        TX_STOCK_REPURCHASE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_repurchase,
            actions: (context: any, event: any) => {
              console.log(`TX_STOCK_REPURCHASE ${event.data.id} is valid`);
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
            actions: (context: any, event: any) => {
              console.log(
                `Error validating ${event.data.object_type} with id: ${event.data.id}`
              );
            },
          },
        ],
        RUN_EOD: {
          taget: 'capTable',
          actions: (context: any, event: any) => {
            console.log(`Cap table as of end of day on ${event.date}:`);
            console.log(context.stockIssuances);
          },
        },
      },
    },
    validationError: {
      type: 'final',
    },
  },
};

export default ocfMachine;
