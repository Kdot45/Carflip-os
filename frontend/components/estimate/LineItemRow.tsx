import { RepairLineItem } from "@/lib/types";
import { formatCurrencyPrecise } from "@/lib/format";
import { SeverityBadge } from "@/components/ui/Badge";

export function LineItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: RepairLineItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const laborCost = item.laborHours * item.laborRate;
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-slate-900">{item.title}</p>
          <SeverityBadge severity={item.severity} />
          {item.diyOk && <span className="text-xs text-slate-500">DIY ok</span>}
        </div>
        {item.description && <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>}
        <p className="mt-1 text-xs capitalize text-slate-400">{item.category}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-slate-900">
          {formatCurrencyPrecise(item.partsCost + laborCost)}
        </p>
        <p className="text-xs text-slate-400">
          {formatCurrencyPrecise(item.partsCost)} parts + {item.laborHours}h × {formatCurrencyPrecise(item.laborRate)}
        </p>
        <div className="mt-1 flex justify-end gap-2 text-xs">
          <button onClick={onEdit} className="font-medium text-accent-600 hover:text-accent-700">
            Edit
          </button>
          <button onClick={onDelete} className="font-medium text-slate-400 hover:text-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
