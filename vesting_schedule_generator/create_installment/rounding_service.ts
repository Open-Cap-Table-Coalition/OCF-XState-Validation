import type { Allocation_Type } from "types";

export const determineVestingMode = (allocation_type: Allocation_Type) => {
  switch (allocation_type) {
    case "CUMULATIVE_ROUNDING":
      return CumulativeRounding;
    case "CUMULATIVE_ROUND_DOWN":
      return CumulativeRoundDown;
    case "FRONT_LOADED":
      return FrontLoaded;
    case "BACK_LOADED":
      return Backloaded;
    case "FRONT_LOADED_TO_SINGLE_TRANCHE":
      return FrontLoadedToSingleTrache;
    case "BACK_LOADED_TO_SINGLE_TRANCHE":
      return BackLoadedToSingleTrache;
    case "FRACTIONAL":
      return Fractional;
  }
};

export const CumulativeRounding = (
  installmentIndex: number,
  totalInstallments: number,
  totalQuantity: number
) => {
  const installmentCount = installmentIndex + 1;
  const cumulativePercent = installmentCount / totalInstallments;

  if (installmentCount === 1) {
    return Math.round(cumulativePercent * totalQuantity);
  }

  const lastCumulativePercent = (installmentCount - 1) / totalInstallments;
  return (
    Math.round(cumulativePercent * totalQuantity) -
    Math.round(lastCumulativePercent * totalQuantity)
  );
};

export const CumulativeRoundDown = (
  installmentIndex: number,
  totalInstallments: number,
  totalQuantity: number
) => {
  const installmentCount = installmentIndex + 1;
  const cumulativePercent = installmentCount / totalInstallments;

  if (installmentCount === 1) {
    return Math.floor(cumulativePercent * totalQuantity);
  }

  const lastCumulativePercent = (installmentCount - 1) / totalInstallments;
  return (
    Math.floor(cumulativePercent * totalQuantity) -
    Math.floor(lastCumulativePercent * totalQuantity)
  );
};

export const FrontLoaded = (
  installmentIndex: number,
  totalInstallments: number,
  totalQuantity: number
) => {
  const remainder = totalQuantity % totalInstallments;
  if (installmentIndex < remainder) {
    return Math.ceil(totalQuantity / totalInstallments);
  }
  return Math.floor(totalQuantity / totalInstallments);
};

export const Backloaded = (
  installmentIndex: number,
  totalInstallments: number,
  totalQuantity: number
) => {
  const baseQuantity = Math.floor(totalQuantity / totalInstallments);
  const remainder = totalQuantity % totalInstallments;

  // Distribute the remainder to the last installments
  if (installmentIndex >= totalInstallments - remainder) {
    return baseQuantity + 1;
  }
  return baseQuantity;
};

export const FrontLoadedToSingleTrache = (
  installmentIndex: number,
  totalInstallments: number,
  totalQuantity: number
) => {
  const remainder = totalQuantity % totalInstallments;
  if (installmentIndex === 0) {
    return Math.floor(totalQuantity / totalInstallments) + remainder;
  }
  return Math.floor(totalQuantity / totalInstallments);
};

export const BackLoadedToSingleTrache = (
  installmentIndex: number,
  totalInstallments: number,
  totalQuantity: number
) => {
  const remainder = totalQuantity % totalInstallments;
  if (installmentIndex === totalInstallments - 1) {
    return Math.floor(totalQuantity / totalInstallments) + remainder;
  }
  return Math.floor(totalQuantity / totalInstallments);
};

export const Fractional = (
  installmentIndex: number,
  totalInstallments: number,
  totalQuantity: number
) => {
  return totalQuantity / totalInstallments;
};
