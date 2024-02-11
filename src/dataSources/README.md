# Data sources

The `dataSources` folder defines a list of sources that you can use when loading generic data or variables.

## Available data sources

![listModules]

## Vars sources

One of the main purposes of a data source is loading variables into a recipe's context.

For example, we can load the variables ([at compile-time](../kiwi-provider/variables.md#compile-time-variables)) stored in a file with:

```yaml
varsSources:
  - file: path=./vars/someVars.yaml

tasks:
  # Outputs "Hello world"
  - debug: Hello ${{ hello }}
```

or [at run-time](../kiwi-provider/variables.md#run-time-variables) with:

```yaml
tasks:
  - load:
      file: path=./vars/someVars.yaml
    out: someVars
  # Outputs "Hello world"
  - debug: Hello ${{ someVars.hello }}
```

<!--
There are two types of variables sources:

* `DataSource`: loads variables from a single source. E.g. [`file`](./file) loads variables from a single file.
* `MultiDataSource`: loads variables from a list of sub-sources. E.g. [`glob`](./glob) loads variables from a list of files.
-->

### Reference (`varsSources` and [`load`](../task-modules/load))

![type VarsSourceInterface ../components/varsSource.schema.gen.ts]
