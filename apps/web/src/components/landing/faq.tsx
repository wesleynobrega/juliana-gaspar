'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { q: 'Como funcionam as entregas?', a: 'Entregamos nas terças e quintas em Teresina. Os pedidos são refrigerados em caixas térmicas. Você recebe no conforto da sua casa.' },
  { q: 'Preciso pedir com quanta antecedência?', a: 'Os pedidos abrem no sábado e fecham na segunda às 18h para entrega na terça. Para quinta, o prazo é quarta às 18h.' },
  { q: 'Posso congelar as refeições?', a: 'Sim! Nossas embalagens são próprias para refrigeração e congelamento. As refeições duram até 5 dias na geladeira e 30 dias no freezer.' },
  { q: 'Vocês atendem restrições alimentares?', a: 'Sim! Temos opções low carb, veganas e sem glúten. Informe suas restrições no pedido que adaptamos.' },
  { q: 'Qual o valor mínimo do pedido?', a: 'O pedido mínimo é de R$ 50,00. Acima de R$ 100,00 o frete é grátis para a maioria dos bairros de Teresina.' },
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
