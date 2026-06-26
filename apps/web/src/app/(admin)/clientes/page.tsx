'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
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
import { toast } from 'sonner';
import { Phone, Trash2, Pencil, Plus, Mail } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tags: string[];
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  tags: string;
}

const emptyForm: CustomerFormData = { name: '', email: '', phone: '', tags: '' };

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerFormData>(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await api.get<{ data: Customer[] }>(`/customers?${params.toString()}`);
      setClientes(res.data ?? []);
    } catch {
      setError('Não foi possível carregar os clientes.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      email: c.email ?? '',
      phone: c.phone ?? '',
      tags: c.tags?.join(', ') ?? '',
    });
    setSheetOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editingId) {
        await api.put(`/customers/${editingId}`, payload);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.post('/customers', payload);
        toast.success('Cliente criado com sucesso!');
      }
      setSheetOpen(false);
      load();
    } catch {
      toast.error('Erro ao salvar cliente. Tente novamente.');
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setDeleteTarget(customer);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/customers/${deleteTarget.id}`);
      toast.success('Cliente removido com sucesso!');
      load();
    } catch {
      toast.error('Erro ao remover cliente.');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Clientes</h1>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900 mb-6">Clientes</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
        <EmptyState title="Erro ao carregar" description="Tente novamente." action={{ label: 'Tentar novamente', onClick: load }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">Clientes</h1>
        <Button onClick={openCreate} className="min-h-[44px]">
          <Plus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <Input
        placeholder="Buscar clientes..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="max-w-sm min-h-[48px] mb-6"
      />

      {clientes.length === 0 ? (
        <EmptyState title="Nenhum cliente" description="Nenhum cliente cadastrado ainda." />
      ) : (
        <div className="space-y-3">
          {clientes.map((c) => (
            <Card key={c.id} className="border-primary-100 min-h-[88px]">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-primary-900">{c.name}</h3>
                  <div className="flex items-center gap-2">
                    {c.phone && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-500" onClick={() => openEdit(c)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDeleteClick(c)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {c.email && (
                  <p className="text-xs text-primary-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {c.email}
                  </p>
                )}
                {c.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {c.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
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
              {editingId ? 'Editar Cliente' : 'Novo Cliente'}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSave} className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} className="min-h-[48px]" placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="min-h-[48px]" placeholder="cliente@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="min-h-[48px]" placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="min-h-[48px]" placeholder="vegetariano, low carb" />
            </div>
            <Button type="submit" className="w-full min-h-[48px] bg-primary-700 hover:bg-primary-600 text-white" disabled={!form.name.trim()}>
              {editingId ? 'Salvar Alterações' : 'Criar Cliente'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary-900">Excluir Cliente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir &quot;{deleteTarget?.name}&quot;? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="min-h-[44px]">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="min-h-[44px]">
              Sim, excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
