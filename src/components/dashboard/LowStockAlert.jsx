import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LowStockAlert({ items, type }) {
  if (!items || items.length === 0) return null;

  return (
    <Card className="p-5 border-0 shadow-sm bg-white">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-rose-50">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
        </div>
        <h3 className="font-medium text-stone-800">
          {type === "supply" ? "Insumos em Baixa" : "Produtos em Baixa"}
        </h3>
        <Badge variant="secondary" className="ml-auto bg-rose-50 text-rose-600 hover:bg-rose-50">
          {items.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {items.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-stone-700">{item.name}</p>
              <p className="text-xs text-stone-400">
                Mínimo: {item.min_quantity} {item.unit || "un"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-rose-600">
                {item.quantity} {item.unit || "un"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}