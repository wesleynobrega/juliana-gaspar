'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCatalogo } from '@/features/admin/catalogo/hooks/use-catalogo';
import { PratosLista } from '@/features/admin/catalogo/components/pratos-lista';
import { Plus } from 'lucide-react';

export default function CatalogoPage() {
  const router = useRouter();
  const { pratos, isLoading, search, setSearch } = useCatalogo();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">Catálogo</h1>
        <Button onClick={() => router.push('/catalogo/novo')} className="min-h-[48px]">
          <Plus className="w-4 h-4 mr-2" />
          Novo prato
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Buscar pratos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm min-h-[48px]"
        />
      </div>

      <PratosLista pratos={pratos} isLoading={isLoading} onSelect={(id) => router.push(`/catalogo/${id}`)} />
    </div>
  );
}
