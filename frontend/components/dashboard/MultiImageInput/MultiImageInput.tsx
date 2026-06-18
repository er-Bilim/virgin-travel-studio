'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, ArrowLeft } from 'lucide-react';
import { imageUrl } from '@/lib/constants';

interface Props {
  name: string;
  label: string;
  onChange: (files: (File | string)[]) => void;
  value: (File | string)[];
  maxFiles?: number;
  showPreviews?: boolean;
  allowReorder?: boolean;
}

const MultiImageInput: React.FC<Props> = ({
                                            name,
                                            label,
                                            onChange,
                                            value = [],
                                            maxFiles = 5,
                                            showPreviews = true,
                                            allowReorder = false,
                                          }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!showPreviews) {
      setPreviews([]);
      return;
    }

    const objectUrls: string[] = [];

    const newPreviews = value.map((item) => {
      if (typeof item === 'string') {
        return item.startsWith('http') ? item : `${imageUrl}/${item}`;
      }
      const blobUrl = URL.createObjectURL(item);
      objectUrls.push(blobUrl);
      return blobUrl;
    });

    setPreviews(newPreviews);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [value, showPreviews]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const updatedFiles = [...value, ...files].slice(0, maxFiles);
    onChange(updatedFiles);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = value.filter((_, i) => i !== indexToRemove);
    onChange(updatedFiles);
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

      {showPreviews && previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mt-2">
          {previews.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg border border-input overflow-hidden bg-background group"
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0   group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
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
                    className="p-1.5 bg-white rounded-full text-red-500 hover:text-red-700 transition-colors"
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiImageInput;