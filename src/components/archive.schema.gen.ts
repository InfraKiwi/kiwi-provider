/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

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
//meta:ArchiveRecipesMapInterface:[{"unknownType":{"type":"object","metas":[{"className":"RecipeForArchiveInterface"},{"className":"ArchiveRecipeEntryInterface"}],"keys":{"config":{"type":"object","flags":{"presence":"required"},"metas":[{"className":"RecipeMinimalInterface"}],"keys":{"dependencies":{"type":"object","metas":[{"unknownType":{"type":"alternatives","metas":[{"className":"RecipeDependencyWithAlternativesInterface"}],"matches":[{"schema":{"type":"string","rules":[{"name":"custom","args":{}}],"allow":[null]}},{"schema":{"type":"object","metas":[{"className":"RecipeDependencyInterface"}],"keys":{"version":{"type":"string","rules":[{"name":"custom","args":{}}]},"sourceId":{"type":"string"}}}}]}}],"patterns":[{"schema":{"type":"string","rules":[{"name":"pattern","args":{"regex":"/^(?:(\\w+):)?(.+)$/"}}]},"rule":{"type":"alternatives","metas":[{"className":"RecipeDependencyWithAlternativesInterface"}],"matches":[{"schema":{"type":"string","rules":[{"name":"custom","args":{}}],"allow":[null]}},{"schema":{"type":"object","metas":[{"className":"RecipeDependencyInterface"}],"keys":{"version":{"type":"string","rules":[{"name":"custom","args":{}}]},"sourceId":{"type":"string"}}}}]}}]},"tasks":{"type":"array","flags":{"presence":"required"},"rules":[{"name":"min","args":{"limit":1}}],"items":[{"type":"object","flags":{"unknown":true,"description":"\n  Defines a task to be executed.\n  "},"metas":[{"className":"TaskInterface","unknownType":{"type":"any","flags":{"description":"\n    The module to use in the task.\n    You can check the available task modules here: ##link#See all available task modules#/modules\n    "}}}],"keys":{"label":{"type":"string","flags":{"description":"\n  A friendly identifier for the task, which will be printed in logs.\n"}},"if":{"type":"string","flags":{"description":"\n  When provided, the task will be executed only if this condition succeeds.\n  Expects a template that would work inside an `if` condition.\n"},"rules":[{"name":"custom","args":{}}]},"vars":{"type":"object","flags":{"unknown":true,"description":"\n  Any vars you want to provide to the task.\n  "},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}},"out":{"type":"string","flags":{"description":"\n  If provided, registers any output variables into the variable name\n  provided as value of the `out` argument.\n  "}},"failedIf":{"type":"alternatives","flags":{"description":"\n  When provided, the task will fail if this condition succeeds.\n  Expects a template that would work inside an `if` condition.\n"},"matches":[{"schema":{"type":"string","rules":[{"name":"custom","args":{}}]}},{"schema":{"type":"object","metas":[{"className":"ModuleFailFullInterface"},{"className":"FailedIfFullInterface"}],"keys":{"message":{"type":"string"},"if":{"type":"string","flags":{"presence":"required"},"rules":[{"name":"custom","args":{}}]}}}}]},"exitIf":{"type":"alternatives","flags":{"description":"\n  When provided, the recipe will stop successfully if this condition succeeds.\n  Expects a template that would work inside an `if` condition.  \n"},"matches":[{"schema":{"type":"string","rules":[{"name":"custom","args":{}}]}},{"schema":{"type":"object","metas":[{"className":"ModuleExitFullInterface"},{"className":"ExitIfFullInterface"}],"keys":{"message":{"type":"string"},"if":{"type":"string","flags":{"presence":"required"},"rules":[{"name":"custom","args":{}}]}}}}]},"global":{"type":"boolean","flags":{"description":"\n  If true, registers any output variables into the global context.\n  "}},"sensitive":{"type":"boolean","flags":{"description":"  \n  If true, all registered variables will be treated as secrets\n  E.g. useful for logging purposes.\n  "}},"keepPreviousTaskResult":{"type":"boolean","flags":{"description":"\n  Really only meant for debugging purposes, preserves the result of the\n  previous task and does not overwrite it. E.g. useful while using the debug\n  module.\n  "}},"testMocks":{"type":"array","flags":{"description":"\n  Enabled only in testing mode.\n  "},"items":[{"type":"object","metas":[{"className":"TestMockBaseInterface"},{"className":"TaskTestMockInterface"}],"keys":{"result":{"type":"object","flags":{"presence":"required"},"metas":[{"className":"ModuleRunResultInterface"}],"keys":{"failed":{"type":"string","flags":{"description":"\nWhen a module sets the `failed` variable to `true`, the execution of\nthe task is marked as failed and, if there are no other \"failure catching\"\nmethods in place, the recipe's execution will be halted.\n"}},"exit":{"type":"boolean","flags":{"description":"\nWhen a module sets the `exit` variable to `true`, the execution of\nthe recipe will be halted without raising an error.\n"}},"vars":{"type":"object","flags":{"unknown":true,"description":"\nWhen a module sets any key/pair into the `vars` object, these variables\nwill be accessible, depending on the task configuration, in the outer\ncontext.\n"},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}},"changed":{"type":"boolean","flags":{"description":"\nWhen a module sets the `changed` variable to `true`, the task is \ncategorized as one that changed the underlying system.\n"}}}},"if":{"type":"alternatives","metas":[{"className":"ConditionSetInterface"}],"matches":[{"schema":{"type":"string","rules":[{"name":"custom","args":{}}]}},{"schema":{"type":"array","items":[{"type":"string","rules":[{"name":"custom","args":{}}]}]}}]}}}]}}}]},"inputs":{"type":"object","metas":[{"unknownType":{"type":"alternatives","matches":[{"schema":{"type":"string","allow":["alternatives","any","array","boolean","date","function","link","number","object","string","symbol","binary","alt","bool","func"]}},{"schema":{"type":"any","rules":[{"name":"custom","args":{}}]}}]}},{"className":"RecipeInputsInterface"}],"patterns":[{"schema":{"type":"string"},"rule":{"type":"alternatives","matches":[{"schema":{"type":"string","allow":["alternatives","any","array","boolean","date","function","link","number","object","string","symbol","binary","alt","bool","func"]}},{"schema":{"type":"any","rules":[{"name":"custom","args":{}}]}}]}}]},"testMocks":{"type":"array","items":[{"type":"object","metas":[{"className":"TestMockBaseInterface"},{"className":"RecipeTestMockInterface"}],"keys":{"result":{"type":"object","flags":{"presence":"required"},"metas":[{"className":"ModuleRunResultInterface"}],"keys":{"failed":{"type":"string","flags":{"description":"\nWhen a module sets the `failed` variable to `true`, the execution of\nthe task is marked as failed and, if there are no other \"failure catching\"\nmethods in place, the recipe's execution will be halted.\n"}},"exit":{"type":"boolean","flags":{"description":"\nWhen a module sets the `exit` variable to `true`, the execution of\nthe recipe will be halted without raising an error.\n"}},"vars":{"type":"object","flags":{"unknown":true,"description":"\nWhen a module sets any key/pair into the `vars` object, these variables\nwill be accessible, depending on the task configuration, in the outer\ncontext.\n"},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}},"changed":{"type":"boolean","flags":{"description":"\nWhen a module sets the `changed` variable to `true`, the task is \ncategorized as one that changed the underlying system.\n"}}}}},"patterns":[{"schema":{"type":"string"},"rule":{"type":"alternatives","metas":[{"className":"ConditionSetInterface"}],"matches":[{"schema":{"type":"string","rules":[{"name":"custom","args":{}}]}},{"schema":{"type":"array","items":[{"type":"string","rules":[{"name":"custom","args":{}}]}]}}]}}]}]},"vars":{"type":"object","flags":{"unknown":true,"description":"Hardcoded variables for this entry"},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}},"varsSources":{"type":"array","flags":{"description":"Compile-time vars sources for the entry"},"metas":[{"className":"VarsSourcesInterface"}],"items":[{"type":"object","flags":{"unknown":true},"metas":[{"className":"VarsSourceInterface","unknownType":{"type":"any","flags":{"description":"The data source you want to use."}}}],"keys":{"template":{"type":"boolean","flags":{"description":"If true, extract templates from loaded variables"}},"flatten":{"type":"boolean","flags":{"description":"\nIf true and if the data source returns an object then strip out all keys and merge all values.\n\nE.g. if the data source is a `glob` that returns:\n\n{\n  'test/myFile.yaml': { hello: \"World\" },\n  'test/another.yaml': { name: \"Mario\" }\n}\n\nThe loaded variables will be:\n\n{\n  hello: \"World\", \n  name: \"Mario\"\n}\n"}}}}]},"hostVars":{"type":"object","metas":[{"unknownType":{"type":"object","flags":{"unknown":true},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}}}],"patterns":[{"schema":{"type":"string"},"rule":{"type":"object","flags":{"unknown":true},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}}}]},"groupVars":{"type":"object","metas":[{"unknownType":{"type":"object","flags":{"unknown":true},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}}}],"patterns":[{"schema":{"type":"string"},"rule":{"type":"object","flags":{"unknown":true},"metas":[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}],"keys":{}}}]}}},"targets":{"type":"array","metas":[{"className":"RecipeTargetsInterface"}],"items":[{"type":"string"}]},"otherHosts":{"type":"array","metas":[{"className":"RecipeTargetsInterface"}],"items":[{"type":"string"}]},"assetsArchive":{"type":"string"}}}},{"className":"ArchiveRecipesMapInterface"}]

// [block CreateArchiveArgsInterface begin]
export interface CreateArchiveArgsInterface {
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
