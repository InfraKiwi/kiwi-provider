// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleInfoInterface begin]
export interface ModuleInfoInterface {
  /**
   * hardware information
   */
  system?: boolean;

  /**
   * bios information
   */
  bios?: boolean;

  /**
   * baseboard information
   */
  baseboard?: boolean;

  /**
   * chassis information
   */
  chassis?: boolean;

  /**
   * OS information
   */
  osInfo?: boolean;

  /**
   * version information (kernel, ssl, node, ...)
   * apps param is optional for detecting
   * only specific apps/libs
   * (string, comma separated)
   */
  versions?: {
    apps?: string;
  };

  /**
   * standard shell
   */
  shell?: boolean;

  /**
   * object of several UUIDs
   */
  uuid?: boolean;

  /**
   * CPU information
   */
  cpu?: boolean;

  /**
   * CPU flags
   */
  cpuFlags?: boolean;

  /**
   * CPU cache sizes
   */
  cpuCache?: boolean;

  /**
   * current CPU speed (in GHz)
   */
  cpuCurrentSpeed?: boolean;

  /**
   * CPU temperature in C (if supported)
   */
  cpuTemperature?: boolean;

  /**
   * CPU-Load
   */
  currentLoad?: boolean;

  /**
   * CPU full load since bootup in %
   */
  fullLoad?: boolean;

  /**
   * Memory information (in bytes)
   */
  mem?: boolean;

  /**
   * Memory Layout (array)
   */
  memLayout?: boolean;

  /**
   * battery information
   */
  battery?: boolean;

  /**
   * arrays of graphics controllers and displays
   */
  graphics?: boolean;

  /**
   * returns array of mounted file systems
   * drive param is optional
   */
  fsSize?: {
    drive?: string;
  };

  /**
   * count max/allocated file descriptors
   */
  fsOpenFiles?: boolean;

  /**
   * returns array of disks, partitions,
   * raids and roms
   */
  blockDevices?: boolean;

  /**
   * current transfer stats
   */
  fsStats?: boolean;

  /**
   * current transfer stats
   */
  disksIO?: boolean;

  /**
   * physical disk layout (array)
   */
  diskLayout?: boolean;

  /**
   * get name of default network interface
   */
  networkInterfaceDefault?: boolean;

  /**
   * get default network gateway
   */
  networkGatewayDefault?: boolean;

  /**
   * array of network interfaces
   * With the 'default' parameter it returns
   * only the default interface
   */
  networkInterfaces?: boolean;

  /**
   * current network stats of given interfaces
   * iface list: space or comma separated
   * iface parameter is optional
   * defaults to first external network interface,
   * Pass '*' for all interfaces
   */
  networkStats?: {
    ifaces?: string;
  };

  /**
   * current network network connections
   * returns an array of all connections
   */
  networkConnections?: boolean;

  /**
   * response-time (ms) to fetch given URL
   */
  inetChecksite?: {
    url: string;
  };

  /**
   * response-time (ms) to external resource
   * host parameter is optional (default 8.8.8.8)
   */
  inetLatency?: {
    host?: string;
  };

  /**
   * array of available wifi networks
   */
  wifiNetworks?: boolean;

  /**
   * array of detected wifi interfaces
   */
  wifiInterfaces?: boolean;

  /**
   * array of active wifi connections
   */
  wifiConnections?: boolean;

  /**
   * array of users online
   */
  users?: boolean;

  /**
   * # running processes
   */
  processes?: boolean;

  /**
   * pass comma separated string of processes
   * pass "*" for ALL processes (linux/win only)
   */
  processLoad?: {
    processNames: string;
  };

  /**
   * pass comma separated string of services
   * pass "*" for ALL services (linux/win only)
   */
  services?: {
    serviceName: string;
  };

  /**
   * returns general docker info
   */
  dockerInfo?: boolean;

  /**
   * returns array of top level/all docker images
   */
  dockerImages?: {
    all?: boolean;
  };

  /**
   * returns array of active/all docker containers
   */
  dockerContainers?: {
    all?: boolean;
  };

  /**
   * statistics for specific containers
   * container IDs: space or comma separated,
   * pass '*' for all containers
   */
  dockerContainerStats?: {
    id?: string;
  };

  /**
   * array of processes inside a container
   */
  dockerContainerProcesses?: {
    id?: string;
  };

  /**
   * volume name
   */
  dockerVolumes?: boolean;

  /**
   * list of all containers including their stats
   * and processes in one single array
   */
  dockerAll?: boolean;

  /**
   * returns array general virtual box info
   */
  vboxInfo?: boolean;

  /**
   * get printer information
   */
  printer?: boolean;

  /**
   * get detected USB devices
   */
  usb?: boolean;

  /**
   * get printer information
   */
  audio?: boolean;

  /**
   * ...
   */
  bluetoothDevices?: boolean;
}
// [block ModuleInfoInterface end]

export type ModuleInfoInterfaceConfigKey = 'info';
export const ModuleInfoInterfaceConfigKeyFirst = 'info';
