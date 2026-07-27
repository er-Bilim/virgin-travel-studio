import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaqForm } from '../FaqForm';
import { useMutateCreateFaq, useMutateEditFaq } from '@/lib/hooks/faq';
import type { Faq } from '@/types/faq';

vi.mock('@/lib/hooks/faq', () => ({
  useMutateCreateFaq: vi.fn(),
  useMutateEditFaq: vi.fn(),
}));

const createMutate = vi.fn();
const editMutate = vi.fn();

const setupMutations = ({ isCreating = false, isEditing = false } = {}) => {
  vi.mocked(useMutateCreateFaq).mockReturnValue({
    mutate: createMutate,
    isPending: isCreating,
  } as never);
  vi.mocked(useMutateEditFaq).mockReturnValue({
    mutate: editMutate,
    isPending: isEditing,
  } as never);
};

const existingFaq = {
  _id: 'faq-1',
  question: 'Включён ли трансфер?',
  answer: 'Да, включён.',
  isPublished: true,
} as Faq;

describe('FaqForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMutations();
  });

  describe('режим создания', () => {
    it('рендерит пустые поля и чекбокс публикации', () => {
      render(<FaqForm onClose={vi.fn()} />);
      expect(screen.getByPlaceholderText(/Включен ли трансфер/)).toHaveValue(
        '',
      );
      expect(
        screen.getByPlaceholderText(/Опишите подробный ответ/),
      ).toHaveValue('');
      expect(
        screen.getByLabelText('Опубликовать сразу на сайте'),
      ).toBeInTheDocument();
    });

    it('кнопка сабмита называется "Добавить вопрос"', () => {
      render(<FaqForm onClose={vi.fn()} />);
      expect(
        screen.getByRole('button', { name: 'Добавить вопрос' }),
      ).toBeInTheDocument();
    });

    it('чекбокс публикации включён по умолчанию', () => {
      render(<FaqForm onClose={vi.fn()} />);
      expect(
        screen.getByLabelText('Опубликовать сразу на сайте'),
      ).toBeChecked();
    });

    it('вызывает createFaq с данными формы', async () => {
      render(<FaqForm onClose={vi.fn()} />);

      await userEvent.type(
        screen.getByPlaceholderText(/Включен ли трансфер/),
        'Вопрос?',
      );
      await userEvent.type(
        screen.getByPlaceholderText(/Опишите подробный ответ/),
        'Ответ',
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Добавить вопрос' }),
      );

      await waitFor(() => {
        expect(createMutate).toHaveBeenCalledWith(
          { question: 'Вопрос?', answer: 'Ответ', isPublished: true },
          expect.anything(),
        );
      });
      expect(editMutate).not.toHaveBeenCalled();
    });
  });

  describe('режим редактирования', () => {
    it('подставляет значения существующего FAQ', () => {
      render(<FaqForm faq={existingFaq} onClose={vi.fn()} />);
      expect(
        screen.getByDisplayValue('Включён ли трансфер?'),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('Да, включён.')).toBeInTheDocument();
    });

    it('не показывает чекбокс публикации', () => {
      render(<FaqForm faq={existingFaq} onClose={vi.fn()} />);
      expect(
        screen.queryByLabelText('Опубликовать сразу на сайте'),
      ).not.toBeInTheDocument();
    });

    it('кнопка сабмита называется "Сохранить изменения"', () => {
      render(<FaqForm faq={existingFaq} onClose={vi.fn()} />);
      expect(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      ).toBeInTheDocument();
    });

    it('вызывает editFaq с id и данными', async () => {
      render(<FaqForm faq={existingFaq} onClose={vi.fn()} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      );

      await waitFor(() => {
        expect(editMutate).toHaveBeenCalledWith(
          {
            id: 'faq-1',
            data: {
              question: 'Включён ли трансфер?',
              answer: 'Да, включён.',
              isPublished: true,
            },
          },
          expect.anything(),
        );
      });
      expect(createMutate).not.toHaveBeenCalled();
    });
  });

  describe('валидация', () => {
    it('показывает ошибки при пустых обязательных полях', async () => {
      render(<FaqForm onClose={vi.fn()} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'Добавить вопрос' }),
      );

      expect(
        await screen.findByText('Поле вопроса обязательно к заполнению'),
      ).toBeInTheDocument();
      expect(
        await screen.findByText('Поле ответа обязательно к заполнению'),
      ).toBeInTheDocument();
      expect(createMutate).not.toHaveBeenCalled();
    });

    it('не даёт отправить форму только с вопросом', async () => {
      render(<FaqForm onClose={vi.fn()} />);

      await userEvent.type(
        screen.getByPlaceholderText(/Включен ли трансфер/),
        'Вопрос?',
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Добавить вопрос' }),
      );

      expect(
        await screen.findByText('Поле ответа обязательно к заполнению'),
      ).toBeInTheDocument();
      expect(createMutate).not.toHaveBeenCalled();
    });
  });

  describe('состояние сохранения', () => {
    it('блокирует поля и кнопки при isPending', () => {
      setupMutations({ isCreating: true });
      render(<FaqForm onClose={vi.fn()} />);

      expect(screen.getByPlaceholderText(/Включен ли трансфер/)).toBeDisabled();
      expect(
        screen.getByPlaceholderText(/Опишите подробный ответ/),
      ).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Отмена' })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Сохранение/ })).toBeDisabled();
    });

    it('показывает индикатор сохранения', () => {
      setupMutations({ isEditing: true });
      render(<FaqForm faq={existingFaq} onClose={vi.fn()} />);
      expect(screen.getByText('Сохранение...')).toBeInTheDocument();
    });
  });

  describe('обработка ошибок сервера', () => {
    it('показывает сообщение при отсутствии ответа сервера', async () => {
      createMutate.mockImplementation((_data, options) => {
        options.onError({ response: undefined });
      });

      render(<FaqForm onClose={vi.fn()} />);
      await userEvent.type(
        screen.getByPlaceholderText(/Включен ли трансфер/),
        'Вопрос?',
      );
      await userEvent.type(
        screen.getByPlaceholderText(/Опишите подробный ответ/),
        'Ответ',
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Добавить вопрос' }),
      );

      expect(
        await screen.findByText(
          'Сервер не отвечает. Проверьте подключение к сети.',
        ),
      ).toBeInTheDocument();
    });

    it('показывает общую ошибку сервера', async () => {
      createMutate.mockImplementation((_data, options) => {
        options.onError({
          response: { data: { error: 'Такой вопрос уже есть' } },
        });
      });

      render(<FaqForm onClose={vi.fn()} />);
      await userEvent.type(
        screen.getByPlaceholderText(/Включен ли трансфер/),
        'Вопрос?',
      );
      await userEvent.type(
        screen.getByPlaceholderText(/Опишите подробный ответ/),
        'Ответ',
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Добавить вопрос' }),
      );

      expect(
        await screen.findByText('Такой вопрос уже есть'),
      ).toBeInTheDocument();
    });

    it('подставляет ошибки полей из details', async () => {
      createMutate.mockImplementation((_data, options) => {
        options.onError({
          response: {
            data: {
              error: 'Ошибка валидации',
              details: { question: { message: 'Слишком короткий вопрос' } },
            },
          },
        });
      });

      render(<FaqForm onClose={vi.fn()} />);
      await userEvent.type(
        screen.getByPlaceholderText(/Включен ли трансфер/),
        'Вопрос?',
      );
      await userEvent.type(
        screen.getByPlaceholderText(/Опишите подробный ответ/),
        'Ответ',
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Добавить вопрос' }),
      );

      expect(
        await screen.findByText('Слишком короткий вопрос'),
      ).toBeInTheDocument();
      expect(screen.getByText('Ошибка валидации')).toBeInTheDocument();
    });
  });

  describe('закрытие формы', () => {
    it('вызывает onClose по кнопке "Отмена"', async () => {
      const onClose = vi.fn();
      render(<FaqForm onClose={onClose} />);
      await userEvent.click(screen.getByRole('button', { name: 'Отмена' }));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('вызывает onClose после успешного сохранения', async () => {
      const onClose = vi.fn();
      createMutate.mockImplementation((_data, options) => options.onSuccess());

      render(<FaqForm onClose={onClose} />);
      await userEvent.type(
        screen.getByPlaceholderText(/Включен ли трансфер/),
        'Вопрос?',
      );
      await userEvent.type(
        screen.getByPlaceholderText(/Опишите подробный ответ/),
        'Ответ',
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Добавить вопрос' }),
      );

      await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    });
  });
});
