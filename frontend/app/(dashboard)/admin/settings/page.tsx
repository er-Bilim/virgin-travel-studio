'use client';

import Contacts from '@/components/dashboard/contactSettings/contacts';
import ContactSettingsForm from '@/components/dashboard/contactSettings/contactForm';
import { Button } from '@/components/ui/button';
import { useModalStore } from '@/lib/stores/modalStore';
import { Modal } from '@/components/shared/Modal';


export default function Settings() {
  const { openModal } = useModalStore();

  return (
    <section>
      <p className="mb-5">settings page</p>
      <div className="bg-white rounded-2xl py-3 px-5">
        <h2 className="text-xl font-semibold text-[#1E2B6D] mb-5">Контакты:</h2>
        <Contacts />

        <Button
          className="w-full justify-center bg-[#1E2B6D] hover:bg-[#162356] sm:w-auto"
          onClick={() => openModal('contactsForm')}
        >
          Редактиировать
        </Button>
        <Modal id="contactsForm" title='contacts'>
          <ContactSettingsForm />
        </Modal>
      </div>
    </section>
  );
}
