import {
  TX_Equity_Compensation_Exercise,
  TX_Equity_Compensation_Issuance,
  TX_Vesting_Start,
  VestingTerms,
} from "../types";

export class VestingInitializationService {
  constructor(
    private transactions: (
      | TX_Equity_Compensation_Issuance
      | TX_Vesting_Start
      | TX_Equity_Compensation_Exercise
    )[],
    private vestingTerms: VestingTerms[],
    private securityId: string
  ) {}

  public setUpVestingData(): {
    tx_issuance: TX_Equity_Compensation_Issuance;
    tx_vestingStart: TX_Vesting_Start;
    issuanceVestingTerms: VestingTerms;
  } {
    const tx_issuance = this.findIssuance();
    const tx_vestingStart = this.findVestingStartTx();
    const issuanceVestingTerms = this.findIssuanceVestingTerms(tx_issuance);

    return { tx_issuance, tx_vestingStart, issuanceVestingTerms };
  }

  private findIssuance() {
    const issuance = this.transactions.find(
      (tx): tx is TX_Equity_Compensation_Issuance =>
        tx.security_id === this.securityId
    );
    if (!issuance) {
      throw new Error(
        `Equity compensation issuance with security id ${this.securityId} not found`
      );
    }
    return issuance;
  }

  private findVestingStartTx() {
    const vestingStartTx = this.transactions.find(
      (tx): tx is TX_Vesting_Start =>
        tx.object_type === "TX_VESTING_START" &&
        tx.security_id === this.securityId
    );
    if (!vestingStartTx) {
      throw new Error(
        `For this generator, the transaction must have a TX_VESTING_START object.`
      );
    }
    return vestingStartTx;
  }

  private findIssuanceVestingTerms(issuance: TX_Equity_Compensation_Issuance) {
    const issuanceVestingTerms = this.vestingTerms.find(
      (vt) => vt.id === issuance.vesting_terms_id
    );
    if (!issuanceVestingTerms) {
      throw new Error(
        `Vesting terms for security.id ${this.securityId} not found`
      );
    }
    return issuanceVestingTerms;
  }
}
