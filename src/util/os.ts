import * as os from 'node:os';
import type { OSInfoInterface } from './os.schema.gen';

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
