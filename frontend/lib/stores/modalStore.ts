import {create} from 'zustand';

interface ModalStore {
    activeModalId: string | null;
    openModal: (id: string) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
    activeModalId: null,
    openModal: (id) => set({ activeModalId: id }),
    closeModal: () => set({ activeModalId: null }),
}));