'use client';

import { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirmAction: () => void;
  onCancelAction: () => void;
};

export function ConfirmDialog({
                                open,
                                title,
                                description,
                                confirmText = 'Удалить',
                                cancelText = 'Отмена',
                                loading,
                                onConfirmAction,
                                onCancelAction,
                              }: Props) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onCancelAction}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          if (triggerRef.current) {
            event.preventDefault();
            triggerRef.current.focus();
          }
        }}
      >
        <DialogHeader className="pr-8">
          <DialogTitle>{title}</DialogTitle>

          {description ? (
            <DialogDescription>
              {description}
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">
              Диалоговое окно подтверждения
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onCancelAction}>
            {cancelText}
          </Button>

          <Button
            variant="destructive"
            onClick={onConfirmAction}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}