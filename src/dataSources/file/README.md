# File

You can use the `file` data source to load contents from a file on the local file system.

Supported types:

- `.json`
- `.yml|.yaml`

## Usage

This is a way to use the `file` data source to load some variables. By default, any YAML and JSON files will automatically be parsed.

Let's assume we have a `./vars/someVars.yaml` file with this content:

```yaml
hello: world
```

We can load the variables ([at compile-time](../../10infra-config/variables.md#compile-time-variables)) stored in the file with:

```yaml
varsSources:
  - file: path=./vars/someVars.yaml

tasks:
  # Outputs "Hello world"
  - debug: Hello ${{ hello }}
```

or [at run-time](../../10infra-config/variables.md#run-time-variables) with:

```yaml
tasks:
  - load:
      file: path=./vars/someVars.yaml
    out: someVars
  # Outputs "Hello world"
  - debug: Hello ${{ someVars.hello }}
```

### Raw

You can also load raw file contents. The loaded contents will be wrapped by a `content` variable:

```yaml
tasks:
  - load:
      file: path=./vars/someVars.yaml raw=true
    out: someVarsRaw
  # Outputs
  # Raw content: "hello: world"
  - debug: >
      Raw content: "${{ someVarsRaw.content }}"
```

or

```yaml
tasks:
  - load:
      fileRaw: path=./vars/someVars.yaml
    out: someVarsRaw
  # Outputs
  # Raw content: "hello: world"
  - debug: >
      Raw content: "${{ someVarsRaw.content }}"
```

## Reference

Key: `file`

![type DataSourceFileInterface]

Key: `fileRaw`

![type DataSourceFileRawInterface]
