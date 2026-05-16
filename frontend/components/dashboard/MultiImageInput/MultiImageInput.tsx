'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface Props {
  name: string;
  label: string;
  onChange: (files: File[]) => void;
  value: File[];
  maxFiles?: number;
}

const MultiImageInput: React.FC<Props> = ({
  name,
  label,
  onChange,
  value = [],
  maxFiles = 5,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const newPreviews = value.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);

    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [value]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const updatedFiles = [...value, ...files].slice(0, maxFiles);
    onChange(updatedFiles);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const updatedFiles = value.filter((_, i) => i !== index);
    onChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={onFileChange}
        ref={inputRef}
        name={name}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <div
          onClick={() => value.length < maxFiles && inputRef.current?.click()}
          className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors ${
            value.length < maxFiles
              ? 'cursor-pointer hover:bg-accent'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <span className="truncate">
            {value.length > 0
              ? `Выбрано: ${value.length} из ${maxFiles}`
              : label}
          </span>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-background hover:bg-accent"
          disabled={value.length >= maxFiles}
        >
          <Camera className="h-5 w-5" />
        </button>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mt-2">
          {previews.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg border border-input overflow-hidden bg-background"
            >
              <img
                src={url}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:opacity-90"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiImageInput;
