"use client";
import {useEffect, useState} from "react";
import type {NewsMutation} from "@/types/news";
import FileInput from "@/components/dashboard/FileInput/FileInput";
import {Plus, Trash2} from "lucide-react";
import useCreateNews, {useEditNews} from "@/lib/hooks/newsHooks";
import {Input} from "@/components/ui/input";
import {useFieldArray, useForm} from "react-hook-form";

interface Props {
  isEdit?: boolean;
  initialValues?: NewsMutation;
  editedId?: string;
  editImage?: string | null;
}

export default function CreateNewsForm({
                                         isEdit = false,
                                         editedId,
                                         editImage,
                                         initialValues
                                       }: Props) {
  const {
    handleSubmit,
    control,
    setError,
    setValue,
    reset,
    formState: {errors},
    register
  } = useForm<NewsMutation>({
    defaultValues: initialValues || {
      title: "",
      content: "",
      image: null,
      tags: []
    }
  })
  const {mutate: CreateNews, isPending} = useCreateNews(setError);
  const {mutate: EditNews} = useEditNews(setError);

  const {fields, append, remove} = useFieldArray({
    control,
    name: "tags" as never
  });

  const [fileInputKey, setFileInputKey] = useState(0);


  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const onSubmit = (form: NewsMutation) => {
    if (isEdit && editedId) {
      const newForm = {...form};
      if (!form.image) {
        delete newForm.image;
      }

      EditNews({id: editedId, data: newForm}, {
        onSuccess: () => reset()
      });

    } else {
      CreateNews(form, {
        onSuccess: () => reset()
      });
    }

    setFileInputKey(prev => prev + 1);
  };

  const fileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {files} = e.target;
    if (files && files[0]) {
      setValue("image", files[0]);
    } else {
      setValue("image", null);
    }
  };


  const getError = (fieldName: keyof NewsMutation) => {
    return errors[fieldName] &&
      <p className="text-red-500 text-xs">{errors[fieldName].message}</p>
  }


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 border p-6 rounded-xl "
      autoComplete="off"
    >
      <h2 className="text-xl font-semibold">
        {isEdit ? "Редактировать" : "Создать новости"}
      </h2>

      <div className="space-y-1">
        <label className="text-sm font-medium">
          Название
        </label>
        <Input
          {...register("title", {required: "Заголовок обязателен"})}
          className="w-full border rounded-lg p-2"
          placeholder="Заголовок новости"
        />
        {getError("title")}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">
          Контент
        </label>

        <Input
          {...register("content", {required: "Контент обязателен"})}
          className="w-full border rounded-lg p-3"
          placeholder="О чем эта новость? Опишите подробности..."
        />
        {getError("content")}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium leading-none">
          Тэги
        </label>

        <div className={`${fields.length > 2 && 'overflow-y-scroll h-[104px]'} space-y-2`}>
          {fields.map((tag, i) => (
            <div
              key={tag.id}
              className="space-y-1"
            >
              <div className="flex items-center gap-2">
                <Input
                  {...register(`tags.${i}`, {required: "Тэг не может быть пустым"})}
                  className="w-full border rounded-lg p-2"
                  placeholder="Введите тэг"
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-background hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
              {errors.tags?.[i] && (
                <p className="text-red-500 text-[10px] ml-1">
                  {errors.tags[i]?.message}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append("")}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить тэг
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium leading-none">
          Добавить изображение
        </label>
        {isEdit && editImage
          ? <FileInput
            key={fileInputKey}
            name="image"
            label="Добавить"
            onChange={fileChangeHandler}
            editImage={editImage}
          />
          : <FileInput
            key={fileInputKey}
            name="image"
            label="Добавить"
            onChange={fileChangeHandler}
          />
        }

      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {isEdit
          ? isPending ? "Редактируются..." : "Редактировать новости"
          : isPending ? "Создать..." : "Создать новости"
        }
      </button>
    </form>
  );
}
