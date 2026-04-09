import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

export default function FinancialReport({ movements, periodLabel }) {
  const filteredData = useMemo(() => {
    // Usamos os movements inteiros, pois já foram filtrados pela Dashboard
    const filtered = movements;

    // Gastos: compras (entradas) + perdas (saídas)
    const expenses = filtered.filter(m => (
      // compras de itens/insumos
      m.type === "entrada" && (m.itemType === "item" || m.itemType === "insumo") && m.category === "compra") ||
      // perdas (saídas)
      (m.type === "saida" && m.category?.toLowerCase() === "perda") ||
      // devolucoes entram nas depesas tambem ou nao? Para simplificar, vou manter como estava:
      (m.type === "saida" && m.category?.toLowerCase() === "perda")
    ).reduce((acc, m) => acc + (m.totalValue || 0), 0);

    // Receita: saídas de produtos (vendas)
    const revenue = filtered
      .filter(m => m.type === "saida" && m.itemType === "produto" && m.category === "venda")
      .reduce((acc, m) => acc + (m.totalValue || 0), 0);

    // Lucro
    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Contagens
    const purchaseCount = filtered.filter(m => 
      (m.type === "entrada" && m.category === "compra") ||
      (m.type === "saida" && m.category?.toLowerCase() === "perda")
    ).length;
    const salesCount = filtered.filter(m => m.type === "saida" && m.category === "venda").length;

    return { expenses, revenue, profit, margin, purchaseCount, salesCount };
  }, [movements]);

  return (
    <Card className="p-6 border-0 shadow-sm bg-white col-span-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <h3 className="font-semibold text-lg text-stone-800">Relatório Financeiro</h3>
      </div>

      <p className="text-sm text-stone-500 mb-6">{periodLabel || "Atualmente Selecionado"}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gastos */}
        <div className="p-4 rounded-xl bg-rose-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-rose-600">Gastos & Perdas</span>
          </div>
          <p className="text-2xl font-bold text-rose-700">
            R$ {filteredData.expenses.toFixed(2)}
          </p>
          <p className="text-xs text-rose-500 mt-1">
            {filteredData.purchaseCount} registros
          </p>
        </div>

        {/* Receita */}
        <div className="p-4 rounded-xl bg-emerald-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-emerald-600">Receita (Vendas)</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            R$ {filteredData.revenue.toFixed(2)}
          </p>
          <p className="text-xs text-emerald-500 mt-1">
            {filteredData.salesCount} vendas
          </p>
        </div>

        {/* Lucro */}
        <div className={`p-4 rounded-xl ${filteredData.profit >= 0 ? "bg-blue-50" : "bg-orange-50"}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`w-4 h-4 ${filteredData.profit >= 0 ? "text-blue-500" : "text-orange-500"}`} />
            <span className={`text-sm ${filteredData.profit >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              {filteredData.profit >= 0 ? "Lucro" : "Prejuízo"}
            </span>
          </div>
          <p className={`text-2xl font-bold ${filteredData.profit >= 0 ? "text-blue-700" : "text-orange-700"}`}>
            R$ {Math.abs(filteredData.profit).toFixed(2)}
          </p>
        </div>

        {/* Margem */}
        <div className="p-4 rounded-xl bg-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-600">Margem</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {filteredData.margin.toFixed(1)}%
          </p>
        </div>
      </div>
    </Card>
  );
}