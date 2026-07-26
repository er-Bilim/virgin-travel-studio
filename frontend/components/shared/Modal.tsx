import {type ReactNode, useEffect, useRef} from 'react';
import {useModalStore} from '@/lib/stores/modalStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';

interface Props {
  id: string;
  children: ReactNode;
  showCloseButton?: boolean;
  title?: string;
  description?: string;
}

export function Modal({
                        id,
                        children,
                        title,
                        showCloseButton = true,
                        description
                      }: Props) {
  const {activeModalId, closeModal} = useModalStore();

  const isOpen = activeModalId === id;
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={closeModal}
    >
      <DialogContent
        className="!max-w-3xl"
        showCloseButton={showCloseButton}
        onCloseAutoFocus={(event) => {
          if (triggerRef.current) {
            event.preventDefault();
            triggerRef.current.focus();
          }
        }}
      >
        {title ? (
          <DialogTitle className="text-lg font-semibold">
            {title}
          </DialogTitle>
        ) : (
          <div className="sr-only">
            <DialogTitle>Диалоговое окно</DialogTitle>
          </div>
        )}

        {description ? (
          <DialogDescription className="text-sm text-gray-500">
            {description}
          </DialogDescription>
        ) : (
          <div className="sr-only">
            <DialogDescription>
              Содержимое модального окна
            </DialogDescription>
          </div>
        )}

        {children}
      </DialogContent>
    </Dialog>
  )
}