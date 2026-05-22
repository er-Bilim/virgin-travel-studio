import type {ReactNode} from 'react';
import {useModalStore} from '@/lib/stores/modalStore';
import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog';

interface Props {
    id: string;
    children: ReactNode;
    showCloseButton?: boolean;
    title?: string;
}

export function Modal({ id, children, title, showCloseButton = true }: Props) {
    const { activeModalId, closeModal } = useModalStore();

    const isOpen = activeModalId === id;

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent showCloseButton={showCloseButton}>
                {title &&
                    <DialogTitle className='text-lg font-semibold'>
                        {title}
                    </DialogTitle>
                }
                {children}
            </DialogContent>
        </Dialog>
    )
}