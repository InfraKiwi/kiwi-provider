/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

import type { Recipe } from './recipe';

import type { RecipeMinimalInterface, RecipeTargetsInterface } from './recipe.schema.gen';

// [block ArchiveInterface begin]
export interface ArchiveInterface {
  rootRecipes: ArchiveRecipesMapInterface; //typeRef:ArchiveRecipesMapInterface:{"relPath":"self","isRegistryExport":false}

  recipeSources: {
    [x: string]: ArchiveRecipesMapInterface; //typeRef:ArchiveRecipesMapInterface:{"relPath":"self","isRegistryExport":false}
  };
  timestamp: number;
}
// [block ArchiveInterface end]
//meta:ArchiveInterface:[{"className":"ArchiveInterface"}]

// [block ArchiveRecipeEntryInterface begin]
export interface ArchiveRecipeEntryInterface {
  config: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  targets?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  /**
   * Which phase this recipe belongs to.
   *
   * @default runtime
   */
  phase?:

    /**
     * Recipes are run in the boostrap phase when the kiwi-agent is being installed
     * on the machine for the first time.
     */
    | 'bootstrap'

    /**
     * Recipes are normally run in the runtime phase.
     */
    | 'runtime';
  otherHosts?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  assetsArchive?: string;
}
// [block ArchiveRecipeEntryInterface end]
//meta:ArchiveRecipeEntryInterface:[{"className":"RecipeForArchiveInterface"},{"className":"ArchiveRecipeEntryInterface"}]

// [block ArchiveRecipesMapInterface begin]
export interface ArchiveRecipesMapInterface {
  [x: string]: ArchiveRecipeEntryInterface; //typeRef:ArchiveRecipeEntryInterface:{"relPath":"self","isRegistryExport":false}
}
// [block ArchiveRecipesMapInterface end]
//meta:ArchiveRecipesMapInterface:[{"unknownType":{"type":"object","metas":[{"className":"RecipeForArchiveInterface"},{"className":"ArchiveRecipeEntryInterface"}],"keys":{"config":{"type":"object","flags":{"presence":"required"},"metas":[{"className":"RecipeMinimalInterface"}],"keys":{"name":{"type":"string","flags":{"description":"\n    A friendly name, used to describe the recipe.\n  "}},"inputs":{"type":"object","flags":{"description":"\n    Inputs validation config.\n  "},"metas":[{"unknownType":{"type":"alternatives","matches":[{"schema":{"type":"string","flags":{"only":true,"description":"\n    A string that represents a raw type, e.g. string, number, etc.\n    If ending with `?`, mark the input as optional.\n    "},"allow":["alternatives","alternatives?","any","any?","array","array?","boolean","boolean?","date","date?","function","function?","link","link?","number","number?","object","object?","string","string?","symbol","symbol?","binary","binary?","alt","alt?","bool","bool?","func","func?"]}},{"schema":{"type":"any","flags":{"description":"\n    A Joi validation schema in form of JS code.\n     \n    Must be defined using the `!joi` YAML tag, which makes the `Joi` \n    namespace available to use and automatically prepends a `return` keyword\n    to the provided code.\n    \n    You can check out more examples of Joi validation at: https://joi.dev/api\n    \n    Custom cases:\n    \n    * File/directory existence validation: `!joi joiPathExists` \n      (shortcut for `!joi Joi.string().custom(joiValidateSyncFSExists)`)\n    "},"rules":[{"name":"custom","args":{}}],"examples":["\n    inputs:\n      // Accepts an optional string\n      hello: string?\n      // Fully validates that `world` will be a string of min 3 and max 30 chars\n      world: !joi Joi.string().min(3).max(30)\n    "]}}]}},{"className":"RecipeInputsInterface"}],"patterns":[{"schema":{"type":"string"},"rule":{"type":"alternatives","matches":[{"schema":{"type":"string","flags":{"only":true,"description":"\n    A string that represents a raw type, e.g. string, number, etc.\n    If ending with `?`, mark the input as optional.\n    "},"allow":["alternatives","alternatives?","any","any?","array","array?","boolean","boolean?","date","date?","function","function?","link","link?","number","number?","object","object?","string","string?","symbol","symbol?","binary","binary?","alt","alt?","bool","bool?","func","func?"]}},{"schema":{"type":"any","flags":{"description":"\n    A Joi validation schema in form of JS code.\n     \n    Must be defined using the `!joi` YAML tag, which makes the `Joi` \n    namespace available to use and automatically prepends a `return` keyword\n    to the provided code.\n    \n    You can check out more examples of Joi validation at: https://joi.dev/api\n    \n    Custom cases:\n    \n    * File/directory existence validation: `!joi joiPathExists` \n      (shortcut for `!joi Joi.string().custom(joiValidateSyncFSExists)`)\n    "},"rules":[{"name":"custom","args":{}}],"examples":["\n    inputs:\n      // Accepts an optional string\n      hello: string?\n      // Fully validates that `world` will be a string of min 3 and max 30 chars\n      world: !joi Joi.string().min(3).max(30)\n    "]}}]}}]},"dependencies":{"type":"object","flags":{"description":"\n      A key/value map that lists which other recipes this recipe depends upon.\n      Dependencies are bundled at compile time and this list must be exhaustive.\n    "},"metas":[{"unknownType":{"type":"alternatives","metas":[{"className":"RecipeDependencyWithAlternativesInterface"}],"matches":[{"schema":{"type":"string","rules":[{"name":"custom","args":{}}],"allow":[null]}},{"schema":{"type":"object","metas":[{"className":"RecipeDependencyInterface"}],"keys":{"version":{"type":"string","rules":[{"name":"custom","args":{}}]},"sourceId":{"type":"string"}}}}]}}],"patterns":[{"schema":{"type":"string","rules":[{"name":"pattern","args":{"regex":"/^(?!\\.)(?:(\\w+):)?(.+)$/"}}]},"rule":{"type":"alternatives","metas":[{"className":"RecipeDependencyWithAlternativesInterface"}],"matches":[{"schema":{"type":"string","rules":[{"name":"custom","args":{}}],"allow":[null]}},{"schema":{"type":"object","metas":[{"className":"RecipeDependencyInterface"}],"keys":{"version":{"type":"string","rules":[{"name":"custom","args":{}}]},"sourceId":{"type":"string"}}}}]}}]},"tasks":{"type":"array","flags":{"presence":"required","description":"\n    The list of tasks to execute in this recipe.\n  "},"rules":[{"name":"min","args":{"limit":1}}],"items":[{"type":"any","metas":[{"baseType":"TaskInterface"}]}]},"vars":{"type":"object","flags":{"unknown":true,"description":"Hardcoded variables for this entry"},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}},"varsSources":{"type":"array","flags":{"description":"Compile-time vars sources for the entry"},"metas":[{"className":"VarsSourcesInterface"}],"items":[{"type":"object","flags":{"unknown":true},"metas":[{"className":"VarsSourceInterface","unknownType":{"type":"any","flags":{"description":"\n    The data source you want to use.\n    You can check the available data sources here: ##link#See all available data sources#/dataSources\n    "}}}],"keys":{"template":{"type":"boolean","flags":{"default":true,"presence":"optional","description":"\n  If true, extract templates from loaded variables. Enabled by default.\n  "}},"flatten":{"type":"boolean","flags":{"description":"\nIf true and if the data source returns an object then strip out all keys and merge all values.\n\nE.g. if the data source is a `glob` that returns:\n\n{\n  'test/myFile.yaml': { hello: \"World\" },\n  'test/another.yaml': { name: \"Mario\" }\n}\n\nThe loaded variables will be:\n\n{\n  hello: \"World\", \n  name: \"Mario\"\n}\n"}}}}]},"hostVars":{"type":"object","metas":[{"unknownType":{"type":"object","flags":{"unknown":true},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}}}],"patterns":[{"schema":{"type":"string"},"rule":{"type":"object","flags":{"unknown":true},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}}}]},"groupVars":{"type":"object","metas":[{"unknownType":{"type":"object","flags":{"unknown":true},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}}}],"patterns":[{"schema":{"type":"string"},"rule":{"type":"object","flags":{"unknown":true},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}}}]}}},"targets":{"type":"array","metas":[{"className":"RecipeTargetsInterface"}],"items":[{"type":"string"}]},"phase":{"type":"alternatives","flags":{"default":"runtime","presence":"optional","description":"\nWhich phase this recipe belongs to.\n\n@default runtime\n"},"matches":[{"schema":{"type":"string","flags":{"only":true,"description":"\n  Recipes are run in the boostrap phase when the kiwi-agent is being installed\n  on the machine for the first time.\n  "},"allow":["bootstrap"]}},{"schema":{"type":"string","flags":{"only":true,"description":"\n  Recipes are normally run in the runtime phase.\n  "},"allow":["runtime"]}}]},"otherHosts":{"type":"array","metas":[{"className":"RecipeTargetsInterface"}],"items":[{"type":"string"}]},"assetsArchive":{"type":"string"}}}},{"className":"ArchiveRecipesMapInterface"}]

// [block CreateArchiveArgsInterface begin]
export interface CreateArchiveArgsInterface {
  includeTestAssets?: boolean;
  archiveDir?: string;
  recipes: Recipe[];
}
// [block CreateArchiveArgsInterface end]
//meta:CreateArchiveArgsInterface:[{"className":"CreateArchiveArgsInterface"}]

// [block RecipeSourceArchiveInterface begin]
export interface RecipeSourceArchiveInterface {
  archive: object;
  uniqueId: string;
  recipesMap: ArchiveRecipesMapInterface; //typeRef:ArchiveRecipesMapInterface:{"relPath":"self","isRegistryExport":false}

  dryRun: boolean;
}
// [block RecipeSourceArchiveInterface end]
//meta:RecipeSourceArchiveInterface:[{"className":"RecipeSourceArchiveInterface","entryNames":["archive"]},{"className":"RecipeSourceArchiveInterface"}]

export type RecipeSourceArchiveInterfaceConfigKey = 'archive';
export const RecipeSourceArchiveInterfaceConfigKeyFirst = 'archive';
