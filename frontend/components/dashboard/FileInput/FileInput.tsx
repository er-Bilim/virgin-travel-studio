'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { imageUrl } from '@/lib/constants';

interface Props {
  name: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editImage?: string;
}

const FileInput: React.FC<Props> = ({
  name,
  label,
  onChange,
  editImage = null,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<string | null>(
    editImage ? imageUrl + editImage : null,
  );

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const newUrl = URL.createObjectURL(files[0]);
      blobUrlRef.current = newUrl;
      setFileName(files[0].name);
      setPreview(newUrl);
    } else {
      setFileName('');
      setPreview(null);
    }
    onChange(e);
  };

  const activateInput = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setFileName('');
    setPreview(editImage ? imageUrl + editImage : null);
    if (inputRef.current) inputRef.current.value = '';

    const event = {
      target: {
        name,
        files: null,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <div className="space-y-4">
      <input
        title="image"
        className="hidden"
        type="file"
        accept="image/*"
        onChange={onChangeFile}
        ref={inputRef}
        name={name}
      />
      <div className="flex items-center gap-3">
        <div
          onClick={activateInput}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <span className="truncate">{fileName || label}</span>
          {fileName && (
            <X
              className="h-4 w-4 text-muted-foreground hover:text-destructive"
              onClick={clearFile}
            />
          )}
        </div>
        <button
          title="activate button"
          type="button"
          onClick={activateInput}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Camera className="h-5 w-5" />
        </button>
      </div>
      {preview && (
        <div className="relative mt-2 w-full max-w-sm overflow-hidden rounded-lg border">
          <img
            src={preview}
            alt="Preview"
            className="object-cover w-full h-auto max-h-48"
          />
        </div>
      )}
    </div>
  );
};

export default FileInput;
