"use client";
import { Server } from "@/app/types";
import {
  generateRandomPortWithServerContext,
  generateRandomPortWithUsedPortsContext,
} from "@/app/utils";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";

type RandomModalProps = {
  setShowRandomModal: (show: boolean) => void;
  globalErrorHandler: (message: string) => void;
  availableServers: Server[];
  usedPorts: Set<number>;
};

const copyPortToClipboard = (randomPort: number | null) => {
  if (randomPort !== null) {
    navigator.clipboard.writeText(randomPort.toString());
  }
};

const RandomModal = (props: RandomModalProps) => {
  const {
    setShowRandomModal,
    availableServers,
    usedPorts,
    globalErrorHandler,
  } = props;
  const generationRetryAttempts = 1000;
  const [randomPort, setRandomPort] = useState<number | null>(
    generateRandomPortWithUsedPortsContext(usedPorts, generationRetryAttempts)
  );
  const [selectedServerId, setselectedServerId] = useState<number | undefined>(
    undefined
  );

  const handleServerContextChange = (serverId: number) => {
    if (!serverId) {
        setRandomPort(
            generateRandomPortWithUsedPortsContext(usedPorts, generationRetryAttempts)
        );
        setselectedServerId(undefined);
        return
    }
    setselectedServerId(serverId);
    const selectedServer = availableServers.find(
      (server) => server.id === serverId
    );
    setRandomPort(
      generateRandomPortWithServerContext(
        selectedServer,
        generationRetryAttempts
      )
    );
  };

  useEffect(() => {
    if (!randomPort) {
      globalErrorHandler(
        "Could not find free port after " + generationRetryAttempts + " attempts"
      );
      setShowRandomModal(false);
    }
  }, [randomPort, globalErrorHandler]);

  return (
    <>
      <dialog open className="modal" aria-label="Random port generated">
        <div
          className="modal-box max-w-xs space-y-4"
          role="dialog"
          aria-labelledby="random-port-title"
        >
          <div className="text-center">
            <h3 className="font-bold text-xl mb-1" id="random-port-title">
              Random Port Generator
            </h3>
          </div>
          {availableServers.length != 0 && (
            <select
              className="select w-full"
              value={selectedServerId || ""}
              onChange={(e) => {
                handleServerContextChange(Number(e.target.value));
              }}
              required
            >
              <option value={undefined}>Select server for context</option>
              {availableServers.map((server) => (
                <option key={server.id} value={server.id}>
                  {server.name}
                </option>
              ))}
            </select>
          )}
          <div className="text-center">
            <p className="text-sm opacity-75">Your allocated port number</p>
          </div>
          <div className="bg-base-200 rounded-box p-4 w-full text-center shadow-inner">
            <span className="text-4xl font-mono font-bold tracking-wider">
              {randomPort}
            </span>
            {!selectedServerId && availableServers.length != 0 && (
              <p className="text-sm opacity-75">
                Port generated without specific server context in mind
              </p>
            )}
          </div>

          <div className="flex flex-col w-full gap-2">
            <button
              className="btn btn-block gap-2"
              onClick={() => copyPortToClipboard(randomPort)}
              title="Copy port"
              aria-label="Copy port number to clipboard"
            >
              <Copy size={18} className="mr-1" />
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
    </>
  );
};

export default RandomModal;
