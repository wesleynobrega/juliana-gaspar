'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Checkbox } from '@/components/ui/checkbox';
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
import { toast } from 'sonner';
import {
  Phone,
  Trash2,
  Pencil,
  Plus,
  Mail,
  MapPin,
  Instagram,
  MessageCircle,
  ClipboardList,
  ShieldCheck,
  StickyNote,
} from 'lucide-react';

interface Cliente {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  zipCode: string | null;
  instagram: string | null;
  whatsapp: string | null;
  dietaryRestrictions: string | null;
  preferences: string | null;
  healthProfessionalName: string | null;
  healthProfessionalSpecialty: string | null;
  lgpdConsent: boolean;
  tags: string[];
  notes: string | null;
}

interface ClienteFormData {
  name: string;
  phone: string;
  email: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  instagram: string;
  whatsapp: string;
  dietaryRestrictions: string;
  preferences: string;
  healthProfessionalName: string;
  healthProfessionalSpecialty: string;
  lgpdConsent: boolean;
  notes: string;
}

const emptyForm: ClienteFormData = {
  name: '',
  phone: '',
  email: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  zipCode: '',
  instagram: '',
  whatsapp: '',
  dietaryRestrictions: '',
  preferences: '',
  healthProfessionalName: '',
  healthProfessionalSpecialty: '',
  lgpdConsent: false,
  notes: '',
};

function clienteToForm(c: Cliente): ClienteFormData {
  return {
    name: c.name,
    phone: c.phone ?? '',
    email: c.email ?? '',
    street: c.street ?? '',
    number: c.number ?? '',
    neighborhood: c.neighborhood ?? '',
    city: c.city ?? '',
    zipCode: c.zipCode ?? '',
    instagram: c.instagram ?? '',
    whatsapp: c.whatsapp ?? '',
    dietaryRestrictions: c.dietaryRestrictions ?? '',
    preferences: c.preferences ?? '',
    healthProfessionalName: c.healthProfessionalName ?? '',
    healthProfessionalSpecialty: c.healthProfessionalSpecialty ?? '',
    lgpdConsent: c.lgpdConsent,
    notes: c.notes ?? '',
  };
}

function buildPayload(form: ClienteFormData) {
  return {
    name: form.name,
    phone: form.phone || null,
    email: form.email || null,
    street: form.street || null,
    number: form.number || null,
    neighborhood: form.neighborhood || null,
    city: form.city || null,
    zipCode: form.zipCode || null,
    instagram: form.instagram || null,
    whatsapp: form.whatsapp || null,
    dietaryRestrictions: form.dietaryRestrictions || null,
    preferences: form.preferences || null,
    healthProfessionalName: form.healthProfessionalName || null,
    healthProfessionalSpecialty: form.healthProfessionalSpecialty || null,
    lgpdConsent: form.lgpdConsent,
    notes: form.notes || null,
  };
}

const phonePattern = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

function formatPhone(v: string): string {
  const digits = v.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClienteFormData>(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [detailCliente, setDetailCustomer] = useState<Cliente | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
      const res = await api.get<{ data: Cliente[] }>(`/clients?${params.toString()}`);
      setClientes(res.data ?? []);
    } catch {
      setError('Nao foi possivel carregar os clientes.');
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

  const openEdit = (c: Cliente) => {
    setEditingId(c.id);
    setForm(clienteToForm(c));
    setSheetOpen(true);
  };

  const openDetail = (c: Cliente) => {
    setDetailCustomer(c);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) {
      toast.error('Telefone invalido. Use DDD + numero (minimo 10 digitos).');
      return;
    }

    if (!form.lgpdConsent) {
      toast.error('O consentimento LGPD e obrigatorio.');
      return;
    }

    try {
      const payload = buildPayload(form);
      if (editingId) {
        await api.put(`/clients/${editingId}`, payload);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.post('/clients', payload);
        toast.success('Cliente criado com sucesso!');
      }
      setSheetOpen(false);
      load();
    } catch {
      toast.error('Erro ao salvar cliente. Tente novamente.');
    }
  };

  const handleDeleteClick = (cliente: Cliente) => {
    setDeleteTarget(cliente);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/clients/${deleteTarget.id}`);
      toast.success('Cliente removido com sucesso!');
      setDetailCustomer(null);
      load();
    } catch {
      toast.error('Erro ao remover cliente.');
    } finally {
      setDeleteTarget(null);
      setConfirmOpen(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setForm({ ...form, phone: formatted });
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <Card
              key={c.id}
              className="border-primary-100 cursor-pointer hover:border-primary-300 transition-colors min-h-[88px]"
              onClick={() => openDetail(c)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-primary-900 truncate">{c.name}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary-500"
                      onClick={(e) => { e.stopPropagation(); openEdit(c); }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(c); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {c.phone && (
                  <p className="text-xs text-primary-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {c.phone}
                  </p>
                )}
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

      {/* Detail Sheet */}
      <Sheet open={!!detailCliente} onOpenChange={(open) => { if (!open) setDetailCustomer(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">
              {detailCliente?.name}
            </SheetTitle>
          </SheetHeader>
          {detailCliente && (
            <div className="space-y-4 mt-4">
              {/* Contact */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">Contato</h4>
                {detailCliente.phone && (
                  <p className="text-sm flex items-center gap-2 text-primary-700">
                    <Phone className="w-4 h-4 text-primary-400" /> {detailCliente.phone}
                  </p>
                )}
                {detailCliente.email && (
                  <p className="text-sm flex items-center gap-2 text-primary-700">
                    <Mail className="w-4 h-4 text-primary-400" /> {detailCliente.email}
                  </p>
                )}
                {detailCliente.whatsapp && (
                  <p className="text-sm flex items-center gap-2 text-primary-700">
                    <MessageCircle className="w-4 h-4 text-primary-400" /> {detailCliente.whatsapp}
                  </p>
                )}
                {detailCliente.instagram && (
                  <p className="text-sm flex items-center gap-2 text-primary-700">
                    <Instagram className="w-4 h-4 text-primary-400" /> @{detailCliente.instagram}
                  </p>
                )}
              </div>

              {/* Address */}
              {(detailCliente.street || detailCliente.city || detailCliente.zipCode) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">Endereco</h4>
                  <p className="text-sm flex items-start gap-2 text-primary-700">
                    <MapPin className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                    <span>
                      {[
                        detailCliente.street,
                        detailCliente.number,
                        detailCliente.neighborhood,
                        detailCliente.city,
                        detailCliente.zipCode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </p>
                </div>
              )}

              {/* Preferences */}
              {(detailCliente.dietaryRestrictions || detailCliente.preferences) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">Preferencias</h4>
                  {detailCliente.dietaryRestrictions && (
                    <p className="text-sm flex items-center gap-2 text-primary-700">
                      <ClipboardList className="w-4 h-4 text-primary-400" />
                      Restricoes: {detailCliente.dietaryRestrictions}
                    </p>
                  )}
                  {detailCliente.preferences && (
                    <p className="text-sm flex items-center gap-2 text-primary-700">
                      <ClipboardList className="w-4 h-4 text-primary-400" />
                      Preferencias: {detailCliente.preferences}
                    </p>
                  )}
                </div>
              )}

              {/* Profissional de Saúde */}
              {(detailCliente.healthProfessionalName || detailCliente.healthProfessionalSpecialty) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">Profissional de Saude</h4>
                  <p className="text-sm flex items-center gap-2 text-primary-700">
                    <ClipboardList className="w-4 h-4 text-primary-400" />
                    {[
                      detailCliente.healthProfessionalName,
                      detailCliente.healthProfessionalSpecialty,
                    ].filter(Boolean).join(' — ')}
                  </p>
                </div>
              )}

              {/* LGPD */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">LGPD</h4>
                <p className="text-sm flex items-center gap-2 text-primary-700">
                  <ShieldCheck className="w-4 h-4 text-primary-400" />
                  {detailCliente.lgpdConsent ? 'Consentimento concedido' : 'Sem consentimento'}
                </p>
              </div>

              {/* Notes */}
              {detailCliente.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">Observacoes</h4>
                  <p className="text-sm flex items-start gap-2 text-primary-700">
                    <StickyNote className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                    {detailCliente.notes}
                  </p>
                </div>
              )}

              {/* Tags */}
              {detailCliente.tags?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">Tags</h4>
                  <div className="flex gap-1 flex-wrap">
                    {detailCliente.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-primary-100">
                <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => { setDetailCustomer(null); openEdit(detailCliente); }}>
                  <Pencil className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={() => { handleDeleteClick(detailCliente); }}>
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg text-primary-900">
              {editingId ? 'Editar Cliente' : 'Novo Cliente'}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSave} className="space-y-5 mt-6">
            {/* Basic info */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} className="min-h-[48px]" placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" value={form.phone} onChange={(e) => handlePhoneChange(e.target.value)} required className="min-h-[48px]" placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="min-h-[48px]" placeholder="cliente@email.com" />
            </div>

            {/* Address */}
            <div className="space-y-3 pt-2 border-t border-primary-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">Endereco</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input id="street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="min-h-[48px]" placeholder="Rua..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Numero</Label>
                  <Input id="number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="min-h-[48px]" placeholder="123" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="min-h-[48px]" placeholder="Bairro..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="min-h-[48px]" placeholder="Cidade..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input id="zipCode" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className="min-h-[48px]" placeholder="00000-000" />
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="space-y-3 pt-2 border-t border-primary-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">Redes Sociais</h4>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="min-h-[48px]" placeholder="@usuario (sem @)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" value={form.whatsapp} onChange={(e) => handlePhoneChange(e.target.value)} className="min-h-[48px]" placeholder="(11) 99999-9999" />
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-3 pt-2 border-t border-primary-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">Preferencias Alimentares</h4>
              <div className="space-y-2">
                <Label htmlFor="dietaryRestrictions">Restricoes alimentares</Label>
                <Input id="dietaryRestrictions" value={form.dietaryRestrictions} onChange={(e) => setForm({ ...form, dietaryRestrictions: e.target.value })} className="min-h-[48px]" placeholder="ex: lactose, gluten" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferences">Preferencias</Label>
                <Input id="preferences" value={form.preferences} onChange={(e) => setForm({ ...form, preferences: e.target.value })} className="min-h-[48px]" placeholder="ex: low carb, vegetariano" />
              </div>
            </div>

            {/* LGPD */}
            <div className="space-y-3 pt-2 border-t border-primary-100">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="lgpdConsent"
                  checked={form.lgpdConsent}
                  onCheckedChange={() => setForm({ ...form, lgpdConsent: !form.lgpdConsent })}
                />
                <Label htmlFor="lgpdConsent" className="text-sm cursor-pointer leading-tight">
                  Autorizo o tratamento dos meus dados pessoais conforme a LGPD *
                </Label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 pt-2 border-t border-primary-100">
              <Label htmlFor="notes">Observacoes</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[80px]" placeholder="Anotacoes sobre o cliente..." />
            </div>

            {/* Profissional de Saúde */}
            <div className="space-y-3 pt-2 border-t border-primary-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-400">Profissional de Saude (opcional)</h4>
              <div className="space-y-2">
                <Label htmlFor="healthProfessionalName">Nome</Label>
                <Input id="healthProfessionalName" value={form.healthProfessionalName} onChange={(e) => setForm({ ...form, healthProfessionalName: e.target.value })} className="min-h-[48px]" placeholder="ex: Dra. Maria" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="healthProfessionalSpecialty">Especialidade</Label>
                <Input id="healthProfessionalSpecialty" value={form.healthProfessionalSpecialty} onChange={(e) => setForm({ ...form, healthProfessionalSpecialty: e.target.value })} className="min-h-[48px]" placeholder="ex: Nutricionista" />
              </div>
            </div>

            <Button type="submit" className="w-full min-h-[48px] bg-primary-700 hover:bg-primary-600 text-white" disabled={!form.name.trim()}>
              {editingId ? 'Salvar Alteracoes' : 'Criar Cliente'}
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
              Tem certeza que deseja excluir &quot;{deleteTarget?.name}&quot;? Esta acao nao pode ser desfeita.
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
