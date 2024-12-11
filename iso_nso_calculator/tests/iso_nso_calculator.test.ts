import { ISOCalculator } from "../../iso_nso_calculator";
// import { ocfPackage as MultipleGrants} from "./multiple-grants";
// import { ocfPackage as FourYearMonthly1YearCliff } from "../../vesting_schedule_generator/tests/testOcfPackages/four-year-monthly-with-1-year-cliff";
import { ocfPackage as FourYearMonthly1YearCliff } from "./4-year-monthly-1-year-cliff";

describe("Four Year Monthly 1 Year Cliff", () => {
  const calculator = new ISOCalculator(FourYearMonthly1YearCliff);
  const results = calculator.execute("HarryPotter");

  const totalSharesUnderlying = FourYearMonthly1YearCliff.transactions.reduce(
    (acc, tx) => {
      if (tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
        return (acc += parseFloat(tx.quantity));
      }
      return acc;
    },
    0
  );

  const totalSharesQuantity = results.reduce((acc, installment) => {
    return (acc += installment.quantity);
  }, 0);

  const totalExercisable = results.reduce((acc, installment) => {
    return (acc += installment.becameExercisable);
  }, 0);

  const totalISOs = results.reduce((acc, installment) => {
    return (acc += installment.ISOShares);
  }, 0);

  const totalNSOs = results.reduce((acc, installment) => {
    return (acc += installment.NSOShares);
  }, 0);

  // const years: number[] = [];
  // results.map((result) => {
  //   if (!years.includes(result.Year)) {
  //     years.push(result.Year);
  //   }
  // });

  // years.forEach((year) => {
  //   const resultsByYear = results.filter((result) => result.Year === year);
  //   console.table(resultsByYear);
  // });

  test("All shares should become exercisable", () => {
    expect(totalExercisable).toEqual(totalSharesUnderlying);
  });

  test("Total ISOs and NSOs should equal total shares", () => {
    expect(totalISOs + totalNSOs).toEqual(totalSharesUnderlying);
  });

  test("In each installment the total of number of ISOs and NSOs should equal the total number of shares that became exercisable", () => {
    const remainder = results.reduce((acc, installment) => {
      const { becameExercisable, ISOShares, NSOShares } = installment;
      const remainder = becameExercisable - ISOShares - NSOShares;
      if (remainder > 0) {
        console.log("remainder:", remainder);
        console.table(installment);
      }
      return (acc += remainder);
    }, 0);

    expect(remainder).toEqual(0);
  });
});

// describe("Multiple Grants", () => {
//   const results = getISONSOSplits("HarryPotter", MultipleGrants);

//   const years: number[] = [];
//   results.map((result) => {
//     if (!years.includes(result.Year)) {
//       years.push(result.Year);
//     }
//   });

//   years.forEach((year) => {
//     const resultsByYear = results.filter((result) => result.Year === year);
//     console.table(resultsByYear);
//   });

//   test("test", () => {
//     expect(true).toBeTruthy();
//   });
// });
