import { Inbox } from 'lucide-react';
import { Button } from '@heroui/react';

export default function EmptyState({
  title = 'No records found',
  message,
  actionLabel,
  onAction,
  icon,
}) {
  const Icon = icon || Inbox;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-800">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {actionLabel && onAction && (
        <Button className="mt-5" color="primary" variant="flat" size="sm" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
