import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Pencil, Trash2, Plus, Minus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categoryLabels = {
  cera: "Cera",
  essencia: "Essência",
  pavio: "Pavio",
  pote: "Pote",
  corante: "Corante",
  embalagem: "Embalagem",
  outros: "Outros"
};

const categoryColors = {
  cera: "bg-amber-100 text-amber-700",
  essencia: "bg-purple-100 text-purple-700",
  pavio: "bg-stone-100 text-stone-700",
  pote: "bg-blue-100 text-blue-700",
  corante: "bg-pink-100 text-pink-700",
  embalagem: "bg-green-100 text-green-700",
  outros: "bg-gray-100 text-gray-700"
};

export default function SupplyCard({ supply, onEdit, onDelete, onAddStock, onRemoveStock }) {
  const isLowStock = supply.min_quantity && supply.quantity <= supply.min_quantity;

  return (
    <Card className="p-4 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-stone-800">{supply.name}</h3>
            {isLowStock && (
              <Badge variant="destructive" className="text-xs">Baixo</Badge>
            )}
          </div>
          <Badge className={`${categoryColors[supply.category]} border-0 text-xs`}>
            {categoryLabels[supply.category]}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(supply)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(supply)} className="text-rose-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-stone-800">
            {supply.quantity}
            <span className="text-sm font-normal text-stone-400 ml-1">{supply.unit}</span>
          </p>
          {supply.cost_per_unit > 0 && (
            <p className="text-xs text-stone-400 mt-1">
              R$ {supply.cost_per_unit.toFixed(2)}/{supply.unit}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onRemoveStock(supply)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onAddStock(supply)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}