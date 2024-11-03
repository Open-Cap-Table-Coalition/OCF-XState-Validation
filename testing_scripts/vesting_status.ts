import { VestingScheduleService } from "../vesting_schedule_generator";
import { OcfPackageContent, readOcfPackage } from "../read_ocf_package";

const packagePath = "./sample_ocf_folders/acme_holdings_limited";
const securityId = "equity_compensation_issuance_01";
const ocfPackage: OcfPackageContent = readOcfPackage(packagePath);
const { vestingTerms, transactions } = ocfPackage;

try {
  const checkDateString = "2020-06-15";
  const vestingStatus = new VestingScheduleService(
    vestingTerms,
    transactions,
    securityId
  ).getVestingStatus(checkDateString);

  if (!vestingStatus) {
    console.log("The date provided is before the vesting start date");
  }
  console.table(vestingStatus);
} catch (error) {
  if (error instanceof Error) {
    console.error("Error message:", error.message);
  }
  console.error("Unknown error:", error);
}
