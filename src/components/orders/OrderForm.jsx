import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, ArrowRight, PackageOpen } from "lucide-react";
import { format } from "date-fns";
import { NumericFormat } from "react-number-format";

export default function OrderForm({ clients, products, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    clientId: "",
    deliveryDate: "",
    notes: ""
  });

  const [itemData, setItemData] = useState({
    productId: "",
    quantity: 0,
    unitPrice: 0
  });

  const [cartItems, setCartItems] = useState([]);

  // Auto-fill price when product is selected
  const handleProductChange = (productId) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setItemData(prev => ({
        ...prev,
        productId,
        unitPrice: selectedProduct.salePrice || 0
      }));
    }
  };

  const handleAddItemToCart = () => {
    if (!itemData.productId || itemData.quantity <= 0) return;
    
    const product = products.find(p => p.id === itemData.productId);
    
    setCartItems(prev => [
      ...prev,
      {
        localId: Date.now(),
        productId: itemData.productId,
        productName: product?.name || "",
        unitCost: product?.productionCost || 0,
        unitPrice: itemData.unitPrice,
        quantity: parseFloat(itemData.quantity)
      }
    ]);

    // Reset item form
    setItemData({
      productId: "",
      quantity: 0,
      unitPrice: 0
    });
  };

  const handleRemoveFromCart = (localId) => {
    setCartItems(prev => prev.filter(item => item.localId !== localId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientId || cartItems.length === 0) return;

    const apiPayload = {
      clientId: formData.clientId,
      deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : null,
      notes: formData.notes,
      items: cartItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        unitCost: i.unitCost
      }))
    };

    onSubmit(apiPayload);
  };

  const isFormValid = formData.clientId && cartItems.length > 0;
  const cartTotal = cartItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-xl font-semibold text-stone-800">Novo Pedido</h2>
          <p className="text-sm text-stone-500 mt-1">
            Selecione o cliente e os produtos para compor a venda.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Cliente *</Label>
            <Select
              value={formData.clientId}
              onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              required
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione um cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name} - {c.document}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryDate">Data de Entrega (Opcional)</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Entrega prioritária..."
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* Cart Assembly */}
      <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl space-y-4">
        <h3 className="font-medium text-stone-800 flex items-center gap-2">
          <PackageOpen className="w-4 h-4 text-emerald-600" />
          Adicionar ao Carrinho
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 space-y-2">
            <Label className="text-xs text-stone-500 uppercase">Produto</Label>
            <Select
              value={itemData.productId}
              onValueChange={handleProductChange}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} (Disp: {p.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs text-stone-500 uppercase">Qtd</Label>
            <Input
              type="number"
              min="1"
              step="1"
              value={itemData.quantity || ""}
              onChange={(e) => setItemData({ ...itemData, quantity: e.target.value })}
              className="bg-white"
            />
          </div>

          <div className="md:col-span-3 space-y-2">
            <Label className="text-xs text-stone-500 uppercase">Preço Unit. (R$)</Label>
            <NumericFormat
              value={itemData.unitPrice}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
              customInput={Input}
              className="bg-white"
              onValueChange={(values) => {
                const unitPrice = values.floatValue ?? 0;
                setItemData({ ...itemData, unitPrice });
              }}
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <Button 
               type="button" 
               variant="outline"
               onClick={handleAddItemToCart}
               disabled={!itemData.productId || itemData.quantity <= 0}
               className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Cart List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-stone-700">Resumo do Pedido</h3>
          <span className="text-sm font-semibold text-emerald-600">
            Total: R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="py-6 text-center border-2 border-dashed border-stone-200 rounded-xl">
            <p className="text-stone-400 text-sm">O carrinho está vazio.</p>
          </div>
        ) : (
          <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-100">
            {cartItems.map((item) => (
              <div key={item.localId} className="p-3 bg-white flex items-center justify-between group">
                <div>
                  <div className="font-medium text-sm text-stone-800">{item.productName}</div>
                  <div className="text-xs text-stone-500 mt-1">
                    {item.quantity} un x R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-sm text-stone-800">
                    R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-stone-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleRemoveFromCart(item.localId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-stone-100">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 text-stone-600">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white"
        >
          {isLoading ? "Salvando..." : (
            <>
              Confirmar Pedido <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
