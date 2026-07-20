'use client';

import React, {useEffect, useRef, useState} from 'react';
import {AlertCircle, ArrowLeft, Camera, X} from 'lucide-react';
import {IMAGE_UPLOAD, imageUrl} from '@/lib/constants';
import {getFileKey, validateImageFile} from '@/lib/utils';
import type {RejectedFile} from '@/types/multiImage';

interface Props {
  name: string;
  label: string;
  onChange: (files: (File | string)[]) => void;
  value: (File | string)[];
  previewsValues?: (File | string)[];
  maxFiles?: number;
  showPreviews?: boolean;
  allowReorder?: boolean;
}

const MultiImageInput: React.FC<Props> = ({
  name,
  label,
  onChange,
  value = [],
  previewsValues = [],
  maxFiles = IMAGE_UPLOAD.MAX_FILES,
  showPreviews = true,
  allowReorder = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [rejected, setRejected] = useState<RejectedFile[]>([]);

  useEffect(() => {
    if (!showPreviews) {
      setPreviews({});
      return;
    }

    const objectUrls: string[] = [];
    const next: Record<string, string> = {};

    value.forEach((item, index) => {
      const key = getFileKey(item);
      const previewSource = previewsValues[index] ?? item;

      if (typeof previewSource === 'string') {
        next[key] = previewSource.startsWith('http')
          ? previewSource
          : `${imageUrl}${previewSource}`;
        return;
      }

      const blobUrl = URL.createObjectURL(previewSource);
      objectUrls.push(blobUrl);
      next[key] = blobUrl;
    });

    setPreviews(next);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [value, previewsValues, showPreviews]);

 const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const files = Array.from(e.target.files || []);
   const availableSlots = maxFiles - value.length;

   const accepted: File[] = [];
   const newRejected: RejectedFile[] = [];

   files.forEach((file) => {
     const result = validateImageFile(file);

     if (result.valid) {
       accepted.push(file);
     } else {
       newRejected.push({
         id: `${file.name}-${file.size}-${Date.now()}`,
         name: file.name,
         error: result.error!,
       });
     }
   });

   const filesToAdd = accepted.slice(0, availableSlots);
   const excessAccepted = accepted.slice(availableSlots);

   excessAccepted.forEach((file) => {
     newRejected.push({
       id: `${file.name}-${file.size}-${Date.now()}`,
       name: file.name,
       error: `Превышено максимальное количество файлов (${maxFiles})`,
     });
   });

   if (newRejected.length > 0) {
     setRejected((prev) => [...prev, ...newRejected]);
   }

   if (filesToAdd.length > 0) {
     onChange([...value, ...filesToAdd]);
     console.log(value);
   }

   if (inputRef.current) inputRef.current.value = '';
 };

  const removeFile = (indexToRemove: number) => {
    onChange(value.filter((_, i) => i !== indexToRemove));
  };

  const dismissRejected = (id: string) => {
    setRejected((prev) => prev.filter((r) => r.id !== id));
  };

  const moveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...value];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        accept={IMAGE_UPLOAD.ALLOWED_MIME_TYPES.join(',')}
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

      <p className="text-xs text-muted-foreground">
        JPEG, PNG или WEBP, до {IMAGE_UPLOAD.MAX_FILE_SIZE_BYTES / (1024 * 1024)} МБ
      </p>

      {rejected.length > 0 && (
        <ul className="space-y-1">
          {rejected.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600"
            >
              <span className="flex items-center gap-1.5 truncate">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{r.name}</span> — {r.error}
              </span>
              <button type="button" onClick={() => dismissRejected(r.id)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showPreviews && value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mt-2">
          {value.map((item, index) => {
            const key = getFileKey(item);
            const url = previews[key];

            return (
              <div
                key={key}
                className="relative aspect-square rounded-lg border border-input overflow-hidden bg-background group"
              >
                {url && (
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}

                <div className="absolute inset-0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                  <div className="absolute right-1.5 top-1.5">
                    {allowReorder && index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveLeft(index)}
                        className="p-1.5 bg-white rounded-full text-gray-700 hover:text-[#1E2B6D] transition-colors mr-1.5"
                        title="Сдвинуть влево"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1.5 bg-white rounded-full text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      title="Удалить"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-[#1E2B6D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                    Главное
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiImageInput;