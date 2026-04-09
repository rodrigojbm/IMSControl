import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MovementDetails({ movement, onCancel }) {
  if (!movement) return null;

  const categoryLabels = {
    compra: "Compra",
    venda: "Venda",
    producao: "Produção",
    perda: "Perda/Descarte",
    ajuste: "Ajuste de Estoque",
    devolucao: "Devolução"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">
            Detalhes da Movimentação
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Visualização de {movement.type} registrada em {format(new Date(movement.movementDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
        <div className="space-y-2">
          <Label>Tipo de Movimentação</Label>
          <Input value={movement.type === "entrada" ? "Entrada" : "Saída"} disabled className="bg-white font-medium text-stone-800" />
        </div>

        <div className="space-y-2">
          <Label>Categoria</Label>
          <Input value={categoryLabels[movement.category] || movement.category} disabled className="bg-white font-medium text-stone-800" />
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Item ({movement.itemType === "item" ? "Insumo" : "Produto"})</Label>
          <Input value={movement.itemName} disabled className="bg-white font-medium text-stone-800" />
        </div>

        <div className="space-y-2">
          <Label>Quantidade</Label>
          <div className="flex gap-2">
            <Input value={movement.quantity} disabled className="bg-white font-medium text-stone-800" />
            <span className="flex items-center text-sm text-stone-500 px-3 bg-stone-200/50 rounded-md border border-stone-200">
              {movement.unit}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Valor Unitário</Label>
          <Input value={`R$ ${(movement.unitValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} disabled className="bg-white font-medium text-stone-800" />
        </div>

        <div className="space-y-2">
          <Label>Valor Total</Label>
          <Input value={`R$ ${(movement.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} disabled className="bg-white font-medium text-stone-800" />
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Observações</Label>
          <Textarea 
            value={movement.notes || "Nenhuma observação registrada."} 
            disabled 
            rows={3}
            className="bg-white resize-none text-stone-800 disabled:opacity-80" 
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Fechar Detalhes
        </Button>
      </div>
    </div>
  );
}
