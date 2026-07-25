import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {useForm} from 'react-hook-form';
import {VideoInput} from '../VideoInput';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {HomepageSettingsMutationData} from '@/types/homepageSettings';

vi.mock('@/lib/constants', () => ({
  imageUrl: 'http://localhost:8000/',
}));

vi.mock('@/components/dashboard/ConfirmDialog/ConfirmDialog', () => ({
  ConfirmDialog: ({
    open,
    title,
    onConfirmAction,
    onCancelAction,
  }: {
    open: boolean;
    title: string;
    onConfirmAction: () => void;
    onCancelAction: () => void;
  }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <p>{title}</p>
        <button onClick={onConfirmAction}>confirm</button>
        <button onClick={onCancelAction}>cancel</button>
      </div>
    ) : null,
}));

const createVideoFile = (
  name = 'video.mp4',
  type = 'video/mp4',
  size = 1024,
) => {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

function Wrapper({
  defaultValues,
  disabled,
}: {
  defaultValues?: Partial<HomepageSettingsMutationData>;
  disabled?: boolean;
}) {
  const { control, setValue, watch } = useForm<HomepageSettingsMutationData>({
    defaultValues: { advantages: [], ...defaultValues },
  });
  const video = watch('video');
  const deleteVideo = watch('deleteVideo');

  return (
    <div>
      <VideoInput
        control={control}
        setValue={setValue}
        watch={watch}
        disabled={disabled}
      />
      <div data-testid="debug-video">
        {video instanceof File ? video.name : 'none'}
      </div>
      <div data-testid="debug-delete-video">{String(deleteVideo)}</div>
    </div>
  );
}

const getDropzone = (container: HTMLElement) =>
  container.querySelector('div[class*="border-dashed"]') as HTMLElement;

describe('VideoInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('показывает dropzone, если существующего видео нет', () => {
    render(<Wrapper />);
    expect(screen.getByText(/Перетащите файл сюда или/)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('отображает существующее видео по hero.videoUrl', () => {
    render(<Wrapper defaultValues={{ hero: { videoUrl: 'hero.mp4' } }} />);
    const video = document.querySelector('video');
    expect(video).toHaveAttribute(
      'src',
      'http://localhost:8000/api/homepage-settings/video/hero.mp4',
    );
  });

  it('не показывает кнопку удаления и не даёт выбрать файл, если disabled=true', () => {
    const {} = render(
      <Wrapper defaultValues={{ hero: { videoUrl: 'hero.mp4' } }} disabled />,
    );
    expect(screen.queryByTitle('Удалить видеоролик')).not.toBeInTheDocument();
  });

  it('показывает ошибку при выборе файла не видео-типа', () => {
    const { container } = render(<Wrapper />);
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [createVideoFile('photo.jpg', 'image/jpeg')] },
    });

    expect(
      screen.getByText('Допустимы только видеофайлы (mp4, webm).'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('debug-video')).toHaveTextContent('none');
  });

  it('показывает ошибку, если файл больше 15 МБ', () => {
    const { container } = render(<Wrapper />);
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: {
        files: [createVideoFile('big.mp4', 'video/mp4', 16 * 1024 * 1024)],
      },
    });

    expect(
      screen.getByText('Файл слишком тяжелый. Максимальный размер — 15 МБ.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('debug-video')).toHaveTextContent('none');
  });

  it('принимает валидный файл: показывает превью, бейдж и обновляет form-значения', async () => {
    const { container } = render(<Wrapper />);
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = createVideoFile('promo.mp4');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByTestId('debug-video')).toHaveTextContent('promo.mp4'),
    );
    expect(document.querySelector('video')).toHaveAttribute(
      'src',
      'blob:mock-url',
    );
    expect(
      screen.getByText('Новый файл готов к сохранению'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('debug-delete-video')).toHaveTextContent('false');
  });

  it('принимает файл через drag-and-drop', async () => {
    const { container } = render(<Wrapper />);
    const dropzone = getDropzone(container);
    const file = createVideoFile('dropped.mp4');

    fireEvent.dragEnter(dropzone);
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByTestId('debug-video')).toHaveTextContent(
        'dropped.mp4',
      ),
    );
  });

  it('открывает диалог подтверждения при клике на кнопку удаления', () => {
    render(<Wrapper defaultValues={{ hero: { videoUrl: 'hero.mp4' } }} />);
    fireEvent.click(screen.getByTitle('Удалить видеоролик'));

    const dialog = screen.getByTestId('confirm-dialog');
    expect(dialog).toHaveTextContent(
      'Вы уверены, что хотите удалить видеоролик?',
    );
  });

  it('закрывает диалог без изменений при отмене', () => {
    render(<Wrapper defaultValues={{ hero: { videoUrl: 'hero.mp4' } }} />);
    fireEvent.click(screen.getByTitle('Удалить видеоролик'));
    fireEvent.click(screen.getByText('cancel'));

    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    expect(document.querySelector('video')).toHaveAttribute(
      'src',
      'http://localhost:8000/api/homepage-settings/video/hero.mp4',
    );
  });

  it('при подтверждении удаляет видео: очищает поле video и ставит deleteVideo=true', async () => {
    render(<Wrapper defaultValues={{ hero: { videoUrl: 'hero.mp4' } }} />);
    fireEvent.click(screen.getByTitle('Удалить видеоролик'));
    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() =>
      expect(screen.getByTestId('debug-delete-video')).toHaveTextContent(
        'true',
      ),
    );
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    expect(document.querySelector('video')).not.toBeInTheDocument();
    expect(screen.getByText(/Перетащите файл сюда или/)).toBeInTheDocument();
  });
});
