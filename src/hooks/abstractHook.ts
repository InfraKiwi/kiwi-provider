/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { AbstractRegistryEntry } from '../util/registry';
import type { DataSourceContext } from '../dataSources/abstractDataSource';

export abstract class AbstractHook<ConfigType> extends AbstractRegistryEntry<ConfigType> {
  abstract notify(context: DataSourceContext): Promise<void>;
}

export type AbstractHookInstance = InstanceType<typeof AbstractHook>;
