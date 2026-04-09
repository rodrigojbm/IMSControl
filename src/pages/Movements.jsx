import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliesApi, productsApi, movementsApi } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle, Trash2, FileText } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import StockMovementForm from "@/components/stock/StockMovementForm";
import MovementDetails from "@/components/stock/MovementDetails";

export default function Movements() {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("entrada");
  const [filter, setFilter] = useState("all");
  const [selectedMovement, setSelectedMovement] = useState(null);

  const queryClient = useQueryClient();

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ["movements"],
    queryFn: () => movementsApi.list("-movementDate")
  });

  const { data: supplies = [] } = useQuery({
    queryKey: ["supplies"],
    queryFn: () => suppliesApi.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list()
  });

  const movementMutation = useMutation({
    mutationFn: async (data) => {
      await movementsApi.createBatch(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      setShowForm(false);
      toast.success("Movimentação registrada!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => movementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      setSelectedMovement(null);
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
    const date = mov.movementDate ? mov.movementDate.split('T')[0] : "";
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
              .map(([date, items]) => {
                const isValidDate = !isNaN(new Date(date).getTime());
                return (
                  <div key={date}>
                    <h2 className="text-sm font-medium text-stone-500 mb-3">
                      {isValidDate ? format(new Date(date + "T12:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR }) : ""}
                    </h2>
                    <div className="space-y-3">
                      {items.map((movement) => (
                        <Card 
                          key={movement.id} 
                          className="p-4 border border-transparent shadow-sm bg-white hover:border-stone-200 cursor-pointer transition-colors"
                          onClick={() => setSelectedMovement(movement)}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg mt-1 shrink-0 ${movement.type === "entrada" ? "bg-emerald-50" : "bg-rose-50"
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
                                  {movement.itemName}
                                </h3>
                                <Badge variant="outline" className="text-xs shrink-0 bg-stone-50">
                                  {movement.itemType === "item" ? "Insumo" : "Produto"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-stone-600 font-medium">
                                <span>{categoryLabels[movement.category]}</span>
                                <span className="text-stone-300">•</span>
                                <span className={movement.type === "entrada" ? "text-emerald-700" : "text-rose-600"}>
                                  {movement.type === "entrada" ? "+" : "-"}{movement.quantity} {movement.unit}
                                </span>
                                {movement.totalValue > 0 && (
                                  <>
                                    <span className="text-stone-300">•</span>
                                    <span>R$ {movement.totalValue.toFixed(2)}</span>
                                  </>
                                )}
                              </div>
                              {movement.notes && (
                                <div className="mt-3 flex items-start gap-2 text-sm text-stone-500 bg-stone-50/50 p-2 rounded-md border border-stone-100">
                                  <FileText className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{movement.notes}</span>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Deseja excluir esta movimentação? Essa ação cancelará efeitos no estoque.")) {
                                  deleteMutation.mutate(movement.id);
                                }
                              }}
                              className="text-stone-300 hover:text-rose-500 hover:bg-rose-50 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Movement Details Sheet */}
      <Sheet open={!!selectedMovement} onOpenChange={(open) => !open && setSelectedMovement(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <MovementDetails
            movement={selectedMovement}
            onCancel={() => setSelectedMovement(null)}
          />
        </SheetContent>
      </Sheet>

      {/* Movement Form Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
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