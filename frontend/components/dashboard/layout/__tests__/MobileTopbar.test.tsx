import { render, screen, fireEvent } from '@testing-library/react';
import MobileTopbar from '../MobileTopbar';
import { useUser } from '@/lib/hooks/authHooks';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { IUser } from '@/types/user';

vi.mock('@/lib/hooks/authHooks');

const adminUser: IUser = {
  _id: 'user1',
  fullName: 'Бекзат Асанов',
  phone: '+996700000000',
  status: 'active',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('MobileTopbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('показывает "Dashboard", если пользователь ещё не загружен', () => {
    vi.mocked(useUser).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useUser>);

    render(<MobileTopbar onMenuClick={vi.fn()} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('показывает fullName и role пользователя, когда данные загружены', () => {
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    render(<MobileTopbar onMenuClick={vi.fn()} />);
    expect(screen.getByText('Бекзат Асанов · ADMIN')).toBeInTheDocument();
  });

  it('всегда отображает название "Virgin Travel Studio"', () => {
    vi.mocked(useUser).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useUser>);

    render(<MobileTopbar onMenuClick={vi.fn()} />);
    expect(screen.getByText('Virgin Travel Studio')).toBeInTheDocument();
  });

  it('вызывает onMenuClick при клике на кнопку меню', () => {
    const onMenuClick = vi.fn();
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    render(<MobileTopbar onMenuClick={onMenuClick} />);
    fireEvent.click(screen.getByLabelText('Открыть меню'));

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it('кнопка меню доступна по aria-label', () => {
    vi.mocked(useUser).mockReturnValue({
      data: adminUser,
    } as ReturnType<typeof useUser>);

    render(<MobileTopbar onMenuClick={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: 'Открыть меню' }),
    ).toBeInTheDocument();
  });
});
