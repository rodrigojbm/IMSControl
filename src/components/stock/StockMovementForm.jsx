import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
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
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const items = formData.itemType === "item" ? supplies : products;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <h2 className="text-lg font-semibold text-stone-800">
          {type === "entrada" ? "Entrada de Estoque" : "Saída de Estoque"}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de Item</Label>
          <Select
            value={formData.itemType}
            onValueChange={(value) => setFormData({ ...formData, itemType: value, itemId: "", itemName: "" })}
          >
            <SelectTrigger>
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
            <SelectTrigger>
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
            <SelectTrigger>
              <SelectValue placeholder="Selecione o item" />
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
              value={formData.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              required
            />
            <span className="flex items-center text-sm text-stone-500 px-3 bg-stone-100 rounded-md">
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
            onValueChange={(values) => {
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
            onValueChange={(values) => {
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
            placeholder="Anotações sobre a movimentação..."
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className={`flex-1 ${type === "entrada" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
        >
          {isLoading ? "Salvando..." : "Confirmar"}
        </Button>
      </div>
    </form>
  );
}