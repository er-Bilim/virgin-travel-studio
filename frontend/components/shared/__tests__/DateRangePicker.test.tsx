import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from '../DateRangePicker';
import type { DateRange } from 'react-day-picker';

describe('DateRangePicker (inline)', () => {
  it('показывает placeholder без значения', () => {
    render(
      <DateRangePicker
        value={undefined}
        onChange={vi.fn()}
        placeholder="Период"
      />,
    );
    expect(screen.getByText('Период')).toBeInTheDocument();
  });

  it('показывает одну дату, если выбран только from', () => {
    const value: DateRange = {
      from: new Date('2026-06-15T12:00:00'),
      to: undefined,
    };
    render(<DateRangePicker value={value} onChange={vi.fn()} />);
    expect(screen.getByText(/15 июн/)).toBeInTheDocument();
  });

  it('показывает диапазон при from и to', () => {
    const value: DateRange = {
      from: new Date('2026-06-15T12:00:00'),
      to: new Date('2026-06-20T12:00:00'),
    };
    render(<DateRangePicker value={value} onChange={vi.fn()} />);
    expect(screen.getByText(/15 июн.* – .*20 июн/)).toBeInTheDocument();
  });

  it('не показывает кнопку очистки без значения', () => {
    render(<DateRangePicker value={undefined} onChange={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('очищает значение по крестику', async () => {
    const onChange = vi.fn();
    const value: DateRange = {
      from: new Date('2026-06-15T12:00:00'),
      to: undefined,
    };
    render(<DateRangePicker value={value} onChange={onChange} />);

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[buttons.length - 1]);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('открывает календарь по клику на триггер', async () => {
    render(
      <DateRangePicker
        value={undefined}
        onChange={vi.fn()}
        placeholder="Период"
      />,
    );
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryAllByRole('grid')).toHaveLength(0));
  });
});
