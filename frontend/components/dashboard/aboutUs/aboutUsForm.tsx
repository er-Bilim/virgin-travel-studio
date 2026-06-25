import { useForm, useFieldArray } from "react-hook-form";
import type { AboutUsFieldsMutation, ContentBlock } from "@/types/aboutUs";
import { Input } from '@/components/ui/input';
import { inputClass } from '@/lib/constants';
import { useEditAboutUsData, useCreateAboutUsData } from "@/lib/hooks/aboutUs";
import { Loader, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";


const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error && (
      <p className="text-xs font-semibold text-red-500 pt-0.5">{error}</p>
    )}
  </div>
);


interface Props {
  initialValues?: AboutUsFieldsMutation;
  isLoading?: boolean;
  errorLoad?: Error | null;
}

export default function AboutUsForm({ initialValues, isLoading, errorLoad }: Props) {
  const ensureBlock = (content: ContentBlock[] = [], count: number) => {
    const base = [...content];
    while (base.length < count) {
      base.push({ title: '', body: '' });
    }
    return base.slice(0, count);
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AboutUsFieldsMutation>({
    values: {
      ...initialValues,
      pageTitle: initialValues?.pageTitle ?? '',
      description: initialValues?.description ?? '',
      contentBlocks: ensureBlock(initialValues?.contentBlocks, 3),
      ideaBlocks: ensureBlock(initialValues?.ideaBlocks, 2),
      steps: initialValues?.steps ?? [],
    },
  });
  const { fields } = useFieldArray({
    control,
    name: 'contentBlocks',
  });

  const { fields: ideaFields } = useFieldArray({
    control,
    name: 'ideaBlocks',
  });

  const {
    fields: stepsFields,
    remove,
    append,
  } = useFieldArray({
    control,
    name: 'steps' as const as never,
  });

  const { mutate, isPending, error } = initialValues
    ? useEditAboutUsData()
    : useCreateAboutUsData();

  const onSubmit = (data: AboutUsFieldsMutation) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Обновили данные', { position: 'top-center' });
      },
      onError: (mutationError) => {
        toast.error(
          `Произошла ошибка ${mutationError.message || 'Неизвестная ошибка'}`,
          {
            position: 'top-center',
          },
        );
      },
    });
  };

  if (isLoading) {
    return (
    <div className="rounded-2xl border bg-white">
      <div className="p-8 text-center text-gray-500">
        <Loader className="animate-spin w-5 h-5 mx-auto" />
      </div>
    </div>
    )
  }

   if (errorLoad) {
     return <div>{errorLoad.message}</div>;
   }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        autoComplete="off"
      >
        <div className="space-y-4 border p-3 rounded-2xl">
          <h2 className="font-bold text-[#1E2B6D]">
            Блок главного загололвка сверху:
          </h2>
          <Field label="Заголовок:" error={errors.pageTitle?.message}>
            <Input
              {...register('pageTitle', { required: 'Введите Заголовок' })}
              className={`${inputClass} ${errors.pageTitle ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              disabled={isPending}
              placeholder="Путешествия которые начинаются с доверия"
            />
          </Field>

          <Field label="Описание:" error={errors.description?.message}>
            <textarea
              {...register('description', { required: 'Введите описание' })}
              className={`${inputClass} ${errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''} min-h-[100px] py-2.5 resize-y`}
              disabled={isPending}
              placeholder="Virgin Travel помогает выбрать тур без лишнего стресса: посмотреть детали поездки, сравнить..."
            />
          </Field>
        </div>

        <div className="space-y-4 border p-3 rounded-2xl ">
          <p className="font-bold text-[#1E2B6D]">Преимущества:</p>
          <div className="flex flex-wrap gap-4">
            {fields.map((_: ContentBlock, index) => {
              const fieldError = errors.contentBlocks?.[index];
              return (
                <div
                  key={index}
                  className="p-3 border rounded-2xl bg-gray-100 items-start"
                >
                  <div>
                    <label>Заголовок:</label>
                    <Input
                      {...register(`contentBlocks.${index}.title` as const, {
                        required: 'Введите заголовок',
                      })}
                      className={`${inputClass} ${errors.contentBlocks ? (errors.contentBlocks[index] ? 'border-red-500 focus-visible:ring-red-500' : '') : ''}`}
                    />
                    {fieldError?.title && (
                      <span style={{ color: 'red' }}>
                        {fieldError.title.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label>Текст:</label>
                    <textarea
                      {...register(`contentBlocks.${index}.body` as const)}
                      className={`${inputClass} min-h-[100px] py-2.5 resize-y`}
                    />
                    {fieldError?.body && (
                      <span style={{ color: 'red' }}>
                        {fieldError.body.message}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 border p-3 rounded-2xl">
          <p className="font-bold text-[#1E2B6D]">Блок миссии:</p>
          <Field label="Заголовок миссии:" error={errors.missionTitle?.message}>
            <Input
              {...register('missionTitle', { required: 'Введите текст' })}
              className={`${inputClass} ${errors.missionTitle ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              disabled={isPending}
              placeholder="Мы делаем выбор тура понятнее"
            />
          </Field>

          <Field label="Текст миссии:" error={errors.missionBody?.message}>
            <textarea
              {...register('missionBody', { required: 'Введите текст' })}
              className={`${inputClass} ${errors.missionBody ? 'border-red-500 focus-visible:ring-red-500' : ''} min-h-[100px] py-2.5 resize-y`}
              disabled={isPending}
              placeholder="Virgin Travel Studio — это пространство, где клиент может спокойно изучить туры..."
            />
          </Field>
        </div>

        <div className="space-y-4 border p-3 rounded-2xl">
          <p className="font-bold text-[#1E2B6D]">Блок идеи:</p>
          <Field label="Суфикс:" error={errors.ideaLabel?.message}>
            <Input
              {...register('ideaLabel', { required: 'Введите текст' })}
              className={`${inputClass} ${errors.ideaLabel ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              disabled={isPending}
              placeholder="Наша идея"
            />
          </Field>

          <Field label="Заголовок:" error={errors.ideaTitle?.message}>
            <Input
              {...register('ideaTitle', { required: 'Введите текст' })}
              className={`${inputClass} ${errors.ideaTitle ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              disabled={isPending}
              placeholder="Не просто показать тур, а помочь почувствовать будущую поездку..."
            />
          </Field>

          <Field label="Текст:" error={errors.ideaDescription?.message}>
            <textarea
              {...register('ideaDescription', { required: 'Введите текст' })}
              className={`${inputClass} ${errors.ideaDescription ? 'border-red-500 focus-visible:ring-red-500' : ''} min-h-[100px] py-2.5 resize-y`}
              disabled={isPending}
              placeholder="Мы хотим, чтобы каждый клиент видел не только цену, но и полную картину путешествия:..."
            />
          </Field>

          <div className="flex flex-wrap gap-4">
            {ideaFields.map((_: ContentBlock, index: number) => {
              const fieldError = errors.ideaBlocks?.[index];
              return (
                <div
                  key={index}
                  className="p-3 border rounded-2xl bg-gray-100 items-start"
                >
                  <div>
                    <label>Название:</label>
                    <Input
                      {...register(`ideaBlocks.${index}.title` as const, {
                        required: 'Введите название',
                      })}
                      className={`${inputClass} ${errors.ideaBlocks ? (errors.ideaBlocks[index] ? 'border-red-500 focus-visible:ring-red-500' : '') : ''}`}
                    />
                    {fieldError?.title && (
                      <span style={{ color: 'red' }}>
                        {fieldError.title.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label>Текст:</label>
                    <textarea
                      {...register(`ideaBlocks.${index}.body` as const, {
                        required: 'Введите текст',
                      })}
                      className={`${inputClass} ${errors.ideaBlocks ? (errors.ideaBlocks[index] ? 'border-red-500 focus-visible:ring-red-500' : '') : ''} min-h-[100px] py-2.5 resize-y`}
                    />
                    {fieldError?.body && (
                      <span style={{ color: 'red' }}>
                        {fieldError.body.message}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 border p-3 rounded-2xl">
          <p className="font-bold text-[#1E2B6D]">Нижний блок:</p>
          <Field label="Заголовок:" error={errors.heroCardTitle?.message}>
            <Input
              {...register('heroCardTitle', { required: 'Введите текст' })}
              className={`${inputClass} ${errors.heroCardTitle ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              disabled={isPending}
              placeholder="Мы рядом на каждом этапе путешествия"
            />
          </Field>

          <Field label="Текст:" error={errors.heroCardBody?.message}>
            <textarea
              {...register('heroCardBody', { required: 'Введите текст' })}
              className={`${inputClass} ${errors.heroCardBody ? 'border-red-500 focus-visible:ring-red-500' : ''} min-h-[100px] py-2.5 resize-y`}
              placeholder="От первого просмотра тура до возвращения домой — мы стремимся сделать путь клиента спокойным, понятным и вдохновляющим..."
            />
          </Field>

          <div className="space-y-2">
            {stepsFields.map((field, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Input
                    {...register(`steps.${index}` as const, {
                      required: 'Поле не может быть пустым',
                    })}
                    className={`${inputClass} ${errors.steps?.[index] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    disabled={isPending}
                  />
                  {stepsFields.length > 1 && (
                    <button
                      aria-label="Удалить"
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {errors.steps?.[index] && (
                  <p className="text-xs font-semibold text-red-500 pt-0.5">
                    {errors.steps[index]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => append('')}
            className="inline-flex items-center justify-center rounded-xl text-sm font-semibold border border-gray-200 text-[#1E2B6D] bg-transparent hover:bg-gray-50 h-10 px-4 w-full mt-2 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" /> Добавить шаг
          </button>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center rounded-2xl bg-[#1E2B6D] px-4 py-3 font-semibold text-white transition hover:bg-[#162356] disabled:opacity-50 h-12"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Сохранение...
            </span>
          ) : (
            'Сохранить'
          )}
        </button>
      </form>
    </>
  );
}