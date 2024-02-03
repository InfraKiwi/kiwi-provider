# Glob

You can use the `glob` loader to load variables from a multitude of files at the same by specifiying a [glob](https://github.com/isaacs/node-glob) pattern.

**Note for Windows machines**: Please only use forward-slashes in glob expressions.

## Usage

Let's assume we have two files:

`vars/someVars.yaml`:

```yaml
hello: world
```

`vars/moreVars.yaml`:

```yaml
its: my life
```

We can load both of them ([at compile-time](../../kiwi-config/variables.md#compile-time-variables)) with:

```yaml
varsSources:
  - glob: pattern=./vars/*.yaml
    flatten: true

tasks:
  # Outputs "It's my life! Hello world!"
  - debug: It's ${{ its }}! Hello ${{ hello }}!
```

or [at run-time](../../kiwi-config/variables.md#run-time-variables) with:

```yaml
tasks:
  - load:
      glob: pattern=./vars/*.yaml
      flatten: true
    out: globVars

  # Outputs "It's my life! Hello world!"
  - debug: It's ${{ globVars.its }}! Hello ${{ globVars.hello }}!
```

Note: We recommend using the [`flatten`](..#reference-varssources-and-load) option with `glob` because filenames are OS-specific and unpredictable.

## Reference

Key: `glob`

![type MultiDataSourceGlobInterface]
