'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
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
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Max 5MB (images, PDF, Word docs)</p>
      </div>

      {isPending && <p className="text-sm text-muted-foreground">Uploading...</p>}

      {attachments && attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((att) => (
            <Card key={att.id} className="p-3 flex items-center gap-2">
              <File className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{att.filename}</p>
                <p className="text-xs text-muted-foreground">{formatSize(att.size)}</p>
              </div>
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm">View</Button>
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
