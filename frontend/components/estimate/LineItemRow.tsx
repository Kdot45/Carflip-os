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
    <div className="flex items-start justify-between gap-3 border-b border-ink-700 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-ink-50">{item.title}</p>
          <SeverityBadge severity={item.severity} />
          {item.diyOk && <span className="text-xs text-ink-300">DIY ok</span>}
        </div>
        {item.description && <p className="mt-0.5 text-sm text-ink-300">{item.description}</p>}
        <p className="mt-1 text-xs capitalize text-ink-300">{item.category}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-ink-50">
          {formatCurrencyPrecise(item.partsCost + laborCost)}
        </p>
        <p className="text-xs text-ink-300">
          {formatCurrencyPrecise(item.partsCost)} parts + {item.laborHours}h × {formatCurrencyPrecise(item.laborRate)}
        </p>
        <div className="mt-1 flex justify-end gap-2 text-xs">
          <button onClick={onEdit} className="font-medium text-accent-500 hover:text-accent-400">
            Edit
          </button>
          <button onClick={onDelete} className="font-medium text-ink-300 hover:text-bad">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
