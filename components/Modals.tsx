// components/Modals.tsx
'use client';
import { useState, useEffect } from 'react';
import { Server, Port } from '../app/types';

export function AddModal({
                             type,
                             serverName,
                             serverIP,
                             isVm,
                             serverHost,
                             portServer,
                             portNote,
                             portPort,
                             hostServers,
                             servers,
                             usedPorts,
                             setType,
                             setServerName,
                             setServerIP,
                             setIsVm,
                             setServerHost,
                             setPortServer,
                             setPortNote,
                             setPortPort,
                             handleSubmit
                         }: {
    type: number;
    serverName: string;
    serverIP: string;
    isVm: boolean;
    serverHost: number | null;
    portServer: number | null;
    portNote: string;
    portPort: number | null;
    hostServers: Server[];
    servers: Server[];
    usedPorts: Set<number>;
    setType: (type: number) => void;
    setServerName: (name: string) => void;
    setServerIP: (ip: string) => void;
    setIsVm: (isVm: boolean) => void;
    setServerHost: (host: number | null) => void;
    setPortServer: (server: number | null) => void;
    setPortNote: (note: string) => void;
    setPortPort: (port: number | null) => void;
    handleSubmit: () => void;
}) {
    return (
        <dialog id="add" className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg pb-2">Create...</h3>
                <div className="tabs tabs-box">
                    <input
                        type="radio"
                        name="type"
                        className="tab"
                        aria-label="Server"
                        checked={type === 0}
                        onChange={() => setType(0)}
                    />
                    <div className="tab-content bg-base-100 border-base-300 p-6 space-y-2">
                        <input
                            type="text"
                            placeholder="Name"
                            className="input w-full"
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="IP"
                            className="input w-full"
                            value={serverIP}
                            onChange={(e) => setServerIP(e.target.value)}
                            required
                        />
                        <div className="flex gap-2 items-center">
                            <label className="label cursor-pointer">
                                <span className="label-text">Is VM?</span>
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={isVm}
                                    onChange={(e) => setIsVm(e.target.checked)}
                                />
                            </label>
                            {isVm && (
                                <select
                                    className="select select-bordered w-full"
                                    value={serverHost || ""}
                                    onChange={(e) => setServerHost(Number(e.target.value))}
                                    required
                                >
                                    <option disabled value="">Select host</option>
                                    {hostServers.map(server => (
                                        <option key={server.id} value={server.id}>
                                            {server.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <input
                        type="radio"
                        name="type"
                        className="tab"
                        aria-label="Port"
                        checked={type === 1}
                        onChange={() => setType(1)}
                    />
                    <div className="tab-content bg-base-100 border-base-300 p-6 space-y-2">
                        <select
                            className="select w-full"
                            value={portServer || ""}
                            onChange={(e) => setPortServer(Number(e.target.value))}
                            required
                        >
                            <option disabled value="">Select server</option>
                            {servers.map(server => (
                                <option key={server.id} value={server.id}>
                                    {server.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Note"
                            className="input w-full"
                            value={portNote}
                            onChange={(e) => setPortNote(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Port"
                            className="input w-full"
                            value={portPort || ""}
                            onChange={(e) => setPortPort(Number(e.target.value))}
                            min="0"
                            max="65535"
                            required
                        />
                        {portPort !== null && usedPorts.has(portPort) && (
                            <div className="text-error text-sm">Port is already in use!</div>
                        )}
                    </div>
                </div>
                <div className="modal-action mt-auto pt-2">
                    <button className="btn" onClick={handleSubmit}>Add</button>
                    <button className="btn btn-ghost"
                            onClick={() => (document.getElementById('add') as HTMLDialogElement)?.close()}>
                        Cancel
                    </button>
                </div>
            </div>
        </dialog>
    );
}

export function EditModal({
                              editItem,
                              setEditItem,
                              hostServers,
                              servers,
                              handleEdit
                          }: {
    editItem: Server | Port | null;
    setEditItem: (item: Server | Port | null) => void;
    hostServers: Server[];
    servers: Server[];
    handleEdit: () => void;
}) {
    return (
        <dialog id="edit" className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg pb-2">{editItem && "ports" in editItem ? "Edit Server" : "Edit Port"}</h3>
                {editItem && (
                    <div className="space-y-4">
                        {"ports" in editItem ? (
                            <ServerEditForm
                                server={editItem}
                                hostServers={hostServers}
                                setEditItem={setEditItem}
                            />
                        ) : (
                            <PortEditForm
                                port={editItem}
                                servers={servers}
                                setEditItem={setEditItem}
                            />
                        )}
                        <div className="modal-action">
                            <button className="btn" onClick={handleEdit}>Save</button>
                            <button className="btn btn-ghost" onClick={() => {
                                (document.getElementById('edit') as HTMLDialogElement)?.close();
                                setEditItem(null);
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </dialog>
    );
}

function ServerEditForm({ server, hostServers, setEditItem }: {
    server: Server;
    hostServers: Server[];
    setEditItem: (item: Server) => void;
}) {
    return (
        <div className="space-y-2">
            <input
                type="text"
                placeholder="Name"
                className="input w-full"
                value={server.name}
                onChange={(e) => setEditItem({...server, name: e.target.value})}
                required
            />
            <input
                type="text"
                placeholder="IP"
                className="input w-full"
                value={server.ip}
                onChange={(e) => setEditItem({...server, ip: e.target.value})}
                required
            />
            <div className="flex gap-2 items-center">
                <label className="label cursor-pointer">
                    <span className="label-text">Is VM?</span>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={!!server.host}
                        onChange={(e) => {
                            const isVmChecked = e.target.checked;
                            setEditItem({
                                ...server,
                                host: isVmChecked ? hostServers[0]?.id || null : null
                            });
                        }}
                    />
                </label>
                {server.host !== null && (
                    <select
                        className="select select-bordered w-full"
                        value={server.host}
                        onChange={(e) => setEditItem({
                            ...server,
                            host: Number(e.target.value)
                        })}
                        required
                    >
                        <option disabled value="">Select host</option>
                        {hostServers
                            .filter(s => s.id !== server.id)
                            .map(server => (
                                <option key={server.id} value={server.id}>
                                    {server.name}
                                </option>
                            ))}
                    </select>
                )}
            </div>
        </div>
    );
}

function PortEditForm({ port, servers, setEditItem }: {
    port: Port;
    servers: Server[];
    setEditItem: (item: Port) => void;
}) {
    return (
        <div className="space-y-2">
            <select
                className="select w-full"
                value={port.serverId}
                onChange={(e) => setEditItem({
                    ...port,
                    serverId: Number(e.target.value)
                })}
                required
            >
                {servers.map(server => (
                    <option key={server.id} value={server.id}>
                        {server.name}
                    </option>
                ))}
            </select>
            <input
                type="text"
                placeholder="Note"
                className="input w-full"
                value={port.note || ""}
                onChange={(e) => setEditItem({
                    ...port,
                    note: e.target.value
                })}
            />
            <input
                type="number"
                placeholder="Port"
                className="input w-full"
                value={port.port}
                onChange={(e) => setEditItem({
                    ...port,
                    port: Number(e.target.value)
                })}
                min="0"
                max="65535"
                required
            />
        </div>
    );
}