# kiwi-agent

`kiwi-agent` is the binary you need to install on each host. It fetches new releases
from [`kiwi-provider`](./kiwi-provider.md) and executes the recipes on the destination machine.

## Bootstrap

The bootstrap process happens when executing the bootstrap script on any target machine:

```
# curl variant
curl -o- "${CONFIG_PROVIDER_URL}/bootstrap/agentDistribution/install.sh" | sh /dev/stdin

# wget variant
wget -O- "${CONFIG_PROVIDER_URL}/bootstrap/agentDistribution/install.sh" | sh /dev/stdin
```

### Examples

A raw request with the replaced host:

```
wget -O- "http://localhost:13900/bootstrap/agentDistribution/install.sh" | sh /dev/stdin
```

If you need to specify a different expected external url for the config provider:

```
wget -O- "http://172.22.128.1:13900/bootstrap/agentDistribution/install.sh?externalUrl=http://172.22.128.1:13900" | sh /dev/stdin
```

If you need to run with sudo privileges:

```
wget -O- "http://localhost:13900/bootstrap/agentDistribution/install.sh" | sudo sh /dev/stdin
```

If you need to forcefully overwrite an existing agent setup using the `force` flag:

```
wget -O- "http://localhost:13900/bootstrap/agentDistribution/install.sh" | sh /dev/stdin --force=true
```

TODO: PowerShell variant
