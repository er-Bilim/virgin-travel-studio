import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getReviewColumns } from '../review-colum';
import type { IReview } from '@/types/review';
import type { ColumnDef, CellContext } from '@tanstack/react-table';

vi.mock('@/components/ui/tooltip-custom', () => ({
  TooltipCustom: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const baseReview = {
  _id: 'r1',
  clientName: 'Людмила Андреева',
  comment: 'Отличный тур, всё понравилось',
  rating: 5,
  createdAt: '2026-06-15T12:00:00Z',
  isModerated: 'pending',
  featuredOnHomepage: false,
  tourId: {
    _id: 't1',
    title: 'Уикенд в Стамбуле',
    images: ['photo.png'],
    countryCode: 'TR',
    description: 'Описание тура',
  },
} as unknown as IReview;

const handlers = () => ({
  onView: vi.fn(),
  onDelete: vi.fn(),
  onTogglePublish: vi.fn(),
  onCheckedChange: vi.fn(),
});

const findColumn = (columns: ColumnDef<IReview>[], header: string) =>
  columns.find((c) => c.header === header)!;

const renderCell = (
  column: ColumnDef<IReview>,
  review: IReview,
  value?: unknown,
) => {
  const cell = column.cell as (
    ctx: Partial<CellContext<IReview, unknown>>,
  ) => React.ReactElement;
  return render(
    cell({
      row: { original: review } as never,
      getValue: (() => value) as never,
    }),
  );
};

const renderActions = (columns: ColumnDef<IReview>[], review = baseReview) =>
  renderCell(
    columns.find((c) => c.id === 'Действия')!,
    review,
  );

describe('getReviewColumns', () => {
  it('возвращает колонки в ожидаемом порядке', () => {
    const columns = getReviewColumns(handlers());
    expect(
      columns.map((c) => (typeof c.header === 'string' ? c.header : c.id)),
    ).toEqual([
      'Отзыв тура',
      'Имя клиента',
      'Текст отзыва',
      'Рейтинг',
      'Дата создания',
      'Статус',
      'на главной',
      'Действия',
    ]);
  });

  describe('колонка тура', () => {
    it('показывает кнопку просмотра тура', () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'Отзыв тура'), baseReview);
      expect(
        screen.getByRole('button', { name: 'Просмотр тура' }),
      ).toBeInTheDocument();
    });

    it('открывает диалог с информацией о туре', async () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'Отзыв тура'), baseReview);

      await userEvent.click(
        screen.getByRole('button', { name: 'Просмотр тура' }),
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Уикенд в Стамбуле')).toBeInTheDocument();
      expect(screen.getByText('TR')).toBeInTheDocument();
      expect(screen.getByText('Описание тура')).toBeInTheDocument();
    });

    it('не падает без изображений тура', async () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'Отзыв тура'), {
        ...baseReview,
        tourId: { ...baseReview.tourId, images: [] },
      } as IReview);

      await userEvent.click(
        screen.getByRole('button', { name: 'Просмотр тура' }),
      );
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('имя клиента', () => {
    it('показывает имя', () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'Имя клиента'), baseReview);
      expect(screen.getByText('Людмила Андреева')).toBeInTheDocument();
    });

    it('показывает "Аноним" без имени', () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'Имя клиента'), {
        ...baseReview,
        clientName: '',
      } as IReview);
      expect(screen.getByText('Аноним')).toBeInTheDocument();
    });
  });

  it('показывает текст отзыва', () => {
    const columns = getReviewColumns(handlers());
    renderCell(findColumn(columns, 'Текст отзыва'), baseReview);
    expect(
      screen.getByText('Отличный тур, всё понравилось'),
    ).toBeInTheDocument();
  });

  it('показывает рейтинг', () => {
    const columns = getReviewColumns(handlers());
    renderCell(findColumn(columns, 'Рейтинг'), baseReview);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  describe('дата создания', () => {
    it('форматирует дату', () => {
      const columns = getReviewColumns(handlers());
      renderCell(
        findColumn(columns, 'Дата создания'),
        baseReview,
        '2026-06-15T12:00:00Z',
      );
      expect(screen.getAllByText(/15\.06\.2026/).length).toBeGreaterThan(0);
    });

    it('показывает прочерк без даты', () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'Дата создания'), baseReview, undefined);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('статус модерации', () => {
    it('pending — Ожидает', () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'Статус'), {
        ...baseReview,
        isModerated: 'pending',
      } as IReview);
      expect(screen.getByText('Ожидает')).toBeInTheDocument();
    });

    it('approved — Опубликовано', () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'Статус'), {
        ...baseReview,
        isModerated: 'approved',
      } as IReview);
      expect(screen.getByText('Опубликовано')).toBeInTheDocument();
    });

    it('rejected — Отклонено', () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'Статус'), {
        ...baseReview,
        isModerated: 'rejected',
      } as IReview);
      expect(screen.getByText('Отклонено')).toBeInTheDocument();
    });
  });

  describe('переключатель "на главной"', () => {
    it('заблокирован для отзыва на модерации', () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'на главной'), {
        ...baseReview,
        isModerated: 'pending',
      } as IReview);
      expect(screen.getByRole('switch')).toBeDisabled();
      expect(screen.getByText('опубликуйте')).toBeInTheDocument();
    });

    it('заблокирован для отклонённого отзыва', () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'на главной'), {
        ...baseReview,
        isModerated: 'rejected',
      } as IReview);
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('активен для одобренного отзыва', () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'на главной'), {
        ...baseReview,
        isModerated: 'approved',
      } as IReview);
      expect(screen.getByRole('switch')).not.toBeDisabled();
      expect(screen.queryByText('опубликуйте')).not.toBeInTheDocument();
    });

    it('отражает текущее состояние featuredOnHomepage', () => {
      const columns = getReviewColumns(handlers());
      renderCell(findColumn(columns, 'на главной'), {
        ...baseReview,
        isModerated: 'approved',
        featuredOnHomepage: true,
      } as IReview);
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('вызывает onCheckedChange при переключении', async () => {
      const h = handlers();
      const columns = getReviewColumns(h);
      const review = { ...baseReview, isModerated: 'approved' } as IReview;
      renderCell(findColumn(columns, 'на главной'), review);

      await userEvent.click(screen.getByRole('switch'));
      expect(h.onCheckedChange).toHaveBeenCalledWith(review);
    });
  });

  describe('действия', () => {
    it('показывает базовые действия', () => {
      renderActions(getReviewColumns(handlers()));
      expect(
        screen.getByRole('button', { name: 'Просмотр' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Удалить' }),
      ).toBeInTheDocument();
    });

    it('для одобренного показывает "Снять с публикации"', () => {
      renderActions(getReviewColumns(handlers()), {
        ...baseReview,
        isModerated: 'approved',
      } as IReview);
      expect(
        screen.getByRole('button', { name: 'Снять с публикации' }),
      ).toBeInTheDocument();
    });

    it('для неодобренного показывает "Опубликовать"', () => {
      renderActions(getReviewColumns(handlers()), {
        ...baseReview,
        isModerated: 'pending',
      } as IReview);
      expect(
        screen.getByRole('button', { name: 'Опубликовать' }),
      ).toBeInTheDocument();
    });

    it('вызывает onView', async () => {
      const h = handlers();
      renderActions(getReviewColumns(h));
      await userEvent.click(screen.getByRole('button', { name: 'Просмотр' }));
      expect(h.onView).toHaveBeenCalledWith(baseReview);
    });

    it('вызывает onDelete', async () => {
      const h = handlers();
      renderActions(getReviewColumns(h));
      await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));
      expect(h.onDelete).toHaveBeenCalledWith(baseReview);
    });

    it('вызывает onTogglePublish', async () => {
      const h = handlers();
      renderActions(getReviewColumns(h), {
        ...baseReview,
        isModerated: 'approved',
      } as IReview);
      await userEvent.click(
        screen.getByRole('button', { name: 'Снять с публикации' }),
      );
      expect(h.onTogglePublish).toHaveBeenCalledWith({
        ...baseReview,
        isModerated: 'approved',
      });
    });
  });
});
