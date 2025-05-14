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