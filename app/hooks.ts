// app/hooks.ts
'use client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Server, SortType, compareIp } from './types';

export function useExpanded() {
    const [expanded, setExpanded] = useState<Set<number>>(() => {
        if (typeof window !== 'undefined') {
            const saved = Cookies.get('expanded');
            return new Set(saved ? JSON.parse(saved) : []);
        }
        return new Set();
    });

    useEffect(() => {
        Cookies.set('expanded', JSON.stringify(Array.from(expanded)), {
            expires: 365,
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production',
        });
    }, [expanded]);

    return { expanded, setExpanded };
}

export function useServerSort() {
    const [sortType, setSortType] = useState<SortType>(() => {
        if (typeof window !== 'undefined') {
            return (Cookies.get('serverSort') as SortType) || SortType.Alphabet;
        }
        return SortType.Alphabet;
    });

    useEffect(() => {
        Cookies.set('serverSort', sortType, {
            expires: 365,
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production'
        });
    }, [sortType]);

    return { sortType, setSortType };
}

export function useServers(filteredServers: Server[], sortType: SortType) {
    const hostServers = filteredServers
        .filter(s => s.host === null)
        .sort((a, b) => sortType === SortType.IP
            ? a.ip.localeCompare(b.ip, undefined, { numeric: true })
            : a.name.localeCompare(b.name));

    const vmsByHost = filteredServers.reduce((map, s) => {
        if (s.host !== null) {
            map[s.host] = map[s.host] || [];
            map[s.host].push(s);
        }
        return map;
    }, {} as Record<number, Server[]>);

    Object.values(vmsByHost).forEach(arr => arr.sort((a, b) =>
        sortType === SortType.IP ? compareIp(a.ip, b.ip) : a.name.localeCompare(b.name)
    ));

    return { hostServers, vmsByHost };
}