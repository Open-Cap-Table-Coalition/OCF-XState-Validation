import {OcfPackageContent} from './helpers/manifest';
import validators from './validators';

export type OcfMachineContext = {
  stockIssuances: any[];
  optionGrants: any[];
  convertibleIssuances: any[];
  warrantIssuances: any[];
  ocfPackageContent: OcfPackageContent;
};

const ocfMachine: any = {
  predictableActionArguments: true,
  id: 'OCF-xstate',
  initial: 'capTable',
  context: {
    stockIssuances: [],
    optionGrants: [],
    convertibleIssuances: [],
    warrantIssuances: [],
    ocfPackageContent: {},
  },
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
        TX_CONVERTIBLE_ISSUANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_convertible_issuance,
            actions: (context: any, event: any) => {
              context.convertibleIssuances.push(event.data);
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_CONVERTIBLE_RETRACTION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_convertible_retraction,
            actions: (context: any, event: any) => {
              context.convertibleIssuances =
                context.convertibleIssuances.filter((obj: any) => {
                  return obj.security_id !== event.data.security_id;
                });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_CONVERTIBLE_ACCEPTANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_convertible_acceptance,
          },
          {
            target: 'validationError',
          },
        ],
        TX_CONVERTIBLE_CANCELLATION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_convertible_cancellation,
            actions: (context: any, event: any) => {
              context.convertibleIssuances =
                context.convertibleIssuances.filter((obj: any) => {
                  return obj.security_id !== event.data.security_id;
                });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_CONVERTIBLE_TRANSFER: [
          {
            target: 'capTable',
            cond: validators.valid_tx_convertible_transfer,
            actions: (context: any, event: any) => {
              context.convertibleIssuances =
                context.convertibleIssuances.filter((obj: any) => {
                  return obj.security_id !== event.data.security_id;
                });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_CONVERTIBLE_CONVERSION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_convertible_conversion,
            actions: (context: any, event: any) => {
              context.convertibleIssuances =
                context.convertibleIssuances.filter((obj: any) => {
                  return obj.security_id !== event.data.security_id;
                });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_WARRANT_ISSUANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_warrant_issuance,
            actions: (context: any, event: any) => {
              context.warrantIssuances.push(event.data);
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_WARRANT_RETRACTION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_warrant_retraction,
            actions: (context: any, event: any) => {
              context.warrantIssuances = context.warrantIssuances.filter(
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
        TX_WARRANT_ACCEPTANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_warrant_acceptance,
          },
          {
            target: 'validationError',
          },
        ],
        TX_WARRANT_CANCELLATION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_warrant_cancellation,
            actions: (context: any, event: any) => {
              context.warrantIssuances = context.warrantIssuances.filter(
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
        TX_WARRANT_TRANSFER: [
          {
            target: 'capTable',
            cond: validators.valid_tx_warrant_transfer,
            actions: (context: any, event: any) => {
              context.warrantIssuances = context.warrantIssuances.filter(
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
        TX_WARRANT_EXERCISE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_warrant_exercise,
            actions: (context: any, event: any) => {
              context.warrantIssuances = context.warrantIssuances.filter(
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
        TX_EQUITY_COMPENSATION_ISSUANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_equity_compensation_issuance,
            actions: (context: any, event: any) => {
              context.optionGrants.push({
                ...event.data,
                availableToExercise: event.data.quantity,
              });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_EQUITY_COMPENSATION_RETRACTION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_equity_compensation_retraction,
            actions: (context: any, event: any) => {
              context.optionGrants = context.optionGrants.filter((obj: any) => {
                return obj.security_id !== event.data.security_id;
              });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_EQUITY_COMPENSATION_ACCEPTANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_equity_compensation_acceptance,
          },
          {
            target: 'validationError',
          },
        ],
        TX_EQUITY_COMPENSATION_CANCELLATION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_equity_compensation_cancellation,
            actions: (context: any, event: any) => {
              context.optionGrants = context.optionGrants.filter((obj: any) => {
                return obj.security_id !== event.data.security_id;
              });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_EQUITY_COMPENSATION_TRANSFER: [
          {
            target: 'capTable',
            cond: validators.valid_tx_equity_compensation_transfer,
            actions: (context: any, event: any) => {
              context.optionGrants = context.optionGrants.filter((obj: any) => {
                return obj.security_id !== event.data.security_id;
              });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_EQUITY_COMPENSATION_RELEASE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_equity_compensation_release,
            actions: (context: any, event: any) => {
              context.optionGrants = context.optionGrants.filter((obj: any) => {
                return obj.security_id !== event.data.security_id;
              });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_EQUITY_COMPENSATION_EXERCISE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_equity_compensation_exercise,
            actions: (context: any, event: any) => {
              context.optionGrants.map((obj: any, index: any) => {
                if (obj.security_id === event.data.security_id) {
                  context.optionGrants[index].availableToExercise -= parseFloat(
                    event.data.quantity
                  );
                  if (context.optionGrants[index].availableToExercise === 0) {
                    context.optionGrants = context.optionGrants.filter(
                      (obj: any) => {
                        return obj.security_id !== event.data.security_id;
                      }
                    );
                  }
                }
              });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_PLAN_SECURITY_ISSUANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_plan_security_issuance,
            actions: (context: any, event: any) => {
              context.optionGrants.push(event.data);
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_PLAN_SECURITY_RETRACTION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_plan_security_retraction,
            actions: (context: any, event: any) => {
              context.optionGrants = context.optionGrants.filter((obj: any) => {
                return obj.security_id !== event.data.security_id;
              });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_PLAN_SECURITY_ACCEPTANCE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_plan_security_acceptance,
          },
          {
            target: 'validationError',
          },
        ],
        TX_PLAN_SECURITY_CANCELLATION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_plan_security_cancellation,
            actions: (context: any, event: any) => {
              context.optionGrants = context.optionGrants.filter((obj: any) => {
                return obj.security_id !== event.data.security_id;
              });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_PLAN_SECURITY_TRANSFER: [
          {
            target: 'capTable',
            cond: validators.valid_tx_plan_security_transfer,
            actions: (context: any, event: any) => {
              context.optionGrants = context.optionGrants.filter((obj: any) => {
                return obj.security_id !== event.data.security_id;
              });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_PLAN_SECURITY_RELEASE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_plan_security_release,
            actions: (context: any, event: any) => {
              context.optionGrants = context.optionGrants.filter((obj: any) => {
                return obj.security_id !== event.data.security_id;
              });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_PLAN_SECURITY_EXERCISE: [
          {
            target: 'capTable',
            cond: validators.valid_tx_plan_security_exercise,
            actions: (context: any, event: any) => {
              context.optionGrants = context.optionGrants.filter((obj: any) => {
                return obj.security_id !== event.data.security_id;
              });
            },
          },
          {
            target: 'validationError',
          },
        ],
        TX_STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_class_authorized_shares_adjustment,
          },
          {
            target: 'validationError',
          },
        ],
        TX_STOCK_CLASS_CONVERSION_RATIO_ADJUSTMENT: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_class_conversion_ratio_adjustment,
          },
          {
            target: 'validationError',
          },
        ],
        TX_STOCK_CLASS_SPLIT: [
          {
            target: 'capTable',
            cond: validators.valid_tx_stock_class_split,
          },
          {
            target: 'validationError',
          },
        ],
        TX_VESTING_ACCELERATION: [
          {
            target: 'capTable',
            cond: validators.valid_tx_vesting_acceleration,
          },
          {
            target: 'validationError',
          },
        ],
        TX_VESTING_EVENT: [
          {
            target: 'capTable',
            cond: validators.valid_tx_vesting_event,
          },
          {
            target: 'validationError',
          },
        ],
        TX_VESTING_START: [
          {
            target: 'capTable',
            cond: validators.valid_tx_vesting_start,
          },
          {
            target: 'validationError',
          },
        ],
        INVALID_TX: [
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
            const stock_table: any[] = [];
            context.stockIssuances.forEach((issuance: any) => {
              stock_table.push({
                'Equity type': 'Stock',
                'Issue date': issuance.date,
                'Custom ID': issuance.custom_id,
                Stockholder: issuance.stakeholder_id,
                'Stock class': issuance.stock_class_id,
                Quantity: issuance.quantity,
              });
            });
            if (stock_table.length > 0) {
              console.table(stock_table);
            } else {
              console.log('No outstanding stock positions.');
            }
            const convertible_table: any[] = [];
            context.convertibleIssuances.forEach((issuance: any) => {
              convertible_table.push({
                'Equity type': 'Convertible',
                'Custom ID': issuance.custom_id,
                'Convertible holder': issuance.stakeholder_id,
                'Issue Date': issuance.date,
                'Investment Amount': `${issuance.investment_amount.amount} ${issuance.investment_amount.currency}`,
              });
            });
            if (convertible_table.length > 0) {
              console.table(convertible_table);
            } else {
              console.log('No outstanding convertibles.');
            }
            const warrant_table: any[] = [];
            context.warrantIssuances.forEach((issuance: any) => {
              warrant_table.push({
                'Equity type': 'Warrant',
                'Custom ID': issuance.custom_id,
                'Warrant holder': issuance.stakeholder_id,
                'Issue Date': issuance.date,
                'Investment Amount': `${issuance.investment_amount.amount} ${issuance.investment_amount.currency}`,
              });
            });
            if (warrant_table.length > 0) {
              console.table(warrant_table);
            } else {
              console.log('No outstanding warrants.');
            }
            const equity_compensation_table: any[] = [];
            context.optionGrants.forEach((issuance: any) => {
              equity_compensation_table.push({
                'Equity type': 'Equity Compensation',
                'Custom ID': issuance.custom_id,
                'Warrant holder': issuance.stakeholder_id,
                'Issue Date': issuance.date,
                Quantity: `${issuance.quantity}`,
                'Available to Exercise (including unvested)': `${issuance.availableToExercise}`,
              });
            });
            if (equity_compensation_table.length > 0) {
              console.table(equity_compensation_table);
            } else {
              console.log('No outstanding equity compensation.');
            }
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
