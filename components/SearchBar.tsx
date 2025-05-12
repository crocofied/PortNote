// components/SearchBar.tsx
'use client';
import { useState } from 'react';
import { Dice5, Copy, Plus } from 'lucide-react';
import RandomPortModal from './RandomPortModal';

export default function SearchBar({
                                      sortType,
                                      setSortType,
                                      searchQuery,
                                      setSearchQuery,
                                      generateRandomPort,
                                      randomPort,
                                      showRandomModal,
                                      setShowRandomModal
                                  }: {
    sortType: string;
    setSortType: (type: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    generateRandomPort: () => void;
    randomPort: number | null;
    showRandomModal: boolean;
    setShowRandomModal: (show: boolean) => void;
}) {
    return (
        <div className="w-full flex gap-2">
            <select
                value={sortType}
                onChange={e => setSortType(e.target.value)}
                className="select select-bordered w-48"
            >
                <option value="alphabet">Sort: Alphabetical</option>
                <option value="ip">Sort: IP Address</option>
            </select>

            <label className="input w-full">
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
                />
            </label>

            <button
                className="btn btn-square"
                onClick={generateRandomPort}
                title="Generate random port"
            >
                <Dice5/>
            </button>

            <RandomPortModal
                randomPort={randomPort}
                showModal={showRandomModal}
                onClose={() => setShowRandomModal(false)}
                copyToClipboard={() => {
                    if (randomPort) navigator.clipboard.writeText(randomPort.toString());
                }}
            />

            <button className="btn btn-square"
                    onClick={() => (document.getElementById('add') as HTMLDialogElement)?.showModal()}>
                <Plus/>
            </button>
        </div>
    );
}