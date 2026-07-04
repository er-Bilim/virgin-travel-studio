'use client';

import Contacts from '@/components/dashboard/contactSettings/contacts';
import ContactSettingsForm from '@/components/dashboard/contactSettings/contactForm';
import { Button } from '@/components/ui/button';
import { useModalStore } from '@/lib/stores/modalStore';
import { Modal } from '@/components/shared/Modal';
import HomepageSettingsForm from '@/components/dashboard/homepageSettings/HomepageSettingsForm';
import FaqManagement from '@/components/dashboard/faqSettings/FaqManagement';

export default function Settings() {
  const { openModal } = useModalStore();

  return (
    <div className="space-y-8 bg-gray-50 p-8 max-[700px]:p-4 max-[480px]:p-3">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D]">
          Общие настройки платформы
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/60">
        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
          <h2 className="text-xl font-semibold text-[#1E2B6D]">
            Контактные данные компании
          </h2>
        </div>

        <Contacts />

        <Button
          className="w-full justify-center bg-[#1E2B6D] hover:bg-[#162356] sm:w-auto rounded-xl px-6"
          onClick={() => openModal('contactsForm')}
        >
          Редактировать контакты
        </Button>

        <Modal id="contactsForm" title="Редактирование контактов">
          <ContactSettingsForm />
        </Modal>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/60">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
          <h2 className="text-xl font-semibold text-[#1E2B6D]">
            Управление контентом страниц сайта
          </h2>
        </div>

        <HomepageSettingsForm />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/60">
        <FaqManagement />
      </div>
    </div>
  );
}
