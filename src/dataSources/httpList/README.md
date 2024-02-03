# HTTP (List)

You can use the `httpList` loader to load variables from a remote server using a pair of `list`/`load` HTTP requests.

This source expects the remote endpoint to:

1. Provide a list of loadable objects, e.g. in the form of a list of IDs.
2. Provide an endpoint where these objects can be loaded from, one at a time.

## Usage

Let's assume we have an HTTP server listening on `http://127.0.0.1:8080` with two endpoints `/list` and `/load`.

The internal data representation is:

```yaml
- id: hello
  text: world
- id: its
  text: my life
```

The `/list` endpoint returns an array of all ids: `["hello", "its"]`.
The `/load` endpoint returns, for each id, the full object. E.g. for `/load?id=hello`:

```json
{
  "id": "hello",
  "text": "world"
}
```

We can load those variables ([at compile-time](../../kiwi-config/variables.md#compile-time-variables)) with:

```yaml
varsSources:
  - httpList:
      default:
        baseURL: http://127.0.0.1:8080
      list:
        idField: id
        http:
          url: /list
      load:
        http:
          url: /load?id={{ id }}

tasks:
  # Outputs "It's my life! Hello world!"
  - debug: It's ${{ its.text }}! Hello ${{ hello.text }}!
```

or [at run-time](../../kiwi-config/variables.md#run-time-variables) with:

```yaml
tasks:
  - load:
      httpList:
        default:
          baseURL: http://127.0.0.1:8080
        list:
          idField: id
          http:
            url: /list
        load:
          http:
            url: /load?id={{ id }}
    out: httpVars
  # Outputs "It's my life! Hello world!"
  - debug: It's ${{ httpVars.its.text }}! Hello ${{ httpVars.hello.text }}!
```

## Reference

Key: `httpList`

![type MultiDataSourceHTTPListArgsInterface]
