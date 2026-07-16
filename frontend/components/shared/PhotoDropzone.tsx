'use client';

import {
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState
} from 'react';
import {Loader2, UploadCloud, X} from 'lucide-react';
import {cn, compressImage, validateImageFile} from '@/lib/utils';
import useObjectUrl from '@/lib/hooks/useObjectUrl';
import {IMAGE_UPLOAD} from '@/lib/constants';

interface Props {
  id: string;
  name: string;
  value?: File | null;
  label?: string;
  className?: string;
  onFile: (file: File | null) => void;
  error?: string;
}

const PhotoDropzone: React.FC<Props> = ({
  id,
  name,
  value,
  label = 'Перетащите фото или выберите файл',
  className,
  onFile,
  error,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const preview = useObjectUrl(value);
  const fileName = value instanceof File ? value.name : '';

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const accept = async (file: File) => {
    setLocalError(null);

    const result = validateImageFile(file);
    if (!result.valid) {
      setLocalError(result.error!);
      return;
    }

    setIsProcessing(true);

    try {
      const compressed = await compressImage(file);

     const compressedFile = compressed instanceof File
         ? compressed
         : new File([compressed], file.name, {
           type: file.type,
         });

      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(compressed);
      blobUrlRef.current = url;

      onFile(compressedFile);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Не удалось обработать файл');
    } finally {
      setIsProcessing(false);
    }
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (!files) return;
    if (!files[0]) return;

    void accept(files[0]);
  };

  const clear = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setLocalError(null);
    if (inputRef.current) inputRef.current.value = '';
    onFile(null);
  };

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = Array.from(event.dataTransfer.files).find((file) => {
      return file.type.startsWith('image/');
    });

    if (!file) {
      setLocalError('Перетащите файл изображения');
      return;
    }

    void accept(file);
  };

  const displayError = error || localError;

  return (
    <div className={cn(className)}>
      <input
        id={id}
        aria-label={label}
        ref={inputRef}
        type="file"
        accept={IMAGE_UPLOAD.ALLOWED_MIME_TYPES.join(',')}
        name={name}
        className="hidden"
        onChange={onInputChange}
      />

      {preview ? (
        <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-border">
          <img
            src={preview}
            alt="Превью"
            className="h-auto max-h-40 w-full object-cover"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-destructive cursor-pointer"
            title="Удалить фото"
          >
            <X className="size-4" />
          </button>
          <p className="truncate px-3 py-2 text-xs text-muted-foreground">
            {fileName}
          </p>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border-[1.5px] border-dashed border-slate-300 px-4 py-6 text-center transition-colors ${
            dragOver
              ? 'border-ring bg-accent/40'
              : 'border-input bg-background hover:bg-accent/30'
          }`}
        >
          {isProcessing ? (
              <>
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Обработка фото...</p>
              </>
          ) : (
              <>
                <UploadCloud className="size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground flex gap-1">
                  Перетащите фото или
                  <span className="font-medium text-foreground">выберите файл</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WEBP до {IMAGE_UPLOAD.MAX_FILE_SIZE_BYTES / (1024 * 1024)} МБ
                </p>
              </>
          )}
        </div>
      )}

      {displayError && <p className="text-sm mt-2 text-red-500">{displayError}</p>}
    </div>
  );
};

export default PhotoDropzone;
