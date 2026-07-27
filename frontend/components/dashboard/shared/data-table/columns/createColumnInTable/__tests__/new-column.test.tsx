import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getNewsColumns } from '../new-column';
import type { NewsFields } from '@/types/news';
import type { ColumnDef } from '@tanstack/react-table';

vi.mock('@/components/ui/tooltip-custom', () => ({
  TooltipCustom: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const baseNews = {
  _id: 'n1',
  title: 'Раннее бронирование открыто',
  image: 'photo.png',
  author: { fullName: 'admin' },
  createdAt: '2026-06-01T12:00:00Z',
  isPublished: false,
} as unknown as NewsFields;

const handlers = () => ({
  onView: vi.fn(),
  onDelete: vi.fn(),
  onTogglePublish: vi.fn(),
  onEdit: vi.fn(),
});

const findColumn = (columns: ColumnDef<NewsFields>[], header: string) =>
  columns.find((c) => c.header === header)!;

const renderCell = (column: ColumnDef<NewsFields>, news: NewsFields) => {
  const cell = column.cell as (p: {
    row: { original: NewsFields };
  }) => React.ReactElement;
  return render(cell({ row: { original: news } }));
};

const renderActions = (columns: ColumnDef<NewsFields>[], news = baseNews) =>
  renderCell(
    columns.find((c) => c.id === 'Действия')!,
    news,
  );

describe('getNewsColumns', () => {
  it('возвращает колонки в ожидаемом порядке', () => {
    const columns = getNewsColumns(handlers());
    expect(
      columns.map((c) => (typeof c.header === 'string' ? c.header : c.id)),
    ).toEqual(['Фото', 'Название', 'Автор', 'Дата', 'Статус', 'Действия']);
  });

  describe('колонка фото', () => {
    it('показывает заглушку без изображения', () => {
      const columns = getNewsColumns(handlers());
      renderCell(findColumn(columns, 'Фото'), { ...baseNews, image: '' });
      expect(screen.getByText('Нет фото')).toBeInTheDocument();
    });

    it('показывает кнопку просмотра при наличии изображения', () => {
      const columns = getNewsColumns(handlers());
      renderCell(findColumn(columns, 'Фото'), baseNews);
      expect(
        screen.getByRole('button', { name: 'Просмотр изображения' }),
      ).toBeInTheDocument();
    });

    it('открывает диалог с изображением по клику', async () => {
      const columns = getNewsColumns(handlers());
      renderCell(findColumn(columns, 'Фото'), baseNews);

      await userEvent.click(
        screen.getByRole('button', { name: 'Просмотр изображения' }),
      );

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByAltText('Раннее бронирование открыто'),
      ).toBeInTheDocument();
    });
  });

  describe('колонка названия', () => {
    it('показывает заголовок новости', () => {
      const columns = getNewsColumns(handlers());
      renderCell(findColumn(columns, 'Название'), baseNews);
      expect(
        screen.getByText('Раннее бронирование открыто'),
      ).toBeInTheDocument();
    });

    it('показывает пометку "Черновик" для неопубликованной', () => {
      const columns = getNewsColumns(handlers());
      renderCell(findColumn(columns, 'Название'), {
        ...baseNews,
        isPublished: false,
      });
      expect(screen.getByText('Черновик')).toBeInTheDocument();
    });

    it('не показывает пометку для опубликованной', () => {
      const columns = getNewsColumns(handlers());
      renderCell(findColumn(columns, 'Название'), {
        ...baseNews,
        isPublished: true,
      });
      expect(screen.queryByText('Черновик')).not.toBeInTheDocument();
    });
  });

  it('показывает автора', () => {
    const columns = getNewsColumns(handlers());
    renderCell(findColumn(columns, 'Автор'), baseNews);
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('форматирует дату создания', () => {
    const columns = getNewsColumns(handlers());
    renderCell(findColumn(columns, 'Дата'), baseNews);
    expect(screen.getByText('01.06.2026')).toBeInTheDocument();
  });

  describe('колонка статуса', () => {
    it('"Опубликовано" для опубликованной', () => {
      const columns = getNewsColumns(handlers());
      renderCell(findColumn(columns, 'Статус'), {
        ...baseNews,
        isPublished: true,
      });
      expect(screen.getByText('Опубликовано')).toBeInTheDocument();
    });

    it('"Не опубликовано" для черновика', () => {
      const columns = getNewsColumns(handlers());
      renderCell(findColumn(columns, 'Статус'), {
        ...baseNews,
        isPublished: false,
      });
      expect(screen.getByText('Не опубликовано')).toBeInTheDocument();
    });
  });

  describe('действия', () => {
    it('показывает все действия', () => {
      renderActions(getNewsColumns(handlers()));
      expect(
        screen.getByRole('button', { name: 'Просмотр' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Редактироание' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Удалить' }),
      ).toBeInTheDocument();
    });

    it('для черновика показывает "Опубликовать"', () => {
      renderActions(getNewsColumns(handlers()), {
        ...baseNews,
        isPublished: false,
      });
      expect(
        screen.getByRole('button', { name: 'Опубликовать' }),
      ).toBeInTheDocument();
    });

    it('для опубликованной показывает "Снять с публикации"', () => {
      renderActions(getNewsColumns(handlers()), {
        ...baseNews,
        isPublished: true,
      });
      expect(
        screen.getByRole('button', { name: 'Снять с публикации' }),
      ).toBeInTheDocument();
    });

    it('вызывает onView', async () => {
      const h = handlers();
      renderActions(getNewsColumns(h));
      await userEvent.click(screen.getByRole('button', { name: 'Просмотр' }));
      expect(h.onView).toHaveBeenCalledWith(baseNews);
    });

    it('вызывает onEdit', async () => {
      const h = handlers();
      renderActions(getNewsColumns(h));
      await userEvent.click(
        screen.getByRole('button', { name: 'Редактироание' }),
      );
      expect(h.onEdit).toHaveBeenCalledWith(baseNews);
    });

    it('вызывает onDelete', async () => {
      const h = handlers();
      renderActions(getNewsColumns(h));
      await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));
      expect(h.onDelete).toHaveBeenCalledWith(baseNews);
    });

    it('вызывает onTogglePublish', async () => {
      const h = handlers();
      renderActions(getNewsColumns(h), { ...baseNews, isPublished: false });
      await userEvent.click(
        screen.getByRole('button', { name: 'Опубликовать' }),
      );
      expect(h.onTogglePublish).toHaveBeenCalledWith({
        ...baseNews,
        isPublished: false,
      });
    });
  });
});
