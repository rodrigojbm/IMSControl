import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, className }) {
  return (
    <Card className={cn("p-6 border-0 shadow-sm bg-white", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className="text-3xl font-semibold text-stone-800 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-stone-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs font-medium mt-2",
              trend > 0 ? "text-emerald-600" : "text-rose-500"
            )}>
              {trend > 0 ? "+" : ""}{trend}% este mês
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-amber-50">
            <Icon className="w-5 h-5 text-amber-600" />
          </div>
        )}
      </div>
    </Card>
  );
}