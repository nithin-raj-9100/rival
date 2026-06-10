'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Image as ImageIcon, FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

interface FileUploadProps {
  onUpload: (file: File) => void;
  isPending?: boolean;
  attachments?: Attachment[];
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mime: string) {
  if (mime.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-emerald-500" />;
  if (mime.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
  return <File className="w-5 h-5 text-indigo-500" />;
}

export function FileUpload({ onUpload, isPending, attachments }: FileUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      for (const file of accepted) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 5 * 1024 * 1024,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
    },
  });

  return (
    <div className="space-y-6">
      {/* Drop Zone Box */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 focus-ring ${
          isDragActive
            ? 'border-primary bg-primary/5 scale-[0.99] shadow-inner'
            : 'border-border/60 hover:border-primary/40 hover:bg-muted/30 bg-muted/10'
        }`}
        role="button"
        aria-label="Upload files by dragging and dropping here, or click to browse"
      >
        <input {...getInputProps()} />
        <div className="relative w-12 h-12 mx-auto mb-3 bg-background dark:bg-zinc-950 border border-border/60 rounded-xl flex items-center justify-center shadow-sm">
          {isPending ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Upload className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ${
              isDragActive ? 'animate-bounce text-primary' : ''
            }`} />
          )}
        </div>
        <p className="text-sm font-bold text-foreground">
          {isDragActive ? 'Drop your files here' : 'Drag & drop files here, or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">
          Images, PDF, Word documents up to 5MB
        </p>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/20">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          <span>Uploading attachment to secure cloud...</span>
        </div>
      )}

      {/* Attachments Section */}
      {attachments && attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Uploaded Files ({attachments.length})</h4>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {attachments.map((att) => (
              <Card
                key={att.id}
                className="p-3.5 glass-card border-border/40 flex items-center justify-between gap-3 group hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-background dark:bg-zinc-950 p-2 border border-border/50 rounded-xl flex items-center justify-center shadow-sm">
                    {getFileIcon(att.mimeType)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate max-w-[150px] sm:max-w-[120px]">{att.filename}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground">{formatSize(att.size)}</p>
                  </div>
                </div>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring rounded-lg shrink-0"
                  aria-label={`View attachment: ${att.filename}`}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent rounded-lg cursor-pointer">
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
