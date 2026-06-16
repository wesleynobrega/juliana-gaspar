'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChefHat } from 'lucide-react';

const NAV_LINKS = [
  { href: '#como-funciona', label: 'Como Funciona' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#diferenciais', label: 'Diferenciais' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#faq', label: 'FAQ' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-primary-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary-700 hover:text-primary-600 transition-colors">
          <ChefHat className="w-7 h-7" />
          <span className="font-display text-xl font-bold">Juliana Gaspar</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} className="text-sm text-primary-700 hover:text-primary-500 transition-colors">
              {link.label}
            </a>
          ))}
          <a
            href="#cardapio"
            className="inline-flex items-center justify-center rounded-full bg-primary-700 hover:bg-primary-600 text-white text-sm font-medium h-9 px-6 transition-colors"
          >
            Ver Cardápio
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-primary-700" aria-label="Menu">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <nav className="md:hidden bg-cream border-t border-primary-100 px-4 py-4 space-y-3">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-primary-700 hover:text-primary-500 font-medium"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cardapio"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center rounded-full bg-primary-700 hover:bg-primary-600 text-white text-sm font-medium py-2.5 mt-2 transition-colors"
          >
            Ver Cardápio
          </a>
        </nav>
      )}
    </header>
  );
}
