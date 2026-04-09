import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  User,
  Truck,
  CreditCard,
  DollarSign,
  PackageCheck,
  PackageOpen,
  ArrowRightCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ReceiptText,
  Factory
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  "Pendente": { color: "bg-amber-100 text-amber-800", icon: Clock },
  "Em Produção": { color: "bg-blue-100 text-blue-800", icon: PackageOpen },
  "Pronto": { color: "bg-emerald-100 text-emerald-800", icon: PackageCheck },
  "Entregue": { color: "bg-neutral-100 text-neutral-800", icon: Truck },
  "Cancelado": { color: "bg-rose-100 text-rose-800", icon: XCircle },
};

const paymentStatusConfig = {
  "Pendente": { color: "text-rose-600 bg-rose-50 border-rose-200" },
  "Parcial": { color: "text-amber-600 bg-amber-50 border-amber-200" },
  "Pago": { color: "text-emerald-600 bg-emerald-50 border-emerald-200" }
};

export default function OrderDetailsSheet({ order, onProduce, onDeliver, onUpdatePayment, isLoading }) {
  if (!order) return null;

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  
  const formatDate = (dateString) => {
    if (!dateString) return "Não definida";
    return format(parseISO(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
  };

  const margin = order.totalAmount - order.totalCost;
  const marginPercent = order.totalAmount > 0 ? (margin / order.totalAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            Pedido #{order.id}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={`${statusConfig[order.status]?.color} border-none font-medium flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {order.status}
            </Badge>
            <span className="text-sm text-stone-500">
              {formatDate(order.orderDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Client Info */}
        <div className="col-span-2 p-4 bg-stone-50 rounded-xl border border-stone-100">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2 uppercase tracking-wider">
            <User className="w-4 h-4" /> Cliente
          </div>
          <div className="font-medium text-lg text-stone-800">{order.client?.name}</div>
          <div className="text-sm text-stone-500 mt-1">{order.client?.email} • {order.client?.phone}</div>
          <div className="text-sm text-stone-500">{order.client?.address}</div>
        </div>

        {/* Dates */}
        <div className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Entrega Prevista</p>
            <p className="text-sm font-medium text-stone-800">{formatDate(order.deliveryDate)}</p>
          </div>
        </div>

        {/* Payment */}
        <div className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Pagamento</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button disabled={isLoading} className="text-sm font-medium text-stone-800 hover:underline text-left">
                  <Badge variant="outline" className={`mt-0.5 ${paymentStatusConfig[order.paymentStatus]?.color}`}>
                    {order.paymentStatus}
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onUpdatePayment(order.id, "Pendente")}>Pendente</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdatePayment(order.id, "Parcial")}>Parcial</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdatePayment(order.id, "Pago")}>Pago</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="font-semibold text-stone-800 flex items-center gap-2 border-b border-stone-100 pb-2">
          <ReceiptText className="w-4 h-4 text-stone-400" /> Itens do Pedido ({order.items?.length || 0})
        </h3>
        
        <div className="divide-y divide-stone-100">
          {order.items?.map((item) => (
            <div key={item.id} className="py-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-stone-800">{item.quantity}x {item.product?.name}</p>
                <p className="text-xs text-stone-500">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada</p>
              </div>
              <div className="font-semibold text-sm text-stone-800">
                R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-stone-100 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">Custo Total de Produção</span>
          <span className="text-stone-800 font-medium">R$ {order.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">Lucro Estimado</span>
          <span className="text-emerald-600 font-medium">
            R$ {margin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({marginPercent.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center justify-between text-base font-bold mt-2 pt-2 border-t border-stone-100">
          <span className="text-stone-800">Total do Pedido</span>
          <span className="text-stone-800">R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {order.notes && (
        <div className="p-3 bg-amber-50/50 rounded-lg text-sm text-amber-900 border border-amber-100">
          <span className="font-medium">Observações:</span> {order.notes}
        </div>
      )}

      {/* Action Buttons based on Status */}
      <div className="flex flex-col gap-2 pt-4">
        {order.status === "Pendente" && (
          <Button 
            onClick={() => onProduce(order.id)}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Factory className="w-4 h-4 mr-2" />
            Produzir Itens do Pedido
          </Button>
        )}

        {(order.status === "Em Produção" || order.status === "Pronto") && (
          <Button 
            onClick={() => onDeliver(order.id)}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Truck className="w-4 h-4 mr-2" />
            Confirmar Entrega
          </Button>
        )}
      </div>
    </div>
  );
}
