import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';
import { usePathname } from 'next/navigation';
import { useContacts } from '@/lib/hooks/contactSettings';
import { itemsNavHeader, imageUrl } from '@/lib/constants';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));
vi.mock('@/lib/hooks/contactSettings', () => ({ useContacts: vi.fn() }));
vi.mock('@/components/public/layout/logo/Logo', () => ({
  default: () => <span data-testid="logo-text">Virgin Travel Studio</span>,
}));

const setup = ({
  pathname = '/',
  contacts = { logo: '' } as { logo?: string } | undefined,
} = {}) => {
  vi.mocked(usePathname).mockReturnValue(pathname);
  vi.mocked(useContacts).mockReturnValue({ data: contacts } as never);
  render(<Header />);
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  it('рендерит логотип-ссылку на главную', () => {
    setup();
    expect(
      screen.getByRole('link', { name: /На главную страницу/ }),
    ).toHaveAttribute('href', '/');
    expect(screen.getAllByTestId('logo-text').length).toBeGreaterThan(0);
  });

  it('рендерит пункты навигации', () => {
    setup();
    itemsNavHeader.forEach((tab) => {
      const links = screen.getAllByRole('link', { name: tab.label });
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute('href', `/${tab.id}`);
    });
  });

  it('подсвечивает активный пункт по pathname', () => {
    const firstTab = itemsNavHeader[0];
    setup({ pathname: `/${firstTab.id}` });

    const activeLink = screen
      .getAllByRole('link', { name: firstTab.label })
      .find(
        (el) =>
          el.className.includes('bg-[#1E2B6D]') ||
          el.className.includes('bg-white'),
      );
    expect(activeLink).toBeTruthy();
  });

  it('рендерит кнопку "Собери свой тур"', () => {
    setup();
    const links = screen.getAllByRole('link', { name: 'Собери свой тур' });
    expect(links[0]).toHaveAttribute('href', '/tours/custom');
  });

  it('рендерит ссылку на FAQ', () => {
    setup();
    expect(
      screen.getByRole('link', { name: /часто задаваемым вопросам/ }),
    ).toHaveAttribute('href', '/faq');
  });

  describe('логотип', () => {
    it('использует логотип из контактов', () => {
      setup({ contacts: { logo: 'custom-logo.png' } });
      const logos = screen.getAllByAltText(/Virgin Travel Studio|VTS/);
      const src = decodeURIComponent((logos[0] as HTMLImageElement).src);
      expect(src).toContain(imageUrl + 'custom-logo.png');
    });

    it('использует запасной логотип без контактного', () => {
      expect(() => setup({ contacts: { logo: '' } })).not.toThrow();
    });
  });

  describe('мобильное меню', () => {
    it('закрыто по умолчанию (aria-expanded false)', () => {
      setup();
      expect(
        screen.getByRole('button', { name: 'Открыть главное меню' }),
      ).toHaveAttribute('aria-expanded', 'false');
    });

    it('открывается по клику на бургер', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: 'Открыть главное меню' }),
      );

      expect(
        screen.getByRole('button', { name: 'Закрыть главное меню' }),
      ).toHaveAttribute('aria-expanded', 'true');
    });

    it('блокирует скролл body при открытии', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: 'Открыть главное меню' }),
      );
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('возвращает скролл body при закрытии', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: 'Открыть главное меню' }),
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Закрыть меню' }),
      );
      expect(document.body.style.overflow).toBe('');
    });

    it('закрывается по клику на пункт меню', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: 'Открыть главное меню' }),
      );

      const drawerLinks = screen.getAllByRole('link', {
        name: itemsNavHeader[0].label,
      });
      await userEvent.click(drawerLinks[drawerLinks.length - 1]);

      await vi.waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Открыть главное меню' }),
        ).toBeInTheDocument();
      });
    });
  });

  it('подписывается на scroll и отписывается при размонтировании', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = (() => {
      vi.mocked(usePathname).mockReturnValue('/');
      vi.mocked(useContacts).mockReturnValue({ data: { logo: '' } } as never);
      return render(<Header />);
    })();

    expect(addSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      expect.anything(),
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
