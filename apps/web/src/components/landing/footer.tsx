import Link from 'next/link';
import { ChefHat, Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary-900 text-cream-100">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <ChefHat className="w-6 h-6 text-accent-500" />
            <span className="font-display text-xl font-bold text-cream">Juliana Gaspar</span>
          </Link>
          <p className="text-sm text-cream-300 leading-relaxed">
            Comida artesanal saudável, feita com ingredientes frescos e muito carinho. Entregamos em Teresina.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-display text-cream mb-4">Links</h4>
          <nav className="space-y-2 text-sm text-cream-300">
            <a href="#como-funciona" className="block hover:text-accent-300 transition-colors">Como Funciona</a>
            <a href="#cardapio" className="block hover:text-accent-300 transition-colors">Cardápio da Semana</a>
            <a href="#diferenciais" className="block hover:text-accent-300 transition-colors">Diferenciais</a>
            <a href="#faq" className="block hover:text-accent-300 transition-colors">Perguntas Frequentes</a>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display text-cream mb-4">Contato</h4>
          <div className="space-y-3 text-sm text-cream-300">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-accent-500 shrink-0" />
              <span>Teresina, Piauí</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent-500 shrink-0" />
              <span>(86) 9XXXX-XXXX</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent-500 shrink-0" />
              <span>contato@julianagaspar.com.br</span>
            </div>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-cream-300 hover:text-accent-300 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-cream-300 hover:text-accent-300 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-800 py-4 text-center text-xs text-cream-500">
        &copy; {new Date().getFullYear()} Juliana Gaspar. Todos os direitos reservados.
      </div>
    </footer>
  );
}
