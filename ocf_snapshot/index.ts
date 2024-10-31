import { OcfPackageContent, readOcfPackage } from "../read_ocf_package";
import { ocfValidator } from "../ocf_validator";

export const ocfSnapshot = (packagePath: string, inputDateStr: string) => {
    
    const ocfPackage: OcfPackageContent = readOcfPackage(packagePath);
    const snapshots = ocfValidator(packagePath).snapshots;
    const inputDate = new Date(inputDateStr);

    const filteredSnapshots = snapshots.filter((snapshot: any) => new Date(snapshot.date) <= inputDate);

    filteredSnapshots.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const snapshot = filteredSnapshots.length? filteredSnapshots[0]: null;
    
    
    return snapshot;
}