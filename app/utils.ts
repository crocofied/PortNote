import { Server } from "@/app/types";

export const compareIp = (a: string, b: string) => {
    const pa = a.split('.').map(n => parseInt(n, 10));
    const pb = b.split('.').map(n => parseInt(n, 10));
    for (let i = 0; i < 4; i++) {
      const diff = (pa[i] || 0) - (pb[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  };

const generateRandomPort = (): number => {
    return Math.floor(Math.random() * (65535 - 1024) + 1024);
};

export const findAvailablePort = (usedPorts: Set<number>, maxRetries: number): number | null => {
    let port;
    let attempts = 0;

    do {
        port = generateRandomPort();
        attempts++;
    } while (usedPorts.has(port) && attempts < maxRetries);

    return attempts < maxRetries ? port : null;
};

export const generateRandomPortWithUsedPortsContext = (usedPorts: Set<number>, maxRetries: number): number | null => {
    return findAvailablePort(usedPorts, maxRetries);
};

export const generateRandomPortWithServerContext = (serverContext: Server | undefined, maxRetries: number): number | null => {
    if (!serverContext) {
        return null;
    }
    const serverPorts = new Set(serverContext.ports.map(e => e.port)); // Use a Set for faster lookup
    return findAvailablePort(serverPorts, maxRetries);
};