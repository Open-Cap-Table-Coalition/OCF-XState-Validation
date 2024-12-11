import { determineVestingMode } from "../create_installment/rounding_service";

const vestingSchedule = [4.5, 4.5, 4.5, 4.5];

describe("rounding service", () => {
  test("Cumulative Rounding", () => {
    const vestingMode = determineVestingMode("CUMULATIVE_ROUNDING");

    const newVestingSchedule = vestingSchedule.map((installment, index) => {
      return vestingMode(index, 4, 18);
    });

    const expected = [5, 4, 5, 4];

    expect(newVestingSchedule).toEqual(expected);
  });

  test("Cumulative Round Down", () => {
    const vestingMode = determineVestingMode("CUMULATIVE_ROUND_DOWN");

    const newVestingSchedule = vestingSchedule.map((installment, index) => {
      return vestingMode(index, 4, 18);
    });

    const expected = [4, 5, 4, 5];

    expect(newVestingSchedule).toEqual(expected);
  });

  test("Front Loaded", () => {
    const vestingMode = determineVestingMode("FRONT_LOADED");

    const newVestingSchedule = vestingSchedule.map((installment, index) => {
      return vestingMode(index, 4, 18);
    });

    const expected = [5, 5, 4, 4];

    expect(newVestingSchedule).toEqual(expected);
  });

  test("Back Loaded", () => {
    const vestingMode = determineVestingMode("BACK_LOADED");

    const newVestingSchedule = vestingSchedule.map((installment, index) => {
      return vestingMode(index, 4, 18);
    });

    const expected = [4, 4, 5, 5];

    expect(newVestingSchedule).toEqual(expected);
  });

  test("Front Loaded To Single Tranche", () => {
    const vestingMode = determineVestingMode("FRONT_LOADED_TO_SINGLE_TRANCHE");

    const newVestingSchedule = vestingSchedule.map((installment, index) => {
      return vestingMode(index, 4, 18);
    });

    const expected = [6, 4, 4, 4];

    expect(newVestingSchedule).toEqual(expected);
  });

  test("Back Loaded To Single Tranche", () => {
    const vestingMode = determineVestingMode("BACK_LOADED_TO_SINGLE_TRANCHE");

    const newVestingSchedule = vestingSchedule.map((installment, index) => {
      return vestingMode(index, 4, 18);
    });

    const expected = [4, 4, 4, 6];

    expect(newVestingSchedule).toEqual(expected);
  });

  test("Fractional", () => {
    const vestingMode = determineVestingMode("FRACTIONAL");

    const newVestingSchedule = vestingSchedule.map((installment, index) => {
      return vestingMode(index, 4, 18);
    });

    const expected = [4.5, 4.5, 4.5, 4.5];

    expect(newVestingSchedule).toEqual(expected);
  });
});

describe("test rounding methods using random numbers", () => {
  const randomNumbers = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 1000)
  );
  const totalInstallments = 48;

  test.each(randomNumbers)("Cumulative Rounding - Random", (randomNumber) => {
    const vestingMode = determineVestingMode("CUMULATIVE_ROUNDING");
    const randomVestingSchedule = Array(totalInstallments).fill(
      randomNumber / totalInstallments
    );
    const roundedVestingSchedule = randomVestingSchedule.map((_, index) => {
      return vestingMode(index, totalInstallments, randomNumber);
    });

    const totalSharesVested = roundedVestingSchedule.reduce((acc, amount) => {
      return (acc += amount);
    }, 0);
    expect(totalSharesVested).toEqual(randomNumber);
  });

  test.each(randomNumbers)("Cumulative Round Down - Random", (randomNumber) => {
    const vestingMode = determineVestingMode("CUMULATIVE_ROUND_DOWN");
    const randomVestingSchedule = Array(totalInstallments).fill(
      randomNumber / totalInstallments
    );
    const roundedVestingSchedule = randomVestingSchedule.map((_, index) => {
      return vestingMode(index, totalInstallments, randomNumber);
    });

    const totalSharesVested = roundedVestingSchedule.reduce((acc, amount) => {
      return (acc += amount);
    }, 0);
    expect(totalSharesVested).toEqual(randomNumber);
  });

  test.each(randomNumbers)("Front Loaded - Random", (randomNumber) => {
    const vestingMode = determineVestingMode("FRONT_LOADED");
    const randomVestingSchedule = Array(totalInstallments).fill(
      randomNumber / totalInstallments
    );
    const roundedVestingSchedule = randomVestingSchedule.map((_, index) => {
      return vestingMode(index, totalInstallments, randomNumber);
    });

    const totalSharesVested = roundedVestingSchedule.reduce((acc, amount) => {
      return (acc += amount);
    }, 0);
    expect(totalSharesVested).toEqual(randomNumber);
  });

  test.each(randomNumbers)("Back Loaded - Random", (randomNumber) => {
    const vestingMode = determineVestingMode("BACK_LOADED");
    const randomVestingSchedule = Array(totalInstallments).fill(
      randomNumber / totalInstallments
    );
    const roundedVestingSchedule = randomVestingSchedule.map((_, index) => {
      return vestingMode(index, totalInstallments, randomNumber);
    });

    const totalSharesVested = roundedVestingSchedule.reduce((acc, amount) => {
      return (acc += amount);
    }, 0);

    expect(totalSharesVested).toEqual(randomNumber);
  });

  test.each(randomNumbers)(
    "Front Loaded to Single Tranche - Random",
    (randomNumber) => {
      const vestingMode = determineVestingMode(
        "FRONT_LOADED_TO_SINGLE_TRANCHE"
      );
      const randomVestingSchedule = Array(totalInstallments).fill(
        randomNumber / totalInstallments
      );
      const roundedVestingSchedule = randomVestingSchedule.map((_, index) => {
        return vestingMode(index, totalInstallments, randomNumber);
      });

      const totalSharesVested = roundedVestingSchedule.reduce((acc, amount) => {
        return (acc += amount);
      }, 0);
      expect(totalSharesVested).toEqual(randomNumber);
    }
  );

  test.each(randomNumbers)(
    "Back Loaded to Single Tranche - Random",
    (randomNumber) => {
      const vestingMode = determineVestingMode("BACK_LOADED_TO_SINGLE_TRANCHE");
      const randomVestingSchedule = Array(totalInstallments).fill(
        randomNumber / totalInstallments
      );
      const roundedVestingSchedule = randomVestingSchedule.map((_, index) => {
        return vestingMode(index, totalInstallments, randomNumber);
      });

      const totalSharesVested = roundedVestingSchedule.reduce((acc, amount) => {
        return (acc += amount);
      }, 0);
      expect(totalSharesVested).toEqual(randomNumber);
    }
  );
});
