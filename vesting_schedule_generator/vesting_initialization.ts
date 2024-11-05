import {
  Transaction,
  TX_Equity_Compensation_Exercise,
  TX_Equity_Compensation_Issuance,
  TX_Vesting_Start,
  vestingObject,
  VestingTerms,
} from "../types";

export class VestingInitializationService {
  constructor(
    private transactions: Transaction[],
    private vestingTerms: VestingTerms[],
    private securityId: string
  ) {}

  public setUpVestingData() {
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
    return vestingStartTx;
  }

  private findIssuanceVestingTerms(issuance: TX_Equity_Compensation_Issuance) {
    /**
     * Absence of both vesting_terms_id and vestings means the shares are fully vested on issuance. https://github.com/Open-Cap-Table-Coalition/OCF-Tools/issues/76
     * If both vesting_terms_id and vestings are present, defer to vestings. https://github.com/Open-Cap-Table-Coalition/OCF-Tools/issues/77
     */

    const vestings = issuance.vestings;

    if (vestings) return vestings;

    const issuanceVestingTerms = this.vestingTerms.find(
      (vt) => vt.id === issuance.vesting_terms_id
    );

    if (issuanceVestingTerms) return issuanceVestingTerms;

    return undefined;
  }
}
