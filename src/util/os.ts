/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import * as os from 'node:os';
import type { OSInfoInterface, ProcessInfoInterface } from './os.schema.gen';
import process from 'node:process';

export function getOSInfo(): OSInfoInterface {
  return {
    eol: os.EOL,
    arch: os.arch(),
    cpus: os.cpus(),
    devNull: os.devNull,
    endianness: os.endianness(),
    freemem: os.freemem(),
    homedir: os.homedir(),
    hostname: os.hostname(),
    loadavg: os.loadavg(),
    machine: os.machine(),
    networkInterfaces: os.networkInterfaces(),
    platform: os.platform(),
    release: os.release(),
    tmpdir: os.tmpdir(),
    totalmem: os.totalmem(),
    type: os.type(),
    uptime: os.uptime(),
    version: os.version(),
  };
}

export function getProcessInfo(): ProcessInfoInterface {
  return {
    env: { ...process.env },
    argv: [...process.argv],
    execPath: process.execPath,
    uid: process.getuid?.(),
    gid: process.getegid?.(),
    groups: process.getgroups?.(),
    pid: process.pid,
    ppid: process.ppid,
  };
}
