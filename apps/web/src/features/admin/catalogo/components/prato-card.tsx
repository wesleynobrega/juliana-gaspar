'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { PratoListItem } from '../types';

type Props = { prato: PratoListItem; onPress: (id: string) => void };

export function PratoCard({ prato, onPress }: Props) {
  return (
    <Card
      className="cursor-pointer active:bg-primary-50/50 min-h-[88px] transition-colors border-primary-100"
      onClick={() => onPress(prato.id)}
      role="button"
      tabIndex={0}
      aria-label={prato.name}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onPress(prato.id);
      }}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-xl flex-shrink-0">
            🍽️
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate text-primary-900">{prato.name}</h3>
            <p className="text-xs text-primary-400 line-clamp-1">{prato.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge
            variant={prato.available ? 'default' : 'destructive'}
            className={`text-xs ${prato.available ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}`}
          >
            {prato.available ? 'Disponível' : 'Indisponível'}
          </Badge>
          <span className="font-bold text-primary-900 text-sm">{formatCurrency(prato.price)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
