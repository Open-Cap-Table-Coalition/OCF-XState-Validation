import { OcfPackageContent } from "../read_ocf_package";
import {
  Transaction,
  TX_Equity_Compensation_Cancellation,
  TX_Equity_Compensation_Exercise,
  TX_Equity_Compensation_Issuance,
  TX_Vesting_Start,
  Valuation,
  VestingTerms,
} from "../types";
import {
  VestingInstallment,
  VestingScheduleService,
} from "../vesting_schedule_generator";

// Define the interface for the data supplied to the calculator
interface Installment extends VestingInstallment {
  "Security Id": string;
  "Grant Date": string;
  Year: number; // Represents the year of the ISO/NSO test
  FMV: number; // for now we assume that the FMV is the exercise price if there is no valuation.id.  Better approaches to be discussed.
  Grant_Type: "NSO" | "ISO" | "INTL";
}

// Define the interface for the results of the ISO/NSO test
export interface ISONSOTestResult
  extends Pick<
    Installment,
    | "Year"
    | "Date"
    | "Security Id"
    | "Event Type"
    | "Became Exercisable"
    | "FMV"
  > {
  StartingCapacity: number;
  ISOShares: number;
  NSOShares: number;
  CapacityUtilized: number;
  CapacityRemaining: number;
}

export class ISONSOCalculatorService {
  private transactions!: Transaction[];
  private valuations!: Valuation[];
  private issuances!: TX_Equity_Compensation_Issuance[];
  private installments!: Installment[];
  private ANNUAL_CAPACITY = 100000;
  private remainingCapacity: number;
  private results: ISONSOTestResult[];

  constructor(
    private ocfPackage: OcfPackageContent,
    private stakeholderId: string
  ) {
    this.deconstructOCFPackage();
    this.getIssuances();
    this.createInstallments();
    this.sortInstallments();
    this.remainingCapacity = this.ANNUAL_CAPACITY;
    this.results = this.calculate();
  }

  private deconstructOCFPackage() {
    const { transactions, valuations } = this.ocfPackage;
    this.transactions = transactions;
    this.valuations = valuations;
  }

  private getIssuances() {
    const issuances = this.transactions.filter(
      (tx): tx is TX_Equity_Compensation_Issuance =>
        tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE" &&
        tx.stakeholder_id === this.stakeholderId
    );

    this.issuances = issuances;
  }

  private createInstallments() {
    // create a vesting schedule for each issuance
    const allInstallments = this.issuances.reduce((acc, issuance) => {
      const schedule = new VestingScheduleService(
        this.ocfPackage,
        issuance.security_id
      ).getFullSchedule();

      const installments = schedule.reduce((acc, entry) => {
        // ignore exercise events within the vesting schedule
        if (entry["Event Type"] === "Exercise") return acc;

        const date = new Date(entry.Date);
        acc.push({
          ...entry,
          "Security Id": issuance.security_id,
          "Grant Date": issuance.date,
          Year: date.getFullYear(),
          FMV: this.getFMV(issuance),
          Grant_Type: issuance.option_grant_type,
        });
        return acc;
      }, [] as Installment[]);

      acc.push(...installments);
      return acc;
    }, [] as Installment[]);

    this.installments = allInstallments;
  }

  // sort installments by grant date and then by vesting date
  private sortInstallments() {
    this.installments.sort(
      (
        a: { "Grant Date": string; Date: string },
        b: { "Grant Date": string; Date: string }
      ) => {
        if (a["Grant Date"] === b["Grant Date"]) {
          return a.Date.localeCompare(b.Date);
        }
        return a["Grant Date"].localeCompare(b["Grant Date"]);
      }
    );
  }

  /**
   * Exclude options that are not eligible to be ISOs
   * and options that were cancelled prior to the tested year
   */
  private isIncludedInTest(installment: Installment, year: number) {
    const cancelledYear = this.getCancelledDate(
      installment["Security Id"]
    )?.getFullYear();

    return (
      installment.Grant_Type === "ISO" &&
      (cancelledYear === undefined || cancelledYear >= year)
    );
  }

  private getCancelledDate(securityId: string) {
    const cancelTransactions = this.transactions.filter(
      (tx): tx is TX_Equity_Compensation_Cancellation =>
        tx.object_type === "TX_EQUITY_COMPENSATION_CANCELLATION" &&
        tx.security_id === securityId
    );

    // assumes each securityId would only have a single cancel transaction
    if (cancelTransactions.length === 0) {
      return null;
    }

    return new Date(cancelTransactions[0].date);
  }

  // For now we'll assume that the FMV on the grant date is equal to the exercise price if there is no valuation_id
  // Alternative approaches to be discussed
  private getFMV(issuance: TX_Equity_Compensation_Issuance) {
    let FMV;

    const valuation = this.valuations?.find(
      (valuation) => valuation.id === issuance.valuation_id
    );

    if (!valuation) {
      if (!issuance.exercise_price || !issuance.exercise_price.amount) {
        throw new Error(
          `Cannot run the ISO test unless either a valuation or exercies price is provided`
        );
      } else {
        FMV = issuance.exercise_price.amount;
      }
    } else {
      FMV = valuation.price_per_share.amount;
    }

    return parseFloat(FMV);
  }

  private calculate() {
    let currentYear = this.installments[0].Year; // Initialize the current year to the year of the first installment

    const result = this.installments.reduce((acc, current) => {
      /**
       * If the year changes, reset the remaining capacity to 100,000,
       * reset the current year, and
       * get a new array of filtered installments
       */
      if (current.Year !== currentYear) {
        this.remainingCapacity = this.ANNUAL_CAPACITY;
        currentYear = current.Year;
      }

      const startingCapacity = this.remainingCapacity;

      // Determine how many shares are in included in this iteration of the test
      // options that are not eligible to be ISOs have already been removed in createInstallments
      const ISOEligibleShares = this.isIncludedInTest(current, currentYear)
        ? current["Became Exercisable"]
        : 0;

      // Determine how many shares can be ISOs based on the remainingCapacity
      const MaxISOShares = Math.floor(this.remainingCapacity / current.FMV);

      // Determine how many shares are ISOs
      const ISOShares = Math.min(MaxISOShares, ISOEligibleShares);

      // Determine how many shares are NSOs
      const NSOShares = current["Became Exercisable"] - ISOShares;

      // Determine how much capacity was utilized
      const utilizedCapacity = ISOShares * current.FMV;

      // Update remaining capacity after usage
      this.remainingCapacity -= utilizedCapacity;

      acc.push({
        Year: current.Year,
        Date: current.Date,
        "Security Id": current["Security Id"],
        "Event Type": current["Event Type"],
        "Became Exercisable": current["Event Quantity"],
        FMV: current.FMV,
        StartingCapacity: startingCapacity,
        ISOShares: ISOShares,
        NSOShares: NSOShares,
        CapacityUtilized: utilizedCapacity,
        CapacityRemaining: this.remainingCapacity,
      });

      return acc;
    }, [] as ISONSOTestResult[]);

    return result;
  }

  get Results() {
    return this.results;
  }
}
