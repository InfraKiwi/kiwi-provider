// Generated with: yarn gen -> cmd/schemaGen.ts


import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

// Docs can be found at: https://systeminformation.io/#docs

export const ModuleInfoSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    system: Joi.object({}).unknown(false),
    bios: Joi.object({}).unknown(false),
    baseboard: Joi.object({}).unknown(false),
    chassis: Joi.object({}).unknown(false),
    osInfo: Joi.object({}).unknown(false),
    versions: Joi.object({apps: Joi.string()}),
    shell: Joi.object({}).unknown(false),
    uuid: Joi.object({}).unknown(false),
    cpu: Joi.object({}).unknown(false),
    cpuFlags: Joi.object({}).unknown(false),
    cpuCache: Joi.object({}).unknown(false),
    cpuCurrentSpeed: Joi.object({}).unknown(false),
    cpuTemperature: Joi.object({}).unknown(false),
    currentLoad: Joi.object({}).unknown(false),
    fullLoad: Joi.object({}).unknown(false),
    mem: Joi.object({}).unknown(false),
    memLayout: Joi.object({}).unknown(false),
    battery: Joi.object({}).unknown(false),
    graphics: Joi.object({}).unknown(false),
    fsSize: Joi.object({drive: Joi.string()}),
    fsOpenFiles: Joi.object({}).unknown(false),
    blockDevices: Joi.object({}).unknown(false),
    fsStats: Joi.object({}).unknown(false),
    disksIO: Joi.object({}).unknown(false),
    diskLayout: Joi.object({}).unknown(false),
    networkInterfaceDefault: Joi.object({}).unknown(false),
    networkGatewayDefault: Joi.object({}).unknown(false),
    networkInterfaces: Joi.object({}).unknown(false),
    networkStats: Joi.object({ifaces: Joi.string()}),
    networkConnections: Joi.object({}).unknown(false),
    inetChecksite: Joi.object({url: Joi.string().required()}),
    inetLatency: Joi.object({host: Joi.string()}),
    wifiNetworks: Joi.object({}).unknown(false),
    wifiInterfaces: Joi.object({}).unknown(false),
    wifiConnections: Joi.object({}).unknown(false),
    users: Joi.object({}).unknown(false),
    processes: Joi.object({}).unknown(false),
    processLoad: Joi.object({processNames: Joi.string().required()}),
    services: Joi.object({serviceName: Joi.string().required()}),
    dockerInfo: Joi.object({}).unknown(false),
    dockerImages: Joi.object({all: Joi.boolean()}),
    dockerContainers: Joi.object({all: Joi.boolean()}),
    dockerContainerStats: Joi.object({id: Joi.string()}),
    dockerContainerProcesses: Joi.object({id: Joi.string()}),
    dockerVolumes: Joi.object({}).unknown(false),
    dockerAll: Joi.object({}).unknown(false),
    vboxInfo: Joi.object({}).unknown(false),
    printer: Joi.object({}).unknown(false),
    usb: Joi.object({}).unknown(false),
    audio: Joi.object({}).unknown(false),
    bluetoothDevices: Joi.object({}).unknown(false),
    getStaticData: Joi.object({}).unknown(false),
    get: Joi.object({valuesObject: Joi.any().required()})
  }),
);
  