import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';
import { useModalStore } from '@/lib/stores/modalStore';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/stores/modalStore');

describe('Modal', () => {
  const closeModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('не рендерит содержимое, если activeModalId не совпадает с id', () => {
    vi.mocked(useModalStore).mockReturnValue({
      activeModalId: 'otherModal',
      closeModal,
    } as ReturnType<typeof useModalStore>);

    render(
      <Modal id="myModal">
        <p>Контент модалки</p>
      </Modal>,
    );
    expect(screen.queryByText('Контент модалки')).not.toBeInTheDocument();
  });

  it('рендерит содержимое, если activeModalId совпадает с id', () => {
    vi.mocked(useModalStore).mockReturnValue({
      activeModalId: 'myModal',
      closeModal,
    } as ReturnType<typeof useModalStore>);

    render(
      <Modal id="myModal">
        <p>Контент модалки</p>
      </Modal>,
    );
    expect(screen.getByText('Контент модалки')).toBeInTheDocument();
  });

  it('показывает переданный title', () => {
    vi.mocked(useModalStore).mockReturnValue({
      activeModalId: 'myModal',
      closeModal,
    } as ReturnType<typeof useModalStore>);

    render(
      <Modal id="myModal" title="Заголовок модалки">
        <p>Контент</p>
      </Modal>,
    );
    expect(screen.getByText('Заголовок модалки')).toBeInTheDocument();
  });

  it('использует sr-only заголовок "Диалоговое окно", если title не передан', () => {
    vi.mocked(useModalStore).mockReturnValue({
      activeModalId: 'myModal',
      closeModal,
    } as ReturnType<typeof useModalStore>);

    render(
      <Modal id="myModal">
        <p>Контент</p>
      </Modal>,
    );
    expect(screen.getByText('Диалоговое окно')).toBeInTheDocument();
  });

  it('показывает переданное description', () => {
    vi.mocked(useModalStore).mockReturnValue({
      activeModalId: 'myModal',
      closeModal,
    } as ReturnType<typeof useModalStore>);

    render(
      <Modal id="myModal" description="Описание модалки">
        <p>Контент</p>
      </Modal>,
    );
    expect(screen.getByText('Описание модалки')).toBeInTheDocument();
  });

  it('использует sr-only описание "Содержимое модального окна", если description не передан', () => {
    vi.mocked(useModalStore).mockReturnValue({
      activeModalId: 'myModal',
      closeModal,
    } as ReturnType<typeof useModalStore>);

    render(
      <Modal id="myModal">
        <p>Контент</p>
      </Modal>,
    );
    expect(screen.getByText('Содержимое модального окна')).toBeInTheDocument();
  });

  it('вызывает closeModal при закрытии диалога (Escape)', () => {
    vi.mocked(useModalStore).mockReturnValue({
      activeModalId: 'myModal',
      closeModal,
    } as ReturnType<typeof useModalStore>);

    render(
      <Modal id="myModal">
        <p>Контент</p>
      </Modal>,
    );
    fireEvent.keyDown(screen.getByText('Контент'), { key: 'Escape' });
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('рендерит произвольные children внутри диалога', () => {
    vi.mocked(useModalStore).mockReturnValue({
      activeModalId: 'myModal',
      closeModal,
    } as ReturnType<typeof useModalStore>);

    render(
      <Modal id="myModal">
        <button>Кастомная кнопка</button>
      </Modal>,
    );
    expect(
      screen.getByRole('button', { name: 'Кастомная кнопка' }),
    ).toBeInTheDocument();
  });
});
