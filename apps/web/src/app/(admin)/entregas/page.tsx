'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { api } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Truck, Plus, Pencil, Trash2, MapPin } from 'lucide-react';

interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  fee: number;
}

interface DeliveryManifestOrder {
  id: string;
  customer: { name: string; phone: string; address: string };
  deliveryAddress: string;
  deliveryDate?: string;
  status: string;
  totalAmount: number;
  items: Array<{ dish: { name: string } }>;
}

const emptyForm = { name: '', description: '', fee: '0' };

export default function EntregasPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeliveryZone | null>(null);

  // Manifest
  const [manifestOpen, setManifestOpen] = useState(false);
  const [manifest, setManifest] = useState<DeliveryManifestOrder[]>([]);
  const [manifestDate, setManifestDate] = useState('');
  const [manifestZoneId, setManifestZoneId] = useState('');
  const [manifestLoading, setManifestLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: DeliveryZone[] }>('/delivery/zones');
      setZones(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      setError('Não foi possível carregar as zonas de entrega.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (z: DeliveryZone) => {
    setEditingId(z.id);
    setForm({ name: z.name, description: z.description ?? '', fee: String(z.fee) });
    setSheetOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nome é obrigatório.');
      return;
    }
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        fee: parseFloat(form.fee) || 0,
      };
      if (editingId) {
        await api.put(`/delivery/zones/${editingId}`, payload);
        toast.success('Zona atualizada!');
      } else {
        await api.post('/delivery/zones', payload);
        toast.success('Zona criada!');
      }
      setSheetOpen(false);
      load();
    } catch {
      toast.error('Erro ao salvar zona de entrega.');
    }
  };

  const handleDeleteClick = (z: DeliveryZone) => {
    setDeleteTarget(z);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/delivery/zones/${deleteTarget.id}`);
      toast.success('Zona removida!');
      load();
    } catch {
      toast.error('Erro ao remover zona.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const loadManifest = async () => {
    setManifestLoading(true);
    try {
      const params = new URLSearchParams();
      if (manifestDate) params.set('date', manifestDate);
      if (manifestZoneId) params.set('zoneId', manifestZoneId);
      const res = await api.get<{ orders: DeliveryManifestOrder[] }>(`/delivery/manifest?${params.toString()}`);
      setManifest(res.orders ?? []);
    } catch {
      toast.error('Erro ao carregar manifesto.');
    } finally {
      setManifestLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Entregas</h1>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Entregas</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary-900">Entregas</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setManifestOpen(true); loadManifest(); }} className="min-h-[44px] text-sm">
            <Truck className="w-4 h-4 mr-2" /> Manifesto
          </Button>
          <Button onClick={openCreate} className="min-h-[44px]">
            <Plus className="w-4 h-4 mr-2" /> Nova Zona
          </Button>
        </div>
      </div>

      <h2 className="font-semibold text-primary-800 mb-3">Zonas de entrega</h2>

      {zones.length === 0 ? (
        <EmptyState title="Nenhuma zona de entrega" description="Cadastre as zonas de entrega." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {zones.map((z) => (
            <Card key={z.id} className="border-primary-100 min-h-[88px]">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-primary-900">{z.name}</h3>
                    {z.description && (
                      <p className="text-xs text-primary-400 line-clamp-2 mt-0.5">{z.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(z)}>
                      <Pencil className="w-3.5 h-3.5 text-primary-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteClick(z)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
                <Badge variant={z.fee === 0 ? 'default' : 'outline'} className={`text-xs ${z.fee === 0 ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}`}>
                  {z.fee === 0 ? 'Grátis' : `Taxa: ${formatCurrency(z.fee)}`}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">
              {editingId ? 'Editar Zona' : 'Nova Zona de Entrega'}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSave} className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="zone-name">Nome da zona *</Label>
              <Input id="zone-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="min-h-[48px]" placeholder="Ex: Zona Sul, Zona Norte" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-desc">Descrição</Label>
              <Textarea id="zone-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Bairros atendidos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-fee">Taxa de entrega (R$)</Label>
              <Input id="zone-fee" type="number" step="0.01" min="0" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} className="min-h-[48px]" />
            </div>
            <Button type="submit" className="w-full min-h-[48px] bg-primary-700 hover:bg-primary-600 text-white">
              {editingId ? 'Salvar Alterações' : 'Criar Zona'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Manifesto Sheet */}
      <Sheet open={manifestOpen} onOpenChange={setManifestOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">Manifesto de Entrega</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <Input type="date" value={manifestDate} onChange={(e) => setManifestDate(e.target.value)} className="min-h-[44px]" />
              <Button onClick={loadManifest} disabled={manifestLoading} className="min-h-[44px]">
                {manifestLoading ? 'Carregando...' : 'Filtrar'}
              </Button>
            </div>
            {manifestLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : manifest.length === 0 ? (
              <p className="text-center text-primary-400 py-8">Nenhuma entrega encontrada.</p>
            ) : (
              <div className="space-y-3">
                {manifest.map((o) => (
                  <Card key={o.id} className="border-primary-100">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-primary-900">{o.customer.name}</p>
                          <p className="text-xs text-primary-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {o.deliveryAddress}
                          </p>
                        </div>
                        <Badge className="text-xs">{formatCurrency(o.totalAmount)}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {o.items.map((item, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{item.dish.name}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirm */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary-900">Excluir Zona</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a zona &quot;{deleteTarget?.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="min-h-[44px]">Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="min-h-[44px]">Sim, excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
