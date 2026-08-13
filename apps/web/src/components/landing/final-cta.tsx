export function FinalCTA() {
  return (
    <section className="py-20 bg-primary-700 text-white">
      <div className="max-w-2xl mx-auto px-4 text-center animate-fade-in-up">
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Pronta para ter uma chef pessoal?</h2>
        <p className="text-primary-100 text-lg mb-8 leading-relaxed">
          Tenha um plano alimentar personalizado e refeições fresquinhas preparadas para você.
        </p>
        <a
          href="https://wa.me/558631427177"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-accent-500 hover:bg-accent-400 text-primary-900 text-base font-semibold px-8 h-14 transition-all hover:scale-105 active:scale-95 animate-pulse-slow"
        >
          Agendar pelo WhatsApp
        </a>
        <p className="text-primary-300 text-sm mt-4">Resposta em até 30 minutos em horário comercial</p>
      </div>
    </section>
  );
}
