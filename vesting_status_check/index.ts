import { OcfPackageContent, readOcfPackage } from "../read_ocf_package";
import { VestingScheduleService } from "../vesting_schedule_generator";

export const vestingStatusCheck = (packagePath: string, securityId: string, checkDateString: string) => {
  
  const ocfPackage: OcfPackageContent = readOcfPackage(packagePath);
  const { vestingTerms, transactions } = ocfPackage
  const vestingSchedule = new VestingScheduleService(vestingTerms, transactions, securityId).generate()

  const status = vestingSchedule.find((schedule) => Date.parse(schedule.Date) >= Date.parse(checkDateString))
  return status

  // let amountVested = 0;
  // let amountUnvested = 0;
  // let amountAvailable = 0;
  // let amountExercised = 0;

  // for (let i = 0; i < vestingSchedule.length; i++) {
  //   if (Date.parse(vestingSchedule[i].Date) <= Date.parse(checkDate) && Date.parse(vestingSchedule[i + 1].Date) > Date.parse(checkDate)) {
  //     amountVested = vestingSchedule[i]["Cumulative Vested"];
  //     amountUnvested = vestingSchedule[i]["Remaining Unvested"];
  //     amountAvailable = vestingSchedule[i]["Available to Exercise"];
  //     amountExercised = vestingSchedule[i]["Cumulative Exercised"];
  //   }
  // }

  // const status = {
  //   "Analysis Date: ": checkDate,
  //   "Amount Unvested: ": amountUnvested,
  //   "Amount Vested to Date: ": amountVested,
  //   "Amount Exercised to Date: ": amountExercised,
  //   "Amount Available to Exercise: ": amountAvailable,
  // };
  // return status;
};
