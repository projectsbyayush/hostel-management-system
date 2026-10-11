import { Card } from '@heroui/react';

export default function PageHeader({ title, description, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function CardPanel({ className = '', children }) {
  return (
    <Card className={`rounded-xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
      {children}
    </Card>
  );
}
