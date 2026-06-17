'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { catalogoService } from '../services/catalogo.service';
import type { PratoListItem } from '../types';

const dishFormSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string().min(10, 'Descrição muito curta').max(500, 'Máximo 500 caracteres'),
  price: z.coerce.number().positive('Preço deve ser positivo'),
  ingredients: z.string().min(3, 'Liste os ingredientes'),
  allergens: z.string().optional(),
  available: z.boolean(),
});

type DishFormData = z.infer<typeof dishFormSchema>;

type Props = {
  initialData?: PratoListItem | null;
  dishId?: string;
};

export function PratoForm({ initialData, dishId }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!dishId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DishFormData>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      price: initialData?.price ?? 0,
      ingredients: initialData?.ingredients ?? '',
      allergens: '',
      available: initialData?.available ?? true,
    },
  });

  const available = watch('available');

  const onSubmit = async (data: DishFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await catalogoService.update(dishId!, data);
        toast.success('Prato atualizado com sucesso!');
      } else {
        await catalogoService.create(data);
        toast.success('Prato criado com sucesso!');
      }
      router.push('/catalogo');
    } catch {
      toast.error('Erro ao salvar prato. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg">
      <Card className="border-primary-100">
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do prato *</Label>
            <Input id="name" {...register('name')} placeholder="Ex: Risoto de Camarão" className="min-h-[48px]" />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descreva o prato com detalhes"
              rows={3}
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...register('price')}
              placeholder="49.90"
              className="min-h-[48px]"
            />
            {errors.price && <p className="text-xs text-red-600">{errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredientes *</Label>
            <Textarea
              id="ingredients"
              {...register('ingredients')}
              placeholder="Liste os ingredientes principais"
              rows={2}
            />
            {errors.ingredients && <p className="text-xs text-red-600">{errors.ingredients.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergens">Alergênicos</Label>
            <Input
              id="allergens"
              {...register('allergens')}
              placeholder="Ex: Contém glúten, lactose"
              className="min-h-[48px]"
            />
          </div>

          <div className="flex items-center gap-2 min-h-[48px]">
            <Checkbox
              id="available"
              checked={available}
              onCheckedChange={(checked) => setValue('available', checked === true)}
            />
            <Label htmlFor="available" className="text-sm cursor-pointer">
              Prato disponível no cardápio
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="min-h-[48px]">
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar prato' : 'Criar prato'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/catalogo')}
              className="min-h-[48px]"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
