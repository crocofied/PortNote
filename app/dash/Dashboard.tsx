"use client";
import Navbar from "@/components/Navbar";
import ErrorToast from "@/components/Error";
import { Edit, Plus, Trash, Dice5, Copy, ScanSearch, ChevronDown} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Fuse from "fuse.js";
import Footer from "@/components/Footer"
import Cookies from "js-cookie";
import { SortType, Server, Port } from "@/app/types";
import { compareIp } from "@/app/utils";

export default function Dashboard() {
  const [servers, setServers] = useState<Server[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState("");

  const [sortType, setSortType] = useState<SortType>(() => {
    if (typeof window !== 'undefined') {
      return (Cookies.get('serverSort') as SortType) || SortType.Alphabet;
    }
    return SortType.Alphabet;
  });

  const [expanded, setExpanded] = useState<Set<number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = Cookies.get('expanded');
      return new Set(saved ? JSON.parse(saved) : []);
    }
    return new Set();
  });
  // Form States
  const [isVm, setIsVm] = useState(false);
  const [type, setType] = useState(0);
  const [serverName, setServerName] = useState("");
  const [serverIP, setServerIP] = useState("");
  const [serverHost, setServerHost] = useState<number | null>(null);
  const [portServer, setPortServer] = useState<number | null>(null);
  const [portNote, setPortNote] = useState("");
  const [portPort, setPortPort] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<Server | Port | null>(null);

  const [randomPort, setRandomPort] = useState<number | null>(null);
  const [showRandomModal, setShowRandomModal] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);


  useEffect(() => {
    Cookies.set('expanded', JSON.stringify(Array.from(expanded)), {
      expires: 365,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }, [expanded]);

  useEffect(() => {
    Cookies.set('serverSort', sortType, { expires: 365, sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' });
  }, [sortType]);

  const toggleExpanded = (id: number) => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const fuse = useMemo(() => new Fuse(servers, {
    keys: ['name', 'ip', 'ports.note', 'ports.port'],
    threshold: 0.3,
    includeScore: true
  }), [servers]);
  
  const filteredServers = useMemo(() => {
    if (!searchQuery) return servers;
  
    const isNumericQuery = /^\d+$/.test(searchQuery);
    if (isNumericQuery) {
      const portNumber = parseInt(searchQuery, 10);
      return servers.filter(server => 
        server.ports.some(port => port.port === portNumber)
      );
    }
  
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, servers, fuse]);

  const fetchData = async () => {
    try {
      const response = await axios.get<Server[]>("/api/get");
      setServers(response.data);
    } catch (error: any) {
      handleError("Error loading data: " + error.message);
    }
  };

  useEffect(() => {
    fetchData()
  }, [])

  const handleError = (message: string) => {
    setError(message);
    setShowError(true);
  };

  const hostServers = useMemo(() => {
    const list = filteredServers.filter(s => s.host === null);
    return list.sort((a, b) => {
      if (sortType === SortType.IP) {
        return a.ip.localeCompare(b.ip, undefined, { numeric: true });
      }
      return a.name.localeCompare(b.name);
    });
  }, [filteredServers, sortType]);

  // Group & sort VMs under hosts
  const vmsByHost = useMemo(() => {
    const map: Record<number, Server[]> = {};
    filteredServers.forEach(s => {
      if (s.host !== null) {
        map[s.host] = map[s.host] || [];
        map[s.host].push(s);
      }
    });
    Object.values(map).forEach(arr => arr.sort((a, b) => {
      if (sortType === SortType.IP) return compareIp(a.ip, b.ip);
      return a.name.localeCompare(b.name);
    }));
    return map;
  }, [filteredServers, sortType]);

  const validateForm = () => {
    if (type === 0) {
      if (!serverName.trim() || !serverIP.trim()) {
        handleError("Name and IP are required");
        return false;
      }
    } else {
      if (!portServer || !portPort) {
        handleError("Server and port are required");
        return false;
      }

      if (usedPorts.has(portPort)) {
        handleError("Port is already in use");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = type === 0 ? {
        type,
        serverName,
        serverIP,
        serverHost: isVm ? serverHost : null
      } : {
        type,
        portServer,
        portNote,
        portPort
      };

      await axios.post("/api/add", payload);
      await fetchData();
      (document.getElementById('add') as HTMLDialogElement)?.close();
      resetForm();
    } catch (error: any) {
      handleError("Creation failed: " + error.message);
    }
  };

  const handleDelete = async (type: number, id: number) => {
    try {
      await axios.delete("/api/delete", { data: { type, id } });
      await fetchData();
    } catch (error: any) {
      handleError("Deletion failed: " + error.message);
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    
    try {
      const payload = "ports" in editItem ? {
        type: 0,
        id: editItem.id,
        data: {
          name: editItem.name,
          ip: editItem.ip,
          host: editItem.host
        }
      } : {
        type: 1,
        id: editItem.id,
        data: {
          note: editItem.note,
          port: editItem.port
        }
      };

      await axios.put("/api/edit", payload);
      await fetchData();
      (document.getElementById('edit') as HTMLDialogElement)?.close();
      setEditItem(null);
    } catch (error: any) {
      handleError("Update failed: " + error.message);
    }
  };

  const handleScan = async (id: number) => {
    try {
      setIsScanning(true);
      setShowRefreshMessage(false);
      const payload = { serverId: id };
      await axios.post("/api/scan", payload);
      setTimeout(() => {
        setShowRefreshMessage(true);
      }, 30000);
    } catch (error: any) {
      handleError("Scan failed: " + error.message);
      setIsScanning(false);
      setShowRefreshMessage(false);
    }
  };

  const resetForm = () => {
    setType(0);
    setServerName("");
    setServerIP("");
    setIsVm(false);
    setServerHost(null);
    setPortServer(null);
    setPortNote("");
    setPortPort(null);
  };

const usedPorts = useMemo(() => {
  const ports = new Set<number>();
  servers.forEach(server => {
    server.ports.forEach(port => ports.add(port.port));
  });
  return ports;
}, [servers]);

const generateRandomPort = () => {
  let port;
  let attempts = 0;
  
  do {
    port = Math.floor(Math.random() * (65535 - 1024) + 1024);
    attempts++;
  } while (usedPorts.has(port) && attempts < 1000);

  if (attempts >= 1000) {
    handleError("Could not find free port after 1000 attempts");
    return;
  }

  setRandomPort(port);
  setShowRandomModal(true);
};

  const copyToClipboard = () => {
    if (randomPort !== null) {
     navigator.clipboard.writeText(randomPort.toString());
    }
};

  const sortedPorts = (ports: Port[]) => 
    [...ports].sort((a, b) => a.port - b.port);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ErrorToast
        message={error}
        show={showError}
        onClose={() => setShowError(false)}
      />
{isScanning && (
        <dialog className="modal modal-open" aria-labelledby="modal-title">
          <div className="modal-box">
            <div className="flex flex-col items-center justify-center gap-4" id="modal-title">
              {!showRefreshMessage ? (
                <>
                  <span className="loading loading-spinner text-primary loading-lg"></span>
                  <p className="text-center">Scanning ports... This may take up to 30 seconds.</p>
                </>
              ) : (
                <p className="text-center">Scan completed. Please refresh the page to view the new data.</p>
              )}
            </div>
            <div className="modal-action">
              {showRefreshMessage ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setIsScanning(false);
                      setShowRefreshMessage(false);
                      fetchData();
                    }}
                    aria-label="Refresh data after scan"
                  >
                    Refresh Data
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setIsScanning(false);
                      setShowRefreshMessage(false);
                    }}
                    aria-label="Close scan dialog"
                  >
                    Close
                  </button>
                </>
              ) : (
                <button
                  className="btn"
                  onClick={() => {
                    setIsScanning(false);
                    setShowRefreshMessage(false);
                  }}
                  aria-label="Close scan dialog"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </dialog>
      )}
      <div className="grid grid-cols-12 pt-12">
        <div className="col-start-3 col-end-11" role="main" aria-label="Server and port management">
          <div className="w-full flex gap-2">
            <select
                value={sortType}
                onChange={e => setSortType(e.target.value as SortType)}
                className="select select-bordered w-48"
                aria-label="Sort servers by"
            >
              <option value={SortType.Alphabet}>Sort: Alphabetical</option>
              <option value={SortType.IP}>Sort: IP Address</option>
            </select>
            <label className="input w-full ">
              <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
              <input
                  type="text"
                  placeholder="Search..."
                  className="input input-lg outline-none focus:outline-none focus:ring-0 border-0 focus:border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search servers and ports"
              />
            </label>

            <button 
                className="btn btn-square"
                onClick={generateRandomPort}
                title="Generate random port"
                aria-label="Generate random port"
            >
              <Dice5/>
            </button>
            {showRandomModal && randomPort !== null && (
                <dialog open className="modal" aria-label="Random port generated">
                  <div className="modal-box max-w-xs space-y-4" role="dialog" aria-labelledby="random-port-title">
                    <div className="text-center">
                      <h3 className="font-bold text-xl mb-1" id="random-port-title">Random Port Generator</h3>
                      <p className="text-sm opacity-75">Your allocated port number</p>
                    </div>

                    <div className="bg-base-200 rounded-box p-4 w-full text-center shadow-inner">
                        <span className="text-4xl font-mono font-bold tracking-wider">
                        {randomPort}
                        </span>
                    </div>

                    <div className="flex flex-col w-full gap-2">
                      <button
                          className="btn btn-block gap-2"
                          onClick={copyToClipboard}
                          title="Copy port"
                          aria-label="Copy port number to clipboard"
                      >
                        <Copy size={18} className="mr-1"/>
                        Copy Port
                      </button>

                      <button
                          className="btn btn-ghost btn-sm btn-circle absolute top-2 right-2"
                          onClick={() => setShowRandomModal(false)}
                          title="Close"
                          aria-label="Close random port dialog"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </dialog>
            )}

            <button 
                className="btn btn-square"
                onClick={() => (document.getElementById('add') as HTMLDialogElement)?.showModal()}
                aria-label="Add new server or port"
            >
              <Plus/>
            </button>

            {/* Add Dialog */}
            <dialog id="add" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg pb-2" id="add-dialog-title">Add...</h3>
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
                  </div>
                </div>
                <div className="modal-action mt-auto pt-2">
                  <button className="btn" onClick={handleSubmit} aria-label="Add new item">Add</button>
                  <button className="btn btn-ghost"
                          onClick={() => (document.getElementById('add') as HTMLDialogElement)?.close()}
                          aria-label="Cancel adding new item">
                    Cancel
                  </button>
                </div>
              </div>
            </dialog>

            {/* Edit Dialog */}
            <dialog id="edit" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg pb-2" id="edit-dialog-title">{editItem && "ports" in editItem ? "Edit Server" : "Edit Port"}</h3>
                {editItem && (
                    <div className="space-y-4">
                      {"ports" in editItem ? (
                          <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Name"
                                className="input w-full"
                                value={editItem.name}
                                onChange={(e) => setEditItem({...editItem, name: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="IP"
                                className="input w-full"
                                value={editItem.ip}
                                onChange={(e) => setEditItem({...editItem, ip: e.target.value})}
                                required
                            />
                            <div className="flex gap-2 items-center">
                              <label className="label cursor-pointer">
                                <span className="label-text">Is VM?</span>
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={!!editItem.host}
                                    onChange={(e) => {
                                      const isVmChecked = e.target.checked;
                                      if (isVmChecked) {
                                        // Get available hosts excluding the current server
                                        const availableHosts = hostServers.filter(s => s.id !== editItem.id);
                                        const newHost = availableHosts.length > 0 ? availableHosts[0].id : null;
                                        setEditItem({
                                          ...editItem,
                                          host: newHost
                                        });
                                      } else {
                                        setEditItem({
                                          ...editItem,
                                          host: null
                                        });
                                      }
                                    }}

                                />
                              </label>
                              {editItem.host !== null && (
                                  <select
                                      className="select select-bordered w-full"
                                      value={editItem.host}
                                      onChange={(e) => setEditItem({
                                        ...editItem,
                                        host: Number(e.target.value)
                                      })}
                                      required
                                  >
                                    <option disabled value="">Select host</option>
                                    {hostServers
                                        .filter(server => server.id !== editItem.id) // Exclude current server
                                        .map(server => (
                                            <option key={server.id} value={server.id}>
                                              {server.name}
                                            </option>
                                        ))}
                                  </select>
                              )}
                            </div>
                          </div>
                      ) : (
                          <div className="space-y-2">
                            <select
                                className="select w-full"
                                value={editItem.serverId}
                                onChange={(e) => setEditItem({
                                  ...editItem,
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
                                value={editItem.note || ""}
                                onChange={(e) => setEditItem({
                                  ...editItem,
                                  note: e.target.value
                                })}
                            />
                            <input
                                type="number"
                                placeholder="Port"
                                className="input w-full"
                                value={editItem.port}
                                onChange={(e) => setEditItem({
                                  ...editItem,
                                  port: Number(e.target.value)
                                })}
                                min="0"
                                max="65535"
                                required
                            />
                          </div>
                      )}
                      <div className="modal-action">
                        <button className="btn" onClick={handleEdit} aria-label="Save edited item">Save</button>
                        <button className="btn btn-ghost" onClick={() => {
                          (document.getElementById('edit') as HTMLDialogElement)?.close();
                          setEditItem(null);
                        }}
                        aria-label="Cancel editing item">
                          Cancel
                        </button>
                      </div>
                    </div>
                )}
              </div>
            </dialog>
          </div>

          {/* Server List */}
          <div className="mt-8 space-y-4" role="list" aria-label="Server list">
            {hostServers.map(server => (
                <div key={server.id} className="bg-base-200 p-4 rounded-lg" role="listitem" aria-label={`Server ${server.name}`}>
                  <div className="flex items-center gap-2">
                    <button
                        className="btn btn-ghost btn-xs p-1"
                        onClick={() => toggleExpanded(server.id)}
                        aria-label={expanded.has(server.id) ? `Collapse server ${server.name}` : `Expand server ${server.name}`}
                        aria-expanded={expanded.has(server.id)}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                          expanded.has(server.id) ? 'rotate-180' : ''
                      }`} />
                    </button>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="font-bold text-lg">{server.name}</div>
                    <button
                      className="btn btn-xs btn-ghost text-primary"
                      onClick={() => handleScan(server.id)}
                      aria-label={`Scan ports for server ${server.name}`}
                    >
                      <ScanSearch size={14} />
                    </button>
                  </div>
                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={() => {
                      setEditItem(server);
                      (document.getElementById('edit') as HTMLDialogElement)?.showModal();
                    }}
                    aria-label={`Edit server ${server.name}`}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className="btn btn-xs btn-ghost text-error"
                    onClick={() => handleDelete(0, server.id)}
                    aria-label={`Delete server ${server.name}`}
                  >
                    <Trash size={14} />
                  </button>
                </div>
                <div className="text-sm opacity-75">{server.ip}</div>
                  {expanded.has(server.id) && (
                    <div className="ml-4 mt-2 bg-base-100 rounded-xl p-3 shadow-sm" role="region" aria-label={`Ports for server ${server.name}`}>
                      <div className="text-xs font-medium mb-2 text-base-content/70">PORTS</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sortedPorts(server.ports).map(port => (
                          <div key={port.id} className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg transition-colors border border-base-300" role="listitem" aria-label={`Port ${port.port}${port.note ? `, ${port.note}` : ''}`}>
                            <div className="badge badge-neutral w-16 shrink-0 hover:bg-primary hover:text-primary-content cursor-pointer" onClick={() => {window.open(`http://${server.ip}:${port.port}`, '_blank')}} aria-label={`Open port ${port.port}`} >{port.port}</div>
                            <span className="text-sm flex-1 truncate">{port.note}</span>
                            <div className="flex gap-1">
                              <button
                                className="btn btn-xs btn-ghost"
                                onClick={() => {
                                  setEditItem(port);
                                  (document.getElementById('edit') as HTMLDialogElement)?.showModal();
                                }}
                                aria-label={`Edit port ${port.port}`}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="btn btn-xs btn-ghost text-error"
                                onClick={() => handleDelete(2, port.id)}
                                aria-label={`Delete port ${port.port}`}
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {vmsByHost[server.id]?.map(vm => (
                      <div key={vm.id} className="ml-4 mt-4 border-l-2 pl-4" role="listitem" aria-label={`Virtual machine ${vm.name}`}>
                        <div className="flex items-center gap-2">
                          <button
                              className="btn btn-ghost btn-xs p-1"
                              onClick={() => toggleExpanded(vm.id)}
                              aria-label={expanded.has(vm.id) ? `Collapse VM ${vm.name}` : `Expand VM ${vm.name}`}
                              aria-expanded={expanded.has(vm.id)}
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${
                                expanded.has(vm.id) ? 'rotate-180' : ''
                            }`} />
                          </button>
                      <div className="font-medium">🖥️ {vm.name}</div>
                      <button
                    className="btn btn-xs btn-ghost text-primary"
                    onClick={() => handleScan(vm.id)}
                    aria-label={`Scan ports for VM ${vm.name}`}
                  >
                    <ScanSearch size={14} />
                  </button>
                      <div className="ml-auto flex gap-2">
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => {
                            setEditItem(vm);
                            (document.getElementById('edit') as HTMLDialogElement)?.showModal();
                          }}
                          aria-label={`Edit VM ${vm.name}`}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-xs btn-ghost text-error"
                          onClick={() => handleDelete(1, vm.id)}
                          aria-label={`Delete VM ${vm.name}`}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm opacity-75">{vm.ip}</div>
                        {expanded.has(vm.id) && (
                          <div className="ml-4 mt-2 bg-base-100 rounded-xl p-3 shadow-sm" role="region" aria-label={`Ports for VM ${vm.name}`}>
                            <div className="text-xs font-medium mb-2 text-base-content/70">PORTS</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2" role="list" aria-label={`Port list for ${vm.name}`}>
                              {sortedPorts(vm.ports).map(port => (
                                <div key={port.id} className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg transition-colors border border-base-300" role="listitem" aria-label={`Port ${port.port}${port.note ? `, ${port.note}` : ''}`}>
                                  <div className="badge badge-neutral w-16 shrink-0 hover:bg-primary hover:text-primary-content cursor-pointer" onClick={() => {window.open(`http://${vm.ip}:${port.port}`, '_blank')}} aria-label={`Open port ${port.port}`}>{port.port}</div>
                                  <span className="text-sm flex-1 truncate">{port.note}</span>
                                  <div className="flex gap-1">
                                    <button
                                      className="btn btn-xs btn-ghost"
                                      onClick={() => {
                                        setEditItem(port);
                                        (document.getElementById('edit') as HTMLDialogElement)?.showModal();
                                      }}
                                      aria-label={`Edit port ${port.port}`}
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      className="btn btn-xs btn-ghost text-error"
                                      onClick={() => handleDelete(2, port.id)}
                                      aria-label={`Delete port ${port.port}`}
                                    >
                                      <Trash size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}