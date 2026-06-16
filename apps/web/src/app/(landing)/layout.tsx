import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { WhatsAppButton } from '@/components/landing/whatsapp-button';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
