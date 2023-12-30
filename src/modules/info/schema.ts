/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

// Docs can be found at: https://systeminformation.io/#docs

export const ModuleInfoSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    system: Joi.boolean().description(`hardware information`),
    bios: Joi.boolean().description(`bios information`),
    baseboard: Joi.boolean().description(`baseboard information`),
    chassis: Joi.boolean().description(`chassis information`),
    osInfo: Joi.boolean().description(`OS information`),
    versions: Joi.object({ apps: Joi.string() })
      .description(`version information (kernel, ssl, node, ...)
apps param is optional for detecting
only specific apps/libs
(string, comma separated)`),
    shell: Joi.boolean().description(`standard shell`),
    uuid: Joi.boolean().description(`object of several UUIDs`),
    cpu: Joi.boolean().description(`CPU information`),
    cpuFlags: Joi.boolean().description(`CPU flags`),
    cpuCache: Joi.boolean().description(`CPU cache sizes`),
    cpuCurrentSpeed: Joi.boolean().description(`current CPU speed (in GHz)`),
    cpuTemperature: Joi.boolean().description(
      `CPU temperature in C (if supported)`,
    ),
    currentLoad: Joi.boolean().description(`CPU-Load`),
    fullLoad: Joi.boolean().description(`CPU full load since bootup in %`),
    mem: Joi.boolean().description(`Memory information (in bytes)`),
    memLayout: Joi.boolean().description(`Memory Layout (array)`),
    battery: Joi.boolean().description(`battery information`),
    graphics: Joi.boolean().description(
      `arrays of graphics controllers and displays`,
    ),
    fsSize: Joi.object({ drive: Joi.string() })
      .description(`returns array of mounted file systems
drive param is optional`),
    fsOpenFiles: Joi.boolean().description(
      `count max/allocated file descriptors`,
    ),
    blockDevices: Joi.boolean().description(`returns array of disks, partitions,
raids and roms`),
    fsStats: Joi.boolean().description(`current transfer stats`),
    disksIO: Joi.boolean().description(`current transfer stats`),
    diskLayout: Joi.boolean().description(`physical disk layout (array)`),
    networkInterfaceDefault: Joi.boolean().description(
      `get name of default network interface`,
    ),
    networkGatewayDefault: Joi.boolean().description(
      `get default network gateway`,
    ),
    networkInterfaces: Joi.boolean().description(`array of network interfaces
With the 'default' parameter it returns
only the default interface`),
    networkStats: Joi.object({ ifaces: Joi.string() })
      .description(`current network stats of given interfaces
iface list: space or comma separated
iface parameter is optional
defaults to first external network interface,
Pass '*' for all interfaces`),
    networkConnections: Joi.boolean()
      .description(`current network network connections
returns an array of all connections`),
    inetChecksite: Joi.object({ url: Joi.string().required() }).description(
      `response-time (ms) to fetch given URL`,
    ),
    inetLatency: Joi.object({ host: Joi.string() })
      .description(`response-time (ms) to external resource
host parameter is optional (default 8.8.8.8)`),
    wifiNetworks: Joi.boolean().description(`array of available wifi networks`),
    wifiInterfaces: Joi.boolean().description(
      `array of detected wifi interfaces`,
    ),
    wifiConnections: Joi.boolean().description(
      `array of active wifi connections`,
    ),
    users: Joi.boolean().description(`array of users online`),
    processes: Joi.boolean().description(`# running processes`),
    processLoad: Joi.object({ processNames: Joi.string().required() })
      .description(`pass comma separated string of processes
pass "*" for ALL processes (linux/win only)`),
    services: Joi.object({ serviceName: Joi.string().required() })
      .description(`pass comma separated string of services
pass "*" for ALL services (linux/win only)`),
    dockerInfo: Joi.boolean().description(`returns general docker info`),
    dockerImages: Joi.object({ all: Joi.boolean() }).description(
      `returns array of top level/all docker images`,
    ),
    dockerContainers: Joi.object({ all: Joi.boolean() }).description(
      `returns array of active/all docker containers`,
    ),
    dockerContainerStats: Joi.object({ id: Joi.string() })
      .description(`statistics for specific containers
container IDs: space or comma separated,
pass '*' for all containers`),
    dockerContainerProcesses: Joi.object({ id: Joi.string() }).description(
      `array of processes inside a container`,
    ),
    dockerVolumes: Joi.boolean().description(`volume name`),
    dockerAll: Joi.boolean()
      .description(`list of all containers including their stats
and processes in one single array`),
    vboxInfo: Joi.boolean().description(
      `returns array general virtual box info`,
    ),
    printer: Joi.boolean().description(`get printer information`),
    usb: Joi.boolean().description(`get detected USB devices`),
    audio: Joi.boolean().description(`get printer information`),
    bluetoothDevices: Joi.boolean().description(`...`),
  }),
);
