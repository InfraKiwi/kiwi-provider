/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName, joiObjectWithPattern } from './joi';

export const OSInfoCPUInfoSchema = Joi.object({
  model: Joi.string().required(),
  speed: Joi.number().required().description('The core speed in MHz.'),
  times: Joi.object({
    user: Joi.number().required().description('The number of milliseconds the CPU has spent in user mode.'),
    nice: Joi.number().required().description('The number of milliseconds the CPU has spent in nice mode.'),
    sys: Joi.number().required().description('The number of milliseconds the CPU has spent in sys mode.'),
    idle: Joi.number().required().description('The number of milliseconds the CPU has spent in idle mode.'),
    irq: Joi.number().required().description('The number of milliseconds the CPU has spent in irq mode.'),
  }).required(),
}).meta(joiMetaClassName('OSInfoCPUInfoInterface'));

export const OSInfoNetworkInterfaceBaseSchemaObject = Joi.object({
  mac: Joi.string().required().description('The MAC address of the network interface'),
  internal: Joi.boolean()
    .required()
    .description(
      '`true` if the network interface is a loopback or similar interface that is not remotely accessible; otherwise `false`'
    ),
});

export const OSInfoNetworkInterfaceInfoIPv4Schema = OSInfoNetworkInterfaceBaseSchemaObject.append({
  family: 'IPv4',
  address: Joi.string().required().description('The assigned IPv4 address'),
  netmask: Joi.string().required().description('The IPv4 network mask'),
  cidr: Joi.alternatives([Joi.string(), Joi.string().allow(null)]).required().description(`
  The assigned IPv4 address with the routing prefix in CIDR notation. If the 
  netmask is invalid, this property is set to null.
  `),
}).meta(joiMetaClassName('OSInfoNetworkInterfaceInfoIPv4Interface'));

export const OSInfoNetworkInterfaceInfoIPv6Schema = OSInfoNetworkInterfaceBaseSchemaObject.append({
  family: 'IPv6',
  address: Joi.string().required().description('The assigned IPv6 address'),
  netmask: Joi.string().required().description('The IPv6 network mask'),
  scopeid: Joi.number().required().description('The numeric IPv6 scope ID'),
  cidr: Joi.alternatives([Joi.string(), Joi.string().allow(null)]).required().description(`
  The assigned IPv6 address with the routing prefix in CIDR notation. If the 
  netmask is invalid, this property is set to null.
  `),
}).meta(joiMetaClassName('OSInfoNetworkInterfaceInfoIPv6Interface'));

export const OSInfoSchema = Joi.object({
  arch: Joi.string().required().description(`
  Contains the operating system CPU architecture.
  
  Possible values are 'arm', 'arm64', 'ia32', 'loong64','mips', 'mipsel', 'ppc', 
  'ppc64', 'riscv64', 's390', 's390x', and 'x64'.
  `),

  platform: Joi.string().required().description(`
  Contains a string identifying the operating system platform. 
  
  Possible values are 'aix', 'darwin', 'freebsd','linux','openbsd', 'sunos', and 'win32'.
  `),

  machine: Joi.string().required().description(`
  Contains the machine type as a string, such as 'arm', 'arm64', 'aarch64', 'mips', 
  'mips64', 'ppc64', 'ppc64le', 's390', 's390x', 'i386', 'i686', 'x86_64'.
  
  On POSIX systems, the machine type is determined by calling uname(3). On Windows, 
  \`RtlGetVersion()\` is used, and if it is not available, \`GetVersionExW()\` will be used. 
  See https://en.wikipedia.org/wiki/Uname#Examples  for more information.
  `),

  version: Joi.string().required().description(`
  Contains a string identifying the kernel version.
  
  On POSIX systems, the operating system release is determined by calling uname(3). 
  On Windows, \`RtlGetVersion()\` is used, and if it is not available, \`GetVersionExW()\` 
  will be used. See https://en.wikipedia.org/wiki/Uname#Examples for more information.
  `),

  homedir: Joi.string().required().description(`
  Contains the string path of the current user's home directory.

  On POSIX, it uses the $HOME environment variable if defined. Otherwise it 
  uses the effective UID to look up the user's home directory.
  
  On Windows, it uses the USERPROFILE environment variable if defined. 
  Otherwise it uses the path to the profile directory of the current user.
  `),

  tmpdir: Joi.string().required().description(`
  Contains the operating system's default directory for temporary files as a string.
  `),

  devNull: Joi.string().required().description(`
  The platform-specific file path of the null device.

  \\\\.\\nul on Windows
  /dev/null on POSIX
  `),

  eol: Joi.string().required().description(`
  The operating system-specific end-of-line marker.

  \\n on POSIX
  \\r\\n on Windows
  `),

  endianness: Joi.string().valid('BE', 'LE').description(`
  Contains a string identifying the endianness of the CPU.
  
  Possible values are 'BE' for big endian and 'LE' for little endian.
  `),

  freemem: Joi.number().required().description(`
  Contains the amount of free system memory in bytes as an integer.
  `),

  totalmem: Joi.number().required().description(`
  Contains the total amount of system memory in bytes as an integer.
  `),

  cpus: Joi.array().items(OSInfoCPUInfoSchema).description(`
Contains an array of objects containing information about each logical CPU core.
The array will be empty if no CPU information is available, such as if the 
\`/proc\` file system is unavailable.
`),

  loadavg: Joi.array().items(Joi.number()).length(3).description(`
  Contains an array containing the 1, 5, and 15 minute load averages.

  The load average is a measure of system activity calculated by the operating 
  system and expressed as a fractional number.
  
  The load average is a Unix-specific concept. On Windows, the return value is 
  always [0, 0, 0].
  `),

  hostname: Joi.string().required().description('Contains the host name of the operating system as a string.'),

  networkInterfaces: joiObjectWithPattern(
    Joi.alternatives([
      Joi.array().items(
        Joi.alternatives(OSInfoNetworkInterfaceInfoIPv4Schema, OSInfoNetworkInterfaceInfoIPv6Schema).optional()
      ),
      // Undefined
      Joi.alternatives(),
    ])
  ).required().description(`
  Contains an object containing network interfaces that have been assigned a 
  network address.

  Each key on the returned object identifies a network interface. The 
  associated value is an array of objects that each describe an assigned 
  network address.
  `),

  release: Joi.string().required().description(`
  Contains the operating system as a string.

  On POSIX systems, the operating system release is determined by calling 
  uname(3). On Windows, GetVersionExW() is used. 
  See https://en.wikipedia.org/wiki/Uname#Examples for more information.
  `),

  type: Joi.string().required().description(`
  Contains the operating system name as returned by uname(3). For example, it 
  Contains 'Linux' on Linux, 'Darwin' on macOS, and 'Windows_NT' on Windows.

  See https://en.wikipedia.org/wiki/Uname#Examples for additional information 
  about the output of running uname(3) on various operating systems.
  `),

  uptime: Joi.number().required().description(`
  Contains the system uptime in number of seconds.
  `),
}).meta(joiMetaClassName('OSInfoInterface')).description(`
An object containing some OS information, directly generated using the 
Node.js \`os\` API: https://nodejs.org/api/os.html
`);

export const ProcessInfoSchema = Joi.object({
  env: joiObjectWithPattern(
    Joi.alternatives([
      Joi.string(), // Undefined
      Joi.alternatives(),
    ])
  ).description(`
    An object containing a copy of the user environment.
  `),

  argv: Joi.array().items(Joi.string()).required().description(`
   The \`process.argv\` property returns an array containing the command-line
   arguments passed when the kiwi process was launched. The first element will
   be {@link execPath}. The remaining elements will be any additional command-line
   arguments.
  `),

  execPath: Joi.string().required().description(`
   The \`process.execPath\` property returns the absolute pathname of the executable
   that started the kiwiprocess. Symbolic links, if any, are resolved.
  `),

  gid: Joi.number().description(`
    The numerical group identity of the process. 
    See http://man7.org/linux/man-pages/man2/getgid.2.html
    
    This function is only available on POSIX platforms (i.e. not Windows).
    On non-POSIX platforms, this value will be \`undefined\`.
  `),
  uid: Joi.number().description(`
    The numerical user identity of the process. 
    See http://man7.org/linux/man-pages/man2/getuid.2.html
    
    This function is only available on POSIX platforms (i.e. not Windows).
    On non-POSIX platforms, this value will be \`undefined\`.
  `),
  groups: Joi.array().items(Joi.number()).description(`
    An array with the supplementary group
    IDs. POSIX leaves it unspecified if the effective group ID is included but
    Node.js ensures it always is.
    
    This function is only available on POSIX platforms (i.e. not Windows).
    On non-POSIX platforms, this value will be \`undefined\`.
  `),
  pid: Joi.number().required().description(`
   The PID of the process.
  `),
  ppid: Joi.number().required().description(`
   The PID of the parent of the current process.
  `),
}).meta(joiMetaClassName('ProcessInfoInterface')).description(`
An object containing some information about the current process, 
directly generated using the Node.js \`process\` API: https://nodejs.org/api/process.html
`);
