import React, { useState } from 'react';
import { Attachment } from '../../types';
import { formatBytes, formatDate } from '../../lib/utils';
import { FileText, Image as ImageIcon, FileCode, Paperclip, Download, ExternalLink, Eye, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';

interface AttachmentListProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  canEdit?: boolean;
}

export function AttachmentList({ attachments, onRemove, canEdit = false }: AttachmentListProps) {
  const [previewItem, setPreviewItem] = useState<Attachment | null>(null);

  const getFileIcon = (type: string, name: string) => {
    if (type.startsWith('image/') || name.match(/\.(png|jpe?g|gif|webp|svg)$/i)) {
      return <ImageIcon className="h-5 w-5 text-indigo-500" />;
    }
    if (type.includes('json') || type.includes('javascript') || name.match(/\.(ts|tsx|js|json|sql)$/i)) {
      return <FileCode className="h-5 w-5 text-amber-500" />;
    }
    if (type.includes('text') || name.match(/\.(txt|log|csv|md)$/i)) {
      return <FileText className="h-5 w-5 text-sky-500" />;
    }
    return <Paperclip className="h-5 w-5 text-slate-500" />;
  };

  if (!attachments || attachments.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-500">
        <Paperclip className="h-4 w-4 text-slate-400" />
        <span>No attachments uploaded yet.</span>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {attachments.map((att) => {
          const isImage = att.type.startsWith('image/') || att.name.match(/\.(png|jpe?g|gif|webp)$/i);

          return (
            <div
              key={att.id}
              className="group relative flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100/80">
                {getFileIcon(att.type, att.name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                  {att.name}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{formatBytes(att.size)}</span>
                  <span>•</span>
                  <span>{att.uploadedBy?.name || 'User'}</span>
                  <span>•</span>
                  <span>{formatDate(att.uploadedAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                {isImage && (
                  <button
                    type="button"
                    onClick={() => setPreviewItem(att)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Preview attachment"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                )}
                <a
                  href={att.url && att.url !== '#' ? att.url : '#'}
                  download={att.name}
                  onClick={(e) => {
                    if (att.url === '#' || !att.url) {
                      e.preventDefault();
                      alert(`Downloading attachment: ${att.name}`);
                    }
                  }}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title="Download attachment"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                {canEdit && onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(att.id)}
                    className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Remove attachment"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      {previewItem && (
        <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
          <DialogClose onClose={() => setPreviewItem(null)} />
          <DialogHeader>
            <DialogTitle>{previewItem.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-3 flex items-center justify-center rounded-lg bg-slate-950 p-2 overflow-hidden max-h-[70vh]">
            <img
              src={previewItem.url}
              alt={previewItem.name}
              className="max-h-[60vh] max-w-full rounded object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Size: {formatBytes(previewItem.size)}</span>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                window.open(previewItem.url, '_blank');
              }}
              className="gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Open Original
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
