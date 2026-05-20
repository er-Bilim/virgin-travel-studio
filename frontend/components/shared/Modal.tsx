import type {ReactNode} from 'react';
import {useModalStore} from '@/lib/stores/modalStore';
import {Dialog, DialogContent} from '@/components/ui/dialog';

interface Props {
    id: string;
    children: ReactNode;
    showCloseButton?: boolean;
}

export function Modal({ id, children, showCloseButton = true }: Props) {
    const { activeModalId, closeModal } = useModalStore();

    const isOpen = activeModalId === id;

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent showCloseButton={showCloseButton}>
                {children}
            </DialogContent>
        </Dialog>
    )
}