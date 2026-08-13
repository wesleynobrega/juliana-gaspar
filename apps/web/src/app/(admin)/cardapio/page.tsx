'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChefHat, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────

type NutrientType = 'PROTEINA' | 'CARBOIDRATO' | 'FIBRA' | 'GORDURA';

interface MenuItemDTO {
  id: string;
  name: string;
  description: string | null;
  nutrientType: NutrientType;
  photoUrl: string | null;
  allergens: string | null;
  baseUnit: string;
  available: boolean;
}

interface TechnicalSheetDTO {
  id: string;
  menuItemId: string;
  preparationMethod: string;
  cookingTime: number;
  temperature: string | null;
  equipment: string[];
  notes: string | null;
}

// ── Helpers ────────────────────────────────────────────

const NUTRIENT_LABELS: Record<NutrientType, string> = {
  PROTEINA: 'Proteínas',
  CARBOIDRATO: 'Carboidratos',
  FIBRA: 'Fibras',
  GORDURA: 'Gorduras',
};

const NUTRIENT_BADGES: Record<NutrientType, string> = {
  PROTEINA: 'bg-red-100 text-red-800',
  CARBOIDRATO: 'bg-amber-100 text-amber-800',
  FIBRA: 'bg-green-100 text-green-800',
  GORDURA: 'bg-yellow-100 text-yellow-800',
};

const TABS: NutrientType[] = ['PROTEINA', 'CARBOIDRATO', 'FIBRA', 'GORDURA'];

// ── Page ───────────────────────────────────────────────

export default function CardapioPage() {
  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [activeTab, setActiveTab] = useState<NutrientType>('PROTEINA');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<TechnicalSheetDTO | null>(null);
  const [sheetItemId, setSheetItemId] = useState<string | null>(null);

  // ── Menu item form ──────────────────────────────────

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formNutrient, setFormNutrient] = useState<NutrientType>('PROTEINA');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formAllergens, setFormAllergens] = useState('');
  const [formBaseUnit, setFormBaseUnit] = useState('porção');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  // ── Technical sheet form ────────────────────────────

  const [sheetPrep, setSheetPrep] = useState('');
  const [sheetTime, setSheetTime] = useState('');
  const [sheetTemp, setSheetTemp] = useState('');
  const [sheetEquip, setSheetEquip] = useState<string[]>([]);
  const [sheetNotes, setSheetNotes] = useState('');
  const [sheetSaving, setSheetSaving] = useState(false);

  // ── Load items ──────────────────────────────────────

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get<{ data: MenuItemDTO[] }>(
        `/menu?nutrientType=${activeTab}&limit=100`,
      );
      setItems(result.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // ── Menu item form handlers ─────────────────────────

  const openCreateForm = () => {
    setEditingId(null);
    setFormName('');
    setFormDesc('');
    setFormNutrient(activeTab);
    setFormPhotoUrl('');
    setFormAllergens('');
    setFormBaseUnit('porção');
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (item: MenuItemDTO) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormDesc(item.description ?? '');
    setFormNutrient(item.nutrientType);
    setFormPhotoUrl(item.photoUrl ?? '');
    setFormAllergens(item.allergens ?? '');
    setFormBaseUnit(item.baseUnit ?? 'porção');
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setFormError('Nome é obrigatório');
      return;
    }
    setFormSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: formName.trim(),
        description: formDesc.trim() || null,
        nutrientType: formNutrient,
        photoUrl: formPhotoUrl.trim() || null,
        allergens: formAllergens.trim() || null,
        baseUnit: formBaseUnit.trim() || 'porção',
      };
      if (editingId) {
        await api.put(`/menu/${editingId}`, payload);
        toast.success('Item atualizado!');
      } else {
        await api.post('/menu', payload);
        toast.success('Item criado!');
      }
      setShowForm(false);
      setEditingId(null);
      await loadItems();
    } catch {
      setFormError('Erro ao salvar. Tente novamente.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este item do cardápio?')) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Item removido.');
      await loadItems();
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  const handleToggleAvailable = async (item: MenuItemDTO) => {
    try {
      await api.put(`/menu/${item.id}`, { available: !item.available });
      await loadItems();
    } catch {
      // ignore
    }
  };

  // ── Technical sheet ────────────────────────────────

  const resetSheetForm = (data?: TechnicalSheetDTO) => {
    setSheetPrep(data?.preparationMethod ?? '');
    setSheetTime(data?.cookingTime != null ? String(data.cookingTime) : '');
    setSheetTemp(data?.temperature ?? '');
    setSheetEquip(data?.equipment ?? []);
    setSheetNotes(data?.notes ?? '');
  };

  const loadSheet = async (menuItemId: string) => {
    if (sheetItemId === menuItemId) {
      setSheetItemId(null);
      setSheetData(null);
      return;
    }
    try {
      const result = await api.get<TechnicalSheetDTO>(
        `/menu/${menuItemId}/technical-sheet`,
      );
      setSheetData(result);
      setSheetItemId(menuItemId);
      resetSheetForm(result);
    } catch {
      setSheetData(null);
      setSheetItemId(menuItemId);
      resetSheetForm();
    }
  };

  const saveSheet = async (menuItemId: string) => {
    if (!sheetPrep.trim()) {
      toast.error('O modo de preparo é obrigatório.');
      return;
    }
    setSheetSaving(true);
    try {
      const payload = {
        preparationMethod: sheetPrep.trim(),
        cookingTime: parseInt(sheetTime, 10) || 0,
        temperature: sheetTemp.trim() || null,
        equipment: sheetEquip,
        notes: sheetNotes.trim() || null,
      };
      await api.post(`/menu/${menuItemId}/technical-sheet`, payload);
      toast.success('Ficha técnica salva!');
      await loadSheet(menuItemId);
    } catch {
      toast.error('Erro ao salvar ficha técnica.');
    } finally {
      setSheetSaving(false);
    }
  };

  // ── Equipment list ──────────────────────────────────

  const addEquipment = () => {
    setSheetEquip((prev) => [...prev, '']);
  };

  const updateEquipment = (idx: number, value: string) => {
    setSheetEquip((prev) => prev.map((e, i) => (i === idx ? value : e)));
  };

  const removeEquipment = (idx: number) => {
    setSheetEquip((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Render ──────────────────────────────────────────

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">
          Cardápio
        </h1>
        <Button onClick={openCreateForm} className="min-h-[48px]">
          <Plus className="w-4 h-4 mr-2" />
          Novo Prato
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSheetItemId(null);
              setSheetData(null);
            }}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors min-h-[44px]',
              activeTab === tab
                ? 'bg-primary-700 text-white'
                : 'bg-primary-50 text-primary-700 hover:bg-primary-100',
            )}
          >
            {NUTRIENT_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-cream border border-primary-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4 text-primary-900">
            {editingId ? 'Editar item' : 'Novo Prato'}
          </h2>
          {formError && (
            <p className="text-red-600 text-sm mb-3">{formError}</p>
          )}
          <div className="space-y-4">
            <Input
              placeholder="Nome do prato *"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="min-h-[48px]"
            />
            <Textarea
              placeholder="Descrição (opcional)"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              rows={3}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-primary-500 block mb-1">
                  Tipo de nutriente
                </label>
                <select
                  value={formNutrient}
                  onChange={(e) => setFormNutrient(e.target.value as NutrientType)}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[48px]"
                >
                  {TABS.map((t) => (
                    <option key={t} value={t}>
                      {NUTRIENT_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="URL da foto (opcional)"
                value={formPhotoUrl}
                onChange={(e) => setFormPhotoUrl(e.target.value)}
                className="min-h-[48px]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Alergênicos (ex: Leite, Ovos)"
                value={formAllergens}
                onChange={(e) => setFormAllergens(e.target.value)}
                className="min-h-[48px]"
              />
              <Input
                placeholder="Unidade (ex: porção, filé, un)"
                value={formBaseUnit}
                onChange={(e) => setFormBaseUnit(e.target.value)}
                className="min-h-[48px]"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSave} disabled={formSaving}>
              {formSaving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-primary-500">Carregando...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-primary-400">
          <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum item cadastrado em {NUTRIENT_LABELS[activeTab]}</p>
        </div>
      ) : (
        <div className="bg-white border border-primary-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50 text-primary-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nome</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                  Alergênicos
                </th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Unidade
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  Disponível
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  Ficha Técnica
                </th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {items.map((item) => (
                <Fragment key={item.id}>
                  <tr className="hover:bg-primary-50/50">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-primary-900">
                          {item.name}
                        </span>
                        {item.description && (
                          <p className="text-xs text-primary-400 mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-primary-600">
                      {item.allergens || '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-primary-600">
                      {item.baseUnit}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleAvailable(item)}
                        className={cn(
                          'w-10 h-5 rounded-full transition-colors relative',
                          item.available ? 'bg-green-500' : 'bg-gray-300',
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                            item.available ? 'left-5' : 'left-0.5',
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => loadSheet(item.id)}
                        className="text-primary-600 hover:text-primary-800 underline text-xs min-h-[44px]"
                      >
                        {sheetItemId === item.id && sheetData
                          ? 'Ocultar'
                          : 'Ver'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => openEditForm(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {/* Ficha técnica expandida */}
                  {sheetItemId === item.id && (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 bg-cream">
                        {sheetData ? (
                          /* ── View mode ── */
                          <div className="text-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-primary-800">
                                Ficha Técnica
                              </h4>
                              <button
                                onClick={() => resetSheetForm(sheetData)}
                                className="text-xs text-primary-600 underline"
                              >
                                Editar
                              </button>
                            </div>
                            <p>
                              <strong>Preparo:</strong>{' '}
                              {sheetData.preparationMethod}
                            </p>
                            <p>
                              <strong>Tempo:</strong> {sheetData.cookingTime} min
                              {sheetData.temperature &&
                                ` | Temperatura: ${sheetData.temperature}`}
                            </p>
                            {sheetData.equipment.length > 0 && (
                              <p>
                                <strong>Equipamentos:</strong>{' '}
                                {sheetData.equipment.join(', ')}
                              </p>
                            )}
                            {sheetData.notes && (
                              <p>
                                <strong>Observações:</strong> {sheetData.notes}
                              </p>
                            )}
                          </div>
                        ) : (
                          /* ── Edit mode ── */
                          <div className="space-y-4">
                            <h4 className="font-semibold text-primary-800 text-sm">
                              Cadastrar Ficha Técnica
                            </h4>

                            {/* Prep + Time + Temp */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-primary-500">Modo de Preparo *</label>
                                <Textarea
                                  className="mt-1"
                                  rows={2}
                                  value={sheetPrep}
                                  onChange={(e) => setSheetPrep(e.target.value)}
                                  placeholder="Descreva o modo de preparo"
                                />
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs text-primary-500">Tempo de Cozimento (min)</label>
                                  <Input
                                    type="number"
                                    className="min-h-[40px] mt-1"
                                    value={sheetTime}
                                    onChange={(e) => setSheetTime(e.target.value)}
                                    placeholder="30"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-primary-500">Temperatura</label>
                                  <Input
                                    className="min-h-[40px] mt-1"
                                    value={sheetTemp}
                                    onChange={(e) => setSheetTemp(e.target.value)}
                                    placeholder="180°C"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Equipment — dynamic list */}
                            <div>
                              <label className="text-xs text-primary-500">Equipamentos</label>
                              <div className="space-y-2 mt-1">
                                {sheetEquip.map((eq, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <Input
                                      className="min-h-[40px] flex-1"
                                      value={eq}
                                      onChange={(e) => updateEquipment(idx, e.target.value)}
                                      placeholder="Ex: Forno"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 text-red-500 hover:text-red-700 shrink-0"
                                      onClick={() => removeEquipment(idx)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={addEquipment}
                                  className="min-h-[36px]"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Adicionar equipamento
                                </Button>
                              </div>
                            </div>

                            {/* Notes */}
                            <div>
                              <label className="text-xs text-primary-500">Observações</label>
                              <Input
                                className="min-h-[40px] mt-1"
                                value={sheetNotes}
                                onChange={(e) => setSheetNotes(e.target.value)}
                                placeholder="Notas adicionais"
                              />
                            </div>

                            <Button
                              size="sm"
                              onClick={() => saveSheet(item.id)}
                              disabled={sheetSaving}
                              className="min-h-[40px]"
                            >
                              {sheetSaving ? 'Salvando...' : 'Salvar Ficha Técnica'}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
