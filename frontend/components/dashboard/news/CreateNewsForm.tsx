"use client";
import {useState} from "react";
import type {NewsMutation} from "@/types/news";
import FileInput from "@/components/dashboard/FileInput/FileInput";
import {Plus, Trash2} from "lucide-react";
import {useCreateNews, useEditNews} from "@/lib/hooks/newsHooks";
import {Input} from "@/components/ui/input";

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
                                         initialValues = {
                                           title: "",
                                           content: "",
                                           image: null,
                                           tags: []
                                         }
                                       }: Props) {
  const {mutate: CreateNews, isPending} = useCreateNews();
  const {mutate: EditNews} = useEditNews();
  const [form, setForm] = useState<NewsMutation>(initialValues);
  const [fileInputKey, setFileInputKey] = useState(0);


  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && editedId) {
      const newForm = {...form};
      if (!form.image) {
        delete newForm.image;
      }

      EditNews({id: editedId, data: newForm}, {
        onSuccess: () => {
          setForm({
            title: "",
            content: "",
            image: null,
            tags: []
          });
        },
      });

    } else {
      CreateNews(form, {
        onSuccess: () => {
          setForm({
            title: "",
            content: "",
            image: null,
            tags: []
          });
        },
      });
    }

    setFileInputKey(prev => prev + 1);
  };


  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;

    setForm(prevState => ({...prevState, [name]: value}));
  };

  const handleTagChange = (index: number, value: string) => {
    setForm((prev) => {
      const newTags = [...(prev.tags || [])];
      newTags[index] = value;
      return {...prev, tags: newTags};
    });
  };

  const addTag = () => {
    setForm((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), ""],
    }));
  };

  const removeTag = (index: number) => {
    setForm((prev) => {
      const newTags = (prev.tags || []).filter((_, i) => i !== index);
      return {...prev, tags: newTags};
    });
  };

  const fileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, files} = e.target;
    if (files && files[0]) {
      setForm(prevState => ({...prevState, [name]: files[0]}));
    } else {
      setForm(prevState => ({...prevState, [name]: null}));
    }
  };


  return (
    <form
      onSubmit={onSubmit}
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
          type="text"
          value={form.title}
          name="title"
          onChange={inputChangeHandler}
          className="w-full border rounded-lg p-2"
          placeholder="Заголовок новости"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">
          Контент
        </label>

        <Input
          type="text"
          value={form.content}
          name="content"
          onChange={inputChangeHandler}
          className="w-full border rounded-lg p-3"
          placeholder="О чем эта новость? Опишите подробности..."
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium leading-none">
          Тэги
        </label>

        <div className={`${form.tags.length > 2 && 'overflow-y-scroll h-[104px]'} space-y-2`}>
          {form.tags?.map((tag, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
            >
              <Input
                type="text"
                value={tag}
                onChange={(e) => handleTagChange(i, e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="Тэги для новости"
                required
              />
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-background"
                title="Remove tag"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addTag}
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
