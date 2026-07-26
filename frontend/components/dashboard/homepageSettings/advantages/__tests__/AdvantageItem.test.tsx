import {fireEvent, render, screen} from '@testing-library/react';
import AdvantageItem from '../advantageItem';
import {beforeEach, describe, expect, it, vi} from 'vitest';

global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-image-url');
global.URL.revokeObjectURL = vi.fn();

describe('AdvantageItem Component', () => {
  const defaultProps = {
    index: 0,
    field: {
      title: 'Надежность',
      body: 'Мы работаем более 10 лет на рынке.',
      image: null,
    },
    fieldError: undefined,
    register: vi.fn(),
    setValue: vi.fn(),
    watch: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    imageUrl: 'http://localhost:8000/uploads/',
    inputClass: 'custom-input-class',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерит поля ввода заголовка и текста', () => {
    render(<AdvantageItem {...defaultProps} />);

    expect(screen.getByText('Заголовок:')).toBeInTheDocument();
    expect(screen.getByText('Текст:')).toBeInTheDocument();
  });

  it('отображает ошибку валидации заголовка, если она передана в fieldError', () => {
    const propsWithError = {
      ...defaultProps,
      fieldError: {
        title: { type: 'required', message: 'Введите заголовок' },
      } as any,
    };

    render(<AdvantageItem {...propsWithError} />);

    expect(screen.getByText('Введите заголовок')).toBeInTheDocument();
  });

  it('вызывает функцию remove с верным индексом при клике на "Убрать преимущество"', () => {
    render(<AdvantageItem {...defaultProps} />);

    const removeButton = screen.getByRole('button', {
      name: /Убрать преимущество/i,
    });
    fireEvent.click(removeButton);

    expect(defaultProps.remove).toHaveBeenCalledWith(0);
  });

  it('отображает кнопку "Посмотреть", если к преимуществу прикреплен файл изображения', () => {
    const mockFile = new File([''], 'advantage_photo.jpg', { type: 'image/jpeg' });

    const propsWithImage = {
      ...defaultProps,
      field: {
        ...defaultProps.field,
        image: mockFile, // Используем File вместо простой строки
      },
    };

    render(<AdvantageItem {...propsWithImage} />);

    expect(screen.getByText('Посмотреть')).toBeInTheDocument();
  });

  it('вызывает функцию update с image: null при клике на удаление картинки', () => {
    const mockFile = new File([''], 'advantage_photo.jpg', { type: 'image/jpeg' });

    const propsWithImage = {
      ...defaultProps,
      field: {
        ...defaultProps.field,
        image: mockFile,
      },
    };

    defaultProps.watch.mockReturnValue(propsWithImage.field);

    render(<AdvantageItem {...propsWithImage} />);

    const buttons = screen.getAllByRole('button');
    const deleteImageButton = buttons[1];
    fireEvent.click(deleteImageButton);

    expect(defaultProps.update).toHaveBeenCalledWith(0, {
      ...propsWithImage.field,
      image: null,
    });
  });

  it('вызывает setValue при выборе нового файла через input', () => {
    render(<AdvantageItem {...defaultProps} />);

    const file = new File(['dummy content'], 'new-photo.png', { type: 'image/png' });

    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(defaultProps.setValue).toHaveBeenCalledWith(
        'advantages.0.image',
        file,
        { shouldDirty: true, shouldValidate: true }
      );
    }
  });
});