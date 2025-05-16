"use client";
import { Copy } from "lucide-react";

type RandomModalProps = {
  setShowRandomModal: (show: boolean) => void;
  globalErrorHandler: (message: string) => void;
  usedPorts: Set<number>;
};

const copyPortToClipboard = (randomPort: number | null) => {
  if (randomPort !== null) {
    navigator.clipboard.writeText(randomPort.toString());
  } else {
  }
};

const generateRandomPort = (
  usedPorts: Set<number>,
  maxRetries: number
): number | null => {
  let port;
  let attempts = 0;

  do {
    port = Math.floor(Math.random() * (65535 - 1024) + 1024);
    attempts++;
  } while (usedPorts.has(port) && attempts < maxRetries);

  if (attempts >= maxRetries) {
    return null;
  }

  return port;
};

const RandomModal = (props: RandomModalProps) => {
  const { setShowRandomModal, usedPorts, globalErrorHandler } = props;
  const generationRetryAttempts = 1000;
  const randomPort: number | null = generateRandomPort(
    usedPorts,
    generationRetryAttempts
  );

  if (randomPort === null) {
    setShowRandomModal(false);
    globalErrorHandler(
      "Could not find free port after " + generationRetryAttempts + " attempts"
    );
  }

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
