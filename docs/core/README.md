# Architecture

`10infra-config` is a pull-based task execution system, which works in 3 phases:

1. **Local development**: users create [recipes](./recipes.md) and [test](./testing.md) them, assigning to each recipe the [hosts](./inventory.md) it is supposed to run on.
2. **Compilation**: recipes are packed together and "compiled" e.g. through a CI process, creating a finished package of [assets] that can be released.
3. **Runtime**: a central distributor (the [config provider]) offers the archive to the various [agents], who are installed on every destination machine.

## Chart

Below is a chart that represents the high-level architecture of the development/deployment flow of a 10infra-config
archive.

Note: the yellow blocks are all 10infra executables.

```mermaid
flowchart TD
    classDef binary fill: lightYellow;
    classDef clickable text-decoration: underline;
    subgraph Sources
        direction LR
        VarsSources["Vars sources"]
        HostSources["Host sources"]
    end

    subgraph Development
        Code["Recipes definition"]
        Test["Run/Test"]
        TestRunner["Test runner (e.g. Docker)"]
        Code --> Test
        Test --> TestRunner
        class Test binary
        click Code href "../recipes"
    end

    subgraph Archive
        Config
        Assets
    end

    subgraph CI
        Compile["Compile archive"]
        Git --> Compile --> Archive
        class Compile binary
    end

    subgraph Deployment["Deployment (e.g. Kubernetes)"]
        configProvider["Config provider"]
        database["Database"]
        configProvider -- Save reports --> database
        class configProvider binary
    end

    subgraph Instance
        agent["10infra agent"]
        System
        agent -- Run recipes --> System
        class agent binary
    end

%% Dev phase
    Sources -. Load vars .-> Development
    Code -- Commit/Push --> Git
%% CI phase
    Sources -. Load vars .-> Compile
    Assets -- Upload --> objectStorage["Object storage (e.g. S3)"]
%% Deployment phase
    Config -- "GitOps deployment" --> configProvider
    configProvider -- " Pull config " --> agent
    objectStorage -- " Pull assets " --> agent
    agent -- Report metrics --> configProvider
```
