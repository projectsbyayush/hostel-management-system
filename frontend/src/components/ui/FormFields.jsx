import { Input, Textarea } from '@heroui/react';

export function FormInput(props) {
  return (
    <Input
      variant="bordered"
      radius="md"
      classNames={{
        input: 'text-sm',
        label: 'text-sm text-slate-500',
        errorMessage: 'text-xs',
      }}
      {...props}
    />
  );
}

export function FormTextarea(props) {
  return (
    <Textarea
      variant="bordered"
      radius="md"
      classNames={{
        input: 'text-sm',
        label: 'text-sm text-slate-500',
        errorMessage: 'text-xs',
      }}
      {...props}
    />
  );
}

export function FormDate(props) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">
        {props.label}
        {props.required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        type="date"
        value={props.value ?? ''}
        onChange={(e) => props.onChange && props.onChange(e.target.value)}
        disabled={props.isDisabled}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      {props.errorMessage && (
        <p className="mt-1 text-xs text-rose-500">{props.errorMessage}</p>
      )}
    </div>
  );
}

export function FormSelect({ label, required, error, value, onChange, options, placeholder, allowEmpty, emptyLabel }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      >
        <option value="" disabled={!allowEmpty}>
          {placeholder || 'Select'}
        </option>
        {allowEmpty && <option value="">{emptyLabel || 'None'}</option>}
        {options.map((opt) =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
