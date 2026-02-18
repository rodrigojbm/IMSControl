import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function ProductionForm({ product, products, supplies, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    productId: product?.id || "",
    productName: product?.name || "",
    quantity: 1,
    productionDate: format(new Date(), "yyyy-MM-dd"),
    suppliesUsed: [],
    notes: ""
  });

  const [selectedProduct, setSelectedProduct] = useState(product || null);
  const [insufficientSupplies, setInsufficientSupplies] = useState([]);

  useEffect(() => {
    if (selectedProduct) {
      const recipe = selectedProduct.recipe || [];
      const suppliesUsed = recipe.map(item => {
        const supplyId = item.supplyId || item.supplyId;
        const supply = supplies.find(s => s.id === supplyId);
        return {
          supplyId: supplyId,
          supplyName: supply?.name || item.supplyName || "",
          quantityUsed: item.quantity * formData.quantity,
          unit: supply?.unit || item.unit || ""
        };
      });

      setFormData(prev => ({
        ...prev,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        suppliesUsed: suppliesUsed
      }));

      // Check for insufficient supplies
      const insufficient = suppliesUsed.filter(item => {
        const supply = supplies.find(s => s.id === item.supplyId);
        return supply && supply.quantity < item.quantityUsed;
      }).map(item => {
        const supply = supplies.find(s => s.id === item.supplyId);
        return {
          name: item.supplyName,
          needed: item.quantityUsed,
          available: supply?.quantity || 0,
          unit: item.unit
        };
      });

      setInsufficientSupplies(insufficient);
    }
  }, [selectedProduct, formData.quantity, supplies]);

  const handleProductChange = (productId) => {
    // Convert to number if needed, as Select returns string
    const id = typeof productId === 'string' ? Number(productId) : productId;
    const prod = products.find(p => p.id === id || p.id === productId);
    setSelectedProduct(prod);
  };

  const handleQuantityChange = (qty) => {
    const quantity = parseInt(qty) || 1;
    if (selectedProduct?.recipe) {
      const suppliesUsed = selectedProduct.recipe.map(item => {
        const supplyId = item.supplyId || item.supplyId;
        const supply = supplies.find(s => s.id === supplyId);
        return {
          supplyId: supplyId,
          supplyName: supply?.name || item.supplyName || "",
          quantityUsed: item.quantity * quantity,
          unit: supply?.unit || item.unit || ""
        };
      });
      setFormData(prev => ({
        ...prev,
        quantity,
        suppliesUsed: suppliesUsed
      }));
    } else {
      setFormData(prev => ({ ...prev, quantity }));
    }
  };

  const calculateTotalCost = () => {
    let total = 0;
    formData.suppliesUsed.forEach(item => {
      const supply = supplies.find(s => s.id === item.supplyId);
      if (supply?.costPerUnit) {
        total += supply.costPerUnit * item.quantityUsed;
      }
    });
    return total;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure suppliesUsed is properly formatted and productId is a number
    const payload = {
      productId: Number(formData.productId),
      productName: formData.productName,
      quantity: Number(formData.quantity),
      productionDate: formData.productionDate,
      suppliesUsed: (formData.suppliesUsed || []).map(item => ({
        supplyId: Number(item.supplyId),
        supplyName: item.supplyName,
        quantityUsed: Number(item.quantityUsed),
        unit: item.unit
      })),
      notes: formData.notes || "",
      totalCost: calculateTotalCost()
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <h2 className="text-lg font-semibold text-stone-800">Registrar Produção</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Produto *</Label>
          <Select
            value={formData.productId ? String(formData.productId) : ""}
            onValueChange={handleProductChange}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o produto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((prod) => (
                <SelectItem key={prod.id} value={String(prod.id)}>
                  {prod.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade a Produzir *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="productionDate">Data da Produção</Label>
          <Input
            id="productionDate"
            type="date"
            value={formData.productionDate}
            onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
          />
        </div>
      </div>

      {/* Supplies to be used */}
      {formData.suppliesUsed.length > 0 && (
        <div className="space-y-3">
          <Label>Itens que serão utilizados</Label>
          <div className="bg-stone-50 rounded-lg p-4 space-y-2">
            {formData.suppliesUsed.map((item, index) => {
              const supply = supplies.find(s => s.id === item.supplyId);
              const isInsufficient = supply && supply.quantity < item.quantityUsed;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between py-2 border-b border-stone-200 last:border-0 ${isInsufficient ? 'text-rose-600' : ''}`}
                >
                  <span className="text-sm">{item.supplyName}</span>
                  <span className="text-sm font-medium">
                    {item.quantityUsed.toFixed(2)} {item.unit}
                    {supply && (
                      <span className="text-xs text-stone-400 ml-1">
                        (disp: {supply.quantity} {item.unit})
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-2 border-t border-stone-300">
              <span className="text-sm font-medium">Custo Total Estimado</span>
              <span className="text-sm font-semibold text-amber-600">
                R$ {calculateTotalCost().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Warning for insufficient supplies */}
      {insufficientSupplies.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium text-sm">Estoque insuficiente</span>
          </div>
          <ul className="text-sm text-rose-600 space-y-1">
            {insufficientSupplies.map((item, i) => (
              <li key={i}>
                {item.name}: precisa {item.needed} {item.unit}, disponível {item.available} {item.unit}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Anotações sobre a produção..."
          rows={2}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading || insufficientSupplies.length > 0}
          className="flex-1 bg-amber-600 hover:bg-amber-700"
        >
          {isLoading ? "Registrando..." : "Registrar Produção"}
        </Button>
      </div>
    </form>
  );
}