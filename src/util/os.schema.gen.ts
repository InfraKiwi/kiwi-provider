/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block OSInfoCPUInfoInterface begin]
export interface OSInfoCPUInfoInterface {
  model: string;

  /**
   * The core speed in MHz.
   */
  speed: number;
  times: {
    /**
     * The number of milliseconds the CPU has spent in user mode.
     */
    user: number;

    /**
     * The number of milliseconds the CPU has spent in nice mode.
     */
    nice: number;

    /**
     * The number of milliseconds the CPU has spent in sys mode.
     */
    sys: number;

    /**
     * The number of milliseconds the CPU has spent in idle mode.
     */
    idle: number;

    /**
     * The number of milliseconds the CPU has spent in irq mode.
     */
    irq: number;
  };
}
// [block OSInfoCPUInfoInterface end]
//meta:OSInfoCPUInfoInterface:[{"className":"OSInfoCPUInfoInterface"}]

// [block OSInfoInterface begin]
/**
 * An object containing some OS information, directly generated using the
 * Node.js `os` API: https://nodejs.org/api/os.html
 */
export interface OSInfoInterface {
  /**
   * Contains the operating system CPU architecture.
   *
   * Possible values are 'arm', 'arm64', 'ia32', 'loong64','mips', 'mipsel', 'ppc',
   * 'ppc64', 'riscv64', 's390', 's390x', and 'x64'.
   */
  arch: string;

  /**
   * Contains a string identifying the operating system platform.
   *
   * Possible values are 'aix', 'darwin', 'freebsd','linux','openbsd', 'sunos', and 'win32'.
   */
  platform: string;

  /**
   * Contains the machine type as a string, such as 'arm', 'arm64', 'aarch64', 'mips',
   * 'mips64', 'ppc64', 'ppc64le', 's390', 's390x', 'i386', 'i686', 'x86_64'.
   *
   * On POSIX systems, the machine type is determined by calling uname(3). On Windows,
   * `RtlGetVersion()` is used, and if it is not available, `GetVersionExW()` will be used.
   * See https://en.wikipedia.org/wiki/Uname#Examples  for more information.
   */
  machine: string;

  /**
   * Contains a string identifying the kernel version.
   *
   * On POSIX systems, the operating system release is determined by calling uname(3).
   * On Windows, `RtlGetVersion()` is used, and if it is not available, `GetVersionExW()`
   * will be used. See https://en.wikipedia.org/wiki/Uname#Examples for more information.
   */
  version: string;

  /**
   * Contains the string path of the current user's home directory.
   *
   * On POSIX, it uses the $HOME environment variable if defined. Otherwise it
   * uses the effective UID to look up the user's home directory.
   *
   * On Windows, it uses the USERPROFILE environment variable if defined.
   * Otherwise it uses the path to the profile directory of the current user.
   */
  homedir: string;

  /**
   * Contains the operating system's default directory for temporary files as a string.
   */
  tmpdir: string;

  /**
   * The platform-specific file path of the null device.
   *
   * \\.\nul on Windows
   * /dev/null on POSIX
   */
  devNull: string;

  /**
   * The operating system-specific end-of-line marker.
   *
   * \n on POSIX
   * \r\n on Windows
   */
  eol: string;

  /**
   * Contains a string identifying the endianness of the CPU.
   *
   * Possible values are 'BE' for big endian and 'LE' for little endian.
   */
  endianness?:
    | 'BE'
    | 'LE';

  /**
   * Contains the amount of free system memory in bytes as an integer.
   */
  freemem: number;

  /**
   * Contains the total amount of system memory in bytes as an integer.
   */
  totalmem: number;

  /**
   * Contains an array of objects containing information about each logical CPU core.
   * The array will be empty if no CPU information is available, such as if the
   * `/proc` file system is unavailable.
   */
  cpus?: OSInfoCPUInfoInterface[]; //typeRef:OSInfoCPUInfoInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * Contains an array containing the 1, 5, and 15 minute load averages.
   *
   * The load average is a measure of system activity calculated by the operating
   * system and expressed as a fractional number.
   *
   * The load average is a Unix-specific concept. On Windows, the return value is
   * always [0, 0, 0].
   */
  loadavg?: number[];

  /**
   * Contains the host name of the operating system as a string.
   */
  hostname: string;

  /**
   * Contains an object containing network interfaces that have been assigned a
   * network address.
   *
   * Each key on the returned object identifies a network interface. The
   * associated value is an array of objects that each describe an assigned
   * network address.
   */
  networkInterfaces: {
    [x: string]:
      | (
        | OSInfoNetworkInterfaceInfoIPv4Interface //typeRef:OSInfoNetworkInterfaceInfoIPv4Interface:{"relPath":"self","isRegistryExport":false}

        | OSInfoNetworkInterfaceInfoIPv6Interface)[] //typeRef:OSInfoNetworkInterfaceInfoIPv6Interface:{"relPath":"self","isRegistryExport":false}

        | undefined;
  };

  /**
   * Contains the operating system as a string.
   *
   * On POSIX systems, the operating system release is determined by calling
   * uname(3). On Windows, GetVersionExW() is used.
   * See https://en.wikipedia.org/wiki/Uname#Examples for more information.
   */
  release: string;

  /**
   * Contains the operating system name as returned by uname(3). For example, it
   * Contains 'Linux' on Linux, 'Darwin' on macOS, and 'Windows_NT' on Windows.
   *
   * See https://en.wikipedia.org/wiki/Uname#Examples for additional information
   * about the output of running uname(3) on various operating systems.
   */
  type: string;

  /**
   * Contains the system uptime in number of seconds.
   */
  uptime: number;
}
// [block OSInfoInterface end]
//meta:OSInfoInterface:[{"className":"OSInfoInterface"}]

// [block OSInfoNetworkInterfaceBaseSchemaObject begin]
export interface OSInfoNetworkInterfaceBaseSchemaObject {
  /**
   * The MAC address of the network interface
   */
  mac: string;

  /**
   * `true` if the network interface is a loopback or similar interface that is not remotely accessible; otherwise `false`
   */
  internal: boolean;
}
// [block OSInfoNetworkInterfaceBaseSchemaObject end]
//meta:OSInfoNetworkInterfaceBaseSchemaObject:undefined

// [block OSInfoNetworkInterfaceInfoIPv4Interface begin]
export interface OSInfoNetworkInterfaceInfoIPv4Interface {
  /**
   * The MAC address of the network interface
   */
  mac: string;

  /**
   * `true` if the network interface is a loopback or similar interface that is not remotely accessible; otherwise `false`
   */
  internal: boolean;
  family?: 'IPv4';

  /**
   * The assigned IPv4 address
   */
  address: string;

  /**
   * The IPv4 network mask
   */
  netmask: string;

  /**
   * The assigned IPv4 address with the routing prefix in CIDR notation. If the
   * netmask is invalid, this property is set to null.
   */
  cidr:
    | string

    | null;
}
// [block OSInfoNetworkInterfaceInfoIPv4Interface end]
//meta:OSInfoNetworkInterfaceInfoIPv4Interface:[{"className":"OSInfoNetworkInterfaceInfoIPv4Interface"}]

// [block OSInfoNetworkInterfaceInfoIPv6Interface begin]
export interface OSInfoNetworkInterfaceInfoIPv6Interface {
  /**
   * The MAC address of the network interface
   */
  mac: string;

  /**
   * `true` if the network interface is a loopback or similar interface that is not remotely accessible; otherwise `false`
   */
  internal: boolean;
  family?: 'IPv6';

  /**
   * The assigned IPv6 address
   */
  address: string;

  /**
   * The IPv6 network mask
   */
  netmask: string;

  /**
   * The numeric IPv6 scope ID
   */
  scopeid: number;

  /**
   * The assigned IPv6 address with the routing prefix in CIDR notation. If the
   * netmask is invalid, this property is set to null.
   */
  cidr:
    | string

    | null;
}
// [block OSInfoNetworkInterfaceInfoIPv6Interface end]
//meta:OSInfoNetworkInterfaceInfoIPv6Interface:[{"className":"OSInfoNetworkInterfaceInfoIPv6Interface"}]
