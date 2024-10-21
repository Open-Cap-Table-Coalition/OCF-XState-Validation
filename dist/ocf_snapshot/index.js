"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocfSnapshot = void 0;
const read_ocf_package_1 = require("../read_ocf_package");
const ocf_validator_1 = require("../ocf_validator");
const ocfSnapshot = (packagePath, inputDateStr) => {
    const ocfPackage = (0, read_ocf_package_1.readOcfPackage)(packagePath);
    const snapshots = (0, ocf_validator_1.ocfValidator)(packagePath).snapshots;
    const inputDate = new Date(inputDateStr);
    const filteredSnapshots = snapshots.filter((snapshot) => new Date(snapshot.date) <= inputDate);
    filteredSnapshots.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const snapshot = filteredSnapshots.length ? filteredSnapshots[0] : null;
    return snapshot;
};
exports.ocfSnapshot = ocfSnapshot;
