'use client';

import { useState } from 'react';
import { FiltrosPedidos } from '@/features/admin/pedidos/components/filtros-pedidos';
import { PedidosLista } from '@/features/admin/pedidos/components/pedidos-lista';
import { PedidoDetalhesSheet } from '@/features/admin/pedidos/components/pedido-detalhes-sheet';
import { usePedidos } from '@/features/admin/pedidos/hooks/use-pedidos';
import type { PedidoFilter } from '@/features/admin/pedidos/types';

export default function PedidosPage() {
  const { pedidos, isLoading, filters, setFilters } = usePedidos();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <h1 className="font-display text-2xl font-bold text-primary-900 mb-4">Pedidos</h1>

      <FiltrosPedidos filters={filters} onChange={setFilters} />

      <div className="flex-1 overflow-y-auto">
        <PedidosLista pedidos={pedidos} isLoading={isLoading} onSelectPedido={(id) => setSelectedId(id)} />
      </div>

      <PedidoDetalhesSheet pedidoId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
