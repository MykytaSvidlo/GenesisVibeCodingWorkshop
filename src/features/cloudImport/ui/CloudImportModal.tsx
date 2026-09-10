import React, { useState } from "react";

import { cn } from "@/shared/lib/utils/cn";

import type {
  CloudImportModalProps,
  CloudProvider,
  MockCloudFile,
} from "../model/types";

const MOCK_FILES: MockCloudFile[] = [
  {
    id: "gdrive-1",
    name: "Bill_of_Sale_Tesla_Model_Y.pdf",
    size: "2.4 MB",
    updatedAt: "2 hours ago",
    type: "pdf",
    provider: "google-drive",
  },
  {
    id: "gdrive-2",
    name: "Vehicle_Purchase_Agreement_BMW.pdf",
    size: "1.8 MB",
    updatedAt: "Yesterday",
    type: "pdf",
    provider: "google-drive",
  },
  {
    id: "gdrive-3",
    name: "Property_Transfer_Deed_2026.pdf",
    size: "1.1 MB",
    updatedAt: "Sep 8, 2026",
    type: "pdf",
    provider: "google-drive",
  },
  {
    id: "dropbox-1",
    name: "Bill_of_Sale_MacBook_Pro.pdf",
    size: "1.3 MB",
    updatedAt: "1 hour ago",
    type: "pdf",
    provider: "dropbox",
  },
  {
    id: "dropbox-2",
    name: "Signed_Sales_Contract.pdf",
    size: "3.2 MB",
    updatedAt: "3 days ago",
    type: "pdf",
    provider: "dropbox",
  },
];

export const CloudImportModal: React.FC<CloudImportModalProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  initialProvider = "google-drive",
}) => {
  const [activeProvider, setActiveProvider] =
    useState<CloudProvider>(initialProvider);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredFiles = MOCK_FILES.filter(
    (file) =>
      file.provider === activeProvider &&
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImport = () => {
    const file = MOCK_FILES.find((f) => f.id === selectedFileId);
    if (!file) return;

    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setImportSuccess(
        `Successfully imported "${file.name}" from ${activeProvider === "google-drive" ? "Google Drive" : "Dropbox"}!`
      );
      if (onSelectFile) {
        onSelectFile(file);
      }

      setTimeout(() => {
        setImportSuccess(null);
        setSelectedFileId(null);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-semibold text-blue-600 shadow-xs">
              {activeProvider === "google-drive" ? (
                <svg className="h-6 w-6" viewBox="0 0 87.3 78" fill="none">
                  <path
                    d="M6.6 66.85l25.3-43.8 25.3 43.8H6.6z"
                    fill="#0066DA"
                  />
                  <path
                    d="M43.65 23.05L68.95 66.85h-50.6l25.3-43.8z"
                    fill="#00AC47"
                  />
                  <path
                    d="M68.95 66.85L56.3 44.9H5.7l12.65 21.95h50.6z"
                    fill="#EA4335"
                  />
                  <path
                    d="M43.65 23.05L31 1.1h25.3l12.65 21.95H43.65z"
                    fill="#FFBA00"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#0061FF">
                  <path d="M6 2l6 3.8L18 2l4.8 4.2-6 4.8 6 4.8-4.8 4.2L12 16.2 6 20.2 1.2 16l6-4.8-6-4.8L6 2zm12 12.2l-6-3.8-6 3.8 6 3.8 6-3.8z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg leading-tight font-bold text-gray-900">
                Import from{" "}
                {activeProvider === "google-drive" ? "Google Drive" : "Dropbox"}
              </h3>
              <p className="text-xs text-gray-500">
                Select a document template from your cloud storage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Cloud Provider Tabs */}
        <div className="flex gap-2 border-b border-gray-100 bg-gray-50/30 px-6 pt-3">
          <button
            onClick={() => {
              setActiveProvider("google-drive");
              setSelectedFileId(null);
            }}
            className={cn(
              "flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-all",
              activeProvider === "google-drive"
                ? "border-blue-600 bg-white text-blue-600 shadow-xs"
                : "border-transparent text-gray-500 hover:bg-gray-100/50 hover:text-gray-700"
            )}
          >
            <span>🟢 Google Drive</span>
          </button>
          <button
            onClick={() => {
              setActiveProvider("dropbox");
              setSelectedFileId(null);
            }}
            className={cn(
              "flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-all",
              activeProvider === "dropbox"
                ? "border-blue-600 bg-white text-blue-600 shadow-xs"
                : "border-transparent text-gray-500 hover:bg-gray-100/50 hover:text-gray-700"
            )}
          >
            <span>🟦 Dropbox</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="border-b border-gray-100 p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Bill of Sale or contract..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pr-4 pl-10 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-hidden"
            />
            <span className="absolute top-2.5 left-3 text-sm text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* File List */}
        <div className="max-h-64 space-y-2 overflow-y-auto p-4">
          {importSuccess && (
            <div className="animate-in zoom-in-95 flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600">
                ✓
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {importSuccess}
              </p>
            </div>
          )}
          {!importSuccess && filteredFiles.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">
              No files found matching "{searchQuery}"
            </div>
          )}
          {!importSuccess && filteredFiles.length > 0 && (
            filteredFiles.map((file) => {
              const isSelected = selectedFileId === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all",
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 shadow-xs"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-600">
                      PDF
                    </div>
                    <div>
                      <p className="line-clamp-1 text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {file.size} • Modified {file.updatedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300"
                      )}
                    >
                      {isSelected && <span className="text-xs">✓</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <span className="text-xs text-gray-400">
            {selectedFileId
              ? "1 document selected"
              : "Select a document to import into OnlyDoc"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              disabled={!selectedFileId || isImporting || !!importSuccess}
              onClick={handleImport}
              className={cn(
                "flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-md transition-all",
                selectedFileId && !isImporting
                  ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-98"
                  : "cursor-not-allowed bg-blue-300"
              )}
            >
              {isImporting ? (
                <>
                  <span className="animate-spin text-xs">🌀</span>
                  <span>Importing...</span>
                </>
              ) : (
                <span>Import File</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
