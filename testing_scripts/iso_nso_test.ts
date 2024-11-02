import { ISONSOCalculatorService } from "../iso_nso_calculator"
import { OcfPackageContent, readOcfPackage } from "../read_ocf_package";

const packagePath  = './sample_ocf_folders/acme_holdings_limited'
const stakeholderId = 'emilyEmployee'
const ocfPackage: OcfPackageContent = readOcfPackage(packagePath);
const { vestingTerms, transactions, valuations } = ocfPackage;

try {
    
    const results = new ISONSOCalculatorService(
        stakeholderId,
        transactions,
        vestingTerms,
        valuations
    ).Results

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