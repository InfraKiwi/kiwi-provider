# HTTP

You can use the `http` loader to load variables from a remote server using an HTTP request.

## Usage

Let's assume we have an HTTP server listening on `http://127.0.0.1:8080/hello`, whose response will be:

```json
{ "hello": "world" }
```

We can load those variables ([at compile-time](../../kiwi-config/variables.md#compile-time-variables)) with:

```yaml
varsSources:
  - http:
      url: http://127.0.0.1:8080/hello

tasks:
  # Outputs "Hello world!"
  - debug: Hello ${{ hello }}!
```

or [at run-time](../../kiwi-config/variables.md#run-time-variables) with:

```yaml
tasks:
  - load:
      http:
        url: http://127.0.0.1:8080/hello
    out: httpVars
  # Outputs "Hello world!"
  - debug: Hello ${{ httpVars.hello }}!
```

## Examples

![embed examples/runTime.yaml]

## Reference

Key: `http`

![type DataSourceHTTPInterface]
