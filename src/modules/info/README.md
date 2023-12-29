# `info`

You can use the `info` module to extract information from the current system (e.g. the current CPU architecture).

This module is a direct implementation of the wonderful [https://systeminformation.io/](https://systeminformation.io/)
library.

## Examples

![embed examples/simple.yaml]

## Reference

Key: `info`

![type ModuleInfoInterface ./schema.gen.ts]

#### 1. System (HW)

| Function         | Result object | Linux | Mac | Win | Comments                         |
| ---------------- | ------------- | ----- | --- | --- | -------------------------------- |
| `system()` | `{...}` |  X     | X   | X   | hardware information |
|  | `manufacturer` |  X     | X   | X   | e.g. 'MSI' |
|  | `model` |  X     | X   | X   | model/product e.g. 'MS-7823' |
|  | `version` |  X     | X   | X   | version e.g. '1.0' |
|  | `serial` |  X     | X   | X   | serial number |
|  | `uuid` |  X     | X   | X   | UUID |
|  | `sku` |  X     | X   | X   | SKU number |
|  | `virtual` |  X     |     | X   | is virtual machine |
|  | `virtualHost` |  X     |     | X   | virtual host (if virtual) |
|  | `raspberry` |  X     |     |     | optional raspberry revision data |
| `bios()` | `{...}` |  X     | X   | X   | bios information |
|  | `vendor` |  X     | X   | X   | e.g. 'AMI' |
|  | `version` |  X     | X   | X   | version |
|  | `releaseDate` |  X     |     | X   | release date |
|  | `revision` |  X     |     | X   | revision |
|  | `serial` |  X     |     | X   | serial |
| `baseboard()` | `{...}` |  X     | X   | X   | baseboard information |
|  | `manufacturer` |  X     | X   | X   | e.g. 'ASUS' |
|  | `model` |  X     | X   | X   | model / product name |
|  | `version` |  X     | X   | X   | version |
|  | `serial` |  X     | X   | X   | serial number |
|  | `assetTag` |  X     | X   | X   | asset tag |
|  | `memMax` |  X     | X   | X   | max memory in bytes |
|  | `memSlots` |  X     | X   | X   | memory slots on baseboard |
| `chassis()` | `{...}` |  X     | X   | X   | chassis information |
|  | `manufacturer` |  X     | X   | X   | e.g. 'MSI' |
|  | `model` |  X     | X   | X   | model / product name |
|  | `type` |  X     | X   | X   | model / product name |
|  | `version` |  X     | X   | X   | version |
|  | `serial` |  X     | X   | X   | serial number |
|  | `assetTag` |  X     | X   | X   | asset tag |
|  | `sku` |        |     | X   | SKU number |

#### 2. CPU

| Function               | Result object    | Linux | Mac | Win | Comments                            |
| ---------------------- | ---------------- | ----- | --- | --- | ----------------------------------- |
| `cpu()` | `{...}` |  X     | X   | X   | CPU information |
|  | `manufacturer` |  X     | X   | X   | e.g. 'Intel(R)' |
|  | `brand` |  X     | X   | X   | e.g. 'Core(TM)2 Duo' |
|  | `speed` |  X     | X   | X   | in GHz e.g. '3.40' |
|  | `speedMin` |  X     | X   | X   | in GHz e.g. '0.80' |
|  | `speedMax` |  X     | X   | X   | in GHz e.g. '3.90' |
|  | `governor` |  X     |     |     | e.g. 'powersave' |
|  | `cores` |  X     | X   | X   | # cores |
|  | `physicalCores` |  X     | X   | X   | # physical cores |
|  | `efficiencyCores` |  X     | X   |     | # efficiency cores |
|  | `performanceCores` |  X     | X   |     | # performance cores |
|  | `processors` |  X     | X   | X   | # processors |
|  | `socket` |  X     |     | X   | socket type e.g. "LGA1356" |
|  | `vendor` |  X     | X   | X   | vendor ID |
|  | `family` |  X     | X   | X   | processor family |
|  | `model` |  X     | X   | X   | processor model |
|  | `stepping` |  X     | X   | X   | processor stepping |
|  | `revision` |  X     | X   | X   | revision |
|  | `voltage` |        |     |     | voltage |
|  | `flags` |  X     | X   | X   | CPU flags |
|  | `virtualization` |  X     | X   | X   | virtualization supported |
|  | `cache` |  X     | X   | X   | cache in bytes (object) |
|  | `cache.l1d` |  X     | X   | X   | L1D (data) size |
|  | `cache.l1i` |  X     | X   | X   | L1I (instruction) size |
|  | `cache.l2` |  X     | X   | X   | L2 size |
|  | `cache.l3` |  X     | X   | X   | L3 size |
| `cpuFlags()` | `: string` |  X     | X   | X   | CPU flags |
| `cpuCache()` | `{...}` |  X     | X   | X   | CPU cache sizes |
|  | `l1d` |  X     | X   | X   | L1D size |
|  | `l1i` |  X     | X   | X   | L1I size |
|  | `l2` |  X     | X   | X   | L2 size |
|  | `l3` |  X     | X   | X   | L3 size |
| `cpuCurrentSpeed()` | `{...}` |  X     | X   | X   | current CPU speed (in GHz) |
|  | `avg` |  X     | X   | X   | avg CPU speed (all cores) |
|  | `min` |  X     | X   | X   | min CPU speed (all cores) |
|  | `max` |  X     | X   | X   | max CPU speed (all cores) |
|  | `cores` |  X     | X   | X   | CPU speed per core (array) |
| `cpuTemperature()` | `{...}` |  X     | X*  | X   | CPU temperature in C (if supported) |
|  | `main` |  X     | X   | X   | main temperature (avg) |
|  | `cores` |  X     | X   | X   | array of temperatures |
|  | `max` |  X     | X   | X   | max temperature |
|  | `socket` |  X     |     |     | array socket temperatures |
|  | `chipset` |  X     |     |     | chipset temperature |

#### 3. Memory

| Function         | Result object         | Linux | Mac | Win | Comments                               |
| ---------------- | --------------------- | ----- | --- | --- | -------------------------------------- |
| `mem()` | `{...}` |  X     | X   | X   | Memory information (in bytes) |
|  | `total` |  X     | X   | X   | total memory in bytes |
|  | `free` |  X     | X   | X   | not used in bytes |
|  | `used` |  X     | X   | X   | used (incl. buffers/cache) |
|  | `active` |  X     | X   | X   | used actively (excl. buffers/cache) |
|  | `buffcache` |  X     | X   |     | used by buffers+cache |
|  | `buffers` |  X     |     |     | used by buffers |
|  | `cached` |  X     |     |     | used by cache |
|  | `slab` |  X     |     |     | used by slab |
|  | `available` |  X     | X   | X   | potentially available (total - active) |
|  | `swaptotal` |  X     | X   | X   |  |
|  | `swapused` |  X     | X   | X   |  |
|  | `swapfree` |  X     | X   | X   |  |
|  | `writeback` |  X     |     |     |  |
|  | `dirty` |  X     |     |     |  |
| `memLayout()` | `[{...}]` |  X     | X   | X   | Memory Layout (array) |
|  | `[0].size` |  X     | X   | X   | size in bytes |
|  | `[0].bank` |  X     |     | X   | memory bank |
|  | `[0].type` |  X     | X   | X   | memory type |
|  | `[0].clockSpeed` |  X     | X   | X   | clock speed |
|  | `[0].formFactor` |  X     |     | X   | form factor |
|  | `[0].manufacturer` |  X     | X   | X   | manufacturer |
|  | `[0].partNum` |  X     | X   | X   | part number |
|  | `[0].serialNum` |  X     | X   | X   | serial number |
|  | `[0].voltageConfigured` |  X     |     | X   | voltage conf. |
|  | `[0].voltageMin` |  X     |     | X   | voltage min |
|  | `[0].voltageMax` |  X     |     | X   | voltage max |

#### 4. Battery

| Function       | Result object    | Linux | Mac | Win | Comments                          |
| -------------- | ---------------- | ----- | --- | --- | --------------------------------- |
| `battery()` | `{...}` |  X     | X   | X   | battery information |
|  | `hasBattery` |  X     | X   | X   | indicates presence of battery |
|  | `cycleCount` |  X     | X   |     | numbers of recharges |
|  | `isCharging` |  X     | X   | X   | indicates if battery is charging |
|  | `designedCapacity` |  X     | X   | X   | max capacity of battery (mWh) |
|  | `maxCapacity` |  X     | X   | X   | max capacity of battery (mWh) |
|  | `currentCapacity` |  X     | X   | X   | current capacity of battery (mWh) |
|  | `capacityUnit` |  X     | X   | X   | capacity unit (mWh) |
|  | `voltage` |  X     | X   | X   | current voltage of battery (V) |
|  | `percent` |  X     | X   | X   | charging level in percent |
|  | `timeRemaining` |  X     | X   |     | minutes left (if discharging) |
|  | `acConnected` |  X     | X   | X   | AC connected |
|  | `type` |  X     | X   |     | battery type |
|  | `model` |  X     | X   |     | model |
|  | `manufacturer` |  X     | X   |     | manufacturer |
|  | `serial` |  X     | X   |     | battery serial |

* See known issues if you have a problem with macOS temperature or windows temperature

#### 5. Graphics

| Function        | Result object             | Linux | Mac | Win | Comments                                    |
| --------------- | ------------------------- | ----- | --- | --- | ------------------------------------------- |
| `graphics()` | `{...}` |  X     | X   | X   | arrays of graphics controllers and displays |
|  | `controllers[]` |  X     | X   | X   | graphics controllers array |
|  | `...[0].vendor` |  X     | X   | X   | e.g. NVIDIA |
|  | `...[0].subVendor` |  X     |     |     | e.g. Gigabyte |
|  | `...[0].vendorId` |        | X   |     | vendor ID |
|  | `...[0].model` |  X     | X   | X   | graphics controller model |
|  | `...[0].deviceId` |        | X   |     | device ID |
|  | `...[0].bus` |  X     | X   | X   | on which bus (e.g. PCIe) |
|  | `...[0].vram` |  X     | X   | X   | VRAM size (in MB) |
|  | `...[0].vramDynamic` |  X     | X   | X   | true if dynamically allocated ram |
|  | `...[0].external` |        | X   |     | is external GPU |
|  | `...[0].cores` |        | X   |     | Apple silicon only |
|  | `...[0].metalVersion` |        | X   |     | Apple Metal Version |
|  | `displays[]` |  X     | X   | X   | monitor/display array |
|  | `...[0].vendor` |        |     | X   | monitor/display vendor |
|  | `...[0].vendorId` |        | X   |     | vendor ID |
|  | `...[0].deviceName` |        |     | X   | e.g. \\\\.\\DISPLAY1 |
|  | `...[0].model` |  X     | X   | X   | monitor/display model |
|  | `...[0].productionYear` |        | X   |     | production year |
|  | `...[0].serial` |        | X   |     | serial number |
|  | `...[0].displayId` |        | X   |     | display ID |
|  | `...[0].main` |  X     | X   | X   | true if main monitor |
|  | `...[0].builtin` |  X     | X   |     | true if built-in monitor |
|  | `...[0].connection` |  X     | X   | X   | e.g. DisplayPort or HDMI |
|  | `...[0].sizeX` |  X     |     | X   | size in mm horizontal |
|  | `...[0].sizeY` |  X     |     | X   | size in mm vertical |
|  | `...[0].pixelDepth` |  X     | X   | X   | color depth in bits |
|  | `...[0].resolutionX` |  X     | X   | X   | pixel horizontal |
|  | `...[0].resolutionY` |  X     | X   | X   | pixel vertical |
|  | `...[0].currentResX` |  X     | X   | X   | current pixel horizontal |
|  | `...[0].currentResY` |  X     | X   | X   | current pixel vertical |
|  | `...[0].positionX` |        | X   | X   | display position X |
|  | `...[0].positionY` |        | X   | X   | display position Y |
|  | `...[0].currentRefreshRate` |  X     | X   | X   | current screen refresh rate |

#### 6. Operating System

| Function              | Result object | Linux | Mac | Win | Comments                                                                                                                                           |
| --------------------- | ------------- | ----- | --- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `osInfo()` | `{...}` |  X     | X   | X   | OS information |
|  | `platform` |  X     | X   | X   | 'linux', 'darwin', 'Windows', ... |
|  | `distro` |  X     | X   | X   |  |
|  | `release` |  X     | X   | X   |  |
|  | `codename` |  X     | X   |     |  |
|  | `kernel` |  X     | X   | X   | kernel release - same as os.release() |
|  | `arch` |  X     | X   | X   | same as os.arch() |
|  | `hostname` |  X     | X   | X   | same as os.hostname() |
|  | `fqdn` |  X     | X   | X   | FQDN fully qualified domain name |
|  | `codepage` |  X     | X   | X   | OS build version |
|  | `logofile` |  X     | X   | X   | e.g. 'apple', 'debian', 'fedora', ... |
|  | `serial` |  X     | X   | X   | OS/Host serial number |
|  | `build` |  X     | X   | X   | OS build version |
|  | `servicepack` |        |     | X   | service pack version |
|  | `uefi` |  X     | X   | X   | OS started via UEFI |
|  | `hypervisor` |        |     | X   | hyper-v enabled? (win only) |
|  | `remoteSession` |        |     | X   | runs in remote session (win only) |
| `uuid()` | `{...}` |  X     | X   | X   | object of several UUIDs |
|  | `os` |  X     | X   | X   | os specific UUID |
|  | `hardware` |  X     | X   | X   | hardware specific UUID |
|  | `macs` |  X     | X   | X   | MAC addresses |
| `versions(apps)` | `{...}` |  X     | X   | X   | version information (kernel, ssl, node, ...)<br />apps param is optional for detecting<br />only specific apps/libs<br />(string, comma separated) |
| `shell()` | `: string` |  X     | X   | X   | standard shell |
| `users()` | `[{...}]` |  X     | X   | X   | array of users online |
|  | `[0].user` |  X     | X   | X   | user name |
|  | `[0].tty` |  X     | X   | X   | terminal |
|  | `[0].date` |  X     | X   | X   | login date |
|  | `[0].time` |  X     | X   | X   | login time |
|  | `[0].ip` |  X     | X   |     | ip address (remote login) |
|  | `[0].command` |  X     | X   |     | last command or shell |

#### 7. Current Load, Processes & Services

| Function                             | Result object     | Linux | Mac | Win | Comments                                                                                |
| ------------------------------------ | ----------------- | ----- | --- | --- | --------------------------------------------------------------------------------------- |
| `currentLoad()` | `{...}` |  X     | X   | X   | CPU-Load |
|  | `avgLoad` |  X     | X   |     | average load |
|  | `currentLoad` |  X     | X   | X   | CPU load in % |
|  | `currentLoadUser` |  X     | X   | X   | CPU load user in % |
|  | `currentLoadSystem` |  X     | X   | X   | CPU load system in % |
|  | `currentLoadNice` |  X     | X   | X   | CPU load nice in % |
|  | `currentLoadIdle` |  X     | X   | X   | CPU load idle in % |
|  | `currentLoadIrq` |  X     | X   | X   | CPU load system in % |
|  | `rawCurrentLoad...` |  X     | X   | X   | CPU load raw values (ticks) |
|  | `cpus[]` |  X     | X   | X   | current loads per CPU in % + raw ticks |
| `fullLoad()` | `: integer` |  X     | X   | X   | CPU full load since bootup in % |
| `processes()` | `{...}` |  X     | X   | X   | # running processes |
|  | `all` |  X     | X   | X   | # of all processes |
|  | `running` |  X     | X   |     | # of all processes running |
|  | `blocked` |  X     | X   |     | # of all processes blocked |
|  | `sleeping` |  X     | X   |     | # of all processes sleeping |
|  | `unknown` |        |     | X   | # of all processes unknown status |
|  | `list[]` |  X     | X   | X   | list of all processes incl. details |
|  | `...[0].pid` |  X     | X   | X   | process PID |
|  | `...[0].parentPid` |  X     | X   | X   | parent process PID |
|  | `...[0].name` |  X     | X   | X   | process name |
|  | `...[0].cpu` |  X     | X   | X   | process % CPU usage |
|  | `...[0].cpuu` |  X     |     | X   | process % CPU usage (user) |
|  | `...[0].cpus` |  X     |     | X   | process % CPU usage (system) |
|  | `...[0].mem` |  X     | X   | X   | process memory % |
|  | `...[0].priority` |  X     | X   | X   | process priority |
|  | `...[0].memVsz` |  X     | X   | X   | process virtual memory size |
|  | `...[0].memRss` |  X     | X   | X   | process mem resident set size |
|  | `...[0].nice` |  X     | X   |     | process nice value |
|  | `...[0].started` |  X     | X   | X   | process start time |
|  | `...[0].state` |  X     | X   | X   | process state (e.g. sleeping) |
|  | `...[0].tty` |  X     | X   |     | tty from which process was started |
|  | `...[0].user` |  X     | X   |     | user who started process |
|  | `...[0].command` |  X     | X   | X   | process starting command |
|  | `...[0].params` |  X     | X   |     | process params |
|  | `...[0].path` |  X     | X   | X   | process path |
|  | `proc` |  X     | X   | X   | process name |
|  | `pid` |  X     | X   | X   | PID |
|  | `pids` |  X     | X   | X   | additional pids |
|  | `cpu` |  X     | X   | X   | process % CPU |
|  | `mem` |  X     | X   | X   | process % MEM |
| `services('mysql, apache2')` | `[{...}]` |  X     | X   | X   | pass comma separated string of services<br>pass "*" for ALL services (linux/win only) |
|  | `[0].name` |  X     | X   | X   | name of service |
|  | `[0].running` |  X     | X   | X   | true / false |
|  | `[0].startmode` |        |     | X   | manual, automatic, ... |
|  | `[0].pids` |  X     | X   | X   | pids |
|  | `[0].cpu` |  X     | X   |     | process % CPU |
|  | `[0].mem` |  X     | X   |     | process % MEM |
| `processLoad('mysql, apache2')` | `[{...}]` |  X     | X   | X   | pass comma separated string of processes<br>pass "*" for ALL processes (linux/win only) |
|  | `[0].proc` |  X     | X   | X   | name of process |
|  | `[0].pids` |  X     | X   | X   | pids |
|  | `[0].cpu` |  X     | X   |     | process % CPU |
|  | `[0].mem` |  X     | X   |     | process % MEM |

#### 8. File System

| Function             | Result object         | Linux | Mac | Win | Comments                                                                 |
| -------------------- | --------------------- | ----- | --- | --- | ------------------------------------------------------------------------ |
| `diskLayout()` | `[{...}]` |  X     | X   | X   | physical disk layout (array) |
|  | `[0].device` |  X     | X   |     | e.g. /dev/sda |
|  | `[0].type` |  X     | X   | X   | HD, SSD, NVMe |
|  | `[0].name` |  X     | X   | X   | disk name |
|  | `[0].vendor` |  X     |     | X   | vendor/producer |
|  | `[0].size` |  X     | X   | X   | size in bytes |
|  | `[0].bytesPerSector` |        |     | X   | bytes per sector |
|  | `[0].totalCylinders` |        |     | X   | total cylinders |
|  | `[0].totalHeads` |        |     | X   | total heads |
|  | `[0].totalSectors` |        |     | X   | total sectors |
|  | `[0].totalTracks` |        |     | X   | total tracks |
|  | `[0].tracksPerCylinder` |        |     | X   | tracks per cylinder |
|  | `[0].sectorsPerTrack` |        |     | X   | sectors per track |
|  | `[0].firmwareRevision` |  X     | X   | X   | firmware revision |
|  | `[0].serialNum` |  X     | X   | X   | serial number |
|  | `[0].interfaceType` |  X     |     | X   | SATA, PCIe, ... |
|  | `[0].smartStatus` |  X     | X   | X   | S.M.A.R.T Status (see Known Issues) |
|  | `[0].temperature` |  X     |     |     | S.M.A.R.T temperature |
|  | `[0].smartData` |  X     |     | X   | full S.M.A.R.T data from smartctl<br>requires at least smartmontools 7.0 |
| `blockDevices()` | `[{...}]` |  X     | X   | X   | returns array of disks, partitions,<br>raids and roms |
|  | `[0].name` |  X     | X   | X   | name |
|  | `[0].type` |  X     | X   | X   | type |
|  | `[0].fstype` |  X     | X   | X   | file system type (e.g. ext4) |
|  | `[0].mount` |  X     | X   | X   | mount point |
|  | `[0].size` |  X     | X   | X   | size in bytes |
|  | `[0].physical` |  X     | X   | X   | physical type (HDD, SSD, CD/DVD) |
|  | `[0].uuid` |  X     | X   | X   | UUID |
|  | `[0].label` |  X     | X   | X   | label |
|  | `[0].model` |  X     | X   |     | model |
|  | `[0].serial` |  X     |     | X   | serial |
|  | `[0].removable` |  X     | X   | X   | serial |
|  | `[0].protocol` |  X     | X   |     | protocol (SATA, PCI-Express, ...) |
|  | `[0].group` |  X     |     |     | Raid group member (e.g. md1) |
|  | `[0].device` |  X     | X   | X   | physical device mapped to (e.g. /dev/sda) |
| `disksIO()` | `{...}` |  X     | X   |     | current transfer stats |
|  | `rIO` |  X     | X   |     | read IOs on all mounted drives |
|  | `wIO` |  X     | X   |     | write IOs on all mounted drives |
|  | `tIO` |  X     | X   |     | write IOs on all mounted drives |
|  | `rIO_sec` |  X     | X   |     | read IO per sec (* see notes) |
|  | `wIO_sec` |  X     | X   |     | write IO per sec (* see notes) |
|  | `tIO_sec` |  X     | X   |     | total IO per sec (* see notes) |
|  | `rWaitTime` |  X     |     |     | read IO request time (* see notes) |
|  | `wWaitTime` |  X     |     |     | write IO request time (* see notes) |
|  | `tWaitTime` |  X     |     |     | total IO request time (* see notes) |
|  | `rWaitPercent` |  X     |     |     | read IO request time percent (* see notes) |
|  | `wWaitPercent` |  X     |     |     | write IO request time percent (* see notes) |
|  | `tWaitPercent` |  X     |     |     | total IO request time percent (* see notes) |
|  | `ms` |  X     | X   |     | interval length (for per second values) |
| `fsSize(drive)` | `[{...}]` |  X     | X   | X   | returns array of mounted file systems<br>drive param is optional |
|  | `[0].fs` |  X     | X   | X   | name of file system |
|  | `[0].type` |  X     | X   | X   | type of file system |
|  | `[0].size` |  X     | X   | X   | sizes in bytes |
|  | `[0].used` |  X     | X   | X   | used in bytes |
|  | `[0].available` |  X     | X   | X   | used in bytes |
|  | `[0].use` |  X     | X   | X   | used in % |
|  | `[0].mount` |  X     | X   | X   | mount point |
|  | `[0].rw` |  X     | X   | X   | read and write (false if read only) |
| `fsOpenFiles()` | `{...}` |  X     | X   |     | count max/allocated file descriptors |
|  | `max` |  X     | X   |     | max file descriptors |
|  | `allocated` |  X     | X   |     | current open files count |
|  | `available` |  X     | X   |     | count available |
| `fsStats()` | `{...}` |  X     | X   |     | current transfer stats |
|  | `rx` |  X     | X   |     | bytes read since startup |
|  | `wx` |  X     | X   |     | bytes written since startup |
|  | `tx` |  X     | X   |     | total bytes read + written since startup |
|  | `rx_sec` |  X     | X   |     | bytes read / second (* see notes) |
|  | `wx_sec` |  X     | X   |     | bytes written / second (* see notes) |
|  | `tx_sec` |  X     | X   |     | total bytes reads + written / second |
|  | `ms` |  X     | X   |     | interval length (for per second values) |

#### 9. USB

| Function   | Result object    | Linux | Mac | Win | Comments                 |
| ---------- | ---------------- | ----- | --- | --- | ------------------------ |
| `usb()` | `[{...}]` |  X     | X   | X   | get detected USB devices |
|  | `[0].bus` |  X     |     |     | USB bus |
|  | `[0].deviceId` |  X     |     |     | bus device id |
|  | `[0].id` |  X     | X   | X   | internal id |
|  | `[0].name` |  X     | X   | X   | name |
|  | `[0].type` |  X     | X   | X   | name |
|  | `[0].removable` |        | X   |     | is removable |
|  | `[0].vendor` |  X     | X   |     | vendor |
|  | `[0].manufacturer` |  X     | X   | X   | manufacturer |
|  | `[0].maxPower` |  X     |     |     | max power |
|  | `[0].default` |  X     | X   | X   | is default printer |
|  | `[0].serialNumber` |        | X   |     | serial number |

#### 10. Printer

| Function       | Result object | Linux | Mac | Win | Comments                   |
| -------------- | ------------- | ----- | --- | --- | -------------------------- |
| `printer()` | `[{...}]` |  X     | X   | X   | get printer information |
|  | `[0].id` |  X     | X   | X   | internal id |
|  | `[0].name` |  X     | X   | X   | name |
|  | `[0].model` |  X     | X   | X   | model |
|  | `[0].uri` |  X     | X   |     | printer URI |
|  | `[0].uuid` |  X     |     |     | printer UUID |
|  | `[0].status` |  X     | X   | X   | printer status (e.g. idle) |
|  | `[0].local` |  X     | X   | X   | is local printer |
|  | `[0].default` |        | X   | X   | is default printer |
|  | `[0].shared` |  X     | X   | X   | is shared printer |

#### 11. Audio

| Function     | Result object     | Linux | Mac | Win | Comments                              |
| ------------ | ----------------- | ----- | --- | --- | ------------------------------------- |
| `audio()` | `[{...}]` |  X     | X   | X   | get printer information |
|  | `[0].id` |  X     | X   | X   | internal id |
|  | `[0].name` |  X     | X   | X   | name |
|  | `[0].manufacturer` |  X     | X   | X   | manufacturer |
|  | `[0].revision` |  X     |     |     | revision |
|  | `[0].driver` |  X     |     |     | driver |
|  | `[0].default` |        | X   | X   | is default |
|  | `[0].channel` |  X     | X   |     | channel e.g. USB, HDMI, ... |
|  | `[0].type` |  X     | X   | X   | type e.g. Speaker |
|  | `[0].in` |        | X   | X   | is input channel |
|  | `[0].out` |        | X   | X   | is output channel |
|  | `[0].interfaceType` |  X     | X   | X   | interface type (PCIe, USB, HDMI, ...) |
|  | `[0].status` |  X     | X   | X   | printer status (e.g. idle) |

#### 12. Network related functions

| Function                       | Result object      | Linux | Mac | Win | Comments                                                                                                                                                                                           |
| ------------------------------ | ------------------ | ----- | --- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `networkInterfaces()` | `[{...}]` |  X     | X   | X   | array of network interfaces<br>With the 'default' parameter it returns<br>only the default interface |
|  | `[0].iface` |  X     | X   | X   | interface |
|  | `[0].ifaceName` |  X     | X   | X   | interface name (differs on Windows) |
|  | `[0].default` |  X     | X   | X   | true if this is the default interface |
|  | `[0].ip4` |  X     | X   | X   | ip4 address |
|  | `[0].ip4subnet` |  X     | X   | X   | ip4 subnet mask |
|  | `[0].ip6` |  X     | X   | X   | ip6 address |
|  | `[0].ip6subnet` |  X     | X   | X   | ip6 subnet mask |
|  | `[0].mac` |  X     | X   | X   | MAC address |
|  | `[0].internal` |  X     | X   | X   | true if internal interface |
|  | `[0].virtual` |  X     | X   | X   | true if virtual interface |
|  | `[0].operstate` |  X     | X   | X   | up / down |
|  | `[0].type` |  X     | X   | X   | wireless / wired |
|  | `[0].duplex` |  X     | X   |     | duplex |
|  | `[0].mtu` |  X     | X   |     | maximum transmission unit |
|  | `[0].speed` |  X     | X   | X   | speed in MBit / s |
|  | `[0].dhcp` |  X     | X   | X   | IP address obtained by DHCP |
|  | `[0].dnsSuffix` |  X     |     | X   | DNS suffix |
|  | `[0].ieee8021xAuth` |  X     |     | X   | IEEE 802.1x auth |
|  | `[0].ieee8021xState` |  X     |     | X   | IEEE 802.1x state |
|  | `[0].carrierChanges` |  X     |     |     | # changes up/down |
| `networkInterfaceDefault()` | `: string` |  X     | X   | X   | get name of default network interface |
| `networkGatewayDefault()` | `: string` |  X     | X   | X   | get default network gateway |
| `networkStats(ifaces)` | `[{...}]` |  X     | X   | X   | current network stats of given interfaces<br>iface list: space or comma separated<br>iface parameter is optional<br>defaults to first external network interface,<br />Pass '*' for all interfaces |
|  | `[0].iface` |  X     | X   | X   | interface |
|  | `[0].operstate` |  X     | X   | X   | up / down |
|  | `[0].rx_bytes` |  X     | X   | X   | received bytes overall |
|  | `[0].rx_dropped` |  X     | X   | X   | received dropped overall |
|  | `[0].rx_errors` |  X     | X   | X   | received errors overall |
|  | `[0].tx_bytes` |  X     | X   | X   | transferred bytes overall |
|  | `[0].tx_dropped` |  X     | X   | X   | transferred dropped overall |
|  | `[0].tx_errors` |  X     | X   | X   | transferred errors overall |
|  | `[0].rx_sec` |  X     | X   | X   | received bytes / second (* see notes) |
|  | `[0].tx_sec` |  X     | X   | X   | transferred bytes per second (* see notes) |
|  | `[0].ms` |  X     | X   | X   | interval length (for per second values) |
| `networkConnections()` | `[{...}]` |  X     | X   | X   | current network network connections<br>returns an array of all connections |
|  | `[0].protocol` |  X     | X   | X   | tcp or udp |
|  | `[0].localAddress` |  X     | X   | X   | local address |
|  | `[0].localPort` |  X     | X   | X   | local port |
|  | `[0].peerAddress` |  X     | X   | X   | peer address |
|  | `[0].peerPort` |  X     | X   | X   | peer port |
|  | `[0].state` |  X     | X   | X   | like ESTABLISHED, TIME_WAIT, ... |
|  | `[0].pid` |  X     | X   | X   | process ID |
|  | `[0].process` |  X     | X   |     | process name |
| `inetChecksite(url)` | `{...}` |  X     | X   | X   | response-time (ms) to fetch given URL |
|  | `url` |  X     | X   | X   | given url |
|  | `ok` |  X     | X   | X   | status code OK (2xx, 3xx) |
|  | `status` |  X     | X   | X   | status code |
|  | `ms` |  X     | X   | X   | response time in ms |
| `inetLatency(host)` | `: number` |  X     | X   | X   | response-time (ms) to external resource<br>host parameter is optional (default 8.8.8.8) |

#### 13. Wifi

| Function               | Result object   | Linux | Mac | Win | Comments                                      |
| ---------------------- | --------------- | ----- | --- | --- | --------------------------------------------- |
| `wifiNetworks()` | `[{...}]` |  X     | X   | X   | array of available wifi networks |
|  | `[0].ssid` |  X     | X   | X   | Wifi network SSID |
|  | `[0].bssid` |  X     | X   | X   | BSSID (mac) |
|  | `[0].mode` |  X     |     |     | mode |
|  | `[0].channel` |  X     | X   | X   | channel |
|  | `[0].frequency` |  X     | X   | X   | frequency in MHz |
|  | `[0].signalLevel` |  X     | X   | X   | signal level in dB |
|  | `[0].quality` |  X     | X   | X   | quality in % |
|  | `[0].security` |  X     | X   | X   | array e.g. WPA, WPA-2 |
|  | `[0].wpaFlags` |  X     | X   | X   | array of WPA flags |
|  | `[0].rsnFlags` |  X     |     |     | array of RDN flags |
| `wifiInterfaces()` | `[{...}]` |  X     | X   | X   | array of detected wifi interfaces |
|  | `[0].id` |  X     | X   | X   | ID |
|  | `[0].iface` |  X     | X   | X   | interface |
|  | `[0].model` |  X     | X   | X   | model |
|  | `[0].vendor` |  X     | X   | X   | vendor |
|  | `[0].mac` |  X     | X   | X   | MAC address |
| `wifiConnections()` | `[{...}]` |  X     | X   | X   | array of active wifi connections |
|  | `[0].id` |  X     | X   | X   | ID |
|  | `[0].iface` |  X     | X   | X   | interface |
|  | `[0].name` |  X     | X   | X   | name |
|  | `[0].mode` |  X     | X   | X   | model |
|  | `[0].bssid` |  X     | (X) | X   | BSSID (mac) - macOS only on older os versions |
|  | `[0].mode` |  X     |     |     | mode |
|  | `[0].channel` |  X     | X   | X   | channel |
|  | `[0].frequency` |  X     | X   | X   | frequency in MHz |
|  | `[0].signalLevel` |  X     | X   | X   | signal level in dB |
|  | `[0].quality` |  X     | X   | X   | quality in % |
|  | `[0].security` |  X     | X   | X   | array e.g. WPA, WPA-2 |
|  | `[0].txRate` |  X     | X   | X   | transfer rate MBit/s |

#### 14. Bluetooth

| Function                | Result object      | Linux | Mac | Win | Comments                 |
| ----------------------- | ------------------ | ----- | --- | --- | ------------------------ |
| `bluetoothDevices()` | `[{...}]` |  X     | X   | X   | ... |
|  | `[0].device` |        | X   |     | device name |
|  | `[0].name` |  X     | X   | X   | name |
|  | `[0].macDevice` |  X     | X   |     | MAC address device |
|  | `[0].macHost` |  X     | X   |     | MAC address host |
|  | `[0].batteryPercent` |        | X   |     | battery level percent |
|  | `[0].manufacturer` |        | X   | X   | manufacturer |
|  | `[0].type` |  X     | X   | X   | type of bluetooth device |
|  | `[0].connected` |  X     | X   |     | is connected |

#### 15. Docker

| Function                            | Result object       | Linux                               | Mac | Win | Comments                                                                                                      |
| ----------------------------------- | ------------------- | ----------------------------------- | --- | --- | ------------------------------------------------------------------------------------------------------------- |
| `dockerInfo()` | `{...}` |  X                                   | X   | X   | returns general docker info |
|  | `id` |  X                                   | X   | X   | Docker ID |
|  | `containers` |  X                                   | X   | X   | number of containers |
|  | `containersRunning` |  X                                   | X   | X   | number of running containers |
|  | `containersPaused` |  X                                   | X   | X   | number of paused containers |
|  | `containersStopped` |  X                                   | X   | X   | number of stopped containers |
|  | `images` |  X                                   | X   | X   | number of images |
|  | `driver` |  X                                   | X   | X   | driver (e.g. 'devicemapper', 'overlay2') |
|  | `memoryLimit` |  X                                   | X   | X   | has memory limit |
|  | `swapLimit` |  X                                   | X   | X   | has swap limit |
|  | `kernelMemory` |  X                                   | X   | X   | has kernel memory |
|  | `cpuCfsPeriod` |  X                                   | X   | X   | has CpuCfsPeriod |
|  | `cpuCfsQuota` |  X                                   | X   | X   | has CpuCfsQuota |
|  | `cpuShares` |  X                                   | X   | X   | has CPUShares |
|  | `cpuSet` |  X                                   | X   | X   | has CPUShares |
|  | `ipv4Forwarding` |  X                                   | X   | X   | has IPv4Forwarding |
|  | `bridgeNfIptables` |  X                                   | X   | X   | has BridgeNfIptables |
|  | `bridgeNfIp6tables` |  X                                   | X   | X   | has BridgeNfIp6tables |
|  | `debug` |  X                                   | X   | X   | Debug on |
|  | `nfd` |  X                                   | X   | X   | named data networking forwarding daemon |
|  | `oomKillDisable` |  X                                   | X   | X   | out-of-memory kill disabled |
|  | `ngoroutines` |  X                                   | X   | X   | number NGoroutines |
|  | `systemTime` |  X                                   | X   | X   | docker SystemTime |
|  | `loggingDriver` |  X                                   | X   | X   | logging driver e.g. 'json-file' |
|  | `cgroupDriver` |  X                                   | X   | X   | cgroup driver e.g. 'cgroupfs' |
|  | `nEventsListener` |  X                                   | X   | X   | number NEventsListeners |
|  | `kernelVersion` |  X                                   | X   | X   | docker kernel version |
|  | `operatingSystem` |  X                                   | X   | X   | docker OS e.g. 'Docker for Mac' |
|  | `osType` |  X                                   | X   | X   | OSType e.g. 'linux' |
|  | `architecture` |  X                                   | X   | X   | architecture e.g. x86_64 |
|  | `ncpu` |  X                                   | X   | X   | number of CPUs |
|  | `memTotal` |  X                                   | X   | X   | memory total |
|  | `dockerRootDir` |  X                                   | X   | X   | docker root directory |
|  | `httpProxy` |  X                                   | X   | X   | http proxy |
|  | `httpsProxy` |  X                                   | X   | X   | https proxy |
|  | `noProxy` |  X                                   | X   | X   | NoProxy |
|  | `name` |  X                                   | X   | X   | Name |
|  | `labels` |  X                                   | X   | X   | array of labels |
|  | `experimentalBuild` |  X                                   | X   | X   | is experimental build |
|  | `serverVersion` |  X                                   | X   | X   | server version |
|  | `clusterStore` |  X                                   | X   | X   | cluster store |
|  | `clusterAdvertise` |  X                                   | X   | X   | cluster advertise |
|  | `defaultRuntime` |  X                                   | X   | X   | default runtime e.g. 'runc' |
|  | `liveRestoreEnabled` |  X                                   | X   | X   | live store enabled |
|  | `isolation` |  X                                   | X   | X   | isolation |
|  | `initBinary` |  X                                   | X   | X   | init binary |
|  | `productLicense` |  X                                   | X   | X   | product license |
| `dockerImages(all)` | `[{...}]` |  X                                   | X   | X   | returns array of top level/all docker images |
|  | `[0].id` |  X                                   | X   | X   | image ID |
|  | `[0].container` |  X                                   | X   | X   | container ID |
|  | `[0].comment` |  X                                   | X   | X   | comment |
|  | `[0].os` |  X                                   | X   | X   | OS |
|  | `[0].architecture` |  X                                   | X   | X   | architecture |
|  | `[0].parent` |  X                                   | X   | X   | parent ID |
|  | `[0].dockerVersion` |  X                                   | X   | X   | docker version |
|  | `[0].size` |  X                                   | X   | X   | image size |
|  | `[0].sharedSize` |  X                                   | X   | X   | shared size |
|  | `[0].virtualSize` |  X                                   | X   | X   | virtual size |
|  | `[0].author` |  X                                   | X   | X   | author |
|  | `[0].created` |  X                                   | X   | X   | created date / time |
|  | `[0].containerConfig` |  X                                   | X   | X   | container config object |
|  | `[0].graphDriver` |  X                                   | X   | X   | graph driver object |
|  | `[0].repoDigests` |  X                                   | X   | X   | repo digests array |
|  | `[0].repoTags` |  X                                   | X   | X   | repo tags array |
|  | `[0].config` |  X                                   | X   | X   | config object |
|  | `[0].rootFS` |  X                                   | X   | X   | root fs object |
| `dockerContainers(all)` | `[{...}]` |  X                                   | X   | X   | returns array of active/all docker containers |
|  | `[0].id` |  X                                   | X   | X   | ID of container |
|  | `[0].name` |  X                                   | X   | X   | name of container |
|  | `[0].image` |  X                                   | X   | X   | name of image |
|  | `[0].imageID` |  X                                   | X   | X   | ID of image |
|  | `[0].command` |  X                                   | X   | X   | command |
|  | `[0].created` |  X                                   | X   | X   | creation time (unix) |
|  | `[0].started` |  X                                   | X   | X   | creation time (unix) |
|  | `[0].finished` |  X                                   | X   | X   | creation time (unix) |
|  | `[0].createdAt` |  X                                   | X   | X   | creation date time string |
|  | `[0].startedAt` |  X                                   | X   | X   | creation date time string |
|  | `[0].finishedAt` |  X                                   | X   | X   | creation date time string |
|  | `[0].state` |  X                                   | X   | X   | created, running, exited |
|  | `[0].ports` |  X                                   | X   | X   | array of ports |
|  | `[0].mounts` |  X                                   | X   | X   | array of mounts |
| `dockerContainerStats(ids)` | `[{...}]` |  X                                   | X   | X   | statistics for specific containers<br>container IDs: space or comma separated,<br>pass '*' for all containers |
|  | `[0].id` |  X                                   | X   | X   | Container ID |
|  | `[0].memUsage` |  X                                   | X   | X   | memory usage in bytes |
|  | `[0].memLimit` |  X                                   | X   | X   | memory limit (max mem) in bytes |
|  | `[0].memPercent` |  X                                   | X   | X   | memory usage in percent |
|  | `[0].cpuPercent` |  X                                   | X   | X   | cpu usage in percent |
|  | `[0].pids` |  X                                   | X   | X   | number of processes |
|  | `[0].netIO.rx` |  X                                   | X   | X   | received bytes via network |
|  | `[0].netIO.wx` |  X                                   | X   | X   | sent bytes via network |
|  | `[0].blockIO.r` |  X                                   | X   | X   | bytes read from BlockIO |
|  | `[0].blockIO.w` |  X                                   | X   | X   | bytes written to BlockIO |
|  | `[0].cpuStats` |  X                                   | X   | X   | detailed cpu stats |
|  | `[0].percpuStats` |  X                                   | X   | X   | detailed per cpu stats |
|  | `[0].memoryStats` |  X                                   | X   | X   | detailed memory stats |
|  | `[0].networks` |  X                                   | X   | X   | detailed network stats per interface |
| `dockerContainerProcesses(id)` | `[{...}]` |  X                                   | X   | X   | array of processes inside a container |
|  | `[0].pidHost` |  X                                   | X   | X   | process ID (host) |
|  | `[0].ppid` |  X                                   | X   | X   | parent process ID |
|  | `[0].pgid` |  X                                   | X   | X   | process group ID |
|  | `[0].user` |  X                                   | X   | X   | effective user name |
|  | `[0].ruser` |  X                                   | X   | X   | real user name |
|  | `[0].group` |  X                                   | X   | X   | effective group name |
|  | `[0].rgroup` |  X                                   | X   | X   | real group name |
|  | `[0].stat` |  X                                   | X   | X   | process state |
|  | `[0].time` |  X                                   | X   | X   | accumulated CPU time |
|  | `[0].elapsed` |  X                                   | X   | X   | elapsed running time |
|  | `[0].nice` |  X                                   | X   | X   | nice value |
|  | `[0].rss` |  X                                   | X   | X   | resident set size |
|  | `[0].vsz` |  X                                   | X   | X   | virtual size in Kbytes |
|  | `[0].command` |  X                                   | X   | X   | command and arguments |
| `dockerVolumes()` | `[{...}]             | returns array of all docker volumes |                                      | [0].name            | X   | X   | X   | X    | volume name |
|  | `[0].driver` |  X                                   | X   | X   | driver |
|  | `[0].labels` |  X                                   | X   | X   | labels object |
|  | `[0].mountpoint` |  X                                   | X   | X   | mountpoint |
|  | `[0].options` |  X                                   | X   | X   | options |
|  | `[0].scope` |  X                                   | X   | X   | scope |
|  | `[0].created` |  X                                   | X   | X   | created at |
| `dockerAll()` | `{...}` |  X                                   | X   | X   | list of all containers including their stats<br>and processes in one single array |

#### 16. Virtual Box

| Function        | Result object        | Linux | Mac | Win | Comments                               |
| --------------- | -------------------- | ----- | --- | --- | -------------------------------------- |
| `vboxInfo()` | `[{...}]` |  X     | X   | X   | returns array general virtual box info |
|  | `[0].id` |  X     | X   | X   | virtual box ID |
|  | `[0].name` |  X     | X   | X   | name |
|  | `[0].running` |  X     | X   | X   | vbox is running |
|  | `[0].started` |  X     | X   | X   | started date time |
|  | `[0].runningSince` |  X     | X   | X   | running since (secs) |
|  | `[0].stopped` |  X     | X   | X   | stopped date time |
|  | `[0].stoppedSince` |  X     | X   | X   | stopped since (secs) |
|  | `[0].guestOS` |  X     | X   | X   | Guest OS |
|  | `[0].hardwareUUID` |  X     | X   | X   | Hardware UUID |
|  | `[0].memory` |  X     | X   | X   | Memory in MB |
|  | `[0].vram` |  X     | X   | X   | VRAM in MB |
|  | `[0].cpus` |  X     | X   | X   | CPUs |
|  | `[0].cpuExepCap` |  X     | X   | X   | CPU exec cap |
|  | `[0].cpuProfile` |  X     | X   | X   | CPU profile |
|  | `[0].chipset` |  X     | X   | X   | chipset |
|  | `[0].firmware` |  X     | X   | X   | firmware |
|  | `[0].pageFusion` |  X     | X   | X   | page fusion |
|  | `[0].configFile` |  X     | X   | X   | config file |
|  | `[0].snapshotFolder` |  X     | X   | X   | snapshot folder |
|  | `[0].logFolder` |  X     | X   | X   | log folder path |
|  | `[0].hpet` |  X     | X   | X   | HPET |
|  | `[0].pae` |  X     | X   | X   | PAE |
|  | `[0].longMode` |  X     | X   | X   | long mode |
|  | `[0].tripleFaultReset` |  X     | X   | X   | triple fault reset |
|  | `[0].apic` |  X     | X   | X   | APIC |
|  | `[0].x2Apic` |  X     | X   | X   | X2APIC |
|  | `[0].acpi` |  X     | X   | X   | ACPI |
|  | `[0].ioApic` |  X     | X   | X   | IOAPIC |
|  | `[0].biosApicMode` |  X     | X   | X   | BIOS APIC mode |
|  | `[0].bootMenuMode` |  X     | X   | X   | boot menu Mode |
|  | `[0].bootDevice1` |  X     | X   | X   | bootDevice1 |
|  | `[0].bootDevice2` |  X     | X   | X   | bootDevice2 |
|  | `[0].bootDevice3` |  X     | X   | X   | bootDevice3 |
|  | `[0].bootDevice4` |  X     | X   | X   | bootDevice4 |
|  | `[0].timeOffset` |  X     | X   | X   | time Offset |
|  | `[0].rtc` |  X     | X   | X   | RTC |


