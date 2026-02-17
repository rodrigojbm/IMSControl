import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2 } from "lucide-react";

const sizes = [
  { value: "pequena", label: "Pequena" },
  { value: "media", label: "Média" },
  { value: "grande", label: "Grande" },
  { value: "especial", label: "Especial" }
];

export default function ProductForm({ product, supplies, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    size: product?.size || "",
    quantity: product?.quantity || 0,
    min_quantity: product?.min_quantity || 0,
    production_cost: product?.production_cost || 0,
    sale_price: product?.sale_price || 0,
    recipe: product?.recipe || [],
    image_url: product?.image_url || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addRecipeItem = () => {
    setFormData({
      ...formData,
      recipe: [...formData.recipe, { supply_id: "", supply_name: "", quantity: 0, unit: "" }]
    });
  };

  const updateRecipeItem = (index, field, value) => {
    const newRecipe = [...formData.recipe];
    if (field === "supply_id") {
      const supply = supplies.find(s => s.id === value);
      newRecipe[index] = {
        ...newRecipe[index],
        supply_id: value,
        supply_name: supply?.name || "",
        unit: supply?.unit || ""
      };
    } else {
      newRecipe[index] = { ...newRecipe[index], [field]: value };
    }
    setFormData({ ...formData, recipe: newRecipe });
  };

  const removeRecipeItem = (index) => {
    setFormData({
      ...formData,
      recipe: formData.recipe.filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <h2 className="text-lg font-semibold text-stone-800">
          {product ? "Editar Produto" : "Novo Produto"}
        </h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="name">Nome da Vela *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Vela Lavanda Relaxante"
            required
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição do produto..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Tamanho *</Label>
          <Select
            value={formData.size}
            onValueChange={(value) => setFormData({ ...formData, size: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade em Estoque</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_quantity">Estoque Mínimo</Label>
          <Input
            id="min_quantity"
            type="number"
            min="0"
            value={formData.min_quantity}
            onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="production_cost">Custo de Produção (R$)</Label>
          <Input
            id="production_cost"
            type="number"
            step="0.01"
            min="0"
            value={formData.production_cost}
            onChange={(e) => setFormData({ ...formData, production_cost: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="sale_price">Preço de Venda (R$)</Label>
          <Input
            id="sale_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Recipe Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Receita / Insumos Necessários</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRecipeItem}>
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
        
        {formData.recipe.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-4 bg-stone-50 rounded-lg">
            Nenhum insumo adicionado à receita
          </p>
        ) : (
          <div className="space-y-2">
            {formData.recipe.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
                <Select
                  value={item.supply_id}
                  onValueChange={(value) => updateRecipeItem(index, "supply_id", value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione o insumo" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplies.map((supply) => (
                      <SelectItem key={supply.id} value={supply.id}>
                        {supply.name} ({supply.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => updateRecipeItem(index, "quantity", parseFloat(e.target.value) || 0)}
                  className="w-24"
                  placeholder="Qtd"
                />
                <span className="text-sm text-stone-500 w-8">{item.unit}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRecipeItem(index)}
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
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
          {isLoading ? "Salvando..." : product ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}