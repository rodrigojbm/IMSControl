import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import StockMovementForm from "@/components/stock/StockMovementForm";

export default function Movements() {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("entrada");
  const [filter, setFilter] = useState("all");

  const queryClient = useQueryClient();

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ["movements"],
    queryFn: () => base44.entities.StockMovement.list("-movement_date")
  });

  const { data: supplies = [] } = useQuery({
    queryKey: ["supplies"],
    queryFn: () => base44.entities.Supply.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list()
  });

  const movementMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.StockMovement.create(data);
      
      if (data.item_type === "insumo") {
        const supply = supplies.find(s => s.id === data.item_id);
        if (supply) {
          const newQuantity = data.type === "entrada"
            ? supply.quantity + data.quantity
            : supply.quantity - data.quantity;
          await base44.entities.Supply.update(data.item_id, { quantity: Math.max(0, newQuantity) });
        }
      } else {
        const product = products.find(p => p.id === data.item_id);
        if (product) {
          const newQuantity = data.type === "entrada"
            ? product.quantity + data.quantity
            : product.quantity - data.quantity;
          await base44.entities.Product.update(data.item_id, { quantity: Math.max(0, newQuantity) });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false);
      toast.success("Movimentação registrada!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StockMovement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      toast.success("Registro removido!");
    }
  });

  const categoryLabels = {
    compra: "Compra",
    venda: "Venda",
    producao: "Produção",
    perda: "Perda",
    ajuste: "Ajuste",
    devolucao: "Devolução"
  };

  const filteredMovements = movements.filter(m => {
    if (filter === "all") return true;
    if (filter === "entrada") return m.type === "entrada";
    if (filter === "saida") return m.type === "saida";
    return true;
  });

  // Group by date
  const groupedMovements = filteredMovements.reduce((acc, mov) => {
    const date = mov.movement_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(mov);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Movimentações</h1>
            <p className="text-stone-500 mt-1">Entradas e saídas de estoque</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => { setFormType("saida"); setShowForm(true); }}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Saída
            </Button>
            <Button
              onClick={() => { setFormType("entrada"); setShowForm(true); }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Entrada
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-white border">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="entrada">Entradas</TabsTrigger>
            <TabsTrigger value="saida">Saídas</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Movements List */}
        {isLoading ? (
          <div className="text-center py-12 text-stone-500">Carregando...</div>
        ) : filteredMovements.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            Nenhuma movimentação encontrada.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMovements)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([date, items]) => (
                <div key={date}>
                  <h2 className="text-sm font-medium text-stone-500 mb-3">
                    {format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </h2>
                  <div className="space-y-2">
                    {items.map((movement) => (
                      <Card key={movement.id} className="p-4 border-0 shadow-sm bg-white">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            movement.type === "entrada" ? "bg-emerald-50" : "bg-rose-50"
                          }`}>
                            {movement.type === "entrada" ? (
                              <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ArrowUpCircle className="w-5 h-5 text-rose-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-stone-800 truncate">
                                {movement.item_name}
                              </h3>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {movement.item_type === "insumo" ? "Insumo" : "Produto"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-stone-500">
                              <span>{categoryLabels[movement.category]}</span>
                              <span>•</span>
                              <span>{movement.quantity} {movement.unit}</span>
                              {movement.total_value > 0 && (
                                <>
                                  <span>•</span>
                                  <span>R$ {movement.total_value.toFixed(2)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Deseja excluir esta movimentação?")) {
                                deleteMutation.mutate(movement.id);
                              }
                            }}
                            className="text-stone-400 hover:text-rose-500 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Movement Form Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="overflow-y-auto">
          <StockMovementForm
            type={formType}
            supplies={supplies}
            products={products}
            onSubmit={(data) => movementMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            isLoading={movementMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}