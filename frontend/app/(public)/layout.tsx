import Header from "@/components/public/layout/Header";
import Footer from "@/components/public/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-clip">
        <div className="max-w-[1400px] mx-auto px-[10px] md:px-[20px]">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
