export enum SortType {
    Alphabet = 'alphabet',
    IP = 'ip'
}

export interface Server {
    id: number;
    name: string;
    ip: string;
    host: number | null;
    ports: Port[];
}

export interface Port {
    id: number;
    serverId: number;
    note: string | null;
    port: number;
}

export const compareIp = (a: string, b: string) => {
    const pa = a.split('.').map(n => parseInt(n, 10));
    const pb = b.split('.').map(n => parseInt(n, 10));
    for (let i = 0; i < 4; i++) {
        const diff = (pa[i] || 0) - (pb[i] || 0);
        if (diff !== 0) return diff;
    }
    return 0;
};