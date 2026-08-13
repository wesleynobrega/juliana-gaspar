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
    'Chef pessoal e meal prep em Teresina: plano alimentar personalizado e refeições saudáveis preparadas na sua casa ou na cozinha da chef.',
  keywords: [
    'chef pessoal',
    'meal prep',
    'comida saudável',
    'refeições artesanais',
    'Teresina',
    'cozinha afetiva',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Juliana Gaspar',
  },
  manifest: '/manifest.json',
  themeColor: '#2D5A27',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
