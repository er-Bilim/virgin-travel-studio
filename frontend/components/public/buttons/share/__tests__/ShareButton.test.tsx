import { render, screen } from '@testing-library/react';
import ShareButton from '@/components/public/buttons/share/ShareButton';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('ShareButton', () => {
  const url = 'https://site.kg/news/1';
  const title = 'Заголовок';

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('платформы со ссылкой', () => {
    it('telegram: рендерит ссылку с url и title в параметрах', () => {
      render(<ShareButton platform="telegram" url={url} title={title} />);
      const link = screen.getByRole('link', {
        name: 'Поделиться через Telegram',
      });
      expect(link).toHaveAttribute(
        'href',
        expect.stringContaining('t.me/share/url'),
      );
      expect(link.getAttribute('href')).toContain(encodeURIComponent(url));
    });

    it('открывается в новой вкладке с noopener noreferrer', () => {
      render(<ShareButton platform="telegram" url={url} title={title} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('whatsapp без number: ссылка с текстом', () => {
      render(<ShareButton platform="whatsapp" url={url} title={title} />);
      const href = screen.getByRole('link').getAttribute('href')!;
      expect(href).toContain('wa.me/?text=');
    });

    it('whatsapp с number: ссылка на конкретный номер без текста', () => {
      render(
        <ShareButton
          platform="whatsapp"
          url={url}
          title={title}
          number="+996 550 176-420"
        />,
      );
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://wa.me/996550176420',
      );
    });

    it('instagram: собирает ссылку на профиль, убирая @', () => {
      render(
        <ShareButton platform="instagram" url="@virgin_travel" title={title} />,
      );
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://instagram.com/virgin_travel',
      );
    });
  });

  describe('variant', () => {
    it('icon (по умолчанию): подпись не показывается', () => {
      render(<ShareButton platform="telegram" url={url} title={title} />);
      expect(screen.queryByText('Telegram')).not.toBeInTheDocument();
    });

    it('labeled: подпись показывается', () => {
      render(
        <ShareButton
          platform="telegram"
          url={url}
          title={title}
          variant="labeled"
        />,
      );
      expect(screen.getByText('Telegram')).toBeInTheDocument();
    });
  });

  describe('copy', () => {
    it('рендерится как кнопка, а не ссылка', () => {
      render(<ShareButton platform="copy" url={url} title={title} />);
      expect(
        screen.getByRole('button', { name: 'Скопировать ссылку' }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('по клику копирует url в буфер и показывает тост', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      render(<ShareButton platform="copy" url={url} title={title} />);
      await userEvent.click(screen.getByRole('button'));

      expect(writeText).toHaveBeenCalledWith(url);
      expect(toast.success).toHaveBeenCalledWith('Скопировано!');
    });
  });
});
