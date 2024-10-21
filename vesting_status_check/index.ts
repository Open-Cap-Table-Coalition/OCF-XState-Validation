import { OcfPackageContent, readOcfPackage } from "../read_ocf_package";
import { VestingSchedule, generateSchedule } from "../vesting_schedule_generator";

export const vestingStatusCheck = (packagePath: string, equityCompensationIssuanceSecurityId: string, checkDate: string) => {
  
  const ocfPackage: OcfPackageContent = readOcfPackage(packagePath);
  const vestingSchedule: VestingSchedule[] = generateSchedule(packagePath, equityCompensationIssuanceSecurityId);
  let amountVested = 0;
  let amountUnvested = 0;
  let amountAvailable = 0;
  let amountExercised = 0;

  for (let i = 0; i < vestingSchedule.length; i++) {
    if (Date.parse(vestingSchedule[i].Date) <= Date.parse(checkDate) && Date.parse(vestingSchedule[i + 1].Date) > Date.parse(checkDate)) {
      amountVested = vestingSchedule[i]["Cumulative Vested"];
      amountUnvested = vestingSchedule[i]["Remaining Unvested"];
      amountAvailable = vestingSchedule[i]["Available to Exercise"];
      amountExercised = vestingSchedule[i]["Cumulative Exercised"];
    }
  }

  const status = {
    "Analysis Date: ": checkDate,
    "Amount Unvested: ": amountUnvested,
    "Amount Vested to Date: ": amountVested,
    "Amount Exercised to Date: ": amountExercised,
    "Amount Available to Exercise: ": amountAvailable,
  };
  return status;
};
