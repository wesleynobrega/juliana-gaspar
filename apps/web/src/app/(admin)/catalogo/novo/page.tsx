'use client';

import { PratoForm } from '@/features/admin/catalogo/components/prato-form';

export default function NovoPratoPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Novo Prato</h1>
      <PratoForm />
    </div>
  );
}
