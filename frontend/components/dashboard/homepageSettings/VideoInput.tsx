'use client';

import { useRef, useState } from 'react';
import {
  useController,
  type Control,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import { Film, UploadCloud, Trash2, AlertCircle } from 'lucide-react';
import type { HomepageSettingsMutationData } from '@/types/homepageSettings';
import { imageUrl } from '@/lib/constants';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog/ConfirmDialog';

interface VideoInputProps {
  control: Control<HomepageSettingsMutationData>;
  setValue: UseFormSetValue<HomepageSettingsMutationData>;
  watch: UseFormWatch<HomepageSettingsMutationData>;
  disabled?: boolean;
}

export const VideoInput = ({
                             control,
                             setValue,
                             watch,
                             disabled,
                           }: VideoInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // Состояние для модального окна

  const { field: videoField } = useController({ name: 'video', control });
  const deleteVideoValue = watch('deleteVideo');
  const currentVideoUrl = watch('hero.videoUrl');

  const selectedFile = videoField.value as File | null;
  const hasExistingVideo = !!currentVideoUrl && !deleteVideoValue;

  const videoPreviewUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : null;
    const displayVideoUrl =
    videoPreviewUrl ||
    (hasExistingVideo
      ? `${imageUrl}api/homepage-settings/video/${currentVideoUrl}`
      : null);

  const handleFile = (file: File) => {
    setLocalError(null);

    if (!file.type.startsWith('video/')) {
      setLocalError('Допустимы только видеофайлы (mp4, webm).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setLocalError('Файл слишком тяжелый. Максимальный размер — 15 МБ.');
      return;
    }

    videoField.onChange(file);
    setValue('deleteVideo', false);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    videoField.onChange(null);
    if (currentVideoUrl) {
      setValue('deleteVideo', true);
    }
    setIsConfirmOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Film className="w-4 h-4 text-[#1E2B6D]" /> Фоновое видео для главного
        экрана
      </label>

      {displayVideoUrl ? (
        <div className="relative rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden aspect-video max-w-xl group">
          <video
            src={displayVideoUrl}
            className="w-full h-full object-cover"
            controls
            muted
            playsInline
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="
              absolute top-3 right-3
              p-2.5
              rounded-xl
              bg-red-500
              text-white
              shadow-md
              hover:bg-red-600
              transition-all
            "
              title="Удалить видеоролик"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {selectedFile && (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
              Новый файл готов к сохранению
            </div>
          )}
        </div>
      ) : (
        <div
          onDragEnter={onDrag}
          onDragOver={onDrag}
          onDragLeave={onDrag}
          onDrop={onDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all min-h-[180px] ${
            isDragActive
              ? 'border-[#1E2B6D] bg-blue-50/40'
              : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
            accept="video/*"
            className="hidden"
            disabled={disabled}
          />

          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 mb-3 text-gray-400 group-hover:text-[#1E2B6D] transition-colors">
            <UploadCloud className="w-6 h-6 text-[#1E2B6D]" />
          </div>

          <p className="text-sm font-semibold text-gray-700">
            Перетащите файл сюда или{' '}
            <span className="text-[#1E2B6D] hover:underline">
              выберите на диске
            </span>
          </p>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-left border-t border-gray-100 pt-3 w-full max-w-sm mx-auto">
            <span className="text-xs text-gray-400">Форматы:</span>
            <span className="text-xs text-gray-600 font-medium text-right">
              MP4, WebM
            </span>
            <span className="text-xs text-gray-400">Вес:</span>
            <span className="text-xs text-gray-600 font-medium text-right">
              До 15 Мегабайт
            </span>
            <span className="text-xs text-gray-400">Оптимизация:</span>
            <span className="text-xs text-gray-600 font-medium text-right">
              Рекомендуется 720p/1080p
            </span>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title="Вы уверены, что хотите удалить видеоролик?"
        description="Текущее фоновое видео будет убрано с главного экрана после сохранения настроек."
        confirmText="Удалить"
        onCancelAction={() => setIsConfirmOpen(false)}
        onConfirmAction={handleConfirmDelete}
      />

      {localError && (
        <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 pt-1">
          <AlertCircle className="w-3.5 h-3.5" /> {localError}
        </p>
      )}
    </div>
  );
};