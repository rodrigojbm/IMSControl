import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import ProductForm from "@/components/products/ProductForm";
import ProductCard from "@/components/products/ProductCard";
import ProductionForm from "@/components/production/ProductionForm";
import StockMovementForm from "@/components/stock/StockMovementForm";

export default function Products() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [productionModal, setProductionModal] = useState({ open: false, product: null });
  const [stockModal, setStockModal] = useState({ open: false, type: null, item: null });

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: supplies = [] } = useQuery({
    queryKey: ["supplies"],
    queryFn: () => base44.entities.Supply.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false);
      toast.success("Produto cadastrado com sucesso!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false);
      setEditingProduct(null);
      toast.success("Produto atualizado!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto removido!");
    }
  });

  const productionMutation = useMutation({
    mutationFn: async (data) => {
      // Create production record
      await base44.entities.Production.create(data);
      
      // Update product quantity
      const product = products.find(p => p.id === data.product_id);
      if (product) {
        await base44.entities.Product.update(data.product_id, {
          quantity: product.quantity + data.quantity
        });
      }
      
      // Update supplies quantities
      for (const item of data.supplies_used) {
        const supply = supplies.find(s => s.id === item.supply_id);
        if (supply) {
          await base44.entities.Supply.update(item.supply_id, {
            quantity: Math.max(0, supply.quantity - item.quantity_used)
          });
        }
      }

      // Create stock movements for supplies used
      for (const item of data.supplies_used) {
        await base44.entities.StockMovement.create({
          type: "saida",
          category: "producao",
          item_type: "insumo",
          item_id: item.supply_id,
          item_name: item.supply_name,
          quantity: item.quantity_used,
          unit: item.unit,
          movement_date: data.production_date,
          notes: `Usado na produção de ${data.quantity}x ${data.product_name}`
        });
      }

      // Create stock movement for product entry
      await base44.entities.StockMovement.create({
        type: "entrada",
        category: "producao",
        item_type: "produto",
        item_id: data.product_id,
        item_name: data.product_name,
        quantity: data.quantity,
        unit: "un",
        unit_value: data.total_cost / data.quantity,
        total_value: data.total_cost,
        movement_date: data.production_date
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
      queryClient.invalidateQueries({ queryKey: ["productions"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      setProductionModal({ open: false, product: null });
      toast.success("Produção registrada com sucesso!");
    }
  });

  const stockMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.StockMovement.create(data);
      const product = products.find(p => p.id === data.item_id);
      if (product) {
        const newQuantity = data.type === "entrada"
          ? product.quantity + data.quantity
          : product.quantity - data.quantity;
        await base44.entities.Product.update(data.item_id, { quantity: Math.max(0, newQuantity) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      setStockModal({ open: false, type: null, item: null });
      toast.success("Movimentação registrada!");
    }
  });

  const handleSubmit = (data) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (product) => {
    if (confirm(`Deseja excluir "${product.name}"?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by size
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const size = product.size || "outros";
    if (!acc[size]) acc[size] = [];
    acc[size].push(product);
    return acc;
  }, {});

  const sizeLabels = {
    pequena: "Pequenas",
    media: "Médias",
    grande: "Grandes",
    especial: "Especiais"
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Produtos</h1>
            <p className="text-stone-500 mt-1">Suas velas e produtos acabados</p>
          </div>
          <Button
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-stone-200"
          />
        </div>

        {/* Products Grid by Size */}
        {isLoading ? (
          <div className="text-center py-12 text-stone-500">Carregando...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedProducts).map(([size, items]) => (
              <div key={size}>
                <h2 className="text-lg font-semibold text-stone-700 mb-4">
                  {sizeLabels[size] || "Outros"}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onProduce={(p) => setProductionModal({ open: true, product: p })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Form Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <ProductForm
            product={editingProduct}
            supplies={supplies}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingProduct(null); }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </SheetContent>
      </Sheet>

      {/* Production Form Sheet */}
      <Sheet open={productionModal.open} onOpenChange={(open) => setProductionModal({ ...productionModal, open })}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <ProductionForm
            product={productionModal.product}
            products={products}
            supplies={supplies}
            onSubmit={(data) => productionMutation.mutate(data)}
            onCancel={() => setProductionModal({ open: false, product: null })}
            isLoading={productionMutation.isPending}
          />
        </SheetContent>
      </Sheet>

      {/* Stock Movement Sheet */}
      <Sheet open={stockModal.open} onOpenChange={(open) => setStockModal({ ...stockModal, open })}>
        <SheetContent className="overflow-y-auto">
          <StockMovementForm
            type={stockModal.type}
            itemType="produto"
            item={stockModal.item}
            supplies={supplies}
            products={products}
            onSubmit={(data) => stockMutation.mutate(data)}
            onCancel={() => setStockModal({ open: false, type: null, item: null })}
            isLoading={stockMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}