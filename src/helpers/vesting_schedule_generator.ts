// vestingTerms is an array of objects, each object representing a vesting term template. These are the items in the vestingTerms file.
// transactions is an array of objects, each object representing a transaction in the OCF package. These are the items in the transactions file.
// event is an object representing the event data for the equity compensation issuance.

const generate_vesting_schedule = (
  vestingTerms: any,
  transactions: any,
  event: any
) => {
  console.log(event);
  const vesting_schedule_table: any[] = [];

  let vestingTermsData: any;
  vestingTerms.forEach((ele: any) => {
    if (ele.id === event.data.vesting_terms_id) {
      vestingTermsData = ele;
    }
  });

  let nextVestingCondition: any;
  let vestingConditionId: any;
  let eventDate: any;
  let totalVested = 0;
  let totalUnvested = event.data.quantity;

  console.log('Vesting Terms ID: ', vestingTermsData.id);
  transactions.forEach((ele: any) => {
    if (ele.security_id === event.data.security_id) {
      if (ele.object_type === 'TX_VESTING_START') {
        eventDate = new Date(ele.date);
        vestingConditionId = ele.vesting_condition_id;

        vestingTermsData.vesting_conditions.forEach((vestingCondition: any) => {
          if (vestingCondition.id === vestingConditionId) {
            if (vestingCondition.portion.numerator) {
              const amountVested =
                (parseFloat(event.data.quantity) *
                  parseFloat(vestingCondition.portion.numerator)) /
                parseFloat(vestingCondition.portion.denominator);

              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                // Date: new Intl.DateTimeFormat('en-US', {
                //   day: '2-digit',
                //   month: 'short',
                //   year: 'numeric',
                // }).format(eventDate),
                Date: eventDate.toISOString().split('T')[0],
                quantity: amountVested,
                'Cumulative Vested': totalVested,
                'Remaining to Vest': totalUnvested,
                'Condition Id': vestingConditionId,
              });
            }
            nextVestingCondition = vestingCondition.next_condition_ids[0];
          }
        });
      } else if (ele.object_type === 'TX_VESTING_EVENT') {
        eventDate = new Date(ele.date);
        vestingConditionId = ele.vesting_condition_id;
        nextVestingCondition = ele.next_vesting_condition_id;

        vestingTermsData.vesting_conditions.forEach((vestingCondition: any) => {
          if (vestingCondition.id === vestingConditionId) {
            if (vestingCondition.portion.numerator) {
              const amountVested =
                (parseFloat(event.data.quantity) *
                  parseFloat(vestingCondition.portion.numerator)) /
                parseFloat(vestingCondition.portion.denominator);

              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                // Date: new Intl.DateTimeFormat('en-US', {
                //   day: '2-digit',
                //   month: 'short',
                //   year: 'numeric',
                // }).format(eventDate),
                Date: eventDate.toISOString().split('T')[0],
                quantity: amountVested,
                'Cumulative Vested': totalVested,
                'Remaining to Vest': totalUnvested,
                'Condition Id': vestingConditionId,
              });
            }
          }
        });
      }
    }
  });

  vestingConditionId = nextVestingCondition;

  vestingTermsData.vesting_conditions.forEach((vestingCondition: any) => {
    if (vestingCondition.id === vestingConditionId) {
      if (vestingCondition.trigger.type === 'VESTING_SCHEDULE_RELATIVE') {
        for (let i = 0; i < vestingCondition.trigger.period.occurrences; i++) {
          eventDate = new Date(
            eventDate.setMonth(
              eventDate.getMonth() + vestingCondition.trigger.period.length
            )
          );
          if (vestingCondition.portion.numerator) {
            if (vestingTermsData.allocation_type === 'CUMULATIVE_ROUNDING') {
              const cumulativePercent =
                (i + 1) / vestingCondition.portion.denominator;
              let amountVested = -1;
              if (i === 0) {
                amountVested = Math.ceil(
                  cumulativePercent * parseFloat(event.data.quantity)
                );
              } else {
                const lastCumulativePercent =
                  i / vestingCondition.portion.denominator;
                amountVested =
                  Math.ceil(
                    cumulativePercent * parseFloat(event.data.quantity)
                  ) -
                  Math.ceil(
                    lastCumulativePercent * parseFloat(event.data.quantity)
                  );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                // Date: new Intl.DateTimeFormat('en-US', {
                //   day: '2-digit',
                //   month: 'short',
                //   year: 'numeric',
                // }).format(eventDate),
                Date: eventDate.toISOString().split('T')[0],
                quantity: amountVested,
                'Cumulative Vested': totalVested,
                'Remaining to Vest': totalUnvested,
                'Condition Id': vestingConditionId,
              });
            } else if (
              vestingTermsData.allocation_type === 'CUMULATIVE_ROUND_DOWN'
            ) {
              const cumulativePercent =
                (i + 1) / vestingCondition.portion.denominator;
              let amountVested = -1;
              if (i === 0) {
                amountVested = Math.floor(
                  cumulativePercent * parseFloat(event.data.quantity)
                );
              } else {
                const lastCumulativePercent =
                  i / vestingCondition.portion.denominator;
                amountVested =
                  Math.floor(
                    cumulativePercent * parseFloat(event.data.quantity)
                  ) -
                  Math.floor(
                    lastCumulativePercent * parseFloat(event.data.quantity)
                  );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                // Date: new Intl.DateTimeFormat('en-US', {
                //   day: '2-digit',
                //   month: 'short',
                //   year: 'numeric',
                // }).format(eventDate),
                Date: eventDate.toISOString().split('T')[0],
                'Cumulative Vested': totalVested,
                'Remaining to Vest': totalUnvested,
                'Condition Id': vestingConditionId,
              });
            } else if (vestingTermsData.allocation_type === 'FRONT_LOADED') {
              const remainder =
                event.data.quantity % vestingCondition.portion.denominator;
              let amountVested = -1;
              if (i < remainder) {
                amountVested = Math.ceil(
                  event.data.quantity / vestingCondition.portion.denominator
                );
              } else {
                amountVested = Math.floor(
                  event.data.quantity / vestingCondition.portion.denominator
                );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                // Date: new Intl.DateTimeFormat('en-US', {
                //   day: '2-digit',
                //   month: 'short',
                //   year: 'numeric',
                // }).format(eventDate),
                Date: eventDate.toISOString().split('T')[0],
                'Cumulative Vested': totalVested,
                'Remaining to Vest': totalUnvested,
                'Condition Id': vestingConditionId,
              });
            } else if (vestingTermsData.allocation_type === 'BACK_LOADED') {
              const remainder =
                event.data.quantity % vestingCondition.portion.denominator;
              let amountVested = -1;
              if (i < remainder) {
                amountVested = Math.floor(
                  event.data.quantity / vestingCondition.portion.denominator
                );
              } else {
                amountVested = Math.ceil(
                  event.data.quantity / vestingCondition.portion.denominator
                );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                // Date: new Intl.DateTimeFormat('en-US', {
                //   day: '2-digit',
                //   month: 'short',
                //   year: 'numeric',
                // }).format(eventDate),
                Date: eventDate.toISOString().split('T')[0],
                quantity: amountVested,
                'Cumulative Vested': totalVested,
                'Remaining to Vest': totalUnvested,
                'Condition Id': vestingConditionId,
              });
            } else if (
              vestingTermsData.allocation_type ===
              'FRONT_LOADED_TO_SINGLE_TRANCHE'
            ) {
              const remainder =
                event.data.quantity % vestingCondition.portion.denominator;
              let amountVested = -1;
              if (i === 0) {
                amountVested =
                  Math.floor(
                    event.data.quantity / vestingCondition.portion.denominator
                  ) + remainder;
              } else {
                amountVested = Math.floor(
                  event.data.quantity / vestingCondition.portion.denominator
                );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                // Date: new Intl.DateTimeFormat('en-US', {
                //   day: '2-digit',
                //   month: 'short',
                //   year: 'numeric',
                // }).format(eventDate),
                Date: eventDate.toISOString().split('T')[0],
                quantity: amountVested,
                'Cumulative Vested': totalVested,
                'Remaining to Vest': totalUnvested,
                'Condition Id': vestingConditionId,
              });
            } else if (
              vestingTermsData.allocation_type ===
              'BACK_LOADED_TO_SINGLE_TRANCHE'
            ) {
              const remainder =
                event.data.quantity % vestingCondition.portion.denominator;
              let amountVested = -1;
              if (i === vestingCondition.portion.denominator - 1) {
                amountVested =
                  Math.floor(
                    event.data.quantity / vestingCondition.portion.denominator
                  ) + remainder;
              } else {
                amountVested = Math.floor(
                  event.data.quantity / vestingCondition.portion.denominator
                );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                // Date: new Intl.DateTimeFormat('en-US', {
                //   day: '2-digit',
                //   month: 'short',
                //   year: 'numeric',
                // }).format(eventDate),
                Date: eventDate.toISOString().split('T')[0],
                quantity: amountVested,
                'Cumulative Vested': totalVested,
                'Remaining to Vest': totalUnvested,
                'Condition Id': vestingConditionId,
              });
            } else {
              const amountVested =
                (parseFloat(event.data.quantity) *
                  parseFloat(vestingCondition.portion.numerator)) /
                parseFloat(vestingCondition.portion.denominator);
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                // Date: new Intl.DateTimeFormat('en-US', {
                //   day: '2-digit',
                //   month: 'short',
                //   year: 'numeric',
                // }).format(eventDate),
                Date: eventDate.toISOString().split('T')[0],
                quantity: amountVested,
                'Cumulative Vested': totalVested,
                'Remaining to Vest': totalUnvested,
                'Condition Id': vestingConditionId,
              });
            }
          }
        }

        if (vestingCondition.cliff_condition) {
          let cliffAmount = 0;
          vestingTermsData.vesting_conditions.forEach(
            (vestingCliffCondition: any) => {
              if (
                vestingCliffCondition.id === vestingCondition.cliff_condition
              ) {
                for (
                  let i = 1;
                  i <= vestingCliffCondition.trigger.period.length;
                  i++
                ) {
                  if (i < vestingCliffCondition.trigger.period.length) {
                    cliffAmount = vesting_schedule_table[1].quantity;
                    vesting_schedule_table.splice(1, 1);
                    vesting_schedule_table[1].quantity += cliffAmount;
                  }
                }
              }
            }
          );
        }
      }
      nextVestingCondition = vestingCondition.next_condition_ids[0];
      vestingConditionId = nextVestingCondition;
    }
  });

  return vesting_schedule_table;
};

export default generate_vesting_schedule;
