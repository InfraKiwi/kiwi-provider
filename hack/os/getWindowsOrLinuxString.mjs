/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import * as os from 'node:os';
import * as process from 'node:process';

if (os.platform() === 'win32') {
  process.stdout.write('win');
} else {
  process.stdout.write('linux');
}
