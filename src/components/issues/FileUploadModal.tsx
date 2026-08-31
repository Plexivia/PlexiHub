import React, { useState, useRef } from 'react';
import { Attachment, User } from '../../types';
import { Button } from '../ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { formatBytes } from '../../lib/utils';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (attachments: Attachment[]) => void;
  currentUser: User;
}

interface StagedFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed';
}

export function FileUploadModal({
  open,
  onOpenChange,
  onUploadComplete,
  currentUser,
}: FileUploadModalProps) {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newStaged: StagedFile[] = Array.from(files).map((f) => ({
      file: f,
      id: `staged_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      progress: 0,
      status: 'pending',
    }));
    setStagedFiles((prev) => [...prev, ...newStaged]);
  };

  const removeStaged = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleStartUpload = async () => {
    if (stagedFiles.length === 0) return;
    setIsUploading(true);

    // Simulate progress per file
    const completedAttachments: Attachment[] = [];

    for (let i = 0; i < stagedFiles.length; i++) {
      const staged = stagedFiles[i];

      // Simulate progress ticks
      for (let p = 20; p <= 100; p += 30) {
        await new Promise((r) => setTimeout(r, 60));
        setStagedFiles((prev) =>
          prev.map((f) => (f.id === staged.id ? { ...f, progress: p, status: p === 100 ? 'completed' : 'uploading' } : f))
        );
      }

      const isImg = staged.file.type.startsWith('image/');
      const mockUrl = isImg
        ? 'https://images.unsplash.com/photo-1556742049-0a67e5577ff0?w=600&auto=format&fit=crop&q=80'
        : '#';

      completedAttachments.push({
        id: `att_${Date.now()}_${i}`,
        name: staged.file.name,
        size: staged.file.size,
        type: staged.file.type || 'application/octet-stream',
        url: mockUrl,
        uploadedBy: currentUser,
        uploadedAt: new Date().toISOString(),
      });
    }

    setIsUploading(false);
    onUploadComplete(completedAttachments);
    setStagedFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>Upload Attachments</DialogTitle>
        <DialogDescription>
          Drag and drop logs, screenshots, JSON payloads, or click to browse files.
        </DialogDescription>
      </DialogHeader>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-sky-500 bg-sky-50/50'
            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-2xs border border-slate-200 text-sky-600">
          <UploadCloud className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold text-slate-800">
          Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
        </p>
        <p className="mt-1 text-[11px] text-slate-400">PNG, JPG, PDF, TXT, LOG, JSON up to 25MB</p>
      </div>

      {stagedFiles.length > 0 && (
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
          {stagedFiles.map((sf) => (
            <div
              key={sf.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <File className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-800">{sf.file.name}</p>
                  <p className="text-[10px] text-slate-400">{formatBytes(sf.file.size)}</p>
                  {isUploading && (
                    <Progress value={sf.progress} className="h-1.5 mt-1.5" />
                  )}
                </div>
              </div>

              <div className="ml-3 flex items-center gap-1 shrink-0">
                {sf.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : !isUploading ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStaged(sf.id);
                    }}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleStartUpload}
          disabled={stagedFiles.length === 0 || isUploading}
          isLoading={isUploading}
        >
          {isUploading ? 'Uploading...' : `Upload ${stagedFiles.length} file${stagedFiles.length > 1 ? 's' : ''}`}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
