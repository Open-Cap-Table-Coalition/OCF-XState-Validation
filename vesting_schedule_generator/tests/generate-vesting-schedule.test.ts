import { isBefore, parse } from "date-fns";
import { generateVestingSchedule } from "..";
import { ocfPackage as FourYearMonthltyWithOneYearCliff } from "./testOcfPackages/four-year-monthly-with-1-year-cliff";
import { ocfPackage as GrantDateAfterCliff } from "./testOcfPackages/grant-date-after-cliff";
import { ocfPackage as GrantDateAfterVCDNoCliff } from "./testOcfPackages/grant-date-after-VCD-and-no-cliff";
import { ocfPackage as VestedOnGrantDate } from "./testOcfPackages/vested-on-grant-date";
import { ocfPackage as VestingsProvided } from "./testOcfPackages/vestings-provided";
import { ocfPackage as InterdependentEventsWithExpirationDates } from "./testOcfPackages/interdependent-events-with-expiration-dates";
import type { TX_Vesting_Event } from "types";
import { ocfPackage as EventWithExpirationDate } from "./testOcfPackages/event-with-expiration-date";
import { OcfPackageContent } from "../../read_ocf_package";
import { ocfPackage as TwoTierVesting } from "./testOcfPackages/two-tier-vesting";

/******************************
 * 4 year monthly with one year cliff
 ******************************/
describe("4 year monthly with one year cliff", () => {
  const ocfPackage = FourYearMonthltyWithOneYearCliff;

  const fullSchedule = generateVestingSchedule(
    ocfPackage,
    "equity_compensation_issuance_01"
  );

  const totalSharesUnderlying = ocfPackage.transactions.reduce((acc, tx) => {
    if (tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
      return (acc += parseFloat(tx.quantity));
    }
    return acc;
  }, 0);

  test("The total shares underlying should equal 4800", () => {
    expect(totalSharesUnderlying).toEqual(4800);
  });

  test("Final total vested should equal the total shares underyling", () => {
    const totalVested = fullSchedule.reduce((acc, installment) => {
      return (acc += installment.quantity);
    }, 0);

    expect(totalVested).toEqual(totalSharesUnderlying);
  });

  test("Should not have a vesting event before 2025-06-01", () => {
    const vestingEventBeforeCliff = fullSchedule.find(
      (installment) =>
        isBefore(
          installment.date,
          parse("2025-06-01", "yyyy-MM-dd", new Date())
        ) && installment.quantity > 0
    );
    expect(vestingEventBeforeCliff).toBeUndefined();
  });

  test("Last vesting date should be 2028-06-01", () => {
    const lastDate = fullSchedule[fullSchedule.length - 1].date;
    expect(lastDate).toStrictEqual(
      parse("2028-06-01", "yyyy-MM-dd", new Date())
    );
  });

  test("37 vesting installments in total", () => {
    const installmentsWithVesting = fullSchedule.reduce((acc, installment) => {
      if (installment.quantity > 0) {
        return (acc += 1);
      }
      return acc;
    }, 0);

    expect(installmentsWithVesting).toEqual(37);
  });
});

/******************************
 * Grant Date After Cliff
 ******************************/

describe("Grant Date After Cliff", () => {
  const fullSchedule = generateVestingSchedule(
    GrantDateAfterCliff,
    "equity_compensation_issuance_01"
  );

  const totalSharesUnderlying = GrantDateAfterCliff.transactions.reduce(
    (acc, tx) => {
      if (tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
        return (acc += parseFloat(tx.quantity));
      }
      return acc;
    },
    0
  );

  test("The total shares underlying should equal 4800", () => {
    expect(totalSharesUnderlying).toEqual(4800);
  });

  test("Final total vested should equal the total shares underyling", () => {
    const totalVested = fullSchedule.reduce((acc, installment) => {
      return (acc += installment.quantity);
    }, 0);

    expect(totalVested).toEqual(totalSharesUnderlying);
  });

  test("Should not have a vesting event before 2025-08-01", () => {
    const vestingEventBeforeCliff = fullSchedule.find(
      (installment) =>
        isBefore(
          installment.date,
          parse("2025-08-01", "yyyy-MM-dd", new Date())
        ) && installment.quantity > 0
    );
    expect(vestingEventBeforeCliff).toBeUndefined();
  });

  test("Last vesting date should be 2028-06-01", () => {
    const lastDate = fullSchedule[fullSchedule.length - 1].date;
    expect(lastDate).toStrictEqual(
      parse("2028-06-01", "yyyy-MM-dd", new Date())
    );
  });
});

/******************************
 * Grant Date After VCD and No Cliff
 ******************************/

describe("Grant Date After VCD no cliff", () => {
  const fullSchedule = generateVestingSchedule(
    GrantDateAfterVCDNoCliff,
    "equity_compensation_issuance_01"
  );

  const totalSharesUnderlying = GrantDateAfterCliff.transactions.reduce(
    (acc, tx) => {
      if (tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
        return (acc += parseFloat(tx.quantity));
      }
      return acc;
    },
    0
  );

  test("The total shares underlying should equal 4800", () => {
    expect(totalSharesUnderlying).toEqual(4800);
  });

  test("Final total vested should equal the total shares underyling", () => {
    const totalVested = fullSchedule.reduce((acc, installment) => {
      return (acc += installment.quantity);
    }, 0);

    expect(totalVested).toEqual(totalSharesUnderlying);
  });

  test("Should not have a vesting event before 2025-08-05", () => {
    const vestingEventBeforeCliff = fullSchedule.find(
      (installment) =>
        isBefore(
          installment.date,
          parse("2025-08-05", "yyyy-MM-dd", new Date())
        ) && installment.quantity > 0
    );
    expect(vestingEventBeforeCliff).toBeUndefined();
  });

  test("Last vesting date should be 2028-06-01", () => {
    const lastDate = fullSchedule[fullSchedule.length - 1].date;
    expect(lastDate).toStrictEqual(
      parse("2028-06-01", "yyyy-MM-dd", new Date())
    );
  });
});

/******************************
 * Vested On Grant Date
 ******************************/

describe("Vested On Grant Date", () => {
  const fullSchedule = generateVestingSchedule(
    VestedOnGrantDate,
    "equity_compensation_issuance_01"
  );

  const totalSharesUnderlying = VestedOnGrantDate.transactions.reduce(
    (acc, tx) => {
      if (tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
        return (acc += parseFloat(tx.quantity));
      }
      return acc;
    },
    0
  );

  test("The total shares underlying should equal 4800", () => {
    expect(totalSharesUnderlying).toEqual(4800);
  });

  test("Final total vested should equal the total shares underyling", () => {
    const totalVested = fullSchedule.reduce((acc, installment) => {
      return (acc += installment.quantity);
    }, 0);

    expect(totalVested).toEqual(totalSharesUnderlying);
  });

  test("Should have a single vesting event on 2024-06-01", () => {
    expect(fullSchedule.length).toEqual(1);
    expect(fullSchedule[0].date).toStrictEqual(
      parse("2024-06-01", "yyyy-MM-dd", new Date())
    );
  });
});

/******************************
 * Vestings Provided
 ******************************/

describe("Vestings Provided", () => {
  const fullSchedule = generateVestingSchedule(
    VestingsProvided,
    "equity_compensation_issuance_01"
  );

  const totalSharesUnderlying = VestingsProvided.transactions.reduce(
    (acc, tx) => {
      if (tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
        return (acc += parseFloat(tx.quantity));
      }
      return acc;
    },
    0
  );

  test("The total shares underlying should equal 4800", () => {
    expect(totalSharesUnderlying).toEqual(4800);
  });

  test("Final total vested should equal the total shares underyling", () => {
    const totalVested = fullSchedule.reduce((acc, installment) => {
      return (acc += installment.quantity);
    }, 0);

    expect(totalVested).toEqual(totalSharesUnderlying);
  });

  test("Should not have a vesting event before 2025-03-01", () => {
    const vestingEventBeforeCliff = fullSchedule.find(
      (installment) =>
        isBefore(
          installment.date,
          parse("2025-03-01", "yyyy-MM-dd", new Date())
        ) && installment.quantity > 0
    );
    expect(vestingEventBeforeCliff).toBeUndefined();
  });

  test("Last vesting date should be 2025-04-01", () => {
    const lastDate = fullSchedule[fullSchedule.length - 1].date;
    expect(lastDate).toStrictEqual(
      parse("2025-04-01", "yyyy-MM-dd", new Date())
    );
  });
});

/******************************
 * Event With Expiration Date
 ******************************/

describe("Event With Expiration Date", () => {
  describe("Event occurs before expiration", () => {
    const event_A: TX_Vesting_Event = {
      id: "event-A",
      object_type: "TX_VESTING_EVENT",
      date: "2025-07-01",
      security_id: "equity_compensation_issuance_01",
      vesting_condition_id: "event_condition_A",
    };

    const ocfPackage: OcfPackageContent = {
      ...EventWithExpirationDate,
    };

    ocfPackage.transactions.push(event_A);

    const schedule = generateVestingSchedule(
      ocfPackage,
      "equity_compensation_issuance_01"
    );

    const totalSharesUnderlying = ocfPackage.transactions.reduce((acc, tx) => {
      if (tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
        return (acc += parseFloat(tx.quantity));
      }
      return acc;
    }, 0);

    test("The total shares underlying should equal 4800", () => {
      expect(totalSharesUnderlying).toEqual(4800);
    });

    test("Final total vested should equal the total shares underyling", () => {
      const totalVested = schedule.reduce((acc, installment) => {
        return (acc += installment.quantity);
      }, 0);

      expect(totalVested).toEqual(totalSharesUnderlying);
    });

    test("There should be a single vesting installment", () => {
      const installmentCount = schedule.reduce((acc, installment) => {
        if (installment.quantity > 0) {
          return (acc += 1);
        }
        return acc;
      }, 0);
      expect(installmentCount).toEqual(1);
    });

    test("Vesting should occur on the date of the event", () => {
      const vestingDate = schedule[schedule.length - 1].date;
      expect(vestingDate).toStrictEqual(
        parse(event_A.date, "yyyy-MM-dd", new Date())
      );
    });
  });
});

/*********************************************
 * Interdependent Events With Expiration Dates
 *********************************************/

describe("interdependent events with expiration dates", () => {
  describe("Event A occurs before expiration, Event B expires", () => {
    const event_A_Transaction: TX_Vesting_Event = {
      object_type: "TX_VESTING_EVENT",
      id: "eci_vs_01",
      security_id: "equity_compensation_issuance_01",
      vesting_condition_id: "event_condition_A",
      date: "2025-07-01",
    };

    const ocfPackage: OcfPackageContent = {
      ...InterdependentEventsWithExpirationDates,
      transactions: [
        ...InterdependentEventsWithExpirationDates.transactions,
        event_A_Transaction,
      ],
    };

    const schedule = generateVestingSchedule(
      ocfPackage,
      "equity_compensation_issuance_01"
    );

    const totalSharesUnderlying = ocfPackage.transactions.reduce((acc, tx) => {
      if (tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
        return (acc += parseFloat(tx.quantity));
      }
      return acc;
    }, 0);

    test("The total shares underlying should equal 4800", () => {
      expect(totalSharesUnderlying).toEqual(4800);
    });

    test("1/4 of the shares should vest", () => {
      expect(schedule[0].quantity).toEqual(totalSharesUnderlying / 4);
    });

    test("There should be a single vesting installment", () => {
      expect(schedule.length).toEqual(1);
    });

    test("Vesting should occur on the date event B expires", () => {
      expect(schedule[0].date).toStrictEqual(
        parse("2027-01-01", "yyyy-MM-dd", new Date())
      );
    });
  });

  describe("Event A occurs before expiration, Event B occurs before expiration", () => {
    const event_A_Transaction: TX_Vesting_Event = {
      object_type: "TX_VESTING_EVENT",
      id: "eci_vs_01",
      security_id: "equity_compensation_issuance_01",
      vesting_condition_id: "event_condition_A",
      date: "2025-07-01",
    };

    const event_B_Transaction: TX_Vesting_Event = {
      object_type: "TX_VESTING_EVENT",
      id: "eci_vs_01",
      security_id: "equity_compensation_issuance_01",
      vesting_condition_id: "event_condition_B",
      date: "2026-07-01",
    };

    const ocfPackage: OcfPackageContent = {
      ...InterdependentEventsWithExpirationDates,
      transactions: [
        ...InterdependentEventsWithExpirationDates.transactions,
        event_A_Transaction,
        event_B_Transaction,
      ],
    };
    const schedule = generateVestingSchedule(
      ocfPackage,
      "equity_compensation_issuance_01"
    );

    const totalSharesUnderlying = ocfPackage.transactions.reduce((acc, tx) => {
      if (tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
        return (acc += parseFloat(tx.quantity));
      }
      return acc;
    }, 0);

    test("The total shares underlying should equal 4800", () => {
      expect(totalSharesUnderlying).toEqual(4800);
    });

    test("all of the underlying shares should vest", () => {
      expect(schedule[0].quantity).toEqual(totalSharesUnderlying);
    });

    test("There should be a single vesting installment", () => {
      expect(schedule.length).toEqual(1);
    });

    test("Vesting should occur on the date event B occurs", () => {
      expect(schedule[0].date).toStrictEqual(
        parse("2026-07-01", "yyyy-MM-dd", new Date())
      );
    });
  });

  describe("Event A expires, Event B occurs before expiration", () => {
    const event_B_Transaction: TX_Vesting_Event = {
      object_type: "TX_VESTING_EVENT",
      id: "eci_vs_01",
      security_id: "equity_compensation_issuance_01",
      vesting_condition_id: "event_condition_B",
      date: "2026-07-01",
    };

    const ocfPackage: OcfPackageContent = {
      ...InterdependentEventsWithExpirationDates,
      transactions: [
        ...InterdependentEventsWithExpirationDates.transactions,
        event_B_Transaction,
      ],
    };

    const schedule = generateVestingSchedule(
      ocfPackage,
      "equity_compensation_issuance_01"
    );

    const totalSharesUnderlying = ocfPackage.transactions.reduce((acc, tx) => {
      if (tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
        return (acc += parseFloat(tx.quantity));
      }
      return acc;
    }, 0);

    test("The total shares underlying should equal 4800", () => {
      expect(totalSharesUnderlying).toEqual(4800);
    });

    test("3/4 of the underlying shares should vest", () => {
      expect(schedule[0].quantity).toEqual(totalSharesUnderlying * (3 / 4));
    });

    test("There should be a single vesting installment", () => {
      expect(schedule.length).toEqual(1);
    });

    test("Vesting should occur on the date event B occurs", () => {
      expect(schedule[0].date).toStrictEqual(
        parse("2026-07-01", "yyyy-MM-dd", new Date())
      );
    });
  });

  describe("Neither event occurs before expiration", () => {
    const ocfPackage: OcfPackageContent = {
      ...InterdependentEventsWithExpirationDates,
    };
    const schedule = generateVestingSchedule(
      ocfPackage,
      "equity_compensation_issuance_01"
    );

    test("none of the underlying shares should vest", () => {
      expect(schedule.length).toEqual(1);
      expect(schedule[0].quantity).toEqual(0);
    });
  });
});

describe("two-tier-vesting", () => {
  const ocfPackage: OcfPackageContent = {
    ...TwoTierVesting,
  };

  const schedule = generateVestingSchedule(
    ocfPackage,
    "equity_compensation_issuance_01"
  );

  const totalSharesUnderlying = ocfPackage.transactions.reduce((acc, tx) => {
    if (tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE") {
      return (acc += parseFloat(tx.quantity));
    }
    return acc;
  }, 0);

  test("The total shares underlying should equal 4800", () => {
    expect(totalSharesUnderlying).toEqual(4800);
  });

  test("all of the underlying shares should vest", () => {
    const totalVested = schedule.reduce((acc, installment) => {
      return (acc += installment.quantity);
    }, 0);

    expect(totalVested).toEqual(totalSharesUnderlying);
  });

  test("The first vesting should occur on the date event A occurs", () => {
    const firstVestingInstallment = schedule.findIndex(
      (installment) => installment.quantity > 0
    );

    expect(schedule[firstVestingInstallment].date).toStrictEqual(
      parse("2027-01-01", "yyyy-MM-dd", new Date())
    );
  });
});
