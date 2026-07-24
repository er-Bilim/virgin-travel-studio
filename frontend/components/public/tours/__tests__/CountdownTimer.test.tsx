import { render, screen, act } from '@testing-library/react';
import CountdownTimer from '../CountdownTimer';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('CountdownTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('показывает "Дата не указана", если дата дедлайна не передана', () => {
    render(<CountdownTimer />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText('Дата не указана')).toBeInTheDocument();
  });

  it('показывает "Дата не указана", если передана некорректная дата', () => {
    render(<CountdownTimer saleDeadline="invalid-date-string" />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText('Дата не указана')).toBeInTheDocument();
  });

  it('показывает "Акция завершена", если дедлайн уже в прошлом (Expired deadline)', () => {
    vi.setSystemTime(new Date('2024-01-10T12:00:00Z'));

    const pastDeadline = '2024-01-09T12:00:00Z';

    render(<CountdownTimer saleDeadline={pastDeadline} />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText('Акция завершена')).toBeInTheDocument();
  });

  it('корректно отображает оставшееся время для будущей даты', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));

    const futureDeadline = new Date('2024-01-02T14:03:04Z').toISOString();

    render(<CountdownTimer saleDeadline={futureDeadline} />);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByText('1д 2ч 3м 4с')).toBeInTheDocument();
  });

  it('обновляет счетчик каждую секунду', () => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    const futureDeadline = new Date('2024-01-01T12:00:10Z').toISOString();

    render(<CountdownTimer saleDeadline={futureDeadline} />);

    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByText('0д 0ч 0м 10с')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('0д 0ч 0м 9с')).toBeInTheDocument();
  });
});