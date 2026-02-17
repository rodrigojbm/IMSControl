import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Plus, Factory, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import ProductionForm from "@/components/production/ProductionForm";

export default function Production() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: productions = [], isLoading } = useQuery({
    queryKey: ["productions"],
    queryFn: () => base44.entities.Production.list("-production_date")
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: supplies = [] } = useQuery({
    queryKey: ["supplies"],
    queryFn: () => base44.entities.Supply.list()
  });

  const productionMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Production.create(data);
      
      const product = products.find(p => p.id === data.product_id);
      if (product) {
        await base44.entities.Product.update(data.product_id, {
          quantity: product.quantity + data.quantity
        });
      }
      
      for (const item of data.supplies_used) {
        const supply = supplies.find(s => s.id === item.supply_id);
        if (supply) {
          await base44.entities.Supply.update(item.supply_id, {
            quantity: Math.max(0, supply.quantity - item.quantity_used)
          });
        }
      }

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
      setShowForm(false);
      toast.success("Produção registrada!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Production.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productions"] });
      toast.success("Registro removido!");
    }
  });

  // Group by date
  const groupedProductions = productions.reduce((acc, prod) => {
    const date = prod.production_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(prod);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Produção</h1>
            <p className="text-stone-500 mt-1">Histórico de velas produzidas</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Produção
          </Button>
        </div>

        {/* Production List */}
        {isLoading ? (
          <div className="text-center py-12 text-stone-500">Carregando...</div>
        ) : productions.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            Nenhuma produção registrada. Clique em "Nova Produção" para começar.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedProductions)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([date, items]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-stone-400" />
                    <h2 className="text-sm font-medium text-stone-500">
                      {format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {items.map((production) => (
                      <Card key={production.id} className="p-4 border-0 shadow-sm bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-amber-50">
                              <Factory className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-stone-800">
                                {production.product_name}
                              </h3>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {production.quantity} unidades
                                </Badge>
                                {production.total_cost > 0 && (
                                  <span className="text-xs text-stone-500">
                                    Custo: R$ {production.total_cost.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              {production.supplies_used && production.supplies_used.length > 0 && (
                                <div className="mt-3 text-xs text-stone-400">
                                  Insumos: {production.supplies_used.map(s => 
                                    `${s.supply_name} (${s.quantity_used} ${s.unit})`
                                  ).join(", ")}
                                </div>
                              )}
                              {production.notes && (
                                <p className="mt-2 text-sm text-stone-500">{production.notes}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Deseja excluir este registro de produção?")) {
                                deleteMutation.mutate(production.id);
                              }
                            }}
                            className="text-stone-400 hover:text-rose-500"
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

      {/* Production Form Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <ProductionForm
            products={products}
            supplies={supplies}
            onSubmit={(data) => productionMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            isLoading={productionMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}