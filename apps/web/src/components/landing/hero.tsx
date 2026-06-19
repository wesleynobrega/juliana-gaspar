import Image from 'next/image';
import { ArrowDown, Leaf } from 'lucide-react';
const heroImg = '/imagemhero.png';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-cream overflow-hidden">
      {/* Decorative animated leaves */}
      <div className="absolute top-10 right-10 text-primary-100 opacity-50 animate-float">
        <Leaf className="w-48 h-48" />
      </div>
      <div className="absolute bottom-20 left-5 text-accent-100 opacity-40 animate-float-delayed">
        <Leaf className="w-32 h-32 rotate-45" />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-10 w-3 h-3 rounded-full bg-accent-200 animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-4 h-4 rounded-full bg-primary-200 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-20 w-2 h-2 rounded-full bg-sage-300 animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="max-w-6xl mx-auto px-4 pt-20 pb-0 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-end">
          {/* Hero image column — anchored to bottom, fills same height as text */}
          <div className="hidden lg:flex justify-center items-end self-stretch animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-full h-full min-h-[28rem]">
              <Image
                src={heroImg}
                alt="Juliana Gaspar - Cozinha Afetiva & Saudável"
                fill
                className="object-contain object-bottom"
                priority
                sizes="(max-width: 1024px) 0px, 50vw"
              />
            </div>
          </div>

          {/* Text column */}
          <div className="animate-fade-in-up pb-20">
            <span className="inline-block bg-accent-100 text-accent-900 text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Cozinha Afetiva &amp; Saudável
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-900 leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              Comida saudável e caseira que{' '}
              <span className="text-primary-600">nutre seu corpo</span>{' '}
              e encanta seu paladar
            </h1>
            <p className="text-lg sm:text-xl text-primary-700/80 mb-8 max-w-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              Refeições saudáveis preparadas com ingredientes frescos, entregues na sua casa.
              Cardápio que muda toda semana, sem monotonia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '1s' }}>
              <a
                href="#cardapio"
                className="inline-flex items-center justify-center rounded-full bg-primary-700 hover:bg-primary-600 text-white text-base font-medium px-8 h-14 transition-all hover:scale-105 active:scale-95"
              >
                Ver Cardápio da Semana
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-full border border-primary-300 text-primary-700 hover:bg-primary-50 text-base font-medium px-8 h-14 transition-all hover:scale-105 active:scale-95"
              >
                Como Funciona
                <ArrowDown className="ml-2 w-4 h-4 animate-bounce" />
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center gap-6 text-sm text-primary-600 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-primary-200 border-2 border-cream flex items-center justify-center text-xs font-bold text-primary-700 transition-transform hover:scale-110" style={{ zIndex: 4 - i }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span>+100 clientes satisfeitos em Teresina</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
