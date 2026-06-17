'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { PratoForm } from '@/features/admin/catalogo/components/prato-form';
import { catalogoService } from '@/features/admin/catalogo/services/catalogo.service';
import type { PratoListItem } from '@/features/admin/catalogo/types';

export default function EditarPratoPage() {
  const { dishId } = useParams<{ dishId: string }>();
  const [prato, setPrato] = useState<PratoListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dishId) return;
    catalogoService
      .getById(dishId)
      .then(setPrato)
      .catch(() => setError('Prato não encontrado.'))
      .finally(() => setIsLoading(false));
  }, [dishId]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 rounded-2xl max-w-lg" />
      </div>
    );
  }

  if (error || !prato) {
    return (
      <div className="text-center py-16">
        <p className="text-primary-400">{error || 'Prato não encontrado.'}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Editar Prato</h1>
      <PratoForm initialData={prato} dishId={dishId} />
    </div>
  );
}
