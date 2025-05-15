import type { Server } from 'node:http';
import type { Express } from 'express';

export function listenAsync(app: Express, PORT: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, err => {
      if (err) return reject(err);
      resolve(server);
    });
    server.once('error', reject);
  });
}
