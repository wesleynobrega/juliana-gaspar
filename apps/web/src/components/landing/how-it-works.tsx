import { ClipboardCheck, CookingPot, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    icon: ClipboardCheck,
    title: 'Plano alimentar personalizado',
    description: 'Conversamos para entender suas necessidades e restrições. Com a orientação do seu nutricionista ou médico — ou com a experiência da chef — montamos seu plano.'
  },
  {
    icon: CookingPot,
    title: 'Sessão de meal prep',
    description: 'A chef prepara suas refeições na sua casa ou na cozinha dela, com ingredientes frescos selecionados, do jeito que você gosta.'
  },
  {
    icon: CheckCircle2,
    title: 'Refeições prontas',
    description: 'Você recebe refeições saudáveis, saborosas e prontas para a semana, com praticidade e muito carinho.'
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14 animate-fade-in-up">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mb-4">Como Funciona</h2>
          <p className="text-primary-600 max-w-3xl mx-auto leading-relaxed">
            Simples assim: você pode conversar diretamente com Juliana Gaspar e discutir seu cardápio de acordo com a recomendação do(a) Nutricionista ou Médico(a). Ou se já conhece o trabalho dela, pode montar seus pratos.
          </p>
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
