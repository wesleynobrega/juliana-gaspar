'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Pencil } from 'lucide-react';
import type { PratoListItem } from '../types';

type Props = {
  pratos: PratoListItem[];
  onSelect: (id: string) => void;
};

export function PratosTabela({ pratos }: Props) {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-primary-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary-50">
            <th className="text-left py-3 px-4 font-medium text-primary-600">Nome</th>
            <th className="text-left py-3 px-4 font-medium text-primary-600 hidden sm:table-cell">
              Descrição
            </th>
            <th className="text-right py-3 px-4 font-medium text-primary-600">Preço</th>
            <th className="text-center py-3 px-4 font-medium text-primary-600">Status</th>
            <th className="text-right py-3 px-4 font-medium text-primary-600 w-16">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pratos.map((prato) => (
            <tr
              key={prato.id}
              className="border-t border-primary-50 hover:bg-primary-50/30 transition-colors"
            >
              <td className="py-3 px-4 font-medium text-primary-900">{prato.name}</td>
              <td className="py-3 px-4 text-primary-400 hidden sm:table-cell max-w-xs truncate">
                {prato.description}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-primary-900">
                {formatCurrency(prato.price)}
              </td>
              <td className="py-3 px-4 text-center">
                <Badge
                  variant={prato.available ? 'default' : 'destructive'}
                  className={`text-xs ${prato.available ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}`}
                >
                  {prato.available ? 'Sim' : 'Não'}
                </Badge>
              </td>
              <td className="py-3 px-4 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => router.push(`/catalogo/${prato.id}`)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
