import { ClipboardCheck, CookingPot, Truck } from 'lucide-react';

const STEPS = [
  { icon: ClipboardCheck, title: 'Escolha seus pratos', description: 'Todo sabado publicamos o novo cardapio. Voce monta seu pedido com os pratos que mais gosta.' },
  { icon: CookingPot, title: 'Preparamos com carinho', description: 'Cozinhamos seus pratos com ingredientes frescos selecionados, no dia da entrega.' },
  { icon: Truck, title: 'Entregamos na sua casa', description: 'Entrega refrigerada nas terca e quinta em Teresina. E so aquecer e saborear!' },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mb-4">Como Funciona</h2>
          <p className="text-primary-600 max-w-lg mx-auto">Simples assim: voce escolhe, a gente prepara e entrega na sua casa.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
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
