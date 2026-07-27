import { render, screen } from '@testing-library/react';
import { DateRangePicker } from '../DateRangePicker';
import { describe, it, expect, vi } from 'vitest';
import type { DateRange } from 'react-day-picker';

describe('DateRangePicker (advanced)', () => {
  it('показывает placeholder без значения', () => {
    render(
      <DateRangePicker
        value={undefined}
        onChangeAction={vi.fn()}
        placeholder="Диапазон"
      />,
    );
    expect(screen.getByText('Диапазон')).toBeInTheDocument();
  });

  it('форматирует одиночную дату как dd.MM.yyyy', () => {
    const value: DateRange = {
      from: new Date('2026-06-15T12:00:00'),
      to: undefined,
    };
    render(<DateRangePicker value={value} onChangeAction={vi.fn()} />);
    expect(screen.getByText('15.06.2026')).toBeInTheDocument();
  });

  it('форматирует диапазон', () => {
    const value: DateRange = {
      from: new Date('2026-06-15T12:00:00'),
      to: new Date('2026-06-20T12:00:00'),
    };
    render(<DateRangePicker value={value} onChangeAction={vi.fn()} />);
    expect(screen.getByText(/15\.06\.2026 – 20\.06\.2026/)).toBeInTheDocument();
  });
});
