'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import type { PratoListItem } from '../types';
import { PratoCard } from './prato-card';
import { PratosTabela } from './pratos-tabela';

type Props = {
  pratos: PratoListItem[];
  isLoading: boolean;
  onSelect: (id: string) => void;
};

export function PratosLista({ pratos, isLoading, onSelect }: Props) {
  const isTablet = useMediaQuery('(min-width: 768px)');

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-primary-100">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-3/4 bg-primary-100 rounded" />
                <div className="h-3 w-1/2 bg-primary-50 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pratos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-primary-400">Nenhum prato encontrado.</p>
      </div>
    );
  }

  if (isTablet) {
    return <PratosTabela pratos={pratos} onSelect={onSelect} />;
  }

  return (
    <div className="space-y-3">
      {pratos.map((prato) => (
        <PratoCard key={prato.id} prato={prato} onPress={() => onSelect(prato.id)} />
      ))}
    </div>
  );
}
