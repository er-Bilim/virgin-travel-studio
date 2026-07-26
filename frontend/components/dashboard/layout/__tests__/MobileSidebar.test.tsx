import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileSidebar from '../MobileSidebar';
import { useLogout, useUser } from '@/lib/hooks/authHooks';
import { usePathname, useRouter } from 'next/navigation';
import type { IUser } from '@/types/user';

vi.mock('@/lib/hooks/authHooks');
vi.mock('next/navigation');

const adminUser: IUser = {
  _id: 'user1',
  fullName: 'Бекзат Асанов',
  phone: '+996700000000',
  status: 'active',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const managerUser: IUser = {
  ...adminUser,
  _id: 'user2',
  fullName: 'Айгуль Токтосунова',
  role: 'MANAGER',
};

describe('MobileSidebar', () => {
  const push = vi.fn();
  const mutateAsync = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(usePathname).mockReturnValue('/admin/dashboard');
    vi.mocked(useLogout).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useLogout>);
  });

  it('не рендерит ничего, если пользователь не загружен', () => {
    vi.mocked(useUser).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useUser>);

    const { container } = render(
      <MobileSidebar open={true} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('показывает только пункты меню, доступные роли MANAGER', () => {
    vi.mocked(useUser).mockReturnValue({
      data: managerUser,
    } as ReturnType<typeof useUser>);

    render(<MobileSidebar open={true} onClose={vi.fn()} />);

    expect(screen.getByText('Заявки')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Панель/ })).toHaveLength(1);
    expect(screen.queryByText('Менеджеры')).not.toBeInTheDocument();
    expect(screen.queryByText('Категории')).not.toBeInTheDocument();
  });

  it('показывает все ADMIN-пункты меню для роли ADMIN', () => {
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    render(<MobileSidebar open={true} onClose={vi.fn()} />);

    [
      'Менеджеры',
      'Новости',
      'Туры',
      'Категории',
      'Отзывы',
      'Настройки',
      'О нас',
    ].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
  });

  it('подсвечивает пункт меню, соответствующий текущему pathname', () => {
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);
    vi.mocked(usePathname).mockReturnValue('/admin/news');

    render(<MobileSidebar open={true} onClose={vi.fn()} />);

    const activeLink = screen.getByText('Новости').closest('a')!;
    const inactiveLink = screen.getByText('Туры').closest('a')!;

    expect(activeLink.className).toContain('bg-[#1E2B6D]');
    expect(inactiveLink.className).not.toContain('bg-[#1E2B6D]');
  });

  it('не рендерит затемняющий оверлей, если open=false', () => {
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    const { container } = render(
      <MobileSidebar open={false} onClose={vi.fn()} />,
    );
    expect(container.querySelector('.bg-black\\/40')).not.toBeInTheDocument();
  });

  it('вызывает onClose при клике на оверлей, если open=true', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    const { container } = render(
      <MobileSidebar open={true} onClose={onClose} />,
    );
    const overlay = container.querySelector('.bg-black\\/40')!;
    await user.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('добавляет translate-x-0 при open=true и -translate-x-full при open=false', () => {
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    const { rerender, container } = render(
      <MobileSidebar open={true} onClose={vi.fn()} />,
    );
    expect(container.querySelector('aside')!.className).toContain(
      'translate-x-0',
    );

    rerender(<MobileSidebar open={false} onClose={vi.fn()} />);
    expect(container.querySelector('aside')!.className).toContain(
      '-translate-x-full',
    );
  });

  it('ссылка-логотип ведёт на roleDashboardPaths для роли пользователя и вызывает onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    render(<MobileSidebar open={true} onClose={onClose} />);
    const logoLink = screen.getByText('Virgin Travel').closest('a')!;
    expect(logoLink).toHaveAttribute('href', '/admin/dashboard');

    await user.click(logoLink);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('вызывает onClose при клике на пункт меню', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    render(<MobileSidebar open={true} onClose={onClose} />);
    await user.click(screen.getByText('Новости'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('отображает fullName и role пользователя', () => {
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    render(<MobileSidebar open={true} onClose={vi.fn()} />);
    expect(screen.getByText('Бекзат Асанов')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('при клике на кнопку выхода вызывает mutateAsync, затем onClose и router.push', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    render(<MobileSidebar open={true} onClose={onClose} />);
    await user.click(screen.getByText('Выйти'));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('вызывает onClose и router.push даже если logout завершился с ошибкой (finally)', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mutateAsync.mockRejectedValueOnce(new Error('network error'));
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    render(<MobileSidebar open={true} onClose={onClose} />);
    await user.click(screen.getByText('Выйти'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('показывает "Выход..." и блокирует кнопку, пока logoutMutation.isPending=true', () => {
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);
    vi.mocked(useLogout).mockReturnValue({
      mutateAsync,
      isPending: true,
    } as unknown as ReturnType<typeof useLogout>);

    render(<MobileSidebar open={true} onClose={vi.fn()} />);
    const button = screen.getByText('Выход...').closest('button')!;
    expect(button).toBeDisabled();
  });
});
