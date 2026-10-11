import { Loader2 } from 'lucide-react';

export default function PageSpinner({ label = 'Loading\u2026' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <Loader2 size={28} className="animate-spin" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function InlineSpinner({ className = '' }) {
  return <Loader2 size={15} className={`animate-spin ${className}`} />;
}
