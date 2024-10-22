import { isoNsoCalculator } from "./iso_nso_calculator";

const packagePath  = './sample_ocf_folders/acme_holdings_limited'
const stakeholderId = 'emilyEmployee'

try {
    const result = isoNsoCalculator(packagePath, stakeholderId)
    console.table(result)
} catch (error) {
    if (error instanceof Error) {
        console.error("Error message:", error.message)
    }
    console.error("Unknown error:", error)
}