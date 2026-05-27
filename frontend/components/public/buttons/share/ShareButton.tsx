import { PiTelegramLogo } from 'react-icons/pi';
import { FaWhatsapp } from 'react-icons/fa';
import { IoLinkOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type SharePlatform = 'telegram' | 'whatsapp' | 'copy';

interface Props {
  platform: SharePlatform;
  url: string;
  title: string;
  variant?: 'icon' | 'labeled';
  className?: string;
}

const PLATFORM_CONFIG: Record<
  SharePlatform,
  {
    label: string;
    Icon: typeof PiTelegramLogo;
    getHref?: (url: string, title: string) => string;
  }
> = {
  telegram: {
    label: 'Telegram',
    Icon: PiTelegramLogo,
    getHref: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  whatsapp: {
    label: 'Whatsapp',
    Icon: FaWhatsapp,
    getHref: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  },
  copy: {
    label: 'Скопировать',
    Icon: IoLinkOutline,
  },
};

const ShareButton = ({
  platform,
  url,
  title,
  variant = 'icon',
  className,
}: Props) => {
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.Icon;
  const isIcon = variant === 'icon';

  const buttonProps = {
    variant: 'outline' as const,
    size: (isIcon ? 'icon' : 'sm') as 'icon' | 'sm',
    className: cn(className),
  };

  const content = (
    <>
      <Icon className="size-4" aria-hidden />
      {!isIcon && <span>{config.label}</span>}
    </>
  );

  if (config.getHref) {
    return (
      <Button {...buttonProps} asChild>
        <a
          href={config.getHref(url, title)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Поделиться через ${config.label}`}
        >
          {content}
        </a>
      </Button>
    );
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Скопировано!');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function handleNativeShare(url: string, title: string) {
    if (typeof navigator === 'undefined' || !navigator.share) return;
    try {
      await navigator.share({ url, title });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  const handler =
    platform === 'copy'
      ? () => handleCopy(url)
      : () => handleNativeShare(url, title);
  const ariaLabel = platform === 'copy' ? 'Скопировать ссылку' : 'Поделиться';

  return (
    <Button {...buttonProps} onClick={handler} aria-label={ariaLabel}>
      {content}
    </Button>
  );
};

export default ShareButton;
