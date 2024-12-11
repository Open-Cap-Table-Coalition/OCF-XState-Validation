import { OcfPackageContent } from "../read_ocf_package";
import {
  Transaction,
  TX_Equity_Compensation_Cancellation,
  TX_Equity_Compensation_Exercise,
  TX_Equity_Compensation_Issuance,
  TX_Vesting_Event,
  TX_Vesting_Start,
  OCFDataBySecurityId,
} from "types";

export const getOCFDataBySecurityId = (
  ocfPackage: OcfPackageContent,
  securityId: string
): OCFDataBySecurityId => {
  const equityCompensationTransactions = ocfPackage.transactions.filter(
    (tx): tx is Transaction => tx.security_id === securityId
  );

  if (!equityCompensationTransactions) {
    throw new Error(
      `No equity-related transactions found for security id ${securityId}`
    );
  }

  const issuanceTransaction = equityCompensationTransactions.find(
    (tx): tx is TX_Equity_Compensation_Issuance =>
      tx.object_type === "TX_EQUITY_COMPENSATION_ISSUANCE"
  );

  if (!issuanceTransaction) {
    throw new Error(
      `No issuance transaction found for security id ${securityId}`
    );
  }

  const vestingStartTransactions = equityCompensationTransactions.filter(
    (tx): tx is TX_Vesting_Start => tx.object_type === "TX_VESTING_START"
  );

  const vestingEventTransactions = equityCompensationTransactions.filter(
    (tx): tx is TX_Vesting_Event => tx.object_type === "TX_VESTING_EVENT"
  );

  const exerciseTransactions = equityCompensationTransactions.filter(
    (tx): tx is TX_Equity_Compensation_Exercise =>
      tx.object_type === "TX_EQUITY_COMPENSATION_EXERCISE"
  );

  const cancellationTransactions = equityCompensationTransactions.filter(
    (tx): tx is TX_Equity_Compensation_Cancellation =>
      tx.object_type === "TX_EQUITY_COMPENSATION_CANCELLATION"
  );

  const issuanceVestingTerms = ocfPackage.vestingTerms.find(
    (vt) => vt.id === issuanceTransaction.vesting_terms_id
  );

  const vestingObjects = issuanceTransaction.vestings;

  const ocfData: OCFDataBySecurityId = {
    issuanceTransaction: issuanceTransaction,
    vestingStartTransactions: vestingStartTransactions,
    vestingEventTransactions: vestingEventTransactions,
    exerciseTransactions: exerciseTransactions,
    cancellationTransactions: cancellationTransactions,
    issuanceVestingTerms: issuanceVestingTerms,
    vestingObjects: vestingObjects,
    valuations: ocfPackage.valuations,
  };

  return ocfData;
};
