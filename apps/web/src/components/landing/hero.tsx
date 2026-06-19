import Image from 'next/image';
import { ArrowDown, Leaf, Star } from 'lucide-react';
const heroImg = '/imagemhero.png';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-cream overflow-hidden">
      {/* ── Decorative elements — very subtle, never competing ── */}
      <div className="absolute top-10 right-10 text-primary-100 opacity-[0.06] animate-float pointer-events-none">
        <Leaf className="w-32 h-32" />
      </div>
      <div className="absolute bottom-20 left-5 text-accent-100 opacity-[0.05] animate-float-delayed pointer-events-none">
        <Leaf className="w-24 h-24 rotate-45" />
      </div>

      {/* Decorative circles — barely there */}
      <div className="absolute top-1/4 left-[6%] w-3 h-3 rounded-full bg-accent-200 animate-pulse-slow opacity-[0.10]" />
      <div className="absolute bottom-1/3 left-[10%] w-4 h-4 rounded-full bg-primary-200 animate-pulse-slow opacity-[0.10]" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[55%] left-[12%] w-2 h-2 rounded-full bg-sage-300 animate-pulse-slow opacity-[0.10]" style={{ animationDelay: '2s' }} />

      {/* ── Main grid — closer columns for visual cohesion ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-20 md:pt-24 pb-0 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-2 lg:gap-4">

          {/* ══════ IMAGE COLUMN — prominent, anchored to bottom ══════ */}
          <div
            className="order-2 lg:order-1 flex justify-center lg:justify-start self-stretch animate-fade-in-up"
            style={{ animationDelay: '0.3s', minHeight: 'clamp(22rem, 52vw, 40rem)' }}
          >
            <div className="relative w-full h-full">
              <Image
                src={heroImg}
                alt="Juliana Gaspar — Cozinha Afetiva & Saudável"
                fill
                className="object-contain object-[50%_100%] lg:scale-110"
                priority
                sizes="(max-width: 768px) 90vw, 48vw"
              />
            </div>
          </div>

          {/* ══════ TEXT COLUMN ══════ */}
          <div
            className="order-1 lg:order-2 flex flex-col justify-center py-4 lg:py-0 animate-fade-in-up"
            style={{ animationDelay: '0.25s' }}
          >
            {/* Badge — close to headline for hierarchy */}
            <span
              className="inline-block bg-accent-100 text-accent-900 text-sm font-medium px-4 py-1.5 rounded-full mb-4 w-fit animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              Cozinha Afetiva &amp; Saudável
            </span>

            {/* Headline — ~10% smaller, natural line breaks */}
            <h1
              className="font-display font-bold text-primary-900 leading-[1.15] mb-5 animate-fade-in-up"
              style={{
                fontSize: 'clamp(1.85rem, 4.2vw, 3.2rem)',
                animationDelay: '0.55s',
                maxWidth: '16ch',
              }}
            >
              Comida saudável e caseira{' '}
              que <span className="text-primary-600">nutre seu corpo</span>{' '}
              e encanta seu paladar
            </h1>

            {/* Subtitle — discreetly stronger */}
            <p
              className="text-base sm:text-lg text-primary-800 font-medium mb-8 max-w-md leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '0.7s' }}
            >
              Refeições saudáveis preparadas com ingredientes frescos, entregues na sua casa.
              Cardápio que muda toda semana, sem monotonia.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
              style={{ animationDelay: '0.85s' }}
            >
              <a
                href="#cardapio"
                className="inline-flex items-center justify-center rounded-full bg-primary-700 hover:bg-primary-600 text-white text-base font-medium px-8 h-14 transition-all hover:scale-105 active:scale-95"
              >
                Ver Cardápio da Semana
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-full border-2 border-primary-300 text-primary-700 hover:bg-primary-50 text-base font-medium px-6 h-14 transition-all hover:scale-105 active:scale-95"
              >
                Como Funciona
                <ArrowDown className="ml-2 w-4 h-4 animate-bounce" />
              </a>
            </div>

            {/* Social proof — bolder, bigger avatars, star icon */}
            <div
              className="mt-10 flex items-center gap-5 text-primary-600 animate-fade-in-up"
              style={{ animationDelay: '1s' }}
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-primary-200 border-2 border-cream flex items-center justify-center text-xs font-bold text-primary-700 transition-transform hover:scale-110"
                    style={{ zIndex: 4 - i }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm font-semibold inline-flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-accent-500 text-accent-500" />
                +100 clientes satisfeitos em Teresina
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
