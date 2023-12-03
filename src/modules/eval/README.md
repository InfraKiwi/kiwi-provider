# `eval`

You can use the `eval` module to execute generic JS code.

## Usage

You can directly run JS code:

![embed examples/simple.yaml]

Or you can execute a whole file:

![embed examples/assets/file.js]
![embed examples/file.yaml]

## `context`

The executed code will have the following context available under the `context` variable:

![type RunContextPublicVarsInterface ../../util/runContext.schema.gen.ts]

## `result`

The executed code can set the result of the task by altering the `result` variable, which has the following structure:

![type ModuleRunResultInterface ../abstractModuleBase.schema.gen.ts]

### Builtins

The executed code has the following builtins available:

| Name                                                                        | Description                                                                                                              |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout) | The global setTimeout() method sets a timer which executes a function or specified piece of code once the timer expires. |
| [`console`](https://developer.mozilla.org/en-US/docs/Web/API/console)       | The console object provides access to the debugging console.                                                             |
| [`require`](https://nodejs.org/api/modules.html#requireid)                  | Used to import modules, JSON, and local files.                                                                           |

## Reference

![type ModuleEvalInterface]
