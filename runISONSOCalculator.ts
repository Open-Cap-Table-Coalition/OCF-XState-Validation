import { isoNsoCalculator } from "./iso_nso_calculator";

const packagePath  = './sample_ocf_folders/acme_holdings_limited'
const stakeholderId = 'emilyEmployee'

try {
    
    const results = isoNsoCalculator(packagePath, stakeholderId)

    const years: number[] = []
    results.map((result) => {
        if (!years.includes(result.Year)) {
            years.push(result.Year)
        }
    })

    years.forEach(year => {
        const resultsByYear = results.filter(result => result.Year === year)
        console.table(resultsByYear)
    })
} catch (error) {
    if (error instanceof Error) {
        console.error("Error message:", error.message)
    }
    console.error("Unknown error:", error)
}