import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useLogout } from '@/lib/hooks/authHooks';
import { dashboardMenuItems, roleDashboardPaths } from '@/lib/constants';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));
vi.mock('@/lib/hooks/authHooks', () => ({
  useUser: vi.fn(),
  useLogout: vi.fn(),
}));

const push = vi.fn();
const mutateAsync = vi.fn().mockResolvedValue(undefined);

const setup = ({
  user = { fullName: 'Иван Петров', role: 'ADMIN' } as {
    fullName: string;
    role: string;
  } | null,
  pathname = '/admin/dashboard',
  isPending = false,
} = {}) => {
  vi.mocked(usePathname).mockReturnValue(pathname);
  vi.mocked(useRouter).mockReturnValue({ push } as never);
  vi.mocked(useUser).mockReturnValue({ data: user } as never);
  vi.mocked(useLogout).mockReturnValue({ mutateAsync, isPending } as never);
  render(<Sidebar />);
};

describe('Sidebar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('не рендерится без пользователя', () => {
    const { container } = (() => {
      vi.mocked(usePathname).mockReturnValue('/admin');
      vi.mocked(useRouter).mockReturnValue({ push } as never);
      vi.mocked(useUser).mockReturnValue({ data: null } as never);
      vi.mocked(useLogout).mockReturnValue({
        mutateAsync,
        isPending: false,
      } as never);
      return render(<Sidebar />);
    })();
    expect(container).toBeEmptyDOMElement();
  });

  it('показывает данные пользователя', () => {
    setup();
    expect(screen.getByText('Иван Петров')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('логотип ведёт на дашборд роли', () => {
    setup({ user: { fullName: 'Иван', role: 'ADMIN' } });
    const logoLink = screen.getByRole('link', { name: /Virgin Travel/ });
    expect(logoLink).toHaveAttribute('href', roleDashboardPaths['ADMIN']);
  });

  describe('фильтрация меню по роли', () => {
    it('админ видит только пункты со своей ролью', () => {
      setup({ user: { fullName: 'Иван', role: 'ADMIN' } });
      const adminItems = dashboardMenuItems.filter((i) =>
        i.roles.includes('ADMIN'),
      );
      adminItems.forEach((item) => {
        expect(
          screen.getByRole('link', { name: item.label }),
        ).toBeInTheDocument();
      });
    });

    it('менеджер не видит админские пункты', () => {
      setup({ user: { fullName: 'Иван', role: 'MANAGER' } });

      const adminOnly = dashboardMenuItems.filter(
        (i) => i.roles.includes('ADMIN') && !i.roles.includes('MANAGER'),
      );

      const renderedHrefs = screen
        .queryAllByRole('link')
        .map((l) => l.getAttribute('href'));

      adminOnly.forEach((item) => {
        expect(renderedHrefs).not.toContain(item.href);
      });
    });
  });

  it('подсвечивает активный пункт по pathname', () => {
    const firstItem = dashboardMenuItems.find((i) =>
      i.roles.includes('ADMIN'),
    )!;
    setup({
      user: { fullName: 'Иван', role: 'ADMIN' },
      pathname: firstItem.href,
    });

    const activeLink = screen.getByRole('link', { name: firstItem.label });
    expect(activeLink.className).toContain('bg-[#1E2B6D]');
  });

  describe('выход', () => {
    it('вызывает logout и редиректит на /login', async () => {
      setup();
      await userEvent.click(screen.getByRole('button', { name: 'Выйти' }));

      await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
      await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
    });

    it('редиректит даже при ошибке logout', async () => {
      mutateAsync.mockRejectedValueOnce(new Error('fail'));
      setup();

      await userEvent.click(screen.getByRole('button', { name: 'Выйти' }));
      await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));

      await mutateAsync.mock.results[0].value.catch(() => {});
    });

    it('показывает "Выход..." и блокирует кнопку при isPending', () => {
      setup({ isPending: true });
      const btn = screen.getByRole('button', { name: 'Выход...' });
      expect(btn).toBeDisabled();
    });
  });
});
