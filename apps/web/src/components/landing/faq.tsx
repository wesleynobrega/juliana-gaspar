'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { q: 'Como funcionam as entregas?', a: 'Entregamos nas tercas e quintas em Teresina. Os pedidos sao refrigerados em caixas termicas. Voce recebe no conforto da sua casa.' },
  { q: 'Preciso pedir com quanta antecedencia?', a: 'Os pedidos abrem no sabado e fecham na segunda as 18h para entrega na terca. Para quinta, o prazo e quarta as 18h.' },
  { q: 'Posso congelar as refeicoes?', a: 'Sim! Nossas embalagens sao proprias para refrigeracao e congelamento. As refeicoes duram ate 5 dias na geladeira e 30 dias no freezer.' },
  { q: 'Voce atende restricoes alimentares?', a: 'Sim! Temos opcoes low carb, veganas e sem gluten. Informe suas restricoes no pedido que adaptamos.' },
  { q: 'Qual o valor minimo do pedido?', a: 'O pedido minimo e de R$ 50,00. Acima de R$ 100,00 o frete e gratis para a maioria dos bairros de Teresina.' },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mb-4">Perguntas Frequentes</h2>
          <p className="text-primary-600">Tudo que voce precisa saber para comecar.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-primary-100 rounded-xl overflow-hidden">
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
