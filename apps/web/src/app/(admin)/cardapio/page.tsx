'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChefHat } from 'lucide-react';

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

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAllergens, setFormAllergens] = useState('');
  const [formBaseUnit, setFormBaseUnit] = useState('porção');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  // Technical sheet form state
  const [sheetForm, setSheetForm] = useState({
    preparationMethod: '',
    cookingTime: '',
    temperature: '',
    equipment: '',
    notes: '',
  });
  const [sheetSaving, setSheetSaving] = useState(false);

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

  // ── Form handlers ─────────────────────────────────

  const openCreateForm = () => {
    setEditingId(null);
    setFormName('');
    setFormDesc('');
    setFormAllergens('');
    setFormBaseUnit('porção');
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (item: MenuItemDTO) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormDesc(item.description ?? '');
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
        nutrientType: activeTab,
        allergens: formAllergens.trim() || null,
        baseUnit: formBaseUnit.trim() || 'porção',
      };
      if (editingId) {
        await api.put(`/menu/${editingId}`, payload);
      } else {
        await api.post('/menu', payload);
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
      await loadItems();
    } catch {
      alert('Erro ao remover.');
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

  // ── Technical Sheet ───────────────────────────────

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
      setSheetForm({
        preparationMethod: result.preparationMethod ?? '',
        cookingTime: String(result.cookingTime ?? ''),
        temperature: result.temperature ?? '',
        equipment: (result.equipment ?? []).join(', '),
        notes: result.notes ?? '',
      });
    } catch {
      setSheetData(null);
      setSheetItemId(menuItemId);
      setSheetForm({ preparationMethod: '', cookingTime: '', temperature: '', equipment: '', notes: '' });
    }
  };

  const saveSheet = async (menuItemId: string) => {
    if (!sheetForm.preparationMethod.trim()) {
      toast.error('O modo de preparo é obrigatório.');
      return;
    }
    setSheetSaving(true);
    try {
      const payload = {
        preparationMethod: sheetForm.preparationMethod.trim(),
        cookingTime: parseInt(sheetForm.cookingTime, 10) || 0,
        temperature: sheetForm.temperature.trim() || null,
        equipment: sheetForm.equipment
          ? sheetForm.equipment.split(',').map((e) => e.trim()).filter(Boolean)
          : [],
        notes: sheetForm.notes.trim() || null,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">
          Cardápio
        </h1>
        <Button onClick={openCreateForm} className="min-h-[48px]">
          <Plus className="w-4 h-4 mr-2" />
          Novo item
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

      {/* Form inline */}
      {showForm && (
        <div className="bg-cream border border-primary-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4 text-primary-900">
            {editingId ? 'Editar item' : 'Novo item'} —{' '}
            {NUTRIENT_LABELS[activeTab]}
          </h2>
          {formError && (
            <p className="text-red-600 text-sm mb-3">{formError}</p>
          )}
          <div className="space-y-4">
            <Input
              placeholder="Nome do item"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="min-h-[48px]"
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              rows={3}
              className="w-full border border-primary-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
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
                <>
                  <tr key={item.id} className="hover:bg-primary-50/50">
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
                    <tr key={`${item.id}-sheet`}>
                      <td colSpan={6} className="px-4 py-3 bg-cream">
                        {sheetData ? (
                          <div className="text-sm space-y-2">
                            <h4 className="font-semibold text-primary-800">
                              Ficha Técnica
                            </h4>
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
                          <div className="space-y-3">
                            <h4 className="font-semibold text-primary-800 text-sm">
                              Cadastrar Ficha Técnica
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-primary-500">Modo de Preparo *</label>
                                <textarea
                                  className="w-full border border-primary-200 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                                  rows={2}
                                  value={sheetForm.preparationMethod}
                                  onChange={(e) => setSheetForm({ ...sheetForm, preparationMethod: e.target.value })}
                                  placeholder="Descreva o modo de preparo"
                                />
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs text-primary-500">Tempo de Cozimento (min)</label>
                                  <Input
                                    type="number"
                                    className="min-h-[40px] mt-1"
                                    value={sheetForm.cookingTime}
                                    onChange={(e) => setSheetForm({ ...sheetForm, cookingTime: e.target.value })}
                                    placeholder="30"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-primary-500">Temperatura</label>
                                  <Input
                                    className="min-h-[40px] mt-1"
                                    value={sheetForm.temperature}
                                    onChange={(e) => setSheetForm({ ...sheetForm, temperature: e.target.value })}
                                    placeholder="180°C"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-primary-500">Equipamentos (separados por vírgula)</label>
                                <Input
                                  className="min-h-[40px] mt-1"
                                  value={sheetForm.equipment}
                                  onChange={(e) => setSheetForm({ ...sheetForm, equipment: e.target.value })}
                                  placeholder="Forno, Liquidificador"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-primary-500">Observações</label>
                                <Input
                                  className="min-h-[40px] mt-1"
                                  value={sheetForm.notes}
                                  onChange={(e) => setSheetForm({ ...sheetForm, notes: e.target.value })}
                                  placeholder="Notas adicionais"
                                />
                              </div>
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
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
