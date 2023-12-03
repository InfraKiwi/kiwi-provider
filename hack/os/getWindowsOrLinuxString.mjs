import * as os from 'node:os';
import * as process from 'node:process';

if (os.platform() === 'win32') {
  process.stdout.write('win');
} else {
  process.stdout.write('linux');
}
