import { useQuery } from "@tanstack/react-query";
import { suppliesApi, productsApi, movementsApi, productionsApi } from "@/api/apiClient";
import { Package, Boxes, Factory, TrendingUp } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import RecentMovements from "@/components/dashboard/RecentMovements";
import FinancialReport from "@/components/dashboard/FinancialReport";

export default function Dashboard() {
  const { data: supplies = [] } = useQuery({
    queryKey: ["supplies"],
    queryFn: () => suppliesApi.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list()
  });

  const { data: movements = [] } = useQuery({
    queryKey: ["movements"],
    queryFn: () => movementsApi.list("-movementDate")
  });

  const { data: recentMovements = [] } = useQuery({
    queryKey: ["recentMovements"],
    queryFn: () => movementsApi.list("-movementDate", 10)
  });

  const { data: productions = [] } = useQuery({
    queryKey: ["productions"],
    queryFn: () => productionsApi.list("-production_date", 30)
  });

  // Calculate stats
  const totalSupplyValue = supplies.reduce((acc, s) => acc + (s.quantity * (s.costPerUnit || 0)), 0);
  const totalProductValue = products.reduce((acc, p) => acc + (p.quantity * (p.salePrice || 0)), 0);
  const totalProduced = productions.reduce((acc, p) => acc + p.quantity, 0);

  const lowStockSupplies = supplies.filter(s => s.minQuantity && s.quantity <= s.minQuantity);
  const lowStockProducts = products.filter(p => p.minQuantity && p.quantity <= p.minQuantity);

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Dashboard</h1>
          <p className="text-stone-500 mt-1">Visão geral da sua produção de velas</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Tipos de Insumos"
            value={supplies.length}
            subtitle={`R$ ${totalSupplyValue.toFixed(2)} em estoque`}
            icon={Package}
          />
          <StatsCard
            title="Produtos"
            value={products.length}
            subtitle={`${products.reduce((a, p) => a + p.quantity, 0)} unidades`}
            icon={Boxes}
          />
          <StatsCard
            title="Produzidas (30 dias)"
            value={totalProduced}
            subtitle="velas produzidas"
            icon={Factory}
          />
          <StatsCard
            title="Valor em Produtos"
            value={`R$ ${totalProductValue.toFixed(0)}`}
            subtitle="valor potencial de venda"
            icon={TrendingUp}
          />
        </div>

        {/* Financial Report */}
        <FinancialReport movements={movements} />

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