import type {Metadata} from 'next';
import {Montserrat} from 'next/font/google';
import {Toaster} from '@/components/ui/sonner';
import './globals.css';
import Providers from '@/providers/providers';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Virgin Travel',
  description: '',
  icons: {
    icon: `/logo/logo.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${montserrat.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
