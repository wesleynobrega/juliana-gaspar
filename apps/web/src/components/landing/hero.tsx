"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowDown, Leaf, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&q=80",
    alt: "Legumes e carne na tigela",
  },
  {
    src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&q=80",
    alt: "Tigela de saladas de legumes",
  },
  {
    src: "https://images.unsplash.com/photo-1547592180-85f173990554?w=1920&q=80",
    alt: "Salada de legumes fresca",
  },
  {
    src: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1920&q=80",
    alt: "Close-up de salada de legumes",
  },
  {
    src: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=1920&q=80",
    alt: "Salada de legumes na tigela branca",
  },
  {
    src: "https://plus.unsplash.com/premium_photo-1663858367108-9150fe5ce9bd?w=1920&q=80",
    alt: "Tigela branca com salada e garfo",
  },
  {
    src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1920&q=80",
    alt: "Comida cozida na tigela preta",
  },
];

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
      <div
        className="absolute bottom-1/3 left-[10%] w-4 h-4 rounded-full bg-primary-200 animate-pulse-slow opacity-[0.10]"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-[55%] left-[12%] w-2 h-2 rounded-full bg-sage-300 animate-pulse-slow opacity-[0.10]"
        style={{ animationDelay: "2s" }}
      />

      {/* ── Carousel Background ── */}
      <HeroCarousel />

      {/* ── Text Content Overlay ── */}
      <HeroTextContent />
    </section>
  );
}

function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="absolute inset-0 z-0" ref={emblaRef}>
      <div className="flex h-full">
        {HERO_IMAGES.map((img, index) => (
          <div className="relative flex-[0_0_100%] h-full" key={index}>
            <img
              src={img.src}
              alt={img.alt}
              className="absolute inset-0 object-cover w-full h-full"
              loading={index === 0 ? "eager" : "lazy"}
            />
            {/* Overlay for better text contrast */}
            <div className="absolute inset-0 bg-linear-to-t from-cream/80 via-cream/30 to-transparent lg:bg-linear-to-r lg:from-cream lg:via-cream/70 lg:to-transparent" />
          </div>
        ))}
      </div>
      {/* Carousel Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              selectedIndex === index
                ? "bg-primary-700 scale-125"
                : "bg-primary-200"
            }`}
            aria-label={`Ir para imagem ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function HeroTextContent() {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-4 md:pt-5 pb-0 relative z-10 w-full">
      {/* ── Main grid — the image column is a spacer; carousel runs in background ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-2 lg:gap-4">
        {/* ══════ IMAGE COLUMN — spacer, pushes text into place ══════ */}
        <div
          className="order-2 lg:order-2 self-stretch"
          style={{
            minHeight: "clamp(22rem, 52vw, 40rem)",
          }}
        />

        {/* ══════ TEXT COLUMN ══════ */}
        <div
          className="order-1 lg:order-1 flex flex-col justify-center py-4 lg:py-0 animate-fade-in-up"
          style={{ animationDelay: "0.25s" }}
        >
          {/* Badge — close to headline for hierarchy */}
          <span
            className="inline-block bg-accent-100 text-accent-900 text-sm font-medium px-4 py-1.5 rounded-full mb-4 w-fit animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Cozinha Afetiva & Saudável
          </span>

          {/* Headline — ~10% smaller, natural line breaks */}
          <h1
            className="font-display font-bold text-primary-900 leading-[1.15] mb-5 animate-fade-in-up"
            style={{
              fontSize: "clamp(1.85rem, 4.2vw, 3.2rem)",
              animationDelay: "0.55s",
              maxWidth: "16ch",
            }}
          >
            {"Comida saudável e caseira que "}
            <span className="text-primary-600">nutre seu corpo</span>
            {" e encanta seu paladar"}
          </h1>

          {/* Subtitle — discreetly stronger */}
          <p
            className="text-base sm:text-lg text-primary-800 font-medium mb-8 max-w-md leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.7s" }}
          >
            Monte cada refeição do seu jeito: escolha proteína, carboidrato e
            acompanhamentos. Cardápio que muda toda semana, entregue na sua
            casa.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.85s" }}
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
            style={{ animationDelay: "1s" }}
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
  );
}
