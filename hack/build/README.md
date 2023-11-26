# Building with docker/podman

Prereqs:

```
sudo apt install fuse-overlayfs qemu-user-static

# podman
echo "[storage]" > ~/.config/containers/storage.conf
echo 'driver = "overlay"' >> ~/.config/containers/storage.conf
```

Build with:

```
podman build -f hack/build/linux.Dockerfile --build-arg "NODE_VERSION=$(cat .nvmrc | cut -c 2-)" --platform linux/arm/v7 .
```

TODO
TODO
TODO use a minimum type of yarn cache?
TODO github actions? qemu + docker build + volume mount if possible?
TODO save build artifact
TODO
TODO