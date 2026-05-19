'use client';

import {
    Dialog,
    DialogContent, DialogDescription,
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

    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({
                                  open,
                                  title,
                                  description,
                                  confirmText = 'Удалить',
                                  cancelText = 'Отмена',
                                  loading,
                                  onConfirm,
                                  onCancel,
                              }: Props) {
    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader className="pr-8">
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        {cancelText}
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Загрузка...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}