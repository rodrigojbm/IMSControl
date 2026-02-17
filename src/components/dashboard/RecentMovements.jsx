import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RecentMovements({ movements }) {
  if (!movements || movements.length === 0) {
    return (
      <Card className="p-5 border-0 shadow-sm bg-white">
        <h3 className="font-medium text-stone-800 mb-4">Últimas Movimentações</h3>
        <p className="text-sm text-stone-400 text-center py-8">
          Nenhuma movimentação registrada
        </p>
      </Card>
    );
  }

  const categoryLabels = {
    compra: "Compra",
    venda: "Venda",
    producao: "Produção",
    perda: "Perda",
    ajuste: "Ajuste",
    devolucao: "Devolução"
  };

  return (
    <Card className="p-5 border-0 shadow-sm bg-white">
      <h3 className="font-medium text-stone-800 mb-4">Últimas Movimentações</h3>
      <div className="space-y-3">
        {movements.slice(0, 6).map((movement) => (
          <div key={movement.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
            <div className={`p-2 rounded-lg ${movement.type === "entrada" ? "bg-emerald-50" : "bg-rose-50"}`}>
              {movement.type === "entrada" ? (
                <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <ArrowUpCircle className="w-4 h-4 text-rose-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 truncate">
                {movement.item_name}
              </p>
              <p className="text-xs text-stone-400">
                {categoryLabels[movement.category]} • {movement.quantity} {movement.unit || "un"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-400">
                {format(new Date(movement.movement_date), "dd MMM", { locale: ptBR })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}