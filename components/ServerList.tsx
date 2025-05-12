// components/ServerList.tsx
'use client';
import { Server, Port, SortType } from '../app/types';
import { useState } from 'react';
import { ChevronDown, Edit, Trash, ScanSearch } from 'lucide-react';
import PortItem from './PortItem';

export default function ServerList({
                                       servers,
                                       vmsByHost,
                                       sortType,
                                       expanded,
                                       toggleExpanded,
                                       handleScan,
                                       handleDelete,
                                       setEditItem
                                   }: {
    servers: Server[];
    vmsByHost: Record<number, Server[]>;
    sortType: SortType;
    expanded: Set<number>;
    toggleExpanded: (id: number) => void;
    handleScan: (id: number) => void;
    handleDelete: (type: number, id: number) => void;
    setEditItem: (item: Server | Port | null) => void;
}) {
    return (
        <div className="mt-8 space-y-4">
            {servers.map(server => (
                <div key={server.id} className="bg-base-200 p-4 rounded-lg">
                    <ServerItem
                        server={server}
                        expanded={expanded}
                        toggleExpanded={toggleExpanded}
                        handleScan={handleScan}
                        handleDelete={handleDelete}
                        setEditItem={setEditItem}
                    />

                    {expanded.has(server.id) && server.ports.map(port => (
                        <PortItem
                            key={port.id}
                            port={port}
                            setEditItem={setEditItem}
                            handleDelete={handleDelete}
                        />
                    ))}

                    {vmsByHost[server.id]?.map(vm => (
                        <VmItem
                            key={vm.id}
                            vm={vm}
                            expanded={expanded}
                            toggleExpanded={toggleExpanded}
                            handleScan={handleScan}
                            handleDelete={handleDelete}
                            setEditItem={setEditItem}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

function ServerItem({ server, expanded, toggleExpanded, handleScan, handleDelete, setEditItem }: {
    server: Server;
    expanded: Set<number>;
    toggleExpanded: (id: number) => void;
    handleScan: (id: number) => void;
    handleDelete: (type: number, id: number) => void;
    setEditItem: (item: Server | Port | null) => void;
}) {
    return (
        <>
            <div className="flex items-center gap-2">
                <ExpandButton id={server.id} expanded={expanded} toggle={toggleExpanded} />
                <div className="flex items-center gap-2 flex-1">
                    <div className="font-bold text-lg">{server.name}</div>
                    <button
                        className="btn btn-xs btn-ghost text-primary"
                        onClick={() => handleScan(server.id)}
                    >
                        <ScanSearch size={14} />
                    </button>
                </div>
                <EditButton item={server} setEditItem={setEditItem} />
                <DeleteButton type={0} id={server.id} handleDelete={handleDelete} />
            </div>
            <div className="text-sm opacity-75">{server.ip}</div>
        </>
    );
}

function VmItem({ vm, expanded, toggleExpanded, handleScan, handleDelete, setEditItem }: {
    vm: Server;
    expanded: Set<number>;
    toggleExpanded: (id: number) => void;
    handleScan: (id: number) => void;
    handleDelete: (type: number, id: number) => void;
    setEditItem: (item: Server | Port | null) => void;
}) {
    return (
        <div className="ml-4 mt-4 border-l-2 pl-4">
            <div className="flex items-center gap-2">
                <ExpandButton id={vm.id} expanded={expanded} toggle={toggleExpanded} />
                <div className="font-medium">🖥️ {vm.name}</div>
                <button
                    className="btn btn-xs btn-ghost text-primary"
                    onClick={() => handleScan(vm.id)}
                >
                    <ScanSearch size={14} />
                </button>
                <div className="ml-auto flex gap-2">
                    <EditButton item={vm} setEditItem={setEditItem} />
                    <DeleteButton type={1} id={vm.id} handleDelete={handleDelete} />
                </div>
            </div>
            <div className="text-sm opacity-75">{vm.ip}</div>
            {expanded.has(vm.id) && vm.ports.map(port => (
                <PortItem
                    key={port.id}
                    port={port}
                    setEditItem={setEditItem}
                    handleDelete={handleDelete}
                />
            ))}
        </div>
    );
}

function PortItem({ port, setEditItem, handleDelete }: {
    port: Port;
    setEditItem: (item: Server | Port | null) => void;
    handleDelete: (type: number, id: number) => void;
}) {
    return (
        <div className="ml-4 mt-2 flex items-center gap-2 hover:bg-base-300 rounded-lg">
            <div className="badge badge-neutral w-16">{port.port}</div>
            <span className="ml-2 text-sm flex-1">{port.note}</span>
            <EditButton item={port} setEditItem={setEditItem} />
            <DeleteButton type={2} id={port.id} handleDelete={handleDelete} />
        </div>
    );
}

function ExpandButton({ id, expanded, toggle }: {
    id: number;
    expanded: Set<number>;
    toggle: (id: number) => void
}) {
    return (
        <button
            className="btn btn-ghost btn-xs p-1"
            onClick={() => toggle(id)}
        >
            <ChevronDown className={`h-4 w-4 transition-transform ${
                expanded.has(id) ? 'rotate-180' : ''
            }`} />
        </button>
    );
}

function EditButton({ item, setEditItem }: {
    item: Server | Port;
    setEditItem: (item: Server | Port | null) => void
}) {
    return (
        <button
            className="btn btn-xs btn-ghost"
            onClick={() => {
                setEditItem(item);
                (document.getElementById('edit') as HTMLDialogElement)?.showModal();
            }}
        >
            <Edit size={14} />
        </button>
    );
}

function DeleteButton({ type, id, handleDelete }: {
    type: number;
    id: number;
    handleDelete: (type: number, id: number) => void
}) {
    return (
        <button
            className="btn btn-xs btn-ghost text-error"
            onClick={() => handleDelete(type, id)}
        >
            <Trash size={14} />
        </button>
    );
}