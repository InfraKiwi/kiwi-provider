/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { getESBuildVersion } from './package';

test('getESBuildVersion', () => {
  expect(getESBuildVersion).not.toBeUndefined();
});
