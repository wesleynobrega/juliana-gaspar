import { ClipboardCheck, CookingPot, Truck } from 'lucide-react';

const STEPS = [
  { icon: ClipboardCheck, title: 'Monte suas refeições', description: 'Escolha proteína, carboidrato, fibra e gordura para cada refeição. Salve seus combos favoritos para pedir mais rápido.' },
  { icon: CookingPot, title: 'Preparamos com carinho', description: 'Cozinhamos seus pratos com ingredientes frescos selecionados, no dia da entrega.' },
  { icon: Truck, title: 'Entregamos na sua casa', description: 'Entrega refrigerada nas terças e quintas em Teresina. É só aquecer e saborear!' },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14 animate-fade-in-up">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mb-4">Como Funciona</h2>
          <p className="text-primary-600 max-w-lg mx-auto">Simples assim: você monta cada refeição, a gente prepara com ficha técnica e entrega na sua casa.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform hover:scale-110">
                <step.icon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary-900 mb-3">{step.title}</h3>
              <p className="text-primary-600 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
