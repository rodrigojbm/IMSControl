import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { format, startOfDay, startOfMonth, startOfYear, isAfter, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FinancialReport({ movements }) {
  const [period, setPeriod] = useState("month");

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate = null;

    if (period === "day") {
      startDate = startOfDay(now);
    } else if (period === "month") {
      startDate = startOfMonth(now);
    } else if (period === "year") {
      startDate = startOfYear(now);
    }

    const filtered = movements.filter(m => {
      if (period === "all") return true;
      const movDate = parseISO(m.movementDate);
      return isAfter(movDate, startDate) || movDate.getTime() === startDate.getTime();
    });

    // Gastos: entradas de insumos (compras)
    const expenses = filtered
      .filter(m => m.type === "entrada" && m.itemType === "insumo" && m.category === "compra")
      .reduce((acc, m) => acc + (m.totalValue || 0), 0);

    // Receita: saídas de produtos (vendas)
    const revenue = filtered
      .filter(m => m.type === "saida" && m.itemType === "produto" && m.category === "venda")
      .reduce((acc, m) => acc + (m.totalValue || 0), 0);

    // Lucro
    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Contagens
    const purchaseCount = filtered.filter(m => m.type === "entrada" && m.category === "compra").length;
    const salesCount = filtered.filter(m => m.type === "saida" && m.category === "venda").length;

    return { expenses, revenue, profit, margin, purchaseCount, salesCount };
  }, [movements, period]);

  const periodLabels = {
    day: "Hoje",
    month: format(new Date(), "MMMM/yyyy", { locale: ptBR }),
    year: format(new Date(), "yyyy"),
    all: "Todo o período"
  };

  return (
    <Card className="p-6 border-0 shadow-sm bg-white col-span-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="font-semibold text-lg text-stone-800">Relatório Financeiro</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Hoje</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
            <SelectItem value="all">Total</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-stone-500 mb-4">{periodLabels[period]}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gastos */}
        <div className="p-4 rounded-xl bg-rose-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-rose-600">Gastos (Compras)</span>
          </div>
          <p className="text-2xl font-bold text-rose-700">
            R$ {filteredData.expenses.toFixed(2)}
          </p>
          <p className="text-xs text-rose-500 mt-1">
            {filteredData.purchaseCount} compras
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