import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliesApi, productsApi, productionsApi } from "@/api/apiClient";
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
    queryFn: () => productionsApi.list("-productionDate")
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list()
  });

  const { data: supplies = [] } = useQuery({
    queryKey: ["supplies"],
    queryFn: () => suppliesApi.list()
  });

  const productionMutation = useMutation({
    mutationFn: async (data) => {
      // API expects camelCase
      // Filter out invalid items and ensure all required fields are present
      // Don't include production field - it causes circular reference and API should handle it
      const suppliesUsed = (data.suppliesUsed || [])
        .filter(item => item && item.supplyId && item.supplyId > 0)
        .map(item => ({
          supplyId: Number(item.supplyId),
          supplyName: item.supplyName || "",
          quantityUsed: Number(item.quantityUsed) || 0,
          unit: item.unit || ""
          // Don't include production field - API will set it automatically
        }));

      const apiData = {
        productId: Number(data.productId),
        productName: data.productName || "",
        quantity: Number(data.quantity) || 1,
        productionDate: data.productionDate,
        suppliesUsed: suppliesUsed,
        notes: data.notes || "",
        totalCost: Number(data.totalCost) || 0
      };

      console.log("Dados sendo enviados para API:", JSON.stringify(apiData, null, 2));

      try {
        const response = await productionsApi.create(apiData);
        console.log("Resposta da API:", response);
        return response;
      } catch (error) {
        console.error("Erro completo:", error);
        console.error("Resposta do erro:", error?.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
      queryClient.invalidateQueries({ queryKey: ["productions"] });
      setShowForm(false);
      toast.success("Produção registrada!");
    },
    onError: (error) => {
      console.error("Erro ao registrar produção:", error);
      const errorMessage = error?.response?.data?.message ||
        error?.response?.data?.error ||
        JSON.stringify(error?.response?.data) ||
        "Erro ao registrar produção";
      toast.error(errorMessage);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productions"] });
      toast.success("Registro removido!");
    }
  });

  // Group by date
  const groupedProductions = productions.reduce((acc, prod) => {
    const date = prod.productionDate;
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
                                {production.productName}
                              </h3>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {production.quantity} unidades
                                </Badge>
                                {production.totalCost > 0 && (
                                  <span className="text-xs text-stone-500">
                                    Custo: R$ {production.totalCost.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              {production.suppliesUsed && production.suppliesUsed.length > 0 && (
                                <div className="mt-3 text-xs text-stone-400">
                                  Itens: {production.suppliesUsed.map(s =>
                                    `${s.supplyName} (${s.quantityUsed} ${s.unit})`
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