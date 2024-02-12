# kiwi-cli

`kiwi-cli` is the main entrypoint you can use to run and test new recipes locally during the development phase.

You can install the `kiwi-cli` with:

```
# curl variant
curl -o- "http://TODO/artifacts/install.cli.sh" | bash /dev/stdin
# or
curl -o- "http://TODO/artifacts/install.cli.sh" | sh /dev/stdin

# wget variant
wget -O- "http://TODO/artifacts/install.cli.sh" | bash /dev/stdin 
# or
wget -O- "http://TODO/artifacts/install.cli.sh" | sh /dev/stdin 
```

## Running a recipe

You can use the `kiwi-cli` to run recipes locally, or on Docker, or on any other [supported runners](../runners)
