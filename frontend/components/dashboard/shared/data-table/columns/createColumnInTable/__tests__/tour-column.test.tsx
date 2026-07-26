import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getToursColumns } from '../tour-colum';
import type { TourType } from '@/types/tour';
import type { ColumnDef, CellContext } from '@tanstack/react-table';

vi.mock('@/components/ui/tooltip-custom', () => ({
  TooltipCustom: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock(
  '@/components/dashboard/shared/data-table/columnComponent/TourImageCell',
  () => ({
    TourImageCell: ({ tour }: { tour: TourType }) => (
      <div data-testid="tour-image">{tour.title}</div>
    ),
  }),
);

const baseTour = {
  _id: 't1',
  title: 'Уикенд в Стамбуле',
  countryCode: 'TR',
  createdAt: '2026-06-01T12:00:00Z',
  category: { title: 'Экскурсионные' },
  isPublished: false,
  images: [],
} as unknown as TourType;

const handlers = () => ({
  onView: vi.fn(),
  onDelete: vi.fn(),
  onTogglePublish: vi.fn(),
  onEdit: vi.fn(),
});

const findColumn = (columns: ColumnDef<TourType>[], header: string) =>
  columns.find((c) => c.header === header)!;

const renderCell = (
  column: ColumnDef<TourType>,
  tour: TourType,
  value?: unknown,
) => {
  const cell = column.cell as (
    ctx: Partial<CellContext<TourType, unknown>>,
  ) => React.ReactElement;
  return render(
    cell({
      row: { original: tour } as never,
      getValue: (() => value) as never,
    }),
  );
};

const renderActions = (columns: ColumnDef<TourType>[], tour = baseTour) =>
  renderCell(
    columns.find((c) => c.id === 'Действия')!,
    tour,
  );

describe('getToursColumns', () => {
  it('возвращает колонки в ожидаемом порядке', () => {
    const columns = getToursColumns({ ...handlers(), visible: true });
    expect(
      columns.map((c) => (typeof c.header === 'string' ? c.header : c.id)),
    ).toEqual([
      'Фото',
      'Код страны',
      'Дата создания',
      'Название',
      'Категория',
      'Статус',
      'Действия',
    ]);
  });

  it('рендерит компонент изображения', () => {
    const columns = getToursColumns({ ...handlers(), visible: true });
    renderCell(findColumn(columns, 'Фото'), baseTour);
    expect(screen.getByTestId('tour-image')).toBeInTheDocument();
  });

  describe('код страны', () => {
    it('показывает код', () => {
      const columns = getToursColumns({ ...handlers(), visible: true });
      renderCell(findColumn(columns, 'Код страны'), baseTour);
      expect(screen.getByText('TR')).toBeInTheDocument();
    });

    it('показывает прочерк без кода', () => {
      const columns = getToursColumns({ ...handlers(), visible: true });
      renderCell(findColumn(columns, 'Код страны'), {
        ...baseTour,
        countryCode: '',
      } as TourType);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('дата создания', () => {
    it('форматирует дату', () => {
      const columns = getToursColumns({ ...handlers(), visible: true });
      renderCell(
        findColumn(columns, 'Дата создания'),
        baseTour,
        '2026-06-01T12:00:00Z',
      );
      expect(screen.getAllByText(/01\.06\.2026/).length).toBeGreaterThan(0);
    });

    it('показывает прочерк без даты', () => {
      const columns = getToursColumns({ ...handlers(), visible: true });
      renderCell(findColumn(columns, 'Дата создания'), baseTour, undefined);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('название', () => {
    it('показывает заголовок тура', () => {
      const columns = getToursColumns({ ...handlers(), visible: true });
      renderCell(findColumn(columns, 'Название'), baseTour);
      expect(screen.getByText('Уикенд в Стамбуле')).toBeInTheDocument();
    });

    it('показывает пометку "Черновик" для неопубликованного', () => {
      const columns = getToursColumns({ ...handlers(), visible: true });
      renderCell(findColumn(columns, 'Название'), {
        ...baseTour,
        isPublished: false,
      });
      expect(screen.getByText('Черновик')).toBeInTheDocument();
    });

    it('не показывает пометку для опубликованного', () => {
      const columns = getToursColumns({ ...handlers(), visible: true });
      renderCell(findColumn(columns, 'Название'), {
        ...baseTour,
        isPublished: true,
      });
      expect(screen.queryByText('Черновик')).not.toBeInTheDocument();
    });
  });

  describe('категория', () => {
    it('показывает название категории', () => {
      const columns = getToursColumns({ ...handlers(), visible: true });
      renderCell(findColumn(columns, 'Категория'), baseTour);
      expect(screen.getByText('Экскурсионные')).toBeInTheDocument();
    });

    it('показывает прочерк без категории', () => {
      const columns = getToursColumns({ ...handlers(), visible: true });
      renderCell(findColumn(columns, 'Категория'), {
        ...baseTour,
        category: undefined,
      } as unknown as TourType);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('статус', () => {
    it('"Опубликовано" для опубликованного', () => {
      const columns = getToursColumns({ ...handlers(), visible: true });
      renderCell(findColumn(columns, 'Статус'), {
        ...baseTour,
        isPublished: true,
      });
      expect(screen.getByText('Опубликовано')).toBeInTheDocument();
    });

    it('"Не опубликовано" для черновика', () => {
      const columns = getToursColumns({ ...handlers(), visible: true });
      renderCell(findColumn(columns, 'Статус'), {
        ...baseTour,
        isPublished: false,
      });
      expect(screen.getByText('Не опубликовано')).toBeInTheDocument();
    });
  });

  describe('действия', () => {
    it('показывает базовые действия', () => {
      renderActions(getToursColumns({ ...handlers(), visible: true }));
      expect(
        screen.getByRole('button', { name: 'Просмотр' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Редактирование' }),
      ).toBeInTheDocument();
    });

    it('показывает "Удалить" при visible=true', () => {
      renderActions(getToursColumns({ ...handlers(), visible: true }));
      expect(
        screen.getByRole('button', { name: 'Удалить' }),
      ).toBeInTheDocument();
    });

    it('скрывает "Удалить" при visible=false', () => {
      renderActions(getToursColumns({ ...handlers(), visible: false }));
      expect(
        screen.queryByRole('button', { name: 'Удалить' }),
      ).not.toBeInTheDocument();
    });

    it('для черновика показывает "Опубликовать"', () => {
      renderActions(getToursColumns({ ...handlers(), visible: true }), {
        ...baseTour,
        isPublished: false,
      });
      expect(
        screen.getByRole('button', { name: 'Опубликовать' }),
      ).toBeInTheDocument();
    });

    it('для опубликованного показывает "Снять с публикации"', () => {
      renderActions(getToursColumns({ ...handlers(), visible: true }), {
        ...baseTour,
        isPublished: true,
      });
      expect(
        screen.getByRole('button', { name: 'Снять с публикации' }),
      ).toBeInTheDocument();
    });

    it('вызывает onView', async () => {
      const h = handlers();
      renderActions(getToursColumns({ ...h, visible: true }));
      await userEvent.click(screen.getByRole('button', { name: 'Просмотр' }));
      expect(h.onView).toHaveBeenCalledWith(baseTour);
    });

    it('вызывает onEdit', async () => {
      const h = handlers();
      renderActions(getToursColumns({ ...h, visible: true }));
      await userEvent.click(
        screen.getByRole('button', { name: 'Редактирование' }),
      );
      expect(h.onEdit).toHaveBeenCalledWith(baseTour);
    });

    it('вызывает onDelete', async () => {
      const h = handlers();
      renderActions(getToursColumns({ ...h, visible: true }));
      await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));
      expect(h.onDelete).toHaveBeenCalledWith(baseTour);
    });

    it('вызывает onTogglePublish', async () => {
      const h = handlers();
      renderActions(getToursColumns({ ...h, visible: true }), {
        ...baseTour,
        isPublished: false,
      });
      await userEvent.click(
        screen.getByRole('button', { name: 'Опубликовать' }),
      );
      expect(h.onTogglePublish).toHaveBeenCalledWith({
        ...baseTour,
        isPublished: false,
      });
    });
  });
});
