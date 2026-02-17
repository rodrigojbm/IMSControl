import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import SupplyForm from "@/components/supplies/SupplyForm";
import SupplyCard from "@/components/supplies/SupplyCard";
import StockMovementForm from "@/components/stock/StockMovementForm";

export default function Supplies() {
  const [showForm, setShowForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockModal, setStockModal] = useState({ open: false, type: null, item: null });

  const queryClient = useQueryClient();

  const { data: supplies = [], isLoading } = useQuery({
    queryKey: ["supplies"],
    queryFn: () => base44.entities.Supply.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Supply.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
      setShowForm(false);
      toast.success("Insumo cadastrado com sucesso!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Supply.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
      setShowForm(false);
      setEditingSupply(null);
      toast.success("Insumo atualizado!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Supply.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
      toast.success("Insumo removido!");
    }
  });

  const movementMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.StockMovement.create(data);
      // Update supply quantity
      const supply = supplies.find(s => s.id === data.item_id);
      if (supply) {
        const newQuantity = data.type === "entrada" 
          ? supply.quantity + data.quantity 
          : supply.quantity - data.quantity;
        await base44.entities.Supply.update(data.item_id, { quantity: Math.max(0, newQuantity) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      setStockModal({ open: false, type: null, item: null });
      toast.success("Movimentação registrada!");
    }
  });

  const handleSubmit = (data) => {
    if (editingSupply) {
      updateMutation.mutate({ id: editingSupply.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (supply) => {
    setEditingSupply(supply);
    setShowForm(true);
  };

  const handleDelete = (supply) => {
    if (confirm(`Deseja excluir "${supply.name}"?`)) {
      deleteMutation.mutate(supply.id);
    }
  };

  const filteredSupplies = supplies.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by category
  const groupedSupplies = filteredSupplies.reduce((acc, supply) => {
    const cat = supply.category || "outros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(supply);
    return acc;
  }, {});

  const categoryLabels = {
    cera: "Ceras",
    essencia: "Essências",
    pavio: "Pavios",
    pote: "Potes e Recipientes",
    corante: "Corantes",
    embalagem: "Embalagens",
    outros: "Outros"
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Insumos</h1>
            <p className="text-stone-500 mt-1">Gerencie seus materiais de produção</p>
          </div>
          <Button 
            onClick={() => { setEditingSupply(null); setShowForm(true); }}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Insumo
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar insumos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-stone-200"
          />
        </div>

        {/* Supplies Grid by Category */}
        {isLoading ? (
          <div className="text-center py-12 text-stone-500">Carregando...</div>
        ) : filteredSupplies.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            Nenhum insumo cadastrado. Clique em "Novo Insumo" para começar.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSupplies).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-lg font-semibold text-stone-700 mb-4">
                  {categoryLabels[category]}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((supply) => (
                    <SupplyCard
                      key={supply.id}
                      supply={supply}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAddStock={(s) => setStockModal({ open: true, type: "entrada", item: s })}
                      onRemoveStock={(s) => setStockModal({ open: true, type: "saida", item: s })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supply Form Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="overflow-y-auto">
          <SupplyForm
            supply={editingSupply}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingSupply(null); }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </SheetContent>
      </Sheet>

      {/* Stock Movement Sheet */}
      <Sheet open={stockModal.open} onOpenChange={(open) => setStockModal({ ...stockModal, open })}>
        <SheetContent className="overflow-y-auto">
          <StockMovementForm
            type={stockModal.type}
            itemType="insumo"
            item={stockModal.item}
            supplies={supplies}
            products={products}
            onSubmit={(data) => movementMutation.mutate(data)}
            onCancel={() => setStockModal({ open: false, type: null, item: null })}
            isLoading={movementMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}