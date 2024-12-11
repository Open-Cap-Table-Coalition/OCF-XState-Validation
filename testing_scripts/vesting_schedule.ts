import { OcfPackageContent, readOcfPackage } from "../read_ocf_package";
import { generateVestingSchedule } from "../vesting_schedule_generator/index.ts";

const packagePath = "./testing_scripts/testPackage";
const securityId = "equity_compensation_issuance_01";
const ocfPackage: OcfPackageContent = readOcfPackage(packagePath);

const vestingSchedule = generateVestingSchedule(ocfPackage, securityId);
console.table(vestingSchedule);
