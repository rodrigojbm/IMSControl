import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { suppliesApi, productsApi, movementsApi, productionsApi } from "@/api/apiClient";
import { Package, Boxes, Factory, TrendingUp, ShoppingBag, ArrowDownCircle, Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, startOfYear } from "date-fns";
import StatsCard from "@/components/dashboard/StatsCard";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import RecentMovements from "@/components/dashboard/RecentMovements";
import FinancialReport from "@/components/dashboard/FinancialReport";

export default function Dashboard() {
  const [period, setPeriod] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start = null;
    let end = null;
    if (period === "day") {
      start = format(now, "yyyy-MM-dd");
      end = format(now, "yyyy-MM-dd");
    } else if (period === "month") {
      start = format(startOfMonth(now), "yyyy-MM-dd"); // end will be null -> to present
    } else if (period === "year") {
      start = format(startOfYear(now), "yyyy-MM-dd");
    } else if (period === "custom") {
      start = customStart || null;
      end = customEnd || null;
    }
    return { startDate: start, endDate: end };
  }, [period, customStart, customEnd]);

  const { data: supplies = [] } = useQuery({
    queryKey: ["supplies"],
    queryFn: () => suppliesApi.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list()
  });

  const { data: movements = [] } = useQuery({
    queryKey: ["movements", startDate, endDate],
    queryFn: () => movementsApi.list("-movementDate", null, startDate, endDate)
  });

  const { data: recentMovements = [] } = useQuery({
    queryKey: ["recentMovements"],
    queryFn: () => movementsApi.list("-movementDate", 10)
  });

  // Calculate current stock stats (Globals)
  const totalSupplyValue = supplies.reduce((acc, s) => acc + (s.totalValue || 0), 0);
  const totalProductValue = products.reduce((acc, p) => acc + (p.quantity * (p.salePrice || 0)), 0);

  // Stats from filtered movements
  const itensEntraram = movements.filter(m => m.type === "entrada" && m.itemType === "item").reduce((acc, m) => acc + m.quantity, 0);
  const totalVendas = movements.filter(m => m.type === "saida" && m.category === "venda").reduce((acc, m) => acc + m.totalValue, 0);
  const qtdVendas = movements.filter(m => m.type === "saida" && m.category === "venda").reduce((acc, m) => acc + m.quantity, 0);
  const totalProduzidoMes = movements.filter(m => m.type === "entrada" && m.category === "producao").reduce((acc, m) => acc + m.quantity, 0);

  const lowStockSupplies = supplies.filter(s => s.minQuantity && s.quantity <= s.minQuantity);
  const lowStockProducts = products.filter(p => p.minQuantity && p.quantity <= p.minQuantity);

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header com Filtros */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Dashboard</h1>
            <p className="text-stone-500 mt-1">Visão geral da sua produção de velas</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48 bg-white font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Hoje</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
                <SelectItem value="custom">Período personalizado</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>

            {period === "custom" && (
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border shadow-sm">
                <CalendarIcon className="w-4 h-4 text-stone-400" />
                <input 
                  type="date" 
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-transparent border-none text-sm text-stone-600 focus:ring-0 p-0"
                />
                <span className="text-stone-300">até</span>
                <input 
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-transparent border-none text-sm text-stone-600 focus:ring-0 p-0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Info do Período Selecionado */}
        <div>
          <h2 className="text-lg font-semibold text-stone-700 mb-4">Métricas do Período</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Vendas"
              value={`R$ ${totalVendas.toFixed(2)}`}
              subtitle={`${qtdVendas} produtos vendidos`}
              icon={ShoppingBag}
            />
            <StatsCard
              title="Entrada de Insumos"
              value={itensEntraram.toFixed(0)}
              subtitle="unidades abastecidas"
              icon={ArrowDownCircle}
            />
            <StatsCard
              title="Velas Produzidas"
              value={totalProduzidoMes.toFixed(0)}
              subtitle="produtos finalizados"
              icon={Factory}
            />
          </div>
        </div>

        {/* Global Stock Stats Grid */}
        <div>
          <h2 className="text-lg font-semibold text-stone-700 mb-4">Situação Atual do Estoque</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Insumos"
              value={supplies.length}
              subtitle={`R$ ${totalSupplyValue.toFixed(2)} acumulado`}
              icon={Package}
            />
            <StatsCard
              title="Produtos"
              value={products.length}
              subtitle={`${products.reduce((a, p) => a + p.quantity, 0)} unidades em estoque`}
              icon={Boxes}
            />
            <StatsCard
              title="Valor Potencial"
              value={`R$ ${totalProductValue.toFixed(2)}`}
              subtitle="baseado nos preços de venda"
              icon={TrendingUp}
            />
          </div>
        </div>

        {/* Financial Report - Passando periodLabels dinâmicas */}
        <FinancialReport 
          movements={movements} 
          periodLabel={period === "day" ? "Hoje" : period === "month" ? "Este Mês" : period === "year" ? "Este Ano" : period === "custom" ? "Período Personalizado" : "Todo o período"} 
        />

        {/* Alerts and Recent Activity */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LowStockAlert items={lowStockSupplies} type="supply" />
          <LowStockAlert items={lowStockProducts} type="product" />
          <RecentMovements movements={recentMovements} />
        </div>
      </div>
    </div>
  );
}