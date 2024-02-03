# `httpListener`

The `httpListener` module provides a way to spin up a temporary HTTP server, which you can use both for testing purposes
and as well to act as an HTTP endpoint for any software that may require it.

**NOTE:** the listener will be active until the end of the recipe, but no longer than that.

## Examples

![embed examples/helloWorld.yaml]

### Reverse proxy

![embed examples/proxy.yaml]

## Reference

Key: `httpListener`

![type ModuleHTTPListenerInterface]
