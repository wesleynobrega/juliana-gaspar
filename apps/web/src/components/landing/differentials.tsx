import { Leaf, Award, Clock, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ITEMS = [
  { icon: Leaf, title: 'Ingredientes Frescos', description: 'Selecionamos os melhores ingredientes em feiras locais. Nada de ultraprocessados.' },
  { icon: Award, title: 'Receitas Exclusivas', description: 'Cada prato e uma criacao original, equilibrando sabor e nutricao.' },
  { icon: Clock, title: 'Frescor Garantido', description: 'Preparamos no dia da entrega. Voce recebe a comida ainda fresca, pronta para consumir.' },
  { icon: Truck, title: 'Entrega Refrigerada', description: 'Entregamos em caixas termicas para manter a temperatura e qualidade ideais.' },
];

export function Differentials() {
  return (
    <section id="diferenciais" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mb-4">Por que escolher a Juliana?</h2>
          <p className="text-primary-600 max-w-lg mx-auto">Nao e so comida. E uma experiencia gastronomica que cuida de voce.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map((item, i) => (
            <Card key={i} className="p-6 border-primary-100 hover:border-primary-300 transition-colors text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary-900 mb-2">{item.title}</h3>
              <p className="text-sm text-primary-600 leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
