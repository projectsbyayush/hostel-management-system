import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  MoreVertical,
  Plus,
  Printer,
  Receipt,
  Search,
} from 'lucide-react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import PageSpinner from '../components/ui/PageSpinner';
import EmptyState from '../components/ui/EmptyState';
import FormModal from '../components/ui/FormModal';
import { FormDate, FormInput, FormSelect } from '../components/ui/FormFields';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate, formatINR } from '../utils/format';

const PAGE_SIZE = 8;

const emptyFeeForm = { studentId: '', amount: '', dueDate: '', period: '' };
const emptyPaymentForm = { amount: '', paymentDate: '', method: 'CASH', reference: '', note: '' };

export default function Fees() {
  const { toast } = useToast();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [feeForm, setFeeForm] = useState(emptyFeeForm);
  const [feeErrors, setFeeErrors] = useState({});
  const [submittingFee, setSubmittingFee] = useState(false);

  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [paymentErrors, setPaymentErrors] = useState({});
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const [historyTarget, setHistoryTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [feeRes, stuRes] = await Promise.all([
        api.get(`/fees${q.trim() || status ? `?${new URLSearchParams({
          ...(q.trim() ? { q: q.trim() } : {}),
          ...(status ? { status } : {}),
        }).toString()}` : ''}`),
        api.get('/students?status=ACTIVE'),
      ]);
      setFees(feeRes.data);
      setStudents(stuRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [q, status]);

  const pageCount = Math.max(1, Math.ceil(fees.length / PAGE_SIZE));
  const pageRows = fees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(() => {
    const total = fees.reduce((s, f) => s + Number(f.amount), 0);
    const paid = fees.reduce((s, f) => s + Number(f.paid), 0);
    return { total, paid, balance: total - paid };
  }, [fees]);

  const openAddFee = () => {
    setFeeForm(emptyFeeForm);
    setFeeErrors({});
    setFeeModalOpen(true);
  };

  const validateFee = () => {
    const errors = {};
    if (!feeForm.studentId) errors.studentId = 'Select a student';
    if (!feeForm.amount) errors.amount = 'Amount is required';
    else if (Number(feeForm.amount) <= 0) errors.amount = 'Amount must be greater than zero';
    if (!feeForm.dueDate) errors.dueDate = 'Due date is required';
    if (!feeForm.period.trim()) errors.period = 'Period is required';
    setFeeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateFee = async () => {
    if (!validateFee()) return;
    setSubmittingFee(true);
    try {
      await api.post('/fees', {
        studentId: Number(feeForm.studentId),
        amount: Number(feeForm.amount),
        dueDate: feeForm.dueDate,
        period: feeForm.period.trim(),
      });
      toast.success('Fee record created');
      setFeeModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingFee(false);
    }
  };

  const openPayment = (fee) => {
    setPaymentTarget(fee);
    setPaymentForm({ ...emptyPaymentForm, amount: '', paymentDate: '' });
    setPaymentErrors({});
  };

  const validatePayment = () => {
    const balance = Number(paymentTarget.balance);
    const errors = {};
    if (!paymentForm.amount) errors.amount = 'Amount is required';
    else if (Number(paymentForm.amount) <= 0) errors.amount = 'Amount must be greater than zero';
    else if (Number(paymentForm.amount) > balance)
      errors.amount = `Amount exceeds the outstanding balance of ${formatINR(balance)}`;
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;
    setSubmittingPayment(true);
    try {
      await api.post(`/fees/${paymentTarget.id}/payments`, {
        amount: Number(paymentForm.amount),
        paymentDate: paymentForm.paymentDate || undefined,
        method: paymentForm.method,
        reference: paymentForm.reference || null,
        note: paymentForm.note || null,
      });
      toast.success(`Payment of ${formatINR(paymentForm.amount)} recorded`);
      setPaymentTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Fees & Payments"
        description={`Outstanding balance ${formatINR(totals.balance)} of ${formatINR(totals.total)} billed`}
      >
        <Input
          isClearable
          placeholder="Search student\u2026"
          startContent={<Search size={16} className="text-slate-400" />}
          value={q}
          onValueChange={setQ}
          variant="bordered"
          radius="md"
          className="w-60"
          classNames={{ input: 'text-sm', inputWrapper: 'h-9' }}
        />
        <Select
          placeholder="Status"
          selectedKeys={status ? [status] : []}
          onSelectionChange={(keys) => {
            const v = [...keys][0] || '';
            setStatus(v === 'ALL' ? '' : v);
          }}
          variant="bordered"
          radius="md"
          className="w-48"
          classNames={{ trigger: 'h-9', value: 'text-sm' }}
        >
          <SelectItem key="ALL" value="ALL">All statuses</SelectItem>
          <SelectItem key="PAID" value="PAID">Paid</SelectItem>
          <SelectItem key="PARTIALLY_PAID" value="PARTIALLY_PAID">Partially Paid</SelectItem>
          <SelectItem key="PENDING" value="PENDING">Pending</SelectItem>
        </Select>
        <button
          onClick={openAddFee}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus size={16} /> Add Fee Record
        </button>
      </PageHeader>

      {loading ? (
        <PageSpinner />
      ) : error ? (
        <EmptyState title="Could not load fees" message={error} actionLabel="Retry" onAction={load} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <Table
            aria-label="Fees table"
            isCompact
            isStriped
            removeWrapper
            bottomContent={
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="text-xs text-slate-400">
                  Showing {fees.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                  {(page - 1) * PAGE_SIZE + pageRows.length} of {fees.length}
                </p>
                {pageCount > 1 ? (
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pageCount}
                    onChange={setPage}
                    size="sm"
                  />
                ) : (
                  <span />
                )}
              </div>
            }
            classNames={{
              th: 'bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100',
              td: 'py-3',
              table: 'min-w-[980px] tabular-nums',
            }}
          >
            <TableHeader>
              <TableColumn>STUDENT</TableColumn>
              <TableColumn>PERIOD</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>PAID</TableColumn>
              <TableColumn>BALANCE</TableColumn>
              <TableColumn>DUE DATE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn className="text-right">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={pageRows}
              emptyContent={
                <div className="py-10">
                  <EmptyState
                    title="No fee records found"
                    message={
                      q || status
                        ? 'Try adjusting your search or filters.'
                        : 'Create the first fee record to start tracking payments.'
                    }
                    actionLabel={!q && !status ? 'Add Fee Record' : undefined}
                    onAction={!q && !status ? openAddFee : undefined}
                    icon={IndianRupee}
                  />
                </div>
              }
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="text-sm font-semibold text-slate-800">{item.studentName}</p>
                    <p className="font-mono text-[11px] text-slate-400">{item.studentId}</p>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.period}</TableCell>
                  <TableCell className="text-sm font-semibold text-slate-700">
                    {formatINR(item.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-emerald-600">{formatINR(item.paid)}</TableCell>
                  <TableCell>
                    <span
                      className={`text-sm font-semibold ${
                        Number(item.balance) > 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {formatINR(item.balance)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{formatDate(item.dueDate)}</TableCell>
                  <TableCell>
                    <StatusBadge value={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                          <button
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Fee actions"
                          onAction={(key) => {
                            if (key === 'pay') openPayment(item);
                            if (key === 'history') setHistoryTarget(item);
                          }}
                        >
                          {Number(item.balance) > 0 && (
                            <DropdownItem
                              key="pay"
                              startContent={<IndianRupee size={15} />}
                              description={`Balance ${formatINR(item.balance)}`}
                            >
                              Record Payment
                            </DropdownItem>
                          )}
                          <DropdownItem key="history" startContent={<Receipt size={15} />}>
                            Payment History
                          </DropdownItem>
                          <DropdownItem key="receipt" startContent={<Printer size={15} />}>
                            <Link to={`/fees/${item.id}/receipt`} className="w-full">
                              View Receipt
                            </Link>
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <FormModal
        open={feeModalOpen}
        onOpenChange={(open) => {
          if (!submittingFee) setFeeModalOpen(open);
        }}
        title="Add Fee Record"
        subtitle="Bill a student for a fee period"
        submitLabel="Create Fee Record"
        onSubmit={handleCreateFee}
        loading={submittingFee}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="sm:col-span-2">
            <FormSelect
              label="Student"
              required
              value={feeForm.studentId}
              onChange={(v) => setFeeForm({ ...feeForm, studentId: v })}
              error={feeErrors.studentId}
              placeholder="Select a student"
              options={students.map((s) => ({
                value: String(s.id),
                label: `${s.fullName} \u00B7 ${s.studentId}`,
              }))}
            />
          </div>
          <FormInput
            label="Amount (\u20B9)"
            placeholder="e.g. 21000"
            type="number"
            min={0}
            step="0.01"
            required
            isRequired
            value={feeForm.amount}
            onValueChange={(v) => setFeeForm({ ...feeForm, amount: v })}
            isInvalid={!!feeErrors.amount}
            errorMessage={feeErrors.amount}
          />
          <FormInput
            label="Period"
            placeholder="e.g. Jul - Dec 2026"
            required
            isRequired
            value={feeForm.period}
            onValueChange={(v) => setFeeForm({ ...feeForm, period: v })}
            isInvalid={!!feeErrors.period}
            errorMessage={feeErrors.period}
          />
          <FormDate
            label="Due Date"
            required
            value={feeForm.dueDate}
            onChange={(v) => setFeeForm({ ...feeForm, dueDate: v })}
            errorMessage={feeErrors.dueDate}
          />
        </div>
      </FormModal>

      <FormModal
        open={!!paymentTarget}
        onOpenChange={() => {
          if (!submittingPayment) setPaymentTarget(null);
        }}
        title="Record Payment"
        subtitle={
          paymentTarget
            ? `${paymentTarget.studentName} \u00B7 balance ${formatINR(paymentTarget.balance)}`
            : ''
        }
        submitLabel="Record Payment"
        onSubmit={handlePayment}
        loading={submittingPayment}
      >
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            label="Amount (\u20B9)"
            placeholder={`Up to ${paymentTarget ? formatINR(paymentTarget.balance) : ''}`}
            type="number"
            min={0}
            step="0.01"
            required
            isRequired
            value={paymentForm.amount}
            onValueChange={(v) => setPaymentForm({ ...paymentForm, amount: v })}
            isInvalid={!!paymentErrors.amount}
            errorMessage={paymentErrors.amount}
          />
          <FormSelect
            label="Payment Method"
            required
            value={paymentForm.method}
            onChange={(v) => setPaymentForm({ ...paymentForm, method: v })}
            error={paymentErrors.method}
            options={['CASH', 'UPI', 'BANK_TRANSFER', 'CARD'].map((m) => ({
              value: m,
              label: m.charAt(0) + m.slice(1).replace('_', ' '),
            }))}
          />
          <FormDate
            label="Payment Date"
            value={paymentForm.paymentDate}
            onChange={(v) => setPaymentForm({ ...paymentForm, paymentDate: v })}
          />
          <FormInput
            label="Reference (optional)"
            placeholder="e.g. UPI-261011-01"
            value={paymentForm.reference}
            onValueChange={(v) => setPaymentForm({ ...paymentForm, reference: v })}
          />
          <div className="sm:col-span-2">
            <FormInput
              label="Note (optional)"
              placeholder="e.g. Third instalment"
              value={paymentForm.note}
              onValueChange={(v) => setPaymentForm({ ...paymentForm, note: v })}
            />
          </div>
        </div>
      </FormModal>

      <FormModal
        open={!!historyTarget}
        onOpenChange={() => setHistoryTarget(null)}
        title="Payment History"
        subtitle={
          historyTarget
            ? `${historyTarget.studentName} \u00B7 ${historyTarget.period}`
            : ''
        }
        submitLabel="Close"
        onSubmit={() => setHistoryTarget(null)}
      >
        {historyTarget && (
          <div>
            <div className="mb-4 grid grid-cols-3 gap-3">
              {[
                ['Billed', formatINR(historyTarget.amount), 'text-slate-800'],
                ['Paid', formatINR(historyTarget.paid), 'text-emerald-600'],
                ['Balance', formatINR(historyTarget.balance), Number(historyTarget.balance) > 0 ? 'text-rose-600' : 'text-slate-400'],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                  <p className={`mt-1 text-base font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            {historyTarget.payments.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
                No payments recorded yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {historyTarget.payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {formatINR(p.amount)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {p.method.charAt(0) + p.method.slice(1).replace('_', ' ')}
                        {p.reference ? ` \u00B7 Ref: ${p.reference}` : ''}
                        {p.note ? ` \u00B7 ${p.note}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {formatDate(p.paymentDate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </FormModal>
    </div>
  );
}
