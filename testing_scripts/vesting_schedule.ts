import { VestingScheduleService } from "../vesting_schedule_generator"
import { OcfPackageContent, readOcfPackage } from "../read_ocf_package";

const packagePath  = './sample_ocf_folders/acme_holdings_limited'
const securityId = 'equity_compensation_issuance_01'
const ocfPackage: OcfPackageContent = readOcfPackage(packagePath);
const { vestingTerms, transactions } = ocfPackage;

try {
    
    const schedules = new VestingScheduleService(vestingTerms, transactions, securityId).getVestingDetails()

    const years: number[] = []
    schedules.map((result) => {
        const year = new Date(result.Date).getFullYear()
        if (!years.includes(year)) {
            years.push(year)
        }
    })

    years.sort((a,b) => a - b)

    years.forEach(year => {
        const resultsByYear = schedules.filter(schedule => {
            const vestingYear = new Date(schedule.Date).getFullYear()
            return vestingYear === year
        })
        console.table(resultsByYear)
    })
    
} catch (error) {
    if (error instanceof Error) {
        console.error("Error message:", error.message)
    }
    console.error("Unknown error:", error)
}