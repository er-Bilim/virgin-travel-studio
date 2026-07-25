import { render, screen, fireEvent, within } from '@testing-library/react';
import MultiImageInput from '../MultiImageInput';
import { validateImageFile } from '@/lib/utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type * as UtilsModule from '@/lib/utils';

vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof UtilsModule>();
  return {
    ...actual,
    validateImageFile: vi.fn(),
  };
});

vi.mock('@/lib/constants', () => ({
  imageUrl: 'http://localhost:8000/',
  IMAGE_UPLOAD: {
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
    MAX_FILES: 5,
  },
}));

const createFile = (name = 'photo.jpg', type = 'image/jpeg') =>
  new File(['x'], name, { type });

describe('MultiImageInput', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateImageFile).mockReturnValue({ valid: true });
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('отображает label, если value пустой', () => {
    render(
      <MultiImageInput
        name="images"
        label="Загрузите фото тура"
        onChange={onChange}
        value={[]}
      />,
    );
    expect(screen.getByText('Загрузите фото тура')).toBeInTheDocument();
  });

  it('отображает счётчик выбранных файлов, если value не пустой', () => {
    render(
      <MultiImageInput
        name="images"
        label="Загрузите фото тура"
        onChange={onChange}
        value={[createFile(), createFile('second.jpg')]}
      />,
    );
    expect(screen.getByText('Выбрано: 2 из 5')).toBeInTheDocument();
  });

  it('input содержит multiple, корректный accept и name', () => {
    const { container } = render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[]}
      />,
    );
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    expect(input).toHaveAttribute('name', 'images');
  });

  it('открывает диалог выбора файла при клике на обёртку', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[]}
      />,
    );
    fireEvent.click(screen.getByText('Фото'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('блокирует кнопку камеры, если достигнут maxFiles', () => {
    const { container } = render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[createFile(), createFile('2.jpg')]}
        maxFiles={2}
      />,
    );
    expect(container.querySelector('button[disabled]')).toBeInTheDocument();
  });

  it('добавляет валидный файл через onChange', () => {
    const { container } = render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[]}
      />,
    );
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = createFile();
    fireEvent.change(input, { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledWith([file]);
  });

  it('добавляет невалидный файл в список отклонённых с сообщением об ошибке', () => {
    vi.mocked(validateImageFile).mockReturnValue({
      valid: false,
      error: 'Допустимые форматы: JPEG, PNG, WEBP',
    });
    const { container } = render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[]}
      />,
    );
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [createFile('doc.pdf', 'application/pdf')] },
    });

    expect(screen.getByText(/doc.pdf/)).toBeInTheDocument();
    expect(
      screen.getByText(/Допустимые форматы: JPEG, PNG, WEBP/),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('отклоняет файлы сверх доступных слотов с сообщением о превышении лимита', () => {
    const { container } = render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[createFile('existing.jpg')]}
        maxFiles={2}
      />,
    );
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file1 = createFile('a.jpg');
    const file2 = createFile('b.jpg');
    fireEvent.change(input, { target: { files: [file1, file2] } });

    expect(onChange).toHaveBeenCalledWith([expect.any(File), file1]);
    expect(screen.getByText(/b.jpg/)).toBeInTheDocument();
    expect(
      screen.getByText(/Превышено максимальное количество файлов \(2\)/),
    ).toBeInTheDocument();
  });

  it('убирает отклонённый файл из списка при клике на кнопку удаления', () => {
    vi.mocked(validateImageFile).mockReturnValue({
      valid: false,
      error: 'Файл больше 5 МБ',
    });
    const { container } = render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[]}
      />,
    );
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [createFile('big.jpg')] } });

    const rejectedItem = screen.getByText(/big.jpg/).closest('li')!;
    fireEvent.click(within(rejectedItem).getByRole('button'));

    expect(screen.queryByText(/big.jpg/)).not.toBeInTheDocument();
  });

  it('строит превью с префиксом imageUrl для относительных путей', () => {
    render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={['/uploads/tour1.jpg']}
      />,
    );
    expect(screen.getByAltText('Preview 1')).toHaveAttribute(
      'src',
      'http://localhost:8000//uploads/tour1.jpg',
    );
  });

  it('использует абсолютный URL как есть для превью, начинающихся с http', () => {
    render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={['https://cdn.example.com/tour1.jpg']}
      />,
    );
    expect(screen.getByAltText('Preview 1')).toHaveAttribute(
      'src',
      'https://cdn.example.com/tour1.jpg',
    );
  });

  it('создаёт blob URL для File через URL.createObjectURL', () => {
    const file = createFile('tour1.jpg');
    render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[file]}
      />,
    );

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByAltText('Preview 1')).toHaveAttribute(
      'src',
      'blob:mock-url',
    );
  });

  it('не рендерит превью, если showPreviews=false', () => {
    render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[createFile()]}
        showPreviews={false}
      />,
    );
    expect(screen.queryByAltText('Preview 1')).not.toBeInTheDocument();
  });

  it('удаляет файл при клике на кнопку "Удалить"', () => {
    const file1 = createFile('1.jpg');
    const file2 = createFile('2.jpg');
    render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[file1, file2]}
      />,
    );

    fireEvent.click(screen.getAllByTitle('Удалить')[0]);
    expect(onChange).toHaveBeenCalledWith([file2]);
  });

  it('не показывает кнопку перестановки, если allowReorder=false', () => {
    render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[createFile('1.jpg'), createFile('2.jpg')]}
        allowReorder={false}
      />,
    );
    expect(screen.queryByTitle('Сдвинуть влево')).not.toBeInTheDocument();
  });

  it('переставляет элементы местами при клике на "Сдвинуть влево"', () => {
    const file1 = createFile('1.jpg');
    const file2 = createFile('2.jpg');
    render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[file1, file2]}
        allowReorder={true}
      />,
    );

    fireEvent.click(screen.getByTitle('Сдвинуть влево'));
    expect(onChange).toHaveBeenCalledWith([file2, file1]);
  });

  it('показывает бейдж "Главное" только у первого элемента', () => {
    render(
      <MultiImageInput
        name="images"
        label="Фото"
        onChange={onChange}
        value={[createFile('1.jpg'), createFile('2.jpg')]}
      />,
    );
    expect(screen.getAllByText('Главное')).toHaveLength(1);
  });
});
