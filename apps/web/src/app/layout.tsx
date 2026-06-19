import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    default: 'Juliana Gaspar | Cozinha Afetiva & Saudável',
    template: '%s | Juliana Gaspar',
  },
  description:
    'Refeições saudáveis preparadas com ingredientes frescos, entregues na sua casa em Teresina. Cardápio que muda toda semana, sem monotonia.',
  keywords: [
    'comida saudável',
    'refeições artesanais',
    'Teresina',
    'marmita fit',
    'comida caseira',
    'cozinha afetiva',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Juliana Gaspar',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
