import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatsWidgets } from '../StatsWidgets';
import { useOrderStats } from '@/lib/hooks/orderHooks';
import { useUser } from '@/lib/hooks/authHooks';
import { useModalStore } from '@/lib/stores/modalStore';
import { reportsManager } from '@/services/reports';
import { isValidReportDate, downloadBlobFile } from '@/lib/utils';
import type * as Utils from '@/lib/utils';

vi.mock('@/lib/hooks/orderHooks', () => ({ useOrderStats: vi.fn() }));
vi.mock('@/lib/hooks/authHooks', () => ({ useUser: vi.fn() }));
vi.mock('@/lib/stores/modalStore', () => ({ useModalStore: vi.fn() }));
vi.mock('@/services/reports', () => ({ reportsManager: vi.fn() }));
vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof Utils>();
  return {
    ...actual,
    isValidReportDate: vi.fn(),
    downloadBlobFile: vi.fn(),
  };
});
vi.mock('@/components/shared/Modal', () => ({
  Modal: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div data-testid="modal">
      <span>{title}</span>
      {children}
    </div>
  ),
}));
vi.mock(
  '@/components/dashboard/shared/date-range-picker/DateRangePicker',
  () => ({
    DateRangePicker: () => <div data-testid="date-picker" />,
  }),
);

const openModal = vi.fn();

const stats = {
  byStatus: { NEW: 10, IN_PROGRESS: 9 },
  completedToday: 7,
  monthRevenue: 1080000,
};

const setup = ({
  data = stats as never,
  isLoading = false,
  isError = false,
  role = 'ADMIN',
} = {}) => {
  vi.mocked(useOrderStats).mockReturnValue({
    data,
    isLoading,
    isError,
  } as never);
  vi.mocked(useUser).mockReturnValue({ data: { role } } as never);
  vi.mocked(useModalStore).mockReturnValue({ openModal } as never);
  render(<StatsWidgets />);
};

describe('StatsWidgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isValidReportDate).mockReturnValue(null);
  });

  it('показывает лоадер при загрузке', () => {
    setup({ isLoading: true });
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('показывает ошибку загрузки', () => {
    setup({ isError: true, data: null as never });
    expect(
      screen.getByText('Не удалось загрузить статистику'),
    ).toBeInTheDocument();
  });

  describe('виджеты администратора', () => {
    it('рендерит все четыре виджета', () => {
      setup({ role: 'ADMIN' });
      expect(screen.getByText('Новые заявки')).toBeInTheDocument();
      expect(screen.getByText('В работе')).toBeInTheDocument();
      expect(screen.getByText('Выполнено сегодня')).toBeInTheDocument();
      expect(screen.getByText('Выручка за месяц')).toBeInTheDocument();
    });

    it('показывает значения статистики', () => {
      setup({ role: 'ADMIN' });
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('добавляет "сом" к выручке', () => {
      setup({ role: 'ADMIN' });
      expect(screen.getByText(/сом/)).toBeInTheDocument();
    });

    it('показывает кнопку отчёта', () => {
      setup({ role: 'ADMIN' });
      expect(
        screen.getByRole('button', { name: /Отчет по всем менеджерам/ }),
      ).toBeInTheDocument();
    });
  });

  describe('роль менеджера', () => {
    it('не рендерит виджет выручки для роли менеджера', () => {
      setup({ role: 'MANAGER' });
      expect(screen.queryByText('Выручка за месяц')).not.toBeInTheDocument();
    });

    it('не показывает кнопку отчёта', () => {
      setup({ role: 'MANAGER' });
      expect(
        screen.queryByRole('button', { name: /Отчет по всем менеджерам/ }),
      ).not.toBeInTheDocument();
    });
  });

  it('открывает модалку отчёта по кнопке', async () => {
    setup({ role: 'ADMIN' });
    await userEvent.click(
      screen.getByRole('button', { name: /Отчет по всем менеджерам/ }),
    );
    expect(openModal).toHaveBeenCalledWith('reportAllManagers');
  });

  describe('скачивание отчёта', () => {
    it('показывает ошибку валидации дат', async () => {
      vi.mocked(isValidReportDate).mockReturnValue('Выберите диапазон дат');
      setup({ role: 'ADMIN' });

      await userEvent.click(
        screen.getByRole('button', { name: 'Скачать отчет' }),
      );

      expect(
        await screen.findByText('Выберите диапазон дат'),
      ).toBeInTheDocument();
      expect(reportsManager).not.toHaveBeenCalled();
    });

    it('скачивает отчёт при валидных датах', async () => {
      vi.mocked(reportsManager).mockResolvedValue({
        data: new Blob(['xlsx']),
        headers: {
          'content-disposition': 'attachment; filename="report.xlsx"',
        },
      } as never);
      setup({ role: 'ADMIN' });

      await userEvent.click(
        screen.getByRole('button', { name: 'Скачать отчет' }),
      );

      await waitFor(() => expect(reportsManager).toHaveBeenCalled());
      expect(downloadBlobFile).toHaveBeenCalled();
    });

    it('показывает ошибку при неизвестном сбое', async () => {
      vi.mocked(reportsManager).mockRejectedValue({ response: { data: null } });
      setup({ role: 'ADMIN' });

      await userEvent.click(
        screen.getByRole('button', { name: 'Скачать отчет' }),
      );

      expect(
        await screen.findByText('Неизвестная ошибка при генерации отчёта'),
      ).toBeInTheDocument();
    });
  });

  describe('быстрый выбор периода', () => {
    it('рендерит кнопки периодов', () => {
      setup({ role: 'ADMIN' });
      expect(
        screen.getByRole('button', { name: 'Сегодня' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Неделя' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Месяц' })).toBeInTheDocument();
    });

    it('клик по периоду не вызывает ошибок', async () => {
      setup({ role: 'ADMIN' });
      await userEvent.click(screen.getByRole('button', { name: 'Неделя' }));
      expect(
        screen.getByRole('button', { name: 'Скачать отчет' }),
      ).toBeInTheDocument();
    });
  });
});
