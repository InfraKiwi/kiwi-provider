-- CreateTable
CREATE TABLE "HostReport" (
    "hostname" TEXT NOT NULL,
    "release" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,

    PRIMARY KEY ("hostname", "release", "type", "key")
);

-- CreateTable
CREATE TABLE "HostLogs" (
    "hostname" TEXT NOT NULL,
    "release" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "hash" TEXT NOT NULL PRIMARY KEY,
    "size" INTEGER,
    CONSTRAINT "HostLogs_hostname_release_type_key_fkey" FOREIGN KEY ("hostname", "release", "type", "key") REFERENCES "HostReport" ("hostname", "release", "type", "key") ON DELETE RESTRICT ON UPDATE CASCADE
);
