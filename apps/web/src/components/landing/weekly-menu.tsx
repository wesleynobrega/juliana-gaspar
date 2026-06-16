import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

const DISHES = [
  { name: 'Salmao Grelhado', description: 'File de salmao ao molho de maracuja, pure de batata-doce e legumes salteados', price: 32, tags: ['Low Carb', 'Sem Gluten'], image: '🐟' },
  { name: 'Frango Parmegiana Fit', description: 'Peito de frango empanado com farinha de amendoas, molho artesanal e queijo gratinado', price: 28, tags: ['Fit', 'Proteina'], image: '🍗' },
  { name: 'Bowl de Quinoa Vegano', description: 'Quinoa, grao-de-bico, abacate, tomate cereja, cenoura ralada e molho tahine', price: 26, tags: ['Vegano', 'Sem Gluten'], image: '🥗' },
  { name: 'Carne de Panela Low Carb', description: 'Carne cozida lentamente com legumes rusticos e especiarias', price: 30, tags: ['Low Carb', 'Tradicional'], image: '🥩' },
];

export function WeeklyMenu() {
  return (
    <section id="cardapio" className="py-20 bg-cream">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-accent-700 font-medium text-sm uppercase tracking-wider">Cardapio da Semana</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mt-2 mb-4">Pratos da Semana</h2>
          <p className="text-primary-600 max-w-lg mx-auto">Cardapio renovado toda semana. Ingredientes frescos, receitas exclusivas.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DISHES.map((dish, i) => (
            <Card key={i} className="bg-white border-primary-100 hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-32 bg-primary-50 flex items-center justify-center text-5xl">{dish.image}</div>
              <div className="p-5">
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {dish.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-sage-100 text-primary-700 text-xs">{tag}</Badge>
                  ))}
                </div>
                <h3 className="font-display text-lg font-semibold text-primary-900 mb-2">{dish.name}</h3>
                <p className="text-sm text-primary-600 leading-relaxed mb-4 line-clamp-2">{dish.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary-700">
                    {formatCurrency(dish.price)}
                  </span>
                  <span className="text-xs text-primary-400">/porcao</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://wa.me/5586999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-accent-500 hover:bg-accent-400 text-primary-900 text-base font-semibold px-8 h-14 transition-colors"
          >
            Fazer Pedido pelo WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
