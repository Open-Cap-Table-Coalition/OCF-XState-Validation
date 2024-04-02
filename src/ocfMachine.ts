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
              context.stockIssuances.push(event.data);
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_STOCK_TRANSFER: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_transfer,
            actions: (context: any, event: any) => {
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_STOCK_CANCELLATION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_cancellation,
            actions: (context: any, event: any) => {
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_STOCK_RETRACTION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_retraction,
            actions: (context: any, event: any) => {
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_STOCK_ACCEPTANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_acceptance,
            actions: (context: any, event: any) => {
              // context.stockIssuances = context.stockIssuances.filter(
              //   (obj: any) => {
              //     return obj.security_id !== event.data.security_id;
              //   }
              // );
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_STOCK_REISSUANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_reissuance,
            actions: (context: any, event: any) => {
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_STOCK_CONVERSION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_conversion,
            actions: (context: any, event: any) => {
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_STOCK_REPURCHASE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_repurchase,
            actions: (context: any, event: any) => {
              context.stockIssuances = context.stockIssuances.filter(
                (obj: any) => {
                  return obj.security_id !== event.data.security_id;
                }
              );
            },
          },
          {
            target: 'validationError',
          },
        ],
        RUN_EOD: {
          taget: 'capTable',
          actions: (context: any, event: any) => {
            console.log(
              `\x1b[0m\nThe cap table as of the end of day on ${event.date}:\x1b[0m`
            );
            const table: any[] = [];
            context.stockIssuances.forEach((issuance: any) => {
              table.push({
                'Equity type': 'Stock',
                'Custom ID': issuance.custom_id,
                'Equity holder': issuance.stakeholder_id,
                'Stock class': issuance.stock_class_id,
                Quantity: issuance.quantity,
              });
            });
            console.table(table);
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
