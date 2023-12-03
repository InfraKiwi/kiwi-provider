// Generated with: yarn gen -> cmd/schemaGen.ts

import type { DataSourceFileInterface, DataSourceFileRawInterface } from './file/schema.gen';
import type { MultiDataSourceGlobInterface } from './glob/schema.gen';
import type { DataSourceHTTPInterface } from './http/schema.gen';
import type { MultiDataSourceHTTPListInterface } from './httpList/schema.gen';

// [block registryEntriesDataSourcesInterface begin]
export interface registryEntriesDataSourcesInterface {

  /*
   *
   * ========= Available modules =========
   *
   * Only one of the following keys can be
   * used at the same time.
   *
   */

  /**
   * Loads a local file's contents and parses it using a loader, chosen based on the file's extension.
   *
   * Supported file types: `.yaml`, `.yml`, `.json`
   */
  file?: DataSourceFileInterface; //typeRef:DataSourceFileInterface:file/schema.gen.ts:true

  /**
   * Loads a local file's contents.
   */
  fileRaw?: DataSourceFileRawInterface; //typeRef:DataSourceFileRawInterface:file/schema.gen.ts:true

  glob?: MultiDataSourceGlobInterface; //typeRef:MultiDataSourceGlobInterface:glob/schema.gen.ts:true

  http?: DataSourceHTTPInterface; //typeRef:DataSourceHTTPInterface:http/schema.gen.ts:true

  httpList?: MultiDataSourceHTTPListInterface; //typeRef:MultiDataSourceHTTPListInterface:httpList/schema.gen.ts:true

}
// [block registryEntriesDataSourcesInterface end]
