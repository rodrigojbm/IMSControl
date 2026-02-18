import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Pencil, Trash2, Factory } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sizeLabels = {
  pequena: "P",
  media: "M",
  grande: "G"
};

export default function ProductCard({ product, onEdit, onDelete, onProduce }) {
  const isLowStock = product.minQuantity && product.quantity <= product.minQuantity;
  const profit = product.salePrice - product.productionCost;
  const margin = product.salePrice > 0 ? ((profit / product.salePrice) * 100).toFixed(0) : 0;

  return (
    <Card className="p-4 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-stone-800">{product.name}</h3>
            {isLowStock && (
              <Badge variant="destructive" className="text-xs">Baixo</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {sizeLabels[product.size]}
            </Badge>
            {product.salePrice > 0 && (
              <span className="text-xs text-emerald-600 font-medium">
                {margin}% margem
              </span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onProduce(product)}>
              <Factory className="w-4 h-4 mr-2" />
              Produzir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(product)} className="text-rose-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-stone-800">
            {product.quantity}
            <span className="text-sm font-normal text-stone-400 ml-1">un</span>
          </p>
          {product.salePrice > 0 && (
            <p className="text-sm text-amber-600 font-medium mt-1">
              R$ {product.salePrice.toFixed(2)}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onProduce(product)}
          className="text-amber-600 border-amber-200 hover:bg-amber-50"
        >
          <Factory className="w-4 h-4 mr-1" />
          Produzir
        </Button>
      </div>
    </Card>
  );
}