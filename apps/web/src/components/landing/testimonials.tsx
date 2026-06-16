import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  { name: 'Ana Clara', text: 'A comida da Juliana mudou minha rotina! Pratica, deliciosa e saudavel. Recomendo demais!', rating: 5 },
  { name: 'Pedro Henrique', text: 'Finalmente encontrei comida saudavel que tem gosto de comida de verdade. O salmao e espetacular!', rating: 5 },
  { name: 'Maria Luiza', text: 'Desde que comecei a pedir, nao me preocupo mais com almoco na semana. Cardapio variado e entrega pontual.', rating: 5 },
];

export function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 bg-cream">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mb-4">Quem ja experimentou, aprova</h2>
          <p className="text-primary-600 max-w-lg mx-auto">A opiniao de quem importa: nossos clientes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} className="p-6 border-primary-100 bg-white">
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent-500 text-accent-500" />
                ))}
              </div>
              <blockquote className="text-primary-700 leading-relaxed mb-4 text-sm">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <p className="font-semibold text-primary-900 text-sm">&mdash; {t.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
