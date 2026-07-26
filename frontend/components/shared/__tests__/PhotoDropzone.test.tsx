import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhotoDropzone from '../PhotoDropzone';
import useObjectUrl from '@/lib/hooks/useObjectUrl';
import { compressImage, validateImageFile } from '@/lib/utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type * as UtilsModule from '@/lib/utils';

vi.mock('@/lib/hooks/useObjectUrl');
vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof UtilsModule>();
  return {
    ...actual,
    compressImage: vi.fn(),
    validateImageFile: vi.fn(),
  };
});
vi.mock('@/lib/constants', () => ({
  IMAGE_UPLOAD: {
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
    MAX_FILES: 5,
    COMPRESSION: { MAX_SIZE_MB: 1, MAX_WIDTH_OR_HEIGHT: 1920 },
  },
}));

const createFile = (name = 'photo.jpg', type = 'image/jpeg', size = 1024) =>
  new File(['x'.repeat(size)], name, { type });

describe('PhotoDropzone', () => {
  const onFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useObjectUrl).mockReturnValue(null);
    vi.mocked(validateImageFile).mockReturnValue({ valid: true });
    vi.mocked(compressImage).mockImplementation(async (file) => file);
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('отображает инструкцию по умолчанию, если файл не выбран', () => {
    render(<PhotoDropzone id="photo" name="photo" onFile={onFile} />);
    expect(screen.getByText(/JPEG, PNG, WEBP/)).toBeInTheDocument();
  });

  it('прокидывает кастомный label в aria-label скрытого input', () => {
    render(
      <PhotoDropzone
        id="photo"
        name="photo"
        onFile={onFile}
        label="Загрузите обложку"
      />,
    );
    expect(screen.getByLabelText('Загрузите обложку')).toBeInTheDocument();
  });

  it('отображает превью и имя файла, если value передан и хук вернул preview', () => {
    const file = createFile('cover.jpg');
    vi.mocked(useObjectUrl).mockReturnValue('blob:existing-url');
    render(
      <PhotoDropzone id="photo" name="photo" value={file} onFile={onFile} />,
    );

    expect(screen.getByAltText('Превью')).toHaveAttribute(
      'src',
      'blob:existing-url',
    );
    expect(screen.getByText('cover.jpg')).toBeInTheDocument();
  });

  it('показывает ошибку валидации и не вызывает onFile при невалидном файле', async () => {
    vi.mocked(validateImageFile).mockReturnValue({
      valid: false,
      error: 'Допустимые форматы: JPEG, PNG, WEBP',
    });
    render(<PhotoDropzone id="photo" name="photo" onFile={onFile} />);

    const input = screen.getByLabelText(
      'Перетащите фото или выберите файл',
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [createFile('doc.pdf', 'application/pdf')] },
    });

    expect(
      await screen.findByText('Допустимые форматы: JPEG, PNG, WEBP'),
    ).toBeInTheDocument();
    expect(onFile).not.toHaveBeenCalled();
    expect(compressImage).not.toHaveBeenCalled();
  });

  it('сжимает валидный файл и вызывает onFile с результатом', async () => {
    const original = createFile('photo.jpg');
    const compressed = createFile('photo.jpg', 'image/jpeg', 100);
    vi.mocked(compressImage).mockResolvedValue(compressed);

    render(<PhotoDropzone id="photo" name="photo" onFile={onFile} />);
    const input = screen.getByLabelText(
      'Перетащите фото или выберите файл',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [original] } });

    await waitFor(() => expect(onFile).toHaveBeenCalledWith(compressed));
    expect(compressImage).toHaveBeenCalledWith(original);
  });

  it('показывает "Обработка фото..." пока идёт сжатие', async () => {
    let resolveCompress!: (file: File) => void;
    vi.mocked(compressImage).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCompress = resolve;
        }),
    );

    render(<PhotoDropzone id="photo" name="photo" onFile={onFile} />);
    const input = screen.getByLabelText(
      'Перетащите фото или выберите файл',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [createFile()] } });

    expect(await screen.findByText('Обработка фото...')).toBeInTheDocument();

    resolveCompress(createFile());
    await waitFor(() => expect(onFile).toHaveBeenCalled());
  });

  it('показывает ошибку, если compressImage выбросил исключение', async () => {
    vi.mocked(compressImage).mockRejectedValue(
      new Error('Не удалось обработать файл — возможно, он повреждён'),
    );
    render(<PhotoDropzone id="photo" name="photo" onFile={onFile} />);
    const input = screen.getByLabelText(
      'Перетащите фото или выберите файл',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [createFile()] } });

    expect(
      await screen.findByText(
        'Не удалось обработать файл — возможно, он повреждён',
      ),
    ).toBeInTheDocument();
    expect(onFile).not.toHaveBeenCalled();
  });

  it('вызывает onFile(null) при клике на кнопку удаления превью', () => {
    vi.mocked(useObjectUrl).mockReturnValue('blob:existing-url');
    render(
      <PhotoDropzone
        id="photo"
        name="photo"
        value={createFile()}
        onFile={onFile}
      />,
    );

    fireEvent.click(screen.getByTitle('Удалить фото'));
    expect(onFile).toHaveBeenCalledWith(null);
  });

  it('показывает ошибку, переданную через props', () => {
    render(
      <PhotoDropzone
        id="photo"
        name="photo"
        onFile={onFile}
        error="Серверная ошибка"
      />,
    );
    expect(screen.getByText('Серверная ошибка')).toBeInTheDocument();
  });

  it('при drop файла не-изображения показывает ошибку и не вызывает onFile', () => {
    render(<PhotoDropzone id="photo" name="photo" onFile={onFile} />);
    fireEvent.drop(screen.getByRole('button'), {
      dataTransfer: { files: [createFile('doc.pdf', 'application/pdf')] },
    });

    expect(screen.getByText('Перетащите файл изображения')).toBeInTheDocument();
    expect(onFile).not.toHaveBeenCalled();
  });

  it('при drop файла изображения запускает обработку и вызывает onFile', async () => {
    render(<PhotoDropzone id="photo" name="photo" onFile={onFile} />);
    fireEvent.drop(screen.getByRole('button'), {
      dataTransfer: { files: [createFile()] },
    });

    await waitFor(() => expect(onFile).toHaveBeenCalled());
  });

  it('подсвечивает dropzone при dragEnter', () => {
    render(<PhotoDropzone id="photo" name="photo" onFile={onFile} />);
    const dropzone = screen.getByRole('button');
    fireEvent.dragEnter(dropzone);
    expect(dropzone.className).toContain('border-ring');
  });
});
