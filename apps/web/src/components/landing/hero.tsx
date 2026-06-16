import { ArrowDown, Leaf } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-cream overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 text-primary-100 opacity-50">
        <Leaf className="w-48 h-48" />
      </div>
      <div className="absolute bottom-20 left-5 text-accent-100 opacity-40">
        <Leaf className="w-32 h-32 rotate-45" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 relative z-10">
        <div className="max-w-2xl">
          <span className="inline-block bg-accent-100 text-accent-900 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Comida saudavel em Teresina
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-900 leading-tight mb-6">
            Comida artesanal que{' '}
            <span className="text-primary-600">nutre seu corpo</span>{' '}
            e encanta seu paladar
          </h1>
          <p className="text-lg sm:text-xl text-primary-700/80 mb-8 max-w-lg leading-relaxed">
            Refeicoes saudaveis preparadas com ingredientes frescos, entregues na sua casa.
            Cardapio que muda toda semana, sem monotonia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#cardapio"
              className="inline-flex items-center justify-center rounded-full bg-primary-700 hover:bg-primary-600 text-white text-base font-medium px-8 h-14 transition-colors"
            >
              Ver Cardapio da Semana
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center rounded-full border border-primary-300 text-primary-700 hover:bg-primary-50 text-base font-medium px-8 h-14 transition-colors"
            >
              Como Funciona
              <ArrowDown className="ml-2 w-4 h-4" />
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-6 text-sm text-primary-600">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-primary-200 border-2 border-cream flex items-center justify-center text-xs font-bold text-primary-700">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span>+100 clientes satisfeitos em Teresina</span>
          </div>
        </div>
      </div>
    </section>
  );
}
