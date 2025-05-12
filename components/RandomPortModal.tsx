'use client';
import { Copy } from 'lucide-react';

export default function RandomPortModal({
                                            randomPort,
                                            showModal,
                                            onClose,
                                            copyToClipboard
                                        }: {
    randomPort: number | null;
    showModal: boolean;
    onClose: () => void;
    copyToClipboard: () => void;
}) {
    if (!showModal) return null;

    return (
        <dialog open className="modal">
            <div className="modal-box max-w-xs space-y-4">
                <div className="text-center">
                    <h3 className="font-bold text-xl mb-1">Random Port Generator</h3>
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
                    >
                        <Copy size={18} className="mr-1"/>
                        Copy Port
                    </button>

                    <button
                        className="btn btn-ghost btn-sm btn-circle absolute top-2 right-2"
                        onClick={onClose}
                        title="Close"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </dialog>
    );
}