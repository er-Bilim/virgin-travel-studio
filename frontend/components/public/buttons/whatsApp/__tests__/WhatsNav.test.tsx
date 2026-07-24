import { render, screen } from '@testing-library/react';
import WhatsNav from '../whatsApp';
import { useContacts } from '@/lib/hooks/contactSettings';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/hooks/contactSettings');

describe('WhatsNav Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ничего не рендерит, если данные настроек еще не загружены (data: undefined)', () => {
    vi.mocked(useContacts).mockReturnValue({
      data: undefined,
    } as any);

    render(<WhatsNav />);

    expect(screen.queryByTitle('whatsapp')).not.toBeInTheDocument();
  });

  it('ничего не рендерит, если поле whatsapp отсутствует или равно null', () => {
    vi.mocked(useContacts).mockReturnValue({
      data: { whatsapp: null },
    } as any);

    render(<WhatsNav />);

    expect(screen.queryByTitle('whatsapp')).not.toBeInTheDocument();
  });

  it('отображает кнопку WhatsApp с корректной ссылкой wa.me при наличии номера', () => {
    const mockPhoneNumber = '79001234567';

    vi.mocked(useContacts).mockReturnValue({
      data: { whatsapp: mockPhoneNumber },
    } as any);

    render(<WhatsNav />);

    const whatsappLink = screen.getByTitle('whatsapp');

    expect(whatsappLink).toBeInTheDocument();
    expect(whatsappLink).toHaveAttribute(
      'href',
      `https://wa.me/${mockPhoneNumber}`
    );
  });
});