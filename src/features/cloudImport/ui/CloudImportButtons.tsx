import React from "react";

import { cn } from "@/shared/lib/utils/cn";

import type { CloudImportButtonsProps } from "../model/types";

export const CloudImportButtons: React.FC<CloudImportButtonsProps> = ({
  onOpenModal,
  className,
}) => {
  return (
    <div
      className={cn("flex items-center justify-center gap-3 pt-3", className)}
    >
      <span className="text-xs font-medium text-gray-400">or import from:</span>

      {/* Google Drive Button */}
      <button
        type="button"
        onClick={() => onOpenModal("google-drive")}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-xs active:scale-98"
        title="Import document from Google Drive"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 87.3 78" fill="none">
          <path d="M6.6 66.85l25.3-43.8 25.3 43.8H6.6z" fill="#0066DA" />
          <path d="M43.65 23.05L68.95 66.85h-50.6l25.3-43.8z" fill="#00AC47" />
          <path
            d="M68.95 66.85L56.3 44.9H5.7l12.65 21.95h50.6z"
            fill="#EA4335"
          />
          <path
            d="M43.65 23.05L31 1.1h25.3l12.65 21.95H43.65z"
            fill="#FFBA00"
          />
        </svg>
        <span>Google Drive</span>
      </button>

      {/* Dropbox Button */}
      <button
        type="button"
        onClick={() => onOpenModal("dropbox")}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-xs active:scale-98"
        title="Import document from Dropbox"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="#0061FF">
          <path d="M6 2l6 3.8L18 2l4.8 4.2-6 4.8 6 4.8-4.8 4.2L12 16.2 6 20.2 1.2 16l6-4.8-6-4.8L6 2zm12 12.2l-6-3.8-6 3.8 6 3.8 6-3.8z" />
        </svg>
        <span>Dropbox</span>
      </button>
    </div>
  );
};
