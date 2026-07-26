"use client";
import { useContacts } from '@/lib/hooks/contactSettings';
import { FaWhatsapp } from 'react-icons/fa';


export default function WhatsNav() {
    const { data: settings } = useContacts();

    const url = settings
      ? settings.whatsapp
        ? `https://wa.me/${settings.whatsapp}`
        : null
      : null;

    return (
      <>
        {url && (
          <div className="w-10 md:w-15 fixed bottom-6 md:bottom-13 right-6 md:right-13">
            <a
              href={url}
              title="whatsapp"
              className="w-full block bg-slate-50 p-1 rounded-2xl"
            >
              <FaWhatsapp className="w-full h-full fill-green-800" />
            </a>
          </div>
        )}
      </>
    );
}