import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../ConfirmDialog';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Удалить элемент?',
    onConfirmAction: vi.fn(),
    onCancelAction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает title и кнопки с дефолтными текстами', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Удалить элемент?')).toBeInTheDocument();
    expect(screen.getByText('Отмена')).toBeInTheDocument();
    expect(screen.getByText('Удалить')).toBeInTheDocument();
  });

  it('отображает кастомные confirmText и cancelText', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Отозвать"
        cancelText="Назад"
      />,
    );
    expect(screen.getByText('Отозвать')).toBeInTheDocument();
    expect(screen.getByText('Назад')).toBeInTheDocument();
  });

  it('отображает description, если он передан', () => {
    render(
      <ConfirmDialog {...defaultProps} description="Это действие необратимо" />,
    );
    expect(screen.getByText('Это действие необратимо')).toBeInTheDocument();
  });

  it('не отображает диалог, если open=false', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Удалить элемент?')).not.toBeInTheDocument();
  });

  it('вызывает onConfirmAction при клике на кнопку подтверждения', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Удалить'));
    expect(defaultProps.onConfirmAction).toHaveBeenCalledTimes(1);
  });

  it('вызывает onCancelAction при клике на кнопку отмены', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Отмена'));
    expect(defaultProps.onCancelAction).toHaveBeenCalledTimes(1);
  });

  it('блокирует кнопку подтверждения и показывает "Загрузка..." при loading=true', () => {
    render(<ConfirmDialog {...defaultProps} loading={true} />);
    const button = screen.getByText('Загрузка...');
    expect(button).toBeInTheDocument();
    expect(button.closest('button')).toBeDisabled();
  });
});
