/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { InventoryGroupInterface, InventoryInterface } from './inventory.schema.gen';
import {
  groupNameAll,
  groupNameGrouped,
  groupNameUngrouped,
  groupRelationSelfKey,
  InventoryHostSourceSchema,
  InventorySchema,
  specialGroupNamesSet,
} from './inventory.schema';
import { HostPattern } from '../util/hostPattern';
import { hostnameSetLocalhost } from '../util/constants';
import { naturalSortCompareFn } from '../util/sort';
import { setDifference, setIntersection } from '../util/set';
import { tryOrThrowAsync } from '../util/try';
import { InventoryHost } from './inventoryHost';
import type { AbstractHostSourceInstance, HostSourceContext } from '../hostSources/abstractHostSource';
import { hostSourceRegistry } from '../hostSources/registry';
import Joi from 'joi';
import type { HostSourceRawInterface } from '../hostSources/raw/schema.gen';
import { InventoryGroup } from './inventoryGroup';
import { VarsContainer } from './varsContainer';
import type { VarsInterface } from './varsContainer.schema.gen';
import { joiKeepOnlyKeysInJoiSchema } from '../util/joi';
import { VarsContainerSchema } from './varsContainer.schema';
import path from 'node:path';

import { loadYAMLFromFile } from '../util/yaml';
import type { ContextLogger } from '../util/context';
import type { DataSourceContext } from '../dataSources/abstractDataSource';

export interface VisitedCache {
  groups: Record<string, boolean>;
}

interface InventoryCache {
  hostsByGroup: Record<string, Record<string, InventoryHost>>;
}

function newVisitedCache(): VisitedCache {
  return { groups: {} };
}

export interface InventoryMetadata {
  fileName?: string;
}

export class Inventory extends VarsContainer {
  readonly #config: InventoryInterface;
  readonly #meta?: InventoryMetadata;
  #hosts: Record<string, InventoryHost> = {};
  #hostnames: string[] = [];
  #groups: Record<string, InventoryGroup> = {};
  #inventoryCache: InventoryCache = { hostsByGroup: {} };

  #throwOnHostNotMatched = false;

  constructor(config: InventoryInterface, meta?: InventoryMetadata) {
    config = Joi.attempt(config, InventorySchema, 'validate inventory config');
    super(joiKeepOnlyKeysInJoiSchema(config, VarsContainerSchema));

    this.#config = config;
    this.#meta = meta;

    // Load groups
    if (config.groups) {
      for (const groupName in config.groups) {
        const groupConfig = config.groups[groupName];
        let group: InventoryGroupInterface;
        if (typeof groupConfig == 'string') {
          group = { pattern: [groupConfig] };
        } else if (Array.isArray(groupConfig)) {
          group = { pattern: groupConfig };
        } else {
          group = groupConfig;
        }

        this.#groups[groupName] = new InventoryGroup(groupName, group);
      }
    }
  }

  static async fromFile(context: HostSourceContext, inventoryPath: string): Promise<Inventory> {
    const data = await loadYAMLFromFile(inventoryPath);
    const inventory = new Inventory(data as InventoryInterface, { fileName: inventoryPath });
    await inventory.loadGroupsAndStubs(context);
    return inventory;
  }

  get hostnames(): string[] {
    return [...this.#hostnames];
  }

  set throwOnHostNotMatched(value: boolean) {
    this.#throwOnHostNotMatched = value;
  }

  hasHost(hostname: string): boolean {
    return hostname in this.#hosts;
  }

  getRawHostObject(hostname: string): InventoryHost | undefined {
    return this.#hosts[hostname];
  }

  async getHostAndLoadVars(context: DataSourceContext, hostname: string): Promise<InventoryHost> {
    const host = this.getRawHostObject(hostname);
    if (host == null) {
      throw new Error(`Host ${hostname} not found in inventory`);
    }
    await host.loadVars(context);
    return host;
  }

  setHost(context: ContextLogger, host: InventoryHost) {
    this.#hosts[host.id] = host;
    this.#processHostsRecords(context);
  }

  getAllGroupNamesWithoutSpecialGroups(): string[] {
    const allKeys = Object.keys(this.#groups ?? {});
    return Array.from(setDifference(new Set(allKeys), specialGroupNamesSet));
  }

  getHostsByGroup(
    context: ContextLogger,
    groupName: string,
    visitedCache?: VisitedCache
  ): Record<string, InventoryHost> {
    if (groupName in this.#inventoryCache.hostsByGroup) {
      return this.#inventoryCache.hostsByGroup[groupName];
    }

    visitedCache ??= newVisitedCache();
    if (!(groupName in this.#groups)) {
      context.logger.warning(`Inventory group ${groupName} not found`);
      return {};
    }

    if (groupName == groupNameAll) {
      return this.#hosts;
    }

    const hosts: Record<string, InventoryHost> = {};
    const groupEntries = this.#groups[groupName].pattern || {};
    for (const groupEntry of Array.isArray(groupEntries) ? groupEntries : [groupEntries]) {
      if (groupEntry in this.#groups) {
        Object.assign(hosts, this.getHostsByGroup(context, groupEntry, visitedCache));
      } else {
        Object.assign(hosts, this.getHostsByPattern(context, groupEntry, undefined, visitedCache));
      }
    }

    this.#inventoryCache.hostsByGroup[groupName] = hosts;
    return hosts;
  }

  sortPatterns(patternStr: string | string[]): string[] {
    const allPatterns: string[] = [];
    if (Array.isArray(patternStr) || patternStr.indexOf(',') >= 0) {
      const els = Array.isArray(patternStr) ? patternStr : patternStr.split(',');
      for (const el of els) {
        allPatterns.push(...this.sortPatterns(el));
      }
    } else {
      return [patternStr];
    }

    allPatterns.sort((a, b) => {
      let weightA = 0;
      if (a.startsWith('&')) {
        weightA = 1;
      }
      if (a.startsWith('!')) {
        weightA = 2;
      }
      let weightB = 0;
      if (b.startsWith('&')) {
        weightB = 1;
      }
      if (b.startsWith('!')) {
        weightB = 2;
      }

      const wDiff = weightA - weightB;
      if (wDiff != 0) {
        return wDiff;
      }
      return naturalSortCompareFn(a, b);
    });

    return allPatterns;
  }

  getHostsByPattern(
    context: ContextLogger,
    patternStr: string | string[],
    // If provided, this is used as a start group of hostnames that will be filtered down with the query
    allHostnames?: Set<string>,
    visitedCache?: VisitedCache
  ): Record<string, InventoryHost> {
    allHostnames ??= new Set();
    visitedCache ??= newVisitedCache();

    if (Array.isArray(patternStr) || patternStr.indexOf(',') >= 0) {
      const patterns = this.sortPatterns(patternStr);
      let hosts: Record<string, InventoryHost> = {};
      for (const el of patterns) {
        hosts = this.getHostsByPattern(context, el, new Set(Object.keys(hosts)), visitedCache);
      }
      return hosts;
    }

    const pattern = new HostPattern(patternStr);
    const filtered: Record<string, InventoryHost> = {};

    if (pattern.raw in this.#hosts) {
      filtered[pattern.raw] = this.#hosts[pattern.raw];
      return filtered;
    }

    let returnHostnames: Set<string>;
    const matches = this.#getHostsByMatchingHostPatternWithoutForceInclusion(context, pattern, visitedCache);
    const matchedHostnames = new Set(Object.keys(matches));
    if (pattern.forceInclusion === false) {
      // Force exclusion
      returnHostnames = setDifference(allHostnames, matchedHostnames);
    } else if (pattern.forceInclusion === true) {
      returnHostnames = setIntersection(allHostnames, matchedHostnames);
    } else {
      returnHostnames = new Set([...allHostnames, ...matchedHostnames]);
    }

    return Array.from(returnHostnames).reduce((acc: Record<string, InventoryHost>, el) => {
      acc[el] = this.#hosts[el] ?? matches[el];
      return acc;
    }, {});
  }

  #getHostsByMatchingHostPatternWithoutForceInclusion(
    context: ContextLogger,
    pattern: HostPattern,
    visitedCache?: VisitedCache
  ): Record<string, InventoryHost> {
    visitedCache ??= newVisitedCache();
    const filtered: Record<string, InventoryHost> = {};

    if (pattern.rawWithoutModifiers == groupNameAll) {
      Object.assign(filtered, this.#hosts);
      return filtered;
    } else if (pattern.rawWithoutModifiers == groupNameUngrouped) {
      Object.assign(filtered, this.getHostsByPattern(context, [groupNameAll, `!${groupNameGrouped}`]));
      return filtered;
    } else if (pattern.rawWithoutModifiers == groupNameGrouped) {
      const groupNames = this.getAllGroupNamesWithoutSpecialGroups();
      // We only want hosts that are in a group
      for (const groupName of groupNames) {
        if (groupName in visitedCache.groups) {
          continue;
        }
        visitedCache.groups[groupName] = true;
        const hosts = this.getHostsByGroup(context, groupName, visitedCache);
        Object.assign(filtered, hosts);
      }
      return filtered;
    }

    // Process all groups names
    {
      const groupNames = this.getAllGroupNamesWithoutSpecialGroups();
      groupNames.sort(naturalSortCompareFn);
      const matchingGroups = groupNames.filter(pattern.matchString.bind(pattern));
      for (const groupName of matchingGroups) {
        if (groupName in visitedCache.groups) {
          continue;
        }
        visitedCache.groups[groupName] = true;
        const hosts = this.getHostsByGroup(context, groupName, visitedCache);
        Object.assign(filtered, hosts);
      }
    }

    // Check hosts if no groups matched or it is a regex/glob pattern
    if (pattern.raw.startsWith('~') || pattern.containsSpecialChars || Object.keys(filtered).length == 0) {
      const matchingHosts = Object.keys(this.#hosts).filter(pattern.matchString.bind(pattern));
      for (const hostName of matchingHosts) {
        filtered[hostName] = this.#hosts[hostName];
      }
    }

    if (Object.keys(filtered).length == 0 && hostnameSetLocalhost.has(pattern.rawWithoutModifiers)) {
      // Adds the implicit host
      const implicit = this.#getImplicitHost(pattern.rawWithoutModifiers);
      filtered[implicit.id] = implicit;
      return filtered;
    }

    const hostnames = Object.keys(filtered);

    if (hostnames.length == 0 && pattern.rawWithoutModifiers != groupNameAll) {
      if (this.#throwOnHostNotMatched) {
        throw new Error(`Could not match supplied host pattern: ${pattern.raw}`);
      }
      return filtered;
    }

    return filtered;
  }

  async loadGroupsAndStubs(context: HostSourceContext, loadVars = false) {
    await Promise.all(Object.keys(this.#groups).map((groupName) => this.#groups[groupName].loadVars(context)));

    const hosts: Record<string, InventoryHost> = {};

    await Promise.all(
      (this.#config.hostSources ?? []).map(async (inventoryHostSourceConfig) => {
        const hostSource =
          hostSourceRegistry.getRegistryEntryInstanceFromWrappedIndexedConfig<AbstractHostSourceInstance>(
            inventoryHostSourceConfig,
            InventoryHostSourceSchema
          );
        Object.assign(
          hosts,
          await tryOrThrowAsync(
            () => hostSource.loadHostsStubs(context),
            `Failed to load hosts stubs for source ${hostSource.registryEntry.entryName}`,
          )
        );
      })
    );

    for (const hostname in hosts) {
      if (hostname in this.#hosts) {
        context.logger.debug(
          `Host definition for ${hostname} already loaded via ${this.#hosts[hostname].hostSource?.registryEntry.entryName}, overwriting...`
        );
      }
      const host = hosts[hostname];
      if (loadVars) {
        await host.loadVars(context);
      }
      this.#hosts[hostname] = host;
    }

    this.#processHostsRecords(context);
  }

  #processHostsRecords(context: ContextLogger) {
    const hostnames = Object.keys(this.#hosts);
    hostnames.sort(naturalSortCompareFn);
    this.#hostnames = hostnames;

    for (const hostname of hostnames) {
      this.#hosts[hostname].loadGroupNamesFromInventory(context, this);
    }
  }

  #getImplicitHost(hostname: string): InventoryHost {
    if (!hostnameSetLocalhost.has(hostname)) {
      throw new Error('The implicit host can only have a localhost hostname');
    }
    return new InventoryHost(hostname, {});
  }

  getGroupNamesForHost(
    context: ContextLogger,
    host: InventoryHost,
    visitedCache?: VisitedCache,
    includeSpecialGroups?: boolean
  ): string[] {
    visitedCache ??= newVisitedCache();
    const groups = new Set<string>();
    const allGroupNames = this.getAllGroupNamesWithoutSpecialGroups();
    for (const groupName of allGroupNames) {
      if (groupName in visitedCache.groups) {
        continue;
      }
      const groupConfig = this.#groups[groupName];
      if (groupConfig.pattern == null) {
        continue;
      }
      for (const pattern of groupConfig.pattern) {
        const hosts = this.getHostsByPattern(context, pattern, undefined, visitedCache);
        if (host.id in hosts) {
          groups.add(groupName);
        }
      }
      visitedCache.groups[groupName] = true;
    }

    if (includeSpecialGroups) {
      if (groups.size > 0) {
        groups.add(groupNameAll);
        groups.add(groupNameGrouped);
      } else {
        groups.add(groupNameAll);
        groups.add(groupNameUngrouped);
      }
    }

    const groupNames = Array.from(groups);
    groupNames.sort(naturalSortCompareFn);
    return groupNames;
  }

  aggregateGroupVarsForHost(context: ContextLogger, host: InventoryHost): VarsInterface {
    const vars: VarsInterface = {};
    if (!host.groupNamesCacheLoaded) {
      host.loadGroupNamesFromInventory(context, this);
    }
    for (const groupName of host.groupNames) {
      const groupVars = this.#groups[groupName]?.vars ?? {};
      Object.assign(vars, groupVars);
    }
    return vars;
  }

  async #recursivelyPopulateSubInventoryFields(
    context: DataSourceContext,
    host: InventoryHost,
    allRelations: Set<string>,
    allHosts: Set<InventoryHost>,
    allGroups: Set<InventoryGroup>,
    visitedCache: VisitedCache
  ) {
    const loopRelations = new Set<string>();

    await host.loadVars(context);
    host.relations.forEach((r) => loopRelations.add(r));
    allHosts.add(host);
    const groupNames = host.groupNamesWithoutSpecialGroups;
    for (const groupName of groupNames) {
      const group = this.#groups[groupName];
      for (const relation of group.relations) {
        if (relation == groupRelationSelfKey) {
          // The relation contains the group itself
          loopRelations.add(groupName);
        } else {
          loopRelations.add(relation);
        }
      }
      allGroups.add(group);
    }

    const newRelations = setDifference(loopRelations, allRelations);
    newRelations.forEach((r) => allRelations.add(r));

    for (const relation of newRelations) {
      // A relation is no more than a pattern
      const hosts = this.getHostsByPattern(context, relation, undefined, visitedCache);
      for (const hostname in hosts) {
        const host = hosts[hostname];
        if (allHosts.has(host)) {
          continue;
        }
        await this.#recursivelyPopulateSubInventoryFields(
          context,
          host,
          allRelations,
          allHosts,
          allGroups,
          visitedCache
        );
      }
    }
  }

  /*
   *Generates a subset of the current inventory that only contains the specified hosts and any groups
   *they belong to.
   *NOTE: this is not a full object copy, there are plenty of references kept inside.
   */
  async createRawSubInventoryConfig(context: DataSourceContext, hostnames: string[]): Promise<InventoryInterface> {
    for (const hostname of hostnames) {
      if (!this.hasHost(hostname)) {
        throw new Error(`Hostname not found: ${hostname}`);
      }
    }

    /*
     *Using the hostnames provided as argument, populate the relations via:
     *- All relations that each host defines
     *- All relations that each group the host belongs to define
     *
     *Then, populate recursively VIA PATTERN MATCHING until all relations are satisfied.
     */

    const allRelations = new Set<string>();
    const allHosts = new Set<InventoryHost>();
    const allGroups = new Set<InventoryGroup>();

    const visitedCache = newVisitedCache();
    for (const hostname of hostnames) {
      const host = this.getRawHostObject(hostname)!;
      await this.#recursivelyPopulateSubInventoryFields(context, host, allRelations, allHosts, allGroups, visitedCache);
    }

    // Generate group data
    const groups: Record<string, InventoryGroupInterface> = Array.from(allGroups).reduce(
      (acc: Record<string, InventoryGroupInterface>, group) => {
        acc[group.id] = {
          relations: group.relations,
          vars: group.vars,
        };
        return acc;
      },
      {}
    );

    const hostSource: HostSourceRawInterface = Array.from(allHosts).reduce((acc: HostSourceRawInterface, host) => {
      acc[host.id] = {
        relations: host.relations,
        vars: host.vars,
      };
      return acc;
    }, {});

    const config: InventoryInterface = {
      ...this.#config,
      groups,
      hostSources: [{ raw: hostSource }],
    };

    // Make sure this is a valid config
    new Inventory(config);
    return config;
  }

  /*
   *I MEAN
   *
   *command line values (for example, -u my_user, these are not variables)
   *role defaults (defined in role/defaults/main.yml)
   *[XXX] inventory file vars
   *[XXX] inventory group_vars/all
   *[XXX] playbook group_vars/all
   *[XXX] inventory group_vars/*
   *[XXX] playbook group_vars/*
   *[XXX] inventory host_vars/*
   *[XXX] playbook host_vars/*
   *[TODO] host facts / cached set_facts
   *[TODO] play vars
   *[TODO] play vars_prompt
   *[TODO] play vars_files
   *[TODO] role vars (defined in role/vars/main.yml)
   *[TODO] block vars (only for tasks in block)
   *[TODO] task vars (only for the task)
   *[TODO] include_vars
   *[TODO] set_facts / registered vars
   *[TODO] role (and include_role) params
   *[TODO] include params
   *[TODO] extra vars (for example, -e "user=my_user")(always win precedence)
   */
  async aggregateBaseVarsForHost(context: DataSourceContext, host: InventoryHost): Promise<VarsInterface> {
    await this.loadVars({
      ...context,
      workDir: this.#meta?.fileName ? path.dirname(this.#meta.fileName) : context.workDir,
    });

    const vars: VarsInterface = {};

    // inventory file or script group vars
    Object.assign(vars, this.vars);

    // inventory group_vars/*
    Object.assign(vars, this.aggregateGroupVarsForHost(context, host));

    return vars;
  }
}
