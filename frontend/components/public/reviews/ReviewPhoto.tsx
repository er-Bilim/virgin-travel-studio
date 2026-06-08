import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { imageUrl, isDev } from '@/lib/constants';
import Rating from '@/components/shared/Rating';
import { X } from 'lucide-react';
import ClientAvatar from '@/components/shared/ClientAvatar';

interface Props {
  src: string;
  authorName: string;
  rating: number;
}

const ReviewPhoto = ({ src, authorName, rating }: Props) => {
  const fullSrc = imageUrl + src;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Открыть фото от ${authorName}`}
          className="cursor-pointer relative w-50 h-30 overflow-hidden rounded-md border border-border transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Image
            src={fullSrc}
            alt={`Фото от ${authorName}`}
            fill
            sizes="120px"
            unoptimized={isDev}
            className="object-cover"
            priority
          />
        </button>
      </DialogTrigger>

      <DialogContent className="!max-w-[95vw] max-h-[95vh] w-fit border-0 bg-transparent p-0 shadow-none">
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Закрыть"
            className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-[var(--cyan-400)]/30 text-white backdrop-blur transition-colors hover:bg-[var(--cyan-400)]/80 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
        <VisuallyHidden>
          <DialogTitle>Фото от {authorName}</DialogTitle>
        </VisuallyHidden>

        <figure className="flex flex-col overflow-hidden rounded-lg bg-card">
          <div className="flex flex-1 items-center justify-center bg-black/95">
            <Image
              src={fullSrc}
              alt={`Фото от ${authorName}`}
              width={1920}
              height={1080}
              sizes="95vw"
              unoptimized={isDev}
              className="max-h-[50vh] w-auto max-w-[95vw] object-contain"
            />
          </div>
          <figcaption className="flex items-center justify-between border-t border-border bg-background px-4 py-3">
            <div className="flex items-center gap-2.5">
              <ClientAvatar name={authorName} />
              <span className="text-sm font-medium text-foreground">
                {authorName}
              </span>
            </div>
            <Rating value={rating} starSize={4} />
          </figcaption>
        </figure>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPhoto;
