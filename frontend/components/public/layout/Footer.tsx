import Link from "next/link";
import Logo from "@/components/public/layout/logo/Logo";
import iconLogo from "@/assets/Logo_favicon_32_32_2.png";
import Image from "next/image";
import {
    FaInstagram,
    FaTelegramPlane,
    FaWhatsapp,
    FaFacebook
} from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-[#1E2B6D] text-white">
            <div className="mx-auto max-w-[1400px] px-4 py-12">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    <div>
                        <Link href="/" className="flex items-center gap-2">
                            <Image src={iconLogo} className="h-6 w-auto" alt="Логотип" />
                            <Logo />
                        </Link>

                        <p className="mt-3 text-sm text-white/70">
                            Создаём незабываемые путешествия и впечатления по всему миру.
                        </p>
                    </div>

                    <nav className="flex flex-col gap-2 text-sm text-white/80">
                        <Link href="/" className="hover:text-white transition">Главная</Link>
                        <Link href="/tours" className="hover:text-white transition">Туры</Link>
                        <Link href="/about" className="hover:text-white transition">О нас</Link>
                        <Link href="/contacts" className="hover:text-white transition">Контакты</Link>
                    </nav>

                    <address className="not-italic flex flex-col gap-2 text-sm text-white/80">
                        <a href="tel:+996700000000" className="hover:text-white transition">
                            +996 700 000 000
                        </a>

                        <a href="mailto:hello@site.com" className="hover:text-white transition">
                            hello@site.com
                        </a>

                        <span>Бишкек, Кыргызстан</span>
                    </address>

                    <div className="flex flex-col gap-4">

                        <div className="flex gap-4">
                            <a href="#" aria-label="Instagram">
                                <FaInstagram className="h-5 w-5 hover:scale-110 transition" />
                            </a>

                            <a href="#" aria-label="Telegram">
                                <FaTelegramPlane className="h-5 w-5 hover:scale-110 transition" />
                            </a>

                            <a href="#" aria-label="WhatsApp">
                                <FaWhatsapp className="h-5 w-5 hover:scale-110 transition" />
                            </a>

                            <a href="#" aria-label="Facebook">
                                <FaFacebook className="h-5 w-5 hover:scale-110 transition" />
                            </a>
                        </div>

                        <Link href="/privacy" className="text-sm text-white/70 hover:text-white transition">
                            Политика конфиденциальности (в разработке (надо ли?))
                        </Link>

                    </div>

                </div>

                <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60 flex flex-col md:flex-row justify-between gap-2">
                    <span>© 2026 Virgin Travel Studio. Все права защищены.</span>
                    <span>Создаём ваши лучшие воспоминания</span>
                </div>

            </div>
        </footer>
    );
}