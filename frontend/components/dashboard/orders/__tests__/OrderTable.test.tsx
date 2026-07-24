import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderTable from '../OrderTable';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useUser } from '@/lib/hooks/authHooks';
import {
  useOrders,
  useDeleteOrder,
  useUpdateOrder,
} from '@/lib/hooks/orderHooks';
import { useManagers } from '@/lib/hooks/managerHook';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  usePathname: vi.fn(),
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));
vi.mock('@/lib/hooks/authHooks', () => ({ useUser: vi.fn() }));
vi.mock('@/lib/hooks/orderHooks', () => ({
  useOrders: vi.fn(),
  useDeleteOrder: vi.fn(),
  useUpdateOrder: vi.fn(),
}));
vi.mock('@/lib/hooks/managerHook', () => ({ useManagers: vi.fn() }));
vi.mock('@/components/dashboard/shared/data-table/data-table', () => ({
  DataTable: ({ data }: { data: unknown[] }) => (
    <div data-testid="data-table">{data.length}</div>
  ),
}));
vi.mock('@/components/dashboard/orders/OrderTabs', () => ({
  OrderTabs: ({ onChangeTab }: { onChangeTab: (t: string) => void }) => (
    <button onClick={() => onChangeTab('all')}>Все заявки</button>
  ),
}));

const push = vi.fn();
const refetch = vi.fn();

const orders = [{ _id: 'o1' }, { _id: 'o2' }];
const managers = [
  { _id: 'm1', fullName: 'Иван Петров' },
  { _id: 'm2', fullName: 'Мария Иванова' },
];

const setup = ({
  user = { _id: 'u1', role: 'ADMIN' } as never,
  params = {} as never,
  search = '',
  data = { orders, meta: { totalPages: 3 } } as never,
  isLoading = false,
  error = null as unknown,
  isDeleting = false,
} = {}) => {
  vi.mocked(useParams).mockReturnValue(params);
  vi.mocked(usePathname).mockReturnValue('/admin/leads');
  vi.mocked(useRouter).mockReturnValue({ push } as never);
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(search) as never,
  );
  vi.mocked(useUser).mockReturnValue({ data: user } as never);
  vi.mocked(useOrders).mockReturnValue({
    data,
    isLoading,
    error,
    refetch,
  } as never);
  vi.mocked(useManagers).mockReturnValue({
    data: managers,
    isLoading: false,
    isError: false,
  } as never);
  vi.mocked(useDeleteOrder).mockReturnValue({
    mutate: vi.fn(),
    isPending: isDeleting,
  } as never);
  vi.mocked(useUpdateOrder).mockReturnValue({ mutate: vi.fn() } as never);

  return render(<OrderTable />);
};

describe('OrderTable', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает заголовок и таблицу', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Заявки' })).toBeInTheDocument();
    expect(screen.getByTestId('data-table')).toHaveTextContent('2');
  });

  it('показывает спиннер при загрузке', () => {
    const { container } = setup({ isLoading: true });
    expect(
      container.querySelector('[data-testid="data-table"]'),
    ).not.toBeInTheDocument();
  });

  it('показывает лоадер при удалении', () => {
    const { container } = setup({ isDeleting: true });
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('показывает ошибку с кнопкой повтора', async () => {
    setup({ error: new Error('fail') });
    expect(
      screen.getByText('Не удалось загрузить список Заявок'),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Повторить попытку' }),
    );
    expect(refetch).toHaveBeenCalled();
  });

  describe('фильтр по статусу', () => {
    it('доступен админу', () => {
      setup({ user: { _id: 'u1', role: 'ADMIN' } as never });
      expect(screen.getByText('Все статусы')).toBeInTheDocument();
    });

    it('доступен менеджеру на вкладке "мои"', () => {
      setup({
        user: { _id: 'u1', role: 'MANAGER' } as never,
        search: 'tab=my',
      });
      expect(screen.getByText('Все статусы')).toBeInTheDocument();
    });

    it('скрыт у менеджера на вкладке "все"', () => {
      setup({
        user: { _id: 'u1', role: 'MANAGER' } as never,
        search: 'tab=all',
      });
      expect(screen.queryByText('Все статусы')).not.toBeInTheDocument();
    });
  });

  describe('фильтр по менеджеру', () => {
    it('показан админу на вкладке "все"', () => {
      setup({ user: { _id: 'u1', role: 'ADMIN' } as never, search: 'tab=all' });
      expect(screen.getByText('Все менеджеры')).toBeInTheDocument();
    });

    it('скрыт на вкладке "мои"', () => {
      setup({ user: { _id: 'u1', role: 'ADMIN' } as never, search: 'tab=my' });
      expect(screen.queryByText('Все менеджеры')).not.toBeInTheDocument();
    });

    it('скрыт при наличии id в параметрах роута', () => {
      setup({
        user: { _id: 'u1', role: 'ADMIN' } as never,
        params: { id: 'm1' } as never,
        search: 'tab=all',
      });
      expect(screen.queryByText('Все менеджеры')).not.toBeInTheDocument();
    });

    it('скрыт у менеджера', () => {
      setup({
        user: { _id: 'u1', role: 'MANAGER' } as never,
        search: 'tab=all',
      });
      expect(screen.queryByText('Все менеджеры')).not.toBeInTheDocument();
    });
  });

  it('переключение вкладки сбрасывает страницу на первую', async () => {
    setup({ search: 'page=3&tab=my' });
    await userEvent.click(screen.getByRole('button', { name: 'Все заявки' }));

    await waitFor(() => expect(push).toHaveBeenCalled());
    const url = push.mock.calls[0][0] as string;
    expect(url).toContain('tab=all');
    expect(url).toContain('page=1');
  });

  it('запрашивает заявки с параметрами пагинации', () => {
    setup({ search: 'page=2&limit=20' });
    expect(useOrders).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 20 }),
    );
  });

  it('менеджер получает параметр view', () => {
    setup({ user: { _id: 'u1', role: 'MANAGER' } as never, search: 'tab=all' });
    expect(useOrders).toHaveBeenCalledWith(
      expect.objectContaining({ view: 'all' }),
    );
  });

  it('админ на вкладке "мои" фильтрует по своему id', () => {
    setup({ user: { _id: 'u1', role: 'ADMIN' } as never, search: 'tab=my' });
    expect(useOrders).toHaveBeenCalledWith(
      expect.objectContaining({ managerId: 'u1' }),
    );
  });

  it('передаёт статус из параметров', () => {
    setup({ search: 'status=IN_PROGRESS' });
    expect(useOrders).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'IN_PROGRESS' }),
    );
  });
});
