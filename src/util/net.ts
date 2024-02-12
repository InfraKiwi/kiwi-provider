import * as net from 'node:net';
import type { AddressInfo } from 'node:net';

export async function getFreeTCPPort(): Promise<number> {
  return new Promise((res) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = (srv.address() as AddressInfo).port;
      srv.close((err) => res(port));
    });
  });
}
