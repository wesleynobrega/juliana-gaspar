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
    default: 'Juliana Gaspar | Comida Artesanal Saudavel',
    template: '%s | Juliana Gaspar',
  },
  description:
    'Refeicoes artesanais saudaveis entregues em Teresina. Cardapio semanal com ingredientes frescos e receitas exclusivas.',
  keywords: [
    'comida saudavel',
    'refeicoes artesanais',
    'Teresina',
    'marmita fit',
    'comida caseira',
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
