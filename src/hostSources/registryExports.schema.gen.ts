// Generated with: yarn gen -> cmd/schemaGen.ts

import type { HostSourceFileInterface } from './file/schema.gen';
import type { HostSourceGlobInterface } from './glob/schema.gen';
import type { HostSourceHTTPInterface } from './http/schema.gen';
import type { HostSourceRawInterface } from './raw/schema.gen';

// [block registryEntriesHostSourcesInterface begin]
export interface registryEntriesHostSourcesInterface {

  /*
   *
   * ========= Available modules =========
   *
   * Only one of the following keys can be
   * used at the same time.
   *
   */

  file?: HostSourceFileInterface; //typeRef:HostSourceFileInterface:file/schema.gen.ts:true

  glob?: HostSourceGlobInterface; //typeRef:HostSourceGlobInterface:glob/schema.gen.ts:true

  http?: HostSourceHTTPInterface; //typeRef:HostSourceHTTPInterface:http/schema.gen.ts:true

  raw?: HostSourceRawInterface; //typeRef:HostSourceRawInterface:raw/schema.gen.ts:true

}
// [block registryEntriesHostSourcesInterface end]
