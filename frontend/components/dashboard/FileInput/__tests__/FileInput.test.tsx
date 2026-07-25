import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileInput from '../FileInput';
import { imageUrl } from '@/lib/constants';

describe('FileInput', () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:preview-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  const makeFile = (name = 'photo.png') =>
    new File(['content'], name, { type: 'image/png' });

  it('показывает label, если файл не выбран', () => {
    render(
      <FileInput name="image" label="Загрузите фото" onChange={vi.fn()} />,
    );
    expect(screen.getByText('Загрузите фото')).toBeInTheDocument();
  });

  it('показывает превью существующего изображения', () => {
    render(
      <FileInput
        name="image"
        label="Фото"
        onChange={vi.fn()}
        editImage="old.png"
      />,
    );
    const img = screen.getByAltText('Preview') as HTMLImageElement;
    expect(img.src).toContain(imageUrl + 'old.png');
  });

  it('не показывает превью без editImage', () => {
    render(<FileInput name="image" label="Фото" onChange={vi.fn()} />);
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
  });

  it('выбирает файл и показывает его имя и превью', async () => {
    const onChange = vi.fn();
    render(<FileInput name="image" label="Фото" onChange={onChange} />);

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(input, makeFile('beach.png'));

    expect(screen.getByText('beach.png')).toBeInTheDocument();
    expect(screen.getByAltText('Preview')).toHaveAttribute(
      'src',
      'blob:preview-url',
    );
    expect(onChange).toHaveBeenCalled();
  });

  it('создаёт blob-url для превью', async () => {
    render(<FileInput name="image" label="Фото" onChange={vi.fn()} />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(input, makeFile());

    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('очищает выбранный файл по кнопке X', async () => {
    const onChange = vi.fn();
    render(
      <FileInput name="image" label="Загрузите фото" onChange={onChange} />,
    );

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(input, makeFile('beach.png'));
    expect(screen.getByText('beach.png')).toBeInTheDocument();

    const clearIcon = document.querySelector('.lucide-x') as SVGElement;
    await userEvent.click(clearIcon);

    expect(screen.queryByText('beach.png')).not.toBeInTheDocument();
    expect(screen.getByText('Загрузите фото')).toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('возвращает превью к editImage после очистки', async () => {
    render(
      <FileInput
        name="image"
        label="Фото"
        onChange={vi.fn()}
        editImage="old.png"
      />,
    );

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(input, makeFile());
    expect(screen.getByAltText('Preview')).toHaveAttribute(
      'src',
      'blob:preview-url',
    );

    const clearIcon = document.querySelector('.lucide-x') as SVGElement;
    await userEvent.click(clearIcon);

    await waitFor(() =>
      expect(screen.getByAltText('Preview').getAttribute('src')).toContain(
        'old.png',
      ),
    );
  });

  it('открывает выбор файла по клику на кнопку камеры', async () => {
    render(<FileInput name="image" label="Фото" onChange={vi.fn()} />);
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    await userEvent.click(
      screen.getByRole('button', { name: 'activate button' }),
    );
    expect(clickSpy).toHaveBeenCalled();
  });

  it('передаёт событие с files: null при очистке', async () => {
    const onChange = vi.fn();
    render(<FileInput name="image" label="Фото" onChange={onChange} />);

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(input, makeFile());
    onChange.mockClear();

    const clearIcon = document.querySelector('.lucide-x') as SVGElement;
    await userEvent.click(clearIcon);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ files: null }),
      }),
    );
  });
});
