# `eval`

You can use the `eval` module to execute generic JS code.

## Usage

### You can directly run JS code

Inline:

![embed examples/simple.yaml]

As a whole JS/TS recipe:

![embed examples/fn.ts]

### You can execute a whole file:

![embed examples/assets/file.js]
![embed examples/file.yaml]

## Execution context

The executed code will have the following context available:

![type EvalContextInterface]

Or, if the code source is a file:

![type EvalFileContextInterface]

### Builtins

The executed code has the following builtins available:

| Name                                                                        | Description                                                                                                              |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout) | The global setTimeout() method sets a timer which executes a function or specified piece of code once the timer expires. |
| [`console`](https://developer.mozilla.org/en-US/docs/Web/API/console)       | The console object provides access to the debugging console.                                                             |
| [`require`](https://nodejs.org/api/modules.html#requireid)                  | Used to import modules, JSON, and local files.                                                                           |

## Reference

Key: `eval`

![type ModuleEvalInterface]
