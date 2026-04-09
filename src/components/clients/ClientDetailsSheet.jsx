import { useQuery } from "@tanstack/react-query";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Phone, Mail, BuildingIcon, FileText, PackageOpen } from "lucide-react";
import { ordersApi } from "@/api/apiClient";

const statusConfig = {
  "Pendente": "bg-amber-100 text-amber-800",
  "Em Produção": "bg-blue-100 text-blue-800",
  "Pronto": "bg-emerald-100 text-emerald-800",
  "Entregue": "bg-neutral-100 text-neutral-800",
  "Cancelado": "bg-rose-100 text-rose-800",
};

export default function ClientDetailsSheet({ client }) {
  if (!client) return null;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.list()
  });

  const clientOrders = orders.filter(o => o.clientId === client.id);
  const totalSpent = clientOrders
    .filter(o => o.status !== "Cancelado")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <SheetHeader className="p-6 bg-white border-b border-stone-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center">
            <BuildingIcon className="w-6 h-6 text-stone-600" />
          </div>
          <div>
            <SheetTitle className="text-xl text-stone-800">{client.name}</SheetTitle>
            <SheetDescription>Visão geral do cliente e histórico de pedidos</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">Total Gasto</p>
            <p className="text-2xl font-bold text-emerald-600">
              R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">Total de Pedidos</p>
            <p className="text-2xl font-bold text-stone-800">
              {clientOrders.length}
            </p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50 font-medium text-stone-700">
            Dados de Contato
          </div>
          <div className="p-4 space-y-3">
             {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-700">{client.phone}</span>
                </div>
             )}
             {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-700">{client.email}</span>
                </div>
             )}
             {client.document && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-700">{client.document}</span>
                </div>
             )}
             {client.address && (
                <div className="flex items-start gap-2 text-sm pt-2 border-t border-stone-50">
                  <span className="text-stone-400 font-medium">Endereço:</span>
                  <span className="text-stone-600">{client.address}</span>
                </div>
             )}
             {client.notes && (
                <div className="flex items-start gap-2 text-sm pt-2 border-t border-stone-50">
                  <span className="text-stone-400 font-medium">Obs:</span>
                  <span className="text-stone-600 italic">{client.notes}</span>
                </div>
             )}
          </div>
        </div>

        {/* Order History */}
        <div className="space-y-3">
          <h3 className="font-semibold text-stone-800 flex items-center gap-2">
            <PackageOpen className="w-4 h-4 text-amber-600" />
            Histórico de Pedidos
          </h3>
          
          {isLoading ? (
            <div className="p-8 text-center text-stone-400 bg-white rounded-xl border border-stone-100">Carregando pedidos...</div>
          ) : clientOrders.length === 0 ? (
            <div className="p-8 text-center text-stone-400 bg-white rounded-xl border border-stone-100">
              Nenhum pedido encontrado para este cliente.
            </div>
          ) : (
            <div className="space-y-3">
              {clientOrders.map(order => (
                <div key={order.id} className="bg-white p-4 rounded-xl border border-stone-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-stone-400 text-xs font-bold">#{order.id}</span>
                      <span className="text-stone-500 text-xs ml-2">
                        Criado: {format(parseISO(order.orderDate), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <Badge className={`${statusConfig[order.status]} border-none font-medium text-xs`}>
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-stone-50">
                    <span className="text-stone-500">{order.items?.length || 0} itens</span>
                    <span className="font-bold text-stone-800">
                      R$ {order.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
