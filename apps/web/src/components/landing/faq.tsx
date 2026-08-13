'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { q: 'Como funciona o serviço de chef pessoal?', a: 'A Juliana monta um plano alimentar personalizado para você — com base na orientação do seu nutricionista ou médico, ou na experiência dela — e prepara suas refeições em sessões de meal prep, na sua casa ou na cozinha da chef.' },
  { q: 'Onde acontece o meal prep?', a: 'Você escolhe: no conforto da sua casa ou na cozinha da chef. Cada opção tem um valor próprio, e você pode adicionar o serviço de compras para não se preocupar com os ingredientes.' },
  { q: 'Preciso de orientação de um profissional de saúde?', a: 'Não é obrigatório. Você pode trazer a orientação do seu nutricionista ou médico, ou confiar na experiência da chef para montar um plano que combine com seus objetivos e restrições.' },
  { q: 'Vocês atendem restrições alimentares?', a: 'Sim! Adaptamos o plano e as preparações para restrições, alergias e preferências — low carb, vegano, sem glúten e muito mais.' },
  { q: 'Quanto tempo duram as refeições?', a: 'As refeições ficam frescas na geladeira por até 5 dias e podem ser congeladas por até 30 dias, em embalagens próprias.' },
  { q: 'Como faço para agendar?', a: 'É só chamar no WhatsApp e combinar o melhor dia e local para a sua sessão de meal prep.' },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-14 animate-fade-in-up">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mb-4">Perguntas Frequentes</h2>
          <p className="text-primary-600">Tudo que você precisa saber para começar.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-primary-100 rounded-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-primary-50/50 transition-colors min-h-[48px]"
              >
                <span className="font-medium text-primary-900 pr-4 text-sm sm:text-base">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-primary-500 shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-sm text-primary-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
