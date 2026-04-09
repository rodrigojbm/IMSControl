import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, clientsApi, productsApi } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Trash2, FileText, Pickaxe, Banknote, Factory } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import OrderForm from "@/components/orders/OrderForm";
import OrderDetailsSheet from "@/components/orders/OrderDetailsSheet";

const statusConfig = {
  "Pendente": { color: "bg-amber-100 text-amber-800" },
  "Em Produção": { color: "bg-blue-100 text-blue-800" },
  "Pronto": { color: "bg-emerald-100 text-emerald-800" },
  "Entregue": { color: "bg-neutral-100 text-neutral-800" },
  "Cancelado": { color: "bg-rose-100 text-rose-800" },
};

const paymentStatusConfig = {
  "Pendente": { text: "text-rose-600" },
  "Parcial": { text: "text-amber-600" },
  "Pago": { text: "text-emerald-600" }
};

export default function Orders() {
  const [showForm, setShowForm] = useState(false);
  const [detailsModal, setDetailsModal] = useState({ open: false, orderId: null });
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.list()
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list()
  });

  // Fetch single order details if modal is open
  const { data: selectedOrder, isFetching: isLoadingDetails } = useQuery({
    queryKey: ["orders", detailsModal.orderId],
    queryFn: () => ordersApi.get(detailsModal.orderId),
    enabled: !!detailsModal.orderId
  });

  const createMutation = useMutation({
    mutationFn: (data) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false);
      toast.success("Pedido criado com sucesso!");
    },
    onError: (err) => {
      toast.error(err.response?.data || "Erro ao criar pedido.");
    }
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, paymentStatus }) => ordersApi.update(id, { paymentStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Status de pagamento atualizado!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ordersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Pedido excluído e reservas estornadas.");
    },
    onError: (err) => {
      toast.error(err.response?.data || "Erro ao excluir pedido.");
    }
  });

  const produceMutation = useMutation({
    mutationFn: (id) => ordersApi.produce(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["supplies"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      toast.success("Produção concluída! Estoques consumidos e atualizados.");
    },
    onError: (err) => {
      toast.error(err.response?.data || "Erro ao produzir itens.");
    }
  });

  const deliverMutation = useMutation({
    mutationFn: (id) => ordersApi.deliver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      toast.success("Pedido marcado como Entregue!");
      setDetailsModal({ open: false, orderId: null });
    },
    onError: (err) => {
      toast.error(err.response?.data || "Erro ao entregar pedido.");
    }
  });

  const handleDelete = (order) => {
    if (confirm(`Deseja realmente apagar o Pedido #${order.id}?`)) {
      deleteMutation.mutate(order.id);
    }
  };

  const filteredOrders = orders.filter(o => {
    // Status filter
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    
    // Search Term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const clientMatch = o.client?.name.toLowerCase().includes(term);
      const idMatch = o.id.toString().includes(term);
      if (!clientMatch && !idMatch) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Pedidos</h1>
            <p className="text-stone-500 mt-1">Gestão de vendas e encomendas</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-neutral-900 hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pedido
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-stone-200">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {["all", "Pendente", "Em Produção", "Pronto", "Entregue"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterStatus === status 
                    ? "bg-stone-800 text-white shadow-sm" 
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {status === "all" ? "Todos" : status}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar cliente ou # do pedido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 w-full rounded-md border border-stone-200 bg-transparent px-3 py-2 text-sm placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
            />
          </div>
        </div>

        {/* Dashboard Cards Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-none shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">A Produzir</p>
              <p className="text-2xl font-bold text-stone-800">
                {orders.filter(o => o.status === "Pendente").length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Pickaxe className="w-5 h-5" />
            </div>
          </Card>
          
          <Card className="p-4 border-none shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Na Fila</p>
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === "Em Produção" || o.status === "Pronto").length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Factory className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-none shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Financeiro Estimado</p>
              <p className="text-xl font-bold text-emerald-600">
                R$ {orders.filter(o => o.status !== "Cancelado").reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Banknote className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Order List */}
        {isLoading ? (
          <div className="text-center py-12 text-stone-500">Carregando pedidos...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-stone-500 bg-white rounded-xl border border-stone-100 shadow-sm">
            Nenhum pedido encontrado.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <Card key={order.id} className="border-0 shadow-sm bg-white overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="p-4 border-b border-stone-100 flex items-start justify-between">
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-stone-400">#{order.id}</span>
                      <h3 className="font-semibold text-stone-800 truncate">{order.client?.name}</h3>
                    </div>
                    <p className="text-xs text-stone-500">
                      Entregar em: {order.deliveryDate ? format(parseISO(order.deliveryDate), "dd/MM/yyyy") : 'Não definida'}
                    </p>
                  </div>
                  <Badge className={`${statusConfig[order.status]?.color} border-none font-medium whitespace-nowrap`}>
                    {order.status}
                  </Badge>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500 flex items-center gap-1.5"><FileText className="w-4 h-4"/> Itens</span>
                    <span className="font-medium text-stone-800">{order.items?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Pagamento</span>
                    <span className={`font-semibold ${paymentStatusConfig[order.paymentStatus]?.text}`}>
                      {order.paymentStatus}
                    </span>
                  </div>

                  {/* Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="pt-2">
                       <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Resumo dos Itens</p>
                       <div className="bg-stone-50 rounded-lg p-2 space-y-1">
                         {order.items.slice(0, 3).map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-xs">
                             <span className="text-stone-600 truncate pr-2">{item.quantity}x {item.product?.name || `Produto #${item.productId}`}</span>
                             <span className="text-stone-400 font-medium">R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                           </div>
                         ))}
                         {order.items.length > 3 && (
                           <div className="text-xs text-stone-400 text-center pt-1 italic">
                             + {order.items.length - 3} item(s)
                           </div>
                         )}
                       </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-lg pt-2 border-t border-stone-50">
                    <span className="text-stone-800 font-bold">Total</span>
                    <span className="text-stone-800 font-bold">R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center gap-2">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => setDetailsModal({ open: true, orderId: order.id })}
                  >
                    Ver Detalhes
                  </Button>
                  
                  {order.status !== "Entregue" && (
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(order)}
                      className="text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Forms and Sheets */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="overflow-y-auto sm:max-w-3xl w-full">
          <OrderForm
            clients={clients}
            products={products}
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={detailsModal.open} onOpenChange={(open) => setDetailsModal({ ...detailsModal, open })}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          {isLoadingDetails ? (
             <div className="py-20 text-center text-stone-500">Carregando detalhes...</div>
          ) : (
            <OrderDetailsSheet
              order={selectedOrder}
              onProduce={(id) => produceMutation.mutate(id)}
              onDeliver={(id) => deliverMutation.mutate(id)}
              onUpdatePayment={(id, status) => updatePaymentMutation.mutate({ id, paymentStatus: status })}
              isLoading={produceMutation.isPending || deliverMutation.isPending || updatePaymentMutation.isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
