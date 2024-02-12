/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe } from '@jest/globals';

import { testExamples } from '../../util/testUtils';

/*
 * interface ModuleStoreTest {
 *   args: ModuleMkdirInterface;
 *   expect?: ModuleRunResult<ModuleMkdirResult>;
 * }
 */

describe('mkdir module', () => {
  testExamples(__dirname);

  /*
   * const tests: ModuleStoreTest[] = [
   *   {
   *     args: { hello: 'world' },
   *     expect: {
   *       vars: { newValue: 'world123' },
   *       changed: true,
   *     },
   *   },
   * ];
   *
   * test.each(tests)('$#', async (t) => {
   *   const runContext = getTestRunContext();
   *   const module = new ModuleMkdir(t.args);
   *
   *   await expect(module.run(runContext)).resolves.toEqual(t.expect);
   * });
   */
});
