"use client";

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";

interface DragDropUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
}

export function DragDropUploader({ onFilesSelected, maxFiles = 50, accept = "image/*", disabled = false }: DragDropUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFiles = useCallback(
    (files: FileList) => {
      const fileArray = Array.from(files).slice(0, maxFiles);
      setSelectedFiles(fileArray);
      onFilesSelected(fileArray);
      setIsDragging(false);
    },
    [maxFiles, onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-all ${
          isDragging
            ? "border-cyan-400 bg-cyan-50/10"
            : "border-slate-300 bg-slate-50/30 hover:border-cyan-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} p-8`}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-full bg-cyan-100/20 p-3">
            <Upload className="h-6 w-6 text-cyan-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Drop images here or click to browse</p>
            <p className="text-sm text-slate-600">Supports PNG, JPG, GIF, WebP (max {maxFiles} files)</p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">{selectedFiles.length} file(s) selected</p>
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-100 p-3">
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-2 p-1 hover:bg-slate-200 rounded transition-colors"
                  type="button"
                >
                  <X className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
