'use client';

import {useEffect, useState} from 'react';
import {useFieldArray, useForm} from 'react-hook-form';
import type {AxiosError} from 'axios';
import {Compass, FileText, Layout, Loader2, Plus} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';
import {apiURL, inputClass} from '@/lib/constants';
import {VideoInput} from './VideoInput';
import {
  ConfirmDialog
} from '@/components/dashboard/ConfirmDialog/ConfirmDialog';
import AdvantageItem from './advantages/advantageItem';
import type { HomepageSettingsMutationData } from '@/types/homepageSettings';
import {
  mutateCreateHomepageSettings,
  mutateHomepageSettings,
  useHomepageSettings,
} from '@/lib/hooks/homepageSettingsHooks';
import type {GlobalError} from '@/types/error';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';

type FormTab = 'hero' | 'sections' | 'innerPages';

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1 w-full">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error && (
      <p className="text-xs font-semibold text-red-500 pt-0.5">{error}</p>
    )}
  </div>
);

export default function HomepageSettingsForm() {
  const [activeTab, setActiveTab] = useState<FormTab>('hero');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingData, setPendingData] =
    useState<HomepageSettingsMutationData | null>(null);

  const { data: currentSettings, isPending: isFetching } =
    useHomepageSettings(true);
  const isNew = !currentSettings;

  const { mutate, isPending: isSaving } = isNew
    ? mutateCreateHomepageSettings()
    : mutateHomepageSettings();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<HomepageSettingsMutationData>({
    defaultValues: currentSettings || {
      advantages: [],
    },
  });

  useEffect(() => {
    if (currentSettings) {
      reset(currentSettings);
    }
  }, [currentSettings, reset]);

  const {
    fields,
    update,
    remove,
    append,
  } = useFieldArray({
    control,
    name: 'advantages',
  });

  const onSubmit = (data: HomepageSettingsMutationData) => {
    setPendingData(data);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (!pendingData) return;

    setGlobalError(null);
    setIsConfirmOpen(false);

    mutate(pendingData, {
      onSuccess: () => {
        toast.success('Данные обновились!', { position: 'top-center'})
        setPendingData(null);
      },
      onError: (err: unknown) => {
        setPendingData(null);
        const axiosError = err as AxiosError<GlobalError>;
        const serverResponse = axiosError.response?.data;

        if (!serverResponse) {
          setGlobalError('Сервер не отвечает. Проверьте интернет-соединение.');
          return;
        }

        if ('details' in serverResponse) {
          Object.keys(serverResponse.details).forEach((path) => {
            setError(path as Parameters<typeof setError>[0], {
              type: 'server',
              message: serverResponse.details[path].message,
            });
          });
          setGlobalError(serverResponse.error);
        } else {
          setGlobalError(serverResponse.error);
        }
      },
    });
  };

  if (isFetching) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2">
        <Spinner className="w-8 h-8 text-[#1E2B6D]" />
        <span className="text-sm text-gray-500 font-medium">
          Загрузка структуры страниц...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start w-full chunk-container">
      <div className="w-full xl:w-72 flex flex-row xl:flex-col gap-1 overflow-x-auto pb-3 xl:pb-0 border-b xl:border-b-0 xl:border-r border-gray-100 whitespace-nowrap shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
            activeTab === 'hero'
              ? 'bg-[#1E2B6D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Layout className="w-4 h-4" /> Главный экран
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
            activeTab === 'sections'
              ? 'bg-[#1E2B6D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Compass className="w-4 h-4" /> Главная: Секции
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('innerPages')}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
            activeTab === 'innerPages'
              ? 'bg-[#1E2B6D] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-4 h-4" /> Внутренние баннеры
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 w-full space-y-6 max-w-4xl"
        autoComplete="off"
      >
        {globalError && (
          <div className="p-4 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-2xl">
            {globalError}
          </div>
        )}

        {activeTab === 'hero' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h3 className="text-lg font-bold text-[#1E2B6D] border-b border-gray-100 pb-2">
              Контент первого экрана
            </h3>

            <VideoInput
              control={control}
              setValue={setValue}
              watch={watch}
              disabled={isSaving}
            />

            <div className="space-y-4">
              <Field
                label="Главный заголовок (H1): *"
                error={errors.hero?.title?.message}
              >
                <Input
                  {...register('hero.title', {
                    required: 'Главный заголовок на видео обязателен',
                  })}
                  className={`${inputClass} ${errors.hero?.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  disabled={isSaving}
                  placeholder="Например: Путешествуйте по миру с комфортом"
                />
              </Field>

              <Field
                label="Подзаголовок / Описание на главном экране:"
                error={errors.hero?.subtitle?.message}
              >
                <textarea
                  {...register('hero.subtitle')}
                  className={`${inputClass} min-h-[100px] py-2.5 resize-y`}
                  disabled={isSaving}
                  placeholder="Например: Эксклюзивные туры и индивидуальные маршруты от экспертов нашего агентства"
                />
              </Field>
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="space-y-4">
              <h3 className="text-md font-bold text-[#1E2B6D] border-b border-gray-100 pb-1">
                Блок популярных туров
              </h3>
              <div className="space-y-4">
                <Field
                  label="Заголовок блока: *"
                  error={errors.mainPopularTours?.title?.message}
                >
                  <Input
                    {...register('mainPopularTours.title', {
                      required: 'Заголовок секции популярных туров обязателен',
                    })}
                    className={`${inputClass} ${errors.mainPopularTours?.title ? 'border-red-500' : ''}`}
                    disabled={isSaving}
                    placeholder="Например: Популярные направления"
                  />
                </Field>
                <Field
                  label="Подзаголовок / Описание блока:"
                  error={errors.mainPopularTours?.subtitle?.message}
                >
                  <textarea
                    {...register('mainPopularTours.subtitle')}
                    className={`${inputClass} min-h-[80px] py-2.5 resize-y`}
                    disabled={isSaving}
                    placeholder="Например: Лучшие предложения, тщательно отобранные нашими экспертами для вашего идеального отдыха"
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-bold text-[#1E2B6D] border-b border-gray-100 pb-1">
                Блок преимуществ
              </h3>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <AdvantageItem
                    key={field.id}    
                    index={index}
                    field={field}
                    fieldError={errors.advantages?.[index]}
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    update={update}
                    remove={remove}
                    imageUrl={`${apiURL}/homepage-settings/image/`}
                    inputClass={inputClass}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => append({ title: '', body: '', image: null })}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Добавить преимущество
              </button>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-md font-bold text-[#1E2B6D] border-b border-gray-100 pb-1">
                Блок свежих новостей
              </h3>
              <div className="space-y-4">
                <Field
                  label="Заголовок блока: *"
                  error={errors.mainLatestNews?.title?.message}
                >
                  <Input
                    {...register('mainLatestNews.title', {
                      required: 'Заголовок секции новостей обязателен',
                    })}
                    className={`${inputClass} ${errors.mainLatestNews?.title ? 'border-red-500' : ''}`}
                    disabled={isSaving}
                    placeholder="Например: Блог и новости компании"
                  />
                </Field>
                <Field
                  label="Подзаголовок / Описание блока:"
                  error={errors.mainLatestNews?.subtitle?.message}
                >
                  <textarea
                    {...register('mainLatestNews.subtitle')}
                    className={`${inputClass} min-h-[80px] py-2.5 resize-y`}
                    disabled={isSaving}
                    placeholder="Например: Узнавайте первыми об изменениях в правилах перелетов, новых визовых требованиях и лайфхаках для туристов"
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-md font-bold text-[#1E2B6D] border-b border-gray-100 pb-1">
                Блок отзывов
              </h3>
              <div className="space-y-4">
                <Field
                  label="Заголовок блока: *"
                  error={errors.reviewsPage?.title?.message}
                >
                  <Input
                    {...register('reviewsPage.title', {
                      required: 'Заголовок секции отзывов обязателен',
                    })}
                    className={`${inputClass} ${errors.reviewsPage?.title ? 'border-red-500' : ''}`}
                    disabled={isSaving}
                    placeholder="Например: Отзывы о нашей компании"
                  />
                </Field>
                <Field
                  label="Подзаголовок / Описание блока:"
                  error={errors.reviewsPage?.subtitle?.message}
                >
                  <textarea
                    {...register('reviewsPage.subtitle')}
                    className={`${inputClass} min-h-[80px] py-2.5 resize-y`}
                    disabled={isSaving}
                    placeholder="Например: Реальные впечатления тех, кто уже съездил с нами!"
                  />
                </Field>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'innerPages' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="space-y-4">
              <h3 className="text-md font-bold text-[#1E2B6D] border-b border-gray-100 pb-1">
                Баннер страницы туров
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <Field
                    label="Бейдж: *"
                    error={errors.toursPage?.badge?.message}
                  >
                    <Input
                      {...register('toursPage.badge', {
                        required: 'Малый заголовок страницы туров обязателен',
                      })}
                      className={`${inputClass} ${errors.toursPage?.badge ? 'border-red-500' : ''}`}
                      disabled={isSaving}
                      placeholder="Наш каталог"
                    />
                  </Field>
                </div>
                <div className="md:col-span-3">
                  <Field
                    label="Главный заголовок страницы: *"
                    error={errors.toursPage?.title?.message}
                  >
                    <Input
                      {...register('toursPage.title', {
                        required: 'Главный заголовок страницы туров обязателен',
                      })}
                      className={`${inputClass} ${errors.toursPage?.title ? 'border-red-500' : ''}`}
                      disabled={isSaving}
                      placeholder="Найдите тур своей мечты"
                    />
                  </Field>
                </div>
                <div className="col-span-full">
                  <Field
                    label="Подзаголовок / Описание страницы:"
                    error={errors.toursPage?.subtitle?.message}
                  >
                    <textarea
                      {...register('toursPage.subtitle')}
                      className={`${inputClass} min-h-[80px] py-2.5 resize-y`}
                      disabled={isSaving}
                      placeholder="Более 500 вариантов продуманных до мелочей маршрутов по всему земному шару"
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-md font-bold text-[#1E2B6D] border-b border-gray-100 pb-1">
                Баннер страницы новостей
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <Field
                    label="Бейдж: *"
                    error={errors.newsPage?.badge?.message}
                  >
                    <Input
                      {...register('newsPage.badge', {
                        required:
                          'Малый заголовок страницы новостей обязателен',
                      })}
                      className={`${inputClass} ${errors.newsPage?.badge ? 'border-red-500' : ''}`}
                      disabled={isSaving}
                      placeholder="Новости"
                    />
                  </Field>
                </div>
                <div className="md:col-span-3">
                  <Field
                    label="Главный заголовок страницы: *"
                    error={errors.newsPage?.title?.message}
                  >
                    <Input
                      {...register('newsPage.title', {
                        required:
                          'Главный заголовок страницы новостей обязателен',
                      })}
                      className={`${inputClass} ${errors.newsPage?.title ? 'border-red-500' : ''}`}
                      disabled={isSaving}
                      placeholder="Будьте в курсе событий"
                    />
                  </Field>
                </div>
                <div className="col-span-full">
                  <Field
                    label="Подзаголовок / Описание страницы:"
                    error={errors.newsPage?.subtitle?.message}
                  >
                    <textarea
                      {...register('newsPage.subtitle')}
                      className={`${inputClass} min-h-[80px] py-2.5 resize-y`}
                      disabled={isSaving}
                      placeholder="Полезные статьи, заметки путешественников и актуальные пресс-релизы нашей компании"
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center bg-[#1E2B6D] hover:bg-[#162356] sm:w-auto rounded-xl px-6 ml-auto"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Сохранение
                изменений...
              </span>
            ) : (
              'Сохранить настройки страниц'
            )}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Сохранить изменения контента?"
        description="Обновленные заголовки, описания и медиафайлы сразу же вступят в силу на публичной части сайта."
        loading={isSaving}
        confirmText="Сохранить"
        onCancelAction={() => {
          setIsConfirmOpen(false);
          setPendingData(null);
        }}
        onConfirmAction={handleConfirmSave}
      />
    </div>
  );
}
