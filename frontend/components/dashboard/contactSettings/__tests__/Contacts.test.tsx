import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contacts from '../contacts';
import { useContacts } from '@/lib/hooks/contactSettings';
import { imageUrl } from '@/lib/constants';

vi.mock('@/lib/hooks/contactSettings', () => ({ useContacts: vi.fn() }));

const fullContacts = {
  logo: 'brand.png',
  phone: '+996 703 754 456',
  email: 'virgin.travel@agency.com',
  address: 'г. Бишкек, ул. 7 апреля, д. 94',
  instagram: 'virgin_travel',
  telegram: 'virgin_tg',
  whatsapp: '996703754456',
  facebook: 'virgintravel',
  mapEmbedUrl: 'https://maps.google.com/embed?pb=123',
};

const setup = ({
  contacts = fullContacts as Partial<typeof fullContacts> | undefined,
  isPending = false,
  error = null as Error | null,
} = {}) => {
  vi.mocked(useContacts).mockReturnValue({
    data: contacts,
    isPending,
    error,
  } as never);
  render(<Contacts />);
};

describe('Contacts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает лоадер при загрузке', () => {
    setup({ isPending: true });
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('показывает сообщение об ошибке', () => {
    setup({ error: new Error('Не удалось загрузить') });
    expect(screen.getByText('Не удалось загрузить')).toBeInTheDocument();
  });

  it('показывает основные контакты', () => {
    setup();
    expect(screen.getByText('+996 703 754 456')).toBeInTheDocument();
    expect(screen.getByText('virgin.travel@agency.com')).toBeInTheDocument();
    expect(
      screen.getByText('г. Бишкек, ул. 7 апреля, д. 94'),
    ).toBeInTheDocument();
  });

  describe('логотип', () => {
    it('показывает изображение при наличии', () => {
      setup();
      const img = screen.getByAltText('Логотип компании') as HTMLImageElement;
      expect(decodeURIComponent(img.src)).toContain(imageUrl + 'brand.png');
    });

    it('показывает "Не указан" без логотипа', () => {
      setup({ contacts: { ...fullContacts, logo: '' } });
      expect(screen.queryByAltText('Логотип компании')).not.toBeInTheDocument();
      expect(screen.getByText('Не указан')).toBeInTheDocument();
    });
  });

  describe('соцсети', () => {
    it('рендерит Instagram со ссылкой', () => {
      setup();
      const link = screen.getByRole('link', { name: /Instagram/ });
      expect(link).toHaveAttribute(
        'href',
        'https://instagram.com/virgin_travel',
      );
    });

    it('рендерит Telegram со ссылкой', () => {
      setup();
      expect(screen.getByRole('link', { name: /Telegram/ })).toHaveAttribute(
        'href',
        'https://t.me/virgin_tg',
      );
    });

    it('рендерит WhatsApp со ссылкой', () => {
      setup();
      expect(screen.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute(
        'href',
        'https://wa.me/996703754456',
      );
    });

    it('рендерит Facebook со ссылкой', () => {
      setup();
      expect(screen.getByRole('link', { name: /Facebook/ })).toHaveAttribute(
        'href',
        'https://facebook.com/virgintravel',
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
        screen.queryByRole('link', { name: /Instagram/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /Facebook/ }),
      ).not.toBeInTheDocument();
    });

    it('соцсети открываются в новой вкладке с rel', () => {
      setup();
      const link = screen.getByRole('link', { name: /Instagram/ });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('карта', () => {
    it('показывает кнопку при наличии mapEmbedUrl', () => {
      setup();
      expect(
        screen.getByRole('button', { name: /Посмотреть карту/ }),
      ).toBeInTheDocument();
    });

    it('показывает "Не указана" без mapEmbedUrl', () => {
      setup({ contacts: { ...fullContacts, mapEmbedUrl: '' } });
      expect(screen.getByText('Не указана')).toBeInTheDocument();
    });

    it('открывает модалку с картой', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: /Посмотреть карту/ }),
      );

      expect(
        screen.getByText('Проверка карты из настроек'),
      ).toBeInTheDocument();
      expect(
        screen.getByTitle('Предпросмотр карты администратором'),
      ).toBeInTheDocument();
    });

    it('показывает лоадер карты до загрузки iframe', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: /Посмотреть карту/ }),
      );

      expect(
        screen.getByText('Загрузка данных Google Maps...'),
      ).toBeInTheDocument();
    });

    it('скрывает лоадер после загрузки iframe', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: /Посмотреть карту/ }),
      );

      const iframe = screen.getByTitle('Предпросмотр карты администратором');
      iframe.dispatchEvent(new Event('load'));

      await waitFor(() =>
        expect(
          screen.queryByText('Загрузка данных Google Maps...'),
        ).not.toBeInTheDocument(),
      );
    });

    it('закрывает модалку по кнопке', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: /Посмотреть карту/ }),
      );
      expect(
        screen.getByText('Проверка карты из настроек'),
      ).toBeInTheDocument();

      const closeButtons = screen.getAllByRole('button');
      await userEvent.click(closeButtons[closeButtons.length - 1]);

      await waitFor(() =>
        expect(
          screen.queryByText('Проверка карты из настроек'),
        ).not.toBeInTheDocument(),
      );
    });
  });
});
