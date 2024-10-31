import { generateSchedule } from "./vesting_schedule_generator"

const packagePath  = './sample_ocf_folders/acme_holdings_limited'
const equityCompensationIssuanceSecurityId = 'equity_compensation_issuance_03'

try {
    
    const schedules = generateSchedule(packagePath, equityCompensationIssuanceSecurityId )

    const years: number[] = []
    schedules.map((result) => {
        const year = new Date(result.Date).getFullYear()
        if (!years.includes(year)) {
            years.push(year)
        }
    })

    years.forEach(year => {
        const resultsByYear = schedules.filter(schedule => {
            const vestingYear = new Date(schedule.Date).getFullYear()
            return vestingYear === year
        })
        console.table(resultsByYear)
    })
    // console.table(schedules)
} catch (error) {
    if (error instanceof Error) {
        console.error("Error message:", error.message)
    }
    console.error("Unknown error:", error)
}