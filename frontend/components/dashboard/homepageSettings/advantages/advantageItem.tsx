import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react'; 
import { Input } from '@/components/ui/input'; 
import FileInput from '@/components/dashboard/FileInput/FileInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { AdvantagesFields, HomepageSettingsMutationData } from '@/types/homepageSettings';
import type { FieldErrors, UseFieldArrayRemove, UseFieldArrayUpdate, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';

interface AdvantageItemProps {
  index: number;
  field: AdvantagesFields;
  fieldError: FieldErrors<AdvantagesFields> | undefined;
  register: UseFormRegister<HomepageSettingsMutationData>;
  setValue: UseFormSetValue<HomepageSettingsMutationData>;
  watch: UseFormWatch<HomepageSettingsMutationData>;
  update: UseFieldArrayUpdate<HomepageSettingsMutationData, 'advantages'>;
  remove: UseFieldArrayRemove;
  imageUrl: string;
  inputClass: string;
}

export default function AdvantageItem({
  index,
  field,
  fieldError,
  register,
  setValue,
  watch,
  update,
  remove,
  imageUrl,
  inputClass,
}: AdvantageItemProps) {
  const imageToDisplay = field.image;
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    let objectUrl: string | undefined;

    if (imageToDisplay instanceof File) {
      objectUrl = URL.createObjectURL(imageToDisplay);
      setPreviewSrc(objectUrl);
    } else if (typeof imageToDisplay === 'string' && imageToDisplay) {
      setPreviewSrc(imageUrl + imageToDisplay);
    } else {
      setPreviewSrc(undefined);
    }

    // Функция очистки памяти при размонтировании карточки или смене картинки
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageToDisplay, imageUrl]);

  const fileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    const file = files && files[0] ? files[0] : null;

    setValue(`advantages.${index}.image` as const, file, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const deleteFile = () => {
    const currentItem = watch(`advantages.${index}`);
    update(index, {
      ...currentItem,
      image: null,
    });
  };

  return (
    <div className="relative p-3 text-sm border rounded-2xl bg-gray-100 items-start space-y-4">
      <div>
        <label className="font-medium block mb-1">Заголовок:</label>
        <Input
          {...register(`advantages.${index}.title` as const, {
            required: 'Введите заголовок',
          })}
          className={`${inputClass} ${fieldError?.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldError?.title && (
          <span className="text-red-500 text-xs mt-1 block">
            {fieldError.title.message}
          </span>
        )}
      </div>

      <div>
        <label className="font-medium block mb-1">Текст:</label>
        <textarea
          {...register(`advantages.${index}.body` as const)}
          className={`${inputClass} min-h-[100px] py-2.5 resize-y w-full rounded-md border p-2`}
        />
        {fieldError?.body && (
          <span className="text-red-500 text-xs mt-1 block">
            {fieldError.body.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {field.image && (
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Посмотреть
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl flex flex-col items-center">
                <DialogHeader>
                  <DialogTitle className="sr-only">
                    Просмотр изображения
                  </DialogTitle>
                </DialogHeader>

                {previewSrc && (
                  <div className="flex items-center justify-center">
                    <img
                      src={previewSrc}
                      alt={field.title || 'Advantage image'}
                      className="max-h-[80vh] w-auto rounded-xl object-contain"
                    />
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <button
              className="cursor-pointer"
              type="button"
              onClick={deleteFile}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}

        <FileInput
          key={`file-input-${index}-${field.image ? (field.image instanceof File ? field.image.name : field.image) : 'empty'}`}
          name="image"
          label="Добавить фото"
          onChange={fileChangeHandler}
        />
      </div>

      <button
        aria-label="Убрать преимущество"
        type="button"
        onClick={() => remove(index)}
        className="absolute top-3 right-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-background hover:bg-red-50 transition-colors"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </button>
    </div>
  );
};
