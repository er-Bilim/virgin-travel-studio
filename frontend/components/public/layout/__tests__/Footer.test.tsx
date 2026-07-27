import { render, screen } from '@testing-library/react';
import Footer from '../Footer';
import { useContacts } from '@/lib/hooks/contactSettings';
import { imageUrl } from '@/lib/constants';

vi.mock('@/lib/hooks/contactSettings', () => ({ useContacts: vi.fn() }));
vi.mock('@/components/public/layout/logo/Logo', () => ({
  default: () => <span data-testid="logo-text">Virgin Travel Studio</span>,
}));
vi.mock('@/assets/Logo_favicon_32_32_2.png', () => ({
  default: { src: '/fallback-logo.png' },
}));

const fullContacts = {
  logo: 'brand.png',
  phone: '+996 703 754 456',
  email: 'virgin.travel@agency.com',
  address: 'г. Бишкек, ул. 7 апреля, д. 94',
  instagram: 'virgin_travel',
  telegram: '@virgin_tg',
  whatsapp: '+996703754456',
  facebook: 'virgintravel',
};

const setup = ({
  contacts = fullContacts as Partial<typeof fullContacts> | undefined,
  error = null as unknown,
} = {}) => {
  vi.mocked(useContacts).mockReturnValue({ data: contacts, error } as never);
  render(<Footer />);
};

describe('Footer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('рендерит логотип-ссылку на главную', () => {
    setup();
    const homeLink = screen
      .getAllByRole('link')
      .find((l) => l.getAttribute('href') === '/');
    expect(homeLink).toBeTruthy();
    expect(screen.getByTestId('logo-text')).toBeInTheDocument();
  });

  it('рендерит навигационные ссылки', () => {
    setup();
    expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Туры' })).toHaveAttribute(
      'href',
      '/tours',
    );
    expect(screen.getByRole('link', { name: 'О нас' })).toHaveAttribute(
      'href',
      '/about',
    );
    expect(screen.getByRole('link', { name: 'Контакты' })).toHaveAttribute(
      'href',
      '/contacts',
    );
  });

  describe('логотип', () => {
    it('использует логотип из контактов', () => {
      setup({ contacts: { ...fullContacts, logo: 'brand.png' } });
      const img = screen.getByAltText('Логотип') as HTMLImageElement;
      expect(decodeURIComponent(img.src)).toContain(imageUrl + 'brand.png');
    });

    it('использует запасной логотип без контактного', () => {
      setup({ contacts: { ...fullContacts, logo: '' } });
      const img = screen.getByAltText('Логотип') as HTMLImageElement;
      expect(decodeURIComponent(img.src)).toContain('/fallback-logo.png');
    });
  });

  describe('телефон', () => {
    it('показывает телефон из контактов как tel-ссылку', () => {
      setup();
      const phone = screen.getByRole('link', { name: '+996 703 754 456' });
      expect(phone).toHaveAttribute('href', 'tel:+996 703 754 456');
    });

    it('показывает дефолтный телефон без контактного', () => {
      setup({ contacts: { ...fullContacts, phone: '' } });
      expect(screen.getByText('+996 700 000 000')).toBeInTheDocument();
    });
  });

  describe('email', () => {
    it('показывает email как mailto-ссылку', () => {
      setup();
      expect(
        screen.getByRole('link', { name: 'virgin.travel@agency.com' }),
      ).toHaveAttribute('href', 'mailto:virgin.travel@agency.com');
    });

    it('не рендерит email, если его нет', () => {
      setup({ contacts: { ...fullContacts, email: '' } });
      expect(screen.queryByText(/agency\.com/)).not.toBeInTheDocument();
    });
  });

  describe('адрес', () => {
    it('показывает адрес из контактов', () => {
      setup();
      expect(
        screen.getByText('г. Бишкек, ул. 7 апреля, д. 94'),
      ).toBeInTheDocument();
    });

    it('показывает заглушку без адреса', () => {
      setup({ contacts: { ...fullContacts, address: '' } });
      expect(screen.getByText('Адрес не прописан')).toBeInTheDocument();
    });
  });

  describe('соцсети', () => {
    it('рендерит Instagram с очищенной ссылкой', () => {
      setup();
      expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
        'href',
        'https://www.instagram.com/virgin_travel',
      );
    });

    it('обрезает первый символ у telegram', () => {
      setup();
      expect(screen.getByRole('link', { name: 'Telegram' })).toHaveAttribute(
        'href',
        'https://t.me/virgin_tg',
      );
    });

    it('обрезает первый символ у whatsapp', () => {
      setup();
      expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
        'href',
        'https://wa.me/996703754456',
      );
    });

    it('рендерит Facebook', () => {
      setup();
      expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
        'href',
        'https://www.facebook.com/virgintravel',
      );
    });

    it('не рендерит соцсети без данных', () => {
      setup({
        contacts: {
          ...fullContacts,
          instagram: '',
          telegram: '',
          whatsapp: '',
          facebook: '',
        },
      });
      expect(
        screen.queryByRole('link', { name: 'Instagram' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Telegram' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'WhatsApp' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Facebook' }),
      ).not.toBeInTheDocument();
    });

    it('соцсети открываются в новой вкладке с rel', () => {
      setup();
      const insta = screen.getByRole('link', { name: 'Instagram' });
      expect(insta).toHaveAttribute('target', '_blank');
      expect(insta).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('показывает ошибку загрузки контактов', () => {
    setup({ error: new Error('fail') });
    expect(
      screen.getByText(/Не удалось загрузить контакты/),
    ).toBeInTheDocument();
  });

  it('не показывает ошибку при успешной загрузке', () => {
    setup();
    expect(
      screen.queryByText(/Не удалось загрузить контакты/),
    ).not.toBeInTheDocument();
  });

  it('рендерит копирайт', () => {
    setup();
    expect(screen.getByText(/© 2026 Virgin Travel Studio/)).toBeInTheDocument();
  });
});
