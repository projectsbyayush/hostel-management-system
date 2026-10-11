import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate, formatDateTime, formatINR, initials } from '../utils/format';

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/fees/${id}`)
      .then(({ data }) => {
        setFee(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !fee) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100">
        <p className="text-sm text-slate-500">{error || 'Fee record not found'}</p>
        <Link to="/fees" className="text-sm font-semibold text-brand-600 hover:underline">
          Back to Fees
        </Link>
      </div>
    );
  }

  const paid = Number(fee.paid);
  const balance = Number(fee.balance);

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="print-hidden mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/fees')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ArrowLeft size={15} /> Back to Fees
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Printer size={15} /> Print Receipt
          </button>
        </div>

        <div className="print-area rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <span className="text-sm font-bold">H</span>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">Hostel Management System</p>
                  <p className="text-xs text-slate-400">Fee Payment Receipt</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-slate-800">
                REC-{String(fee.id).padStart(4, '0')}
              </p>
              <p className="text-xs text-slate-400">Issued {formatDateTime(fee.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 py-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Student
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                  {initials(fee.studentName)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{fee.studentName}</p>
                  <p className="font-mono text-xs text-slate-400">{fee.studentId}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Fee Period
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">{fee.period}</p>
              <p className="text-xs text-slate-400">Due {formatDate(fee.dueDate)}</p>
            </div>
          </div>

          <table className="w-full border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="border border-slate-200 px-4 py-2.5">Date</th>
                <th className="border border-slate-200 px-4 py-2.5">Method</th>
                <th className="border border-slate-200 px-4 py-2.5">Reference</th>
                <th className="border border-slate-200 px-4 py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {fee.payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border border-slate-200 px-4 py-5 text-center text-sm text-slate-400">
                    No payments received for this fee record.
                  </td>
                </tr>
              ) : (
                fee.payments.map((p) => (
                  <tr key={p.id} className="text-sm">
                    <td className="border border-slate-200 px-4 py-2.5 text-slate-600">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="border border-slate-200 px-4 py-2.5 text-slate-600">
                      {p.method.charAt(0) + p.method.slice(1).replace('_', ' ')}
                    </td>
                    <td className="border border-slate-200 px-4 py-2.5 font-mono text-xs text-slate-500">
                      {p.reference || '\u2014'}
                    </td>
                    <td className="border border-slate-200 px-4 py-2.5 text-right font-semibold text-slate-800">
                      {formatINR(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="text-sm">
                <td colSpan={3} className="border border-slate-200 px-4 py-2.5 text-right font-semibold text-slate-600">
                  Total Billed
                </td>
                <td className="border border-slate-200 px-4 py-2.5 text-right font-bold text-slate-900">
                  {formatINR(fee.amount)}
                </td>
              </tr>
              <tr className="text-sm">
                <td colSpan={3} className="border border-slate-200 px-4 py-2.5 text-right font-semibold text-slate-600">
                  Total Paid
                </td>
                <td className="border border-slate-200 px-4 py-2.5 text-right font-bold text-emerald-600">
                  {formatINR(paid)}
                </td>
              </tr>
              <tr className="text-sm">
                <td colSpan={3} className="border border-slate-200 px-4 py-2.5 text-right font-semibold text-slate-600">
                  Balance Due
                </td>
                <td
                  className={`border border-slate-200 px-4 py-2.5 text-right font-bold ${
                    balance > 0 ? 'text-rose-600' : 'text-slate-400'
                  }`}
                >
                  {formatINR(balance)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-6 flex items-center justify-between">
            <StatusBadge value={fee.status} size="md" />
            <p className="text-[11px] text-slate-400">
              This is a system-generated receipt for record-keeping purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
