'use client';
import { useContacts } from '@/lib/hooks/contactSettings';
import ContactSettingsForm from '@/components/dashboard/contactSettings/contactForm';

export default function ContactsManagePage() {
  const { data: contactSettings, isPending, error } = useContacts();
  return (
    <>
      <h2 className="text-xl font-semibold text-[#1E2B6D] mb-5">
        Редактирование Контактов
      </h2>
      {isPending ? (
        <>Loading</>
      ) : error?.cause === 404 ? (
        <ContactSettingsForm contactSettings={undefined} />
      ) : error ? (
        <>{error.message}</>
      ) : (
        <ContactSettingsForm contactSettings={contactSettings} />
      )}
    </>
  );
}
