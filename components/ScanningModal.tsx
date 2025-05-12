// components/ScanningModal.tsx
'use client';

export default function ScanningModal({
                                          isScanning,
                                          showRefreshMessage,
                                          onRefresh,
                                          onClose
                                      }: {
    isScanning: boolean;
    showRefreshMessage: boolean;
    onRefresh: () => void;
    onClose: () => void;
}) {
    if (!isScanning) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <div className="flex flex-col items-center justify-center gap-4">
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
                            <button className="btn btn-primary" onClick={onRefresh}>
                                Refresh Data
                            </button>
                            <button className="btn" onClick={onClose}>
                                Close
                            </button>
                        </>
                    ) : (
                        <button className="btn" onClick={onClose}>
                            Close
                        </button>
                    )}
                </div>
            </div>
        </dialog>
    );
}