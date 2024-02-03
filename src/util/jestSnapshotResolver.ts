import path from 'node:path';
import { normalizePathToUnix } from './path';

/**
 *
 * @param testPath Path of the test file being tested
 * @param snapshotExtension The extension for snapshots (.snap usually)
 */
const resolveSnapshotPath = (testPath: string, snapshotExtension: string) => {
  const dir = path.dirname(testPath);
  const file = path.basename(testPath);
  const snapDir = path.join(dir, 'test', '__snapshots__');
  return normalizePathToUnix(path.join(snapDir, file) + snapshotExtension);
};

/**
 *
 * @param snapshotFilePath The filename of the snapshot (i.e. some.test.js.snap)
 * @param snapshotExtension The extension for snapshots (.snap)
 */
const resolveTestPath = (snapshotFilePath: string, snapshotExtension: string) => {
  const dir = path.join(path.dirname(snapshotFilePath), '..', '..');
  const snapFile = path.basename(snapshotFilePath);
  const testFile = snapFile.slice(0, -snapshotExtension.length);
  return normalizePathToUnix(path.join(dir, testFile));
};

/* Used to validate resolveTestPath(resolveSnapshotPath( {this} )) */
const testPathForConsistencyCheck = 'test/__snapshots__/some.test.js';

module.exports = {
  resolveSnapshotPath,
  resolveTestPath,
  testPathForConsistencyCheck,
};
