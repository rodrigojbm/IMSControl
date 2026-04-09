import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { NumericFormat } from "react-number-format";

export default function StockMovementForm({
  type = "entrada",
  itemType = "item",
  item,
  supplies,
  products,
  onSubmit,
  onCancel,
  isLoading
}) {
  const [pendingItems, setPendingItems] = useState([]);
  
  const initialFormData = {
    type,
    category: type === "entrada" ? "compra" : "venda",
    itemType: itemType,
    itemId: item?.id || "",
    itemName: item?.name || "",
    quantity: 0,
    unit: item?.unit || "un",
    unitValue: item?.cost_per_unit || item?.sale_price || 0,
    totalValue: 0,
    movementDate: format(new Date(), "yyyy-MM-dd"),
    notes: ""
  };
  
  const [formData, setFormData] = useState(initialFormData);

  const entryCategories = [
    { value: "compra", label: "Compra" },
    { value: "devolucao", label: "Devolução" },
    { value: "ajuste", label: "Ajuste de Estoque" }
  ];

  const exitCategories = [
    { value: "venda", label: "Venda" },
    { value: "producao", label: "Produção" },
    { value: "perda", label: "Perda/Descarte" },
    { value: "ajuste", label: "Ajuste de Estoque" }
  ];

  const categories = type === "entrada" ? entryCategories : exitCategories;

  useEffect(() => {
    setPendingItems([]);
    setFormData({
      type,
      category: type === "entrada" ? "compra" : "venda",
      itemType: itemType,
      itemId: item?.id || "",
      itemName: item?.name || "",
      quantity: 0,
      unit: item?.unit || "un",
      unitValue: item?.cost_per_unit || item?.sale_price || 0,
      totalValue: 0,
      movementDate: format(new Date(), "yyyy-MM-dd"),
      notes: ""
    });
  }, [type, itemType, item]);

  const handleItemChange = (itemId) => {
    const items = formData.itemType === "item" ? supplies : products;
    const selectedItem = items.find(i => i.id === itemId);
    if (selectedItem) {
      const unitValue = formData.itemType === "item"
        ? selectedItem.cost_per_unit || 0
        : (type === "saida" ? selectedItem.sale_price : selectedItem.production_cost) || 0;
      setFormData(prev => ({
        ...prev,
        itemId: itemId,
        itemName: selectedItem.name,
        unit: selectedItem.unit || "un",
        unitValue: unitValue,
        totalValue: prev.quantity * unitValue
      }));
    }
  };

  const handleQuantityChange = (qty) => {
    const quantity = parseFloat(qty) || 0;
    setFormData(prev => ({
      ...prev,
      quantity,
      totalValue: quantity * prev.unitValue
    }));
  };

  const handleAddItem = () => {
    if (!formData.itemId || formData.quantity <= 0) return;
    
    // Add to pending array
    setPendingItems([...pendingItems, { ...formData, localId: Date.now(), id: 0 }]);
    
    // Reset form fields but keep context (date, category)
    setFormData(prev => ({
      ...initialFormData,
      movementDate: prev.movementDate,
      category: prev.category
    }));
  };

  const handleRemoveItem = (localId) => {
    setPendingItems(pendingItems.filter(item => item.localId !== localId));
  };

  const handleSubmitBatch = () => {
    if (pendingItems.length === 0) return;
    onSubmit(pendingItems);
  };

  const items = formData.itemType === "item" ? supplies : products;

  const isAddDisabled = !formData.itemId || formData.quantity <= 0;
  const isSubmitDisabled = pendingItems.length === 0 || isLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">
            {type === "entrada" ? "Registrar Entradas (Lote)" : "Registrar Saídas (Lote)"}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Adicione múltiplos itens na lista abaixo antes de confirmar a movimentação.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
        <div className="space-y-2">
          <Label>Tipo de Item</Label>
          <Select
            value={formData.itemType}
            onValueChange={(value) => setFormData({ ...formData, itemType: value, itemId: "", itemName: "" })}
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="item">Item</SelectItem>
              <SelectItem value="produto">Produto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Item *</Label>
          <Select
            value={formData.itemId}
            onValueChange={handleItemChange}
            required
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione o item..." />
            </SelectTrigger>
            <SelectContent>
              {items.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade *</Label>
          <div className="flex gap-2">
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              value={formData.quantity || ""}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="bg-white"
            />
            <span className="flex items-center text-sm text-stone-500 px-3 bg-stone-100 rounded-md border border-stone-200">
              {formData.unit}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitValue">Valor Unitário (R$)</Label>
          <NumericFormat
            value={formData.unitValue}
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            customInput={Input}
            className="bg-white"
            onValueChange={(values, sourceInfo) => {
              if (sourceInfo?.source !== 'event') return;
              const unitValue = values.floatValue ?? 0;
              setFormData(prev => {
                const q = prev.quantity ?? 0;
                const totalValue = q > 0 ? q * unitValue : 0;
                return {
                  ...prev,
                  unitValue,
                  totalValue,
                };
              });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="movementDate">Data</Label>
          <Input
            id="movementDate"
            type="date"
            value={formData.movementDate}
            onChange={(e) => setFormData({ ...formData, movementDate: e.target.value })}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label>Valor Total (R$)</Label>
          <NumericFormat
            value={formData.totalValue}
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            customInput={Input}
            className="bg-white"
            onValueChange={(values, sourceInfo) => {
              if (sourceInfo?.source !== 'event') return;
              const totalValue = values.floatValue ?? 0;
              setFormData(prev => {
                const q = prev.quantity ?? 0;
                const unitValue = q > 0 ? totalValue / q : 0;
                return {
                  ...prev,
                  totalValue,
                  unitValue,
                };
              });
            }}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Anotações sobre a movimentação (opcional)..."
            rows={1}
            className="bg-white"
          />
        </div>
        
        <div className="col-span-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddItem}
            disabled={isAddDisabled}
            className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar à Lista
          </Button>
        </div>
      </div>

      {/* Lista de Itens Pendentes */}
      {pendingItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-stone-700">Itens no Lote ({pendingItems.length})</h3>
            <span className="text-sm font-semibold text-stone-800">
              Total: R$ {pendingItems.reduce((acc, curr) => acc + curr.totalValue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-100">
            {pendingItems.map((pi) => (
              <div key={pi.localId} className="p-3 bg-white flex items-center justify-between group">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-stone-800 truncate">{pi.itemName}</span>
                    <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                      {pi.itemType}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                    <span>{pi.quantity} {pi.unit}</span>
                    <span>•</span>
                    <span>{categories.find(c => c.value === pi.category)?.label}</span>
                    <span>•</span>
                    <span>R$ {pi.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-stone-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveItem(pi.localId)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingItems.length === 0 && (
        <div className="py-8 text-center border-2 border-dashed border-stone-200 rounded-xl">
          <p className="text-stone-400 text-sm">Nenhum item adicionado ao lote ainda.</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 text-stone-600 hover:text-stone-800 hover:bg-stone-100">
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSubmitBatch}
          disabled={isSubmitDisabled}
          className={`flex-1 ${type === "entrada" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}`}
        >
          {isLoading ? "Salvando..." : (
            <>
              Confirmar Lote <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}