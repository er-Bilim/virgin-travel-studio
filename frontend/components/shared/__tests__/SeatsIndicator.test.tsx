import { render, screen } from '@testing-library/react';
import SeatsIndicator from '../SeatsIndicator';
import getSeatsLevel from '@/lib/tour/seats';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { SeatsLevel } from '@/lib/tour/seats';

vi.mock('@/lib/tour/seats', () => ({
  default: vi.fn(),
}));

describe('SeatsIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('показывает "Мест нет" при free=0, независимо от уровня', () => {
    vi.mocked(getSeatsLevel).mockReturnValue('sold-out');
    render(<SeatsIndicator free={0} total={20} />);
    expect(screen.getByText('Мест нет')).toBeInTheDocument();
  });

  it('показывает "N из M мест" при free > 0', () => {
    vi.mocked(getSeatsLevel).mockReturnValue('available');
    render(<SeatsIndicator free={15} total={20} />);
    expect(screen.getByText('15 из 20 мест')).toBeInTheDocument();
  });

  it('вызывает getSeatsLevel с переданными free и total', () => {
    vi.mocked(getSeatsLevel).mockReturnValue('low');
    render(<SeatsIndicator free={3} total={20} />);
    expect(getSeatsLevel).toHaveBeenCalledWith(3, 20);
  });

  const levelClassCases: [SeatsLevel, string][] = [
    ['available', 'text-emerald-500'],
    ['low', 'text-amber-600'],
    ['critical', 'text-orange-600'],
    ['sold-out', 'text-destructive'],
  ];

  it.each(levelClassCases)(
    'применяет корректный класс для уровня "%s"',
    (level, expectedClass) => {
      vi.mocked(getSeatsLevel).mockReturnValue(level);
      render(<SeatsIndicator free={5} total={20} />);
      expect(screen.getByText('5 из 20 мест')).toHaveClass(expectedClass);
    },
  );

  it('всегда применяет базовый класс font-semibold', () => {
    vi.mocked(getSeatsLevel).mockReturnValue('available');
    render(<SeatsIndicator free={5} total={20} />);
    expect(screen.getByText('5 из 20 мест')).toHaveClass('font-semibold');
  });

  it('добавляет кастомный className, переданный через props', () => {
    vi.mocked(getSeatsLevel).mockReturnValue('available');
    render(<SeatsIndicator free={5} total={20} className="ml-2" />);
    expect(screen.getByText('5 из 20 мест')).toHaveClass('ml-2');
  });
});
