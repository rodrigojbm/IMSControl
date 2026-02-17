import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

const categories = [
  { value: "cera", label: "Cera" },
  { value: "essencia", label: "Essência" },
  { value: "pavio", label: "Pavio" },
  { value: "pote", label: "Pote/Recipiente" },
  { value: "corante", label: "Corante" },
  { value: "embalagem", label: "Embalagem" },
  { value: "outros", label: "Outros" }
];

const units = [
  { value: "kg", label: "Quilograma (kg)" },
  { value: "g", label: "Grama (g)" },
  { value: "ml", label: "Mililitro (ml)" },
  { value: "L", label: "Litro (L)" },
  { value: "un", label: "Unidade (un)" },
  { value: "m", label: "Metro (m)" }
];

export default function SupplyForm({ supply, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: supply?.name || "",
    category: supply?.category || "",
    unit: supply?.unit || "",
    quantity: supply?.quantity || 0,
    minQuantity: supply?.minQuantity || 0,
    costPerUnit: supply?.costPerUnit || 0,
    supplier: supply?.supplier || "",
    notes: supply?.notes || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <h2 className="text-lg font-semibold text-stone-800">
          {supply ? "Editar Insumo" : "Novo Insumo"}
        </h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="name">Nome do Insumo *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Cera de Soja"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
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

        <div className="space-y-2">
          <Label>Unidade *</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade Atual</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minQuantity">Quantidade Mínima</Label>
          <Input
            id="minQuantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.minQuantity}
            onChange={(e) => setFormData({ ...formData, minQuantity: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="costPerUnit">Custo por Unidade (R$)</Label>
          <Input
            id="costPerUnit"
            type="number"
            step="0.01"
            min="0"
            value={formData.costPerUnit}
            onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="Nome do fornecedor"
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Anotações sobre o insumo..."
            rows={3}
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
          className="flex-1 bg-amber-600 hover:bg-amber-700"
        >
          {isLoading ? "Salvando..." : supply ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}