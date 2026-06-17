'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import type { PedidoListItem } from '../types';
import { PedidoCard } from './pedido-card';
import { PedidosTabela } from './pedidos-tabela';

type Props = {
  pedidos: PedidoListItem[];
  isLoading: boolean;
  onSelectPedido: (id: string) => void;
};

export function PedidosLista({ pedidos, isLoading, onSelectPedido }: Props) {
  const isTablet = useMediaQuery('(min-width: 768px)');

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <EmptyState
        title="Nenhum pedido encontrado"
        description="Ajuste os filtros ou aguarde novos pedidos."
      />
    );
  }

  if (isTablet) {
    return <PedidosTabela pedidos={pedidos} />;
  }

  return (
    <div className="space-y-3">
      {pedidos.map((pedido) => (
        <PedidoCard key={pedido.id} pedido={pedido} onPress={onSelectPedido} />
      ))}
    </div>
  );
}
