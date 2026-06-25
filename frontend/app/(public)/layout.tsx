import Header from "@/components/public/layout/Header";
import Footer from "@/components/public/layout/Footer";
import WhatsNav from "@/components/public/buttons/whatsApp/whatsApp";


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-clip relative">
        <div className="max-w-[1400px] mx-auto px-[10px] md:px-[20px]">
          {children}
        </div>
        <WhatsNav/>
      </main>
      <Footer />
    </>
  );
}
