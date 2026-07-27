import { render, screen } from '@testing-library/react';
import { OrderTabs } from '../OrderTabs';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('OrderTabs', () => {
  it('отображает "Мои заявки" и "Новые заявки" для роли, отличной от ADMIN', () => {
    render(<OrderTabs currentTab="my" onChangeTab={vi.fn()} role="MANAGER" />);
    expect(screen.getByText('Мои заявки')).toBeInTheDocument();
    expect(screen.getByText('Новые заявки')).toBeInTheDocument();
  });

  it('отображает "Все заявки" вместо "Новые заявки" для роли ADMIN', () => {
    render(<OrderTabs currentTab="my" onChangeTab={vi.fn()} role="ADMIN" />);
    expect(screen.getByText('Все заявки')).toBeInTheDocument();
    expect(screen.queryByText('Новые заявки')).not.toBeInTheDocument();
  });

  it('вызывает onChangeTab с корректным значением при клике на вкладку', async () => {
    const user = userEvent.setup();
    const onChangeTab = vi.fn();

    render(
      <OrderTabs currentTab="my" onChangeTab={onChangeTab} role="MANAGER" />,
    );

    await user.click(screen.getByText('Новые заявки'));

    expect(onChangeTab).toHaveBeenCalledWith('all');
  });

  it('помечает активную вкладку согласно currentTab', () => {
    render(<OrderTabs currentTab="all" onChangeTab={vi.fn()} role="ADMIN" />);
    expect(screen.getByRole('tab', { name: 'Все заявки' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByRole('tab', { name: 'Мои заявки' })).toHaveAttribute(
      'data-state',
      'inactive',
    );
  });
});
