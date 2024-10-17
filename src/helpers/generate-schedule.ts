/**
 * Use the following command to test:
 * npm run generate-schedule ../test_data/generate-schedule-data.ts '2021-11-15'
 */
const generateSchedule = () => {
  const vesting_schedule_table: any[] = [];

  // 1. Grab the incoming data from the file

  const dataPath = process.argv[2] || '../test_data/generate-schedule-data.ts';
  const {
    equity_compensation_issuance,
    vesting_start,
    vestingTermsData,
    exercise_transactions,
  } = require(dataPath);

  // 2. Initialize the variables to be used in the loop
  let nextVestingCondition: any;
  let totalVested = 0;
  let totalUnvested: any = equity_compensation_issuance.quantity;

  // 3. Initialize the event date and the vesting condition id
  let eventDate = new Date(vesting_start.date);
  let vestingConditionId = vesting_start.vesting_condition_id;

  // 4. Calculate any upfront vesting in the start condition
  vestingTermsData.vesting_conditions.forEach((vestingCondition: any) => {
    if (vestingCondition.id === vestingConditionId) {
      if (vestingCondition.portion.numerator) {
        const amountVested =
          (parseFloat(equity_compensation_issuance.quantity) *
            parseFloat(vestingCondition.portion.numerator)) /
          parseFloat(vestingCondition.portion.denominator);

        totalVested += amountVested;
        totalUnvested -= amountVested;
        vesting_schedule_table.push({
          Date: eventDate.toISOString().split('T')[0],
          'Event Type': 'Vesting Start',
          'Remaining to Vest': totalUnvested,
          'Cumulative Vested': totalVested,
          //'Condition Id': vestingConditionId,
        });
      }
      nextVestingCondition = vestingCondition.next_condition_ids[0];
    }
  });

  // 5. Calculate the vesting schedule for the next condidtion ID
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
                  cumulativePercent *
                    parseFloat(equity_compensation_issuance.quantity)
                );
              } else {
                const lastCumulativePercent =
                  i / vestingCondition.portion.denominator;
                amountVested =
                  Math.ceil(
                    cumulativePercent *
                      parseFloat(equity_compensation_issuance.quantity)
                  ) -
                  Math.ceil(
                    lastCumulativePercent *
                      parseFloat(equity_compensation_issuance.quantity)
                  );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                Date: eventDate.toISOString().split('T')[0],
                'Event Type': 'Vesting',
                'Remaining to Vest': totalUnvested,
                'Cumulative Vested': totalVested,
                //'Condition Id': vestingConditionId,
              });
            } else if (
              vestingTermsData.allocation_type === 'CUMULATIVE_ROUND_DOWN'
            ) {
              const cumulativePercent =
                (i + 1) / vestingCondition.portion.denominator;
              let amountVested = -1;
              if (i === 0) {
                amountVested = Math.floor(
                  cumulativePercent *
                    parseFloat(equity_compensation_issuance.quantity)
                );
              } else {
                const lastCumulativePercent =
                  i / vestingCondition.portion.denominator;
                amountVested =
                  Math.floor(
                    cumulativePercent *
                      parseFloat(equity_compensation_issuance.quantity)
                  ) -
                  Math.floor(
                    lastCumulativePercent *
                      parseFloat(equity_compensation_issuance.quantity)
                  );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                Date: eventDate.toISOString().split('T')[0],

                'Event Type': 'Vesting',
                'Remaining to Vest': totalUnvested,
                'Cumulative Vested': totalVested,
                //'Condition Id': vestingConditionId,
              });
            } else if (vestingTermsData.allocation_type === 'FRONT_LOADED') {
              const remainder =
                parseFloat(equity_compensation_issuance.quantity) %
                vestingCondition.portion.denominator;
              let amountVested = -1;
              if (i < remainder) {
                amountVested = Math.ceil(
                  parseFloat(equity_compensation_issuance.quantity) /
                    vestingCondition.portion.denominator
                );
              } else {
                amountVested = Math.floor(
                  parseFloat(equity_compensation_issuance.quantity) /
                    vestingCondition.portion.denominator
                );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                Date: eventDate.toISOString().split('T')[0],

                'Event Type': 'Vesting',
                'Remaining to Vest': totalUnvested,
                'Cumulative Vested': totalVested,
                //'Condition Id': vestingConditionId,
              });
            } else if (vestingTermsData.allocation_type === 'BACK_LOADED') {
              const remainder =
                parseFloat(equity_compensation_issuance.quantity) %
                vestingCondition.portion.denominator;
              let amountVested = -1;
              if (i < remainder) {
                amountVested = Math.floor(
                  parseFloat(equity_compensation_issuance.quantity) /
                    vestingCondition.portion.denominator
                );
              } else {
                amountVested = Math.ceil(
                  parseFloat(equity_compensation_issuance.quantity) /
                    vestingCondition.portion.denominator
                );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                Date: eventDate.toISOString().split('T')[0],

                'Event Type': 'Vesting',
                'Remaining to Vest': totalUnvested,
                'Cumulative Vested': totalVested,
                //'Condition Id': vestingConditionId,
              });
            } else if (
              vestingTermsData.allocation_type ===
              'FRONT_LOADED_TO_SINGLE_TRANCHE'
            ) {
              const remainder =
                parseFloat(equity_compensation_issuance.quantity) %
                vestingCondition.portion.denominator;
              let amountVested = -1;
              if (i === 0) {
                amountVested =
                  Math.floor(
                    parseFloat(equity_compensation_issuance.quantity) /
                      vestingCondition.portion.denominator
                  ) + remainder;
              } else {
                amountVested = Math.floor(
                  parseFloat(equity_compensation_issuance.quantity) /
                    vestingCondition.portion.denominator
                );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                Date: eventDate.toISOString().split('T')[0],

                'Event Type': 'Vesting',
                'Remaining to Vest': totalUnvested,
                'Cumulative Vested': totalVested,
                //'Condition Id': vestingConditionId,
              });
            } else if (
              vestingTermsData.allocation_type ===
              'BACK_LOADED_TO_SINGLE_TRANCHE'
            ) {
              const remainder =
                parseFloat(equity_compensation_issuance.quantity) %
                vestingCondition.portion.denominator;
              let amountVested = -1;
              if (i === vestingCondition.portion.denominator - 1) {
                amountVested =
                  Math.floor(
                    parseFloat(equity_compensation_issuance.quantity) /
                      vestingCondition.portion.denominator
                  ) + remainder;
              } else {
                amountVested = Math.floor(
                  parseFloat(equity_compensation_issuance.quantity) /
                    vestingCondition.portion.denominator
                );
              }
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                Date: eventDate.toISOString().split('T')[0],

                'Event Type': 'Vesting',
                'Remaining to Vest': totalUnvested,
                'Cumulative Vested': totalVested,
                //'Condition Id': vestingConditionId,
              });
            } else {
              const amountVested =
                (parseFloat(equity_compensation_issuance.quantity) *
                  parseFloat(vestingCondition.portion.numerator)) /
                parseFloat(vestingCondition.portion.denominator);
              totalVested += amountVested;
              totalUnvested -= amountVested;
              vesting_schedule_table.push({
                Date: eventDate.toISOString().split('T')[0],

                'Event Type': 'Vesting',
                'Remaining to Vest': totalUnvested,
                'Cumulative Vested': totalVested,
                //'Condition Id': vestingConditionId,
              });
            }
          }
        }

        // Check if there is a cliff and update the vesting schedule accordingly.
        if (vestingCondition.cliff_condition) {
          for (
            let i = 1;
            i <= vestingCondition.cliff_condition.period.length;
            i++
          ) {
            if (i < vestingCondition.cliff_condition.period.length) {
              vesting_schedule_table.splice(1, 1);
              vesting_schedule_table[1]['Event Type'] = 'Cliff';
            }
          }
        }
      }
      nextVestingCondition = vestingCondition.next_condition_ids[0];
      vestingConditionId = nextVestingCondition;
    }
  });

  // Calculate the exercise transactions and update the vesting schedule accordingly
  if (exercise_transactions.length > 0) {
    const sorted_transactions = exercise_transactions.sort(
      (
        a: {date: string; object_type: string},
        b: {date: string; object_type: string}
      ) => a.date.localeCompare(b.date)
    );

    let cumulativeExercised = 0;
    sorted_transactions.forEach((transaction: any, index: any) => {
      if (
        Date.parse(
          vesting_schedule_table[vesting_schedule_table.length - 1].Date
        ) > Date.parse(transaction.date)
      ) {
        for (let i = 0; i < vesting_schedule_table.length - 1; i++) {
          if (
            Date.parse(vesting_schedule_table[i + 1].Date) <=
              Date.parse(transaction.date) &&
            index === 0
          ) {
            vesting_schedule_table[i]['Amount Exercised'] = 0;
            vesting_schedule_table[i]['Available to Exercise'] =
              vesting_schedule_table[i]['Cumulative Vested'] -
              vesting_schedule_table[i]['Amount Exercised'];
          } else if (
            Date.parse(vesting_schedule_table[i].Date) <=
              Date.parse(transaction.date) &&
            Date.parse(vesting_schedule_table[i + 1].Date) >
              Date.parse(transaction.date) &&
            vesting_schedule_table[i].Event !== 'Exercise'
          ) {
            vesting_schedule_table[i]['Amount Exercised'] = 0;
            vesting_schedule_table[i]['Available to Exercise'] =
              vesting_schedule_table[i]['Cumulative Vested'] -
              cumulativeExercised;
            cumulativeExercised += parseFloat(transaction.quantity);
            vesting_schedule_table.splice(i + 1, 0, {
              Date: transaction.date,
              'Event Type': 'Exercise',
              'Remaining to Vest':
                vesting_schedule_table[i]['Remaining to Vest'],
              'Cumulative Vested':
                vesting_schedule_table[i]['Cumulative Vested'],
              'Amount Exercised': parseFloat(transaction.quantity),
              'Available to Exercise':
                vesting_schedule_table[i]['Cumulative Vested'] -
                cumulativeExercised,
            });
            i++;
          } else if (
            Date.parse(vesting_schedule_table[i].Date) >
              Date.parse(transaction.date) &&
            vesting_schedule_table[i].Event !== 'Exercise'
          ) {
            vesting_schedule_table[i]['Amount Exercised'] = 0;
            vesting_schedule_table[i]['Available to Exercise'] =
              vesting_schedule_table[i]['Cumulative Vested'] -
              cumulativeExercised;
          }
        }
        vesting_schedule_table[vesting_schedule_table.length - 1][
          'Amount Exercised'
        ] = 0;
        vesting_schedule_table[vesting_schedule_table.length - 1][
          'Available to Exercise'
        ] =
          vesting_schedule_table[vesting_schedule_table.length - 1][
            'Cumulative Vested'
          ] - cumulativeExercised;
      } else {
        cumulativeExercised += parseFloat(transaction.quantity);
        vesting_schedule_table.push({
          Date: transaction.date,
          'Event Type': 'Exercise',
          'Remaining to Vest': 0,
          'Cumulative Vested':
            vesting_schedule_table[vesting_schedule_table.length - 1][
              'Cumulative Vested'
            ],
          'Amount Exercised': parseFloat(transaction.quantity),
          'Available to Exercise':
            vesting_schedule_table[vesting_schedule_table.length - 1][
              'Cumulative Vested'
            ] - cumulativeExercised,
        });
      }
    });
  }
  console.table(vesting_schedule_table);

  // If a specific analysis date is provided, calculate the amount vested, unvested, available to exercise, and exercised to date.
  const analysisDate = process.argv[3] ? process.argv[3] : null;

  if (analysisDate) {
    let amountVested = 0;
    let amountUnvested = 0;
    let amountAvailable = 0;
    let amountExercised = 0;
    for (let i = 0; i < vesting_schedule_table.length; i++) {
      if (
        Date.parse(vesting_schedule_table[i].Date) <=
          Date.parse(analysisDate) &&
        Date.parse(vesting_schedule_table[i + 1].Date) >
          Date.parse(analysisDate)
      ) {
        amountVested = vesting_schedule_table[i]['Cumulative Vested'];
        amountUnvested = vesting_schedule_table[i]['Remaining to Vest'];
        amountAvailable = vesting_schedule_table[i]['Available to Exercise'];
        amountExercised = amountVested - amountAvailable;
      }
    }

    console.table([
      {
        'Analysis Date: ': analysisDate,
        'Amount Unvested: ': amountUnvested,
        'Amount Vested to Date: ': amountVested,
        'Amount Exercised to Date: ': amountExercised,
        'Amount Available to Exercise: ': amountAvailable,
      },
    ]);
  }
};

generateSchedule();
