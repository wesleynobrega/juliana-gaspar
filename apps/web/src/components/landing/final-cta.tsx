export function FinalCTA() {
  return (
    <section className="py-20 bg-primary-700 text-white">
      <div className="max-w-2xl mx-auto px-4 text-center animate-fade-in-up">
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Pronta para comer bem sem sair de casa?</h2>
        <p className="text-primary-100 text-lg mb-8 leading-relaxed">
          Faça seu pedido agora e receba refeições saudáveis e deliciosas na sua casa.
        </p>
        <a
          href="https://wa.me/5586999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-accent-500 hover:bg-accent-400 text-primary-900 text-base font-semibold px-8 h-14 transition-all hover:scale-105 active:scale-95 animate-pulse-slow"
        >
          Pedir Agora pelo WhatsApp
        </a>
        <p className="text-primary-300 text-sm mt-4">Resposta em até 30 minutos em horário comercial</p>
      </div>
    </section>
  );
}
