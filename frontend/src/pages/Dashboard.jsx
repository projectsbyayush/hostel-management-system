import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BedDouble,
  DoorOpen,
  IndianRupee,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../api/client';
import { getErrorMessage } from '../api/client';
import PageHeader, { CardPanel } from '../components/ui/PageHeader';
import PageSpinner from '../components/ui/PageSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate, formatINRShort, initials } from '../utils/format';

function StatCard({ icon: Icon, label, value, sub, tone }) {
  return (
    <CardPanel className="flex items-center gap-4 p-5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">{sub}</p>
      </div>
    </CardPanel>
  );
}

function ChartTooltip({ active, payload, label, money }) {
  if (!active || !payload || !payload.length) return null;
  const title = label || payload[0]?.name || '';
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      {title && <p className="text-xs font-semibold text-slate-900">{title}</p>}
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="text-xs text-slate-500">
          {p.name}:{' '}
          <span className="font-semibold text-slate-800">
            {money ? formatINRShort(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function LegendDot({ color, label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
      {value !== undefined && (
        <span className="font-bold text-slate-700">{value}</span>
      )}
    </span>
  );
}

function DonutCard({ title, subtitle, pct, pctLabel, data, colors, legend, emptyText }) {
  return (
    <CardPanel className="flex flex-col p-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      {data.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-10 text-center text-xs text-slate-400">
          {emptyText}
        </p>
      ) : (
        <>
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<ChartTooltip money={title === 'Fee Recovery'} />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={74}
                  paddingAngle={3}
                  cornerRadius={5}
                  strokeWidth={0}
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[26px] font-bold leading-none tracking-tight text-slate-900">
                {pct}%
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">{pctLabel}</p>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {legend.map((l) => (
              <LegendDot key={l.label} color={l.color} label={l.label} value={l.value} />
            ))}
          </div>
        </>
      )}
    </CardPanel>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [occupancy, setOccupancy] = useState([]);
  const [collections, setCollections] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [statsRes, occRes, colRes, stuRes, cmpRes, roomRes, feeRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/room-occupancy'),
          api.get('/dashboard/monthly-collections'),
          api.get('/dashboard/recent-students'),
          api.get('/dashboard/pending-complaints'),
          api.get('/rooms'),
          api.get('/fees'),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setOccupancy(occRes.data);
        setCollections(colRes.data);
        setRecentStudents(stuRes.data);
        setPendingComplaints(cmpRes.data);
        setRooms(roomRes.data);
        setFees(feeRes.data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageSpinner />;
  if (error)
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );

  const bookableRooms = rooms.filter((r) => r.status !== 'MAINTENANCE');
  const maintenanceCount = rooms.length - bookableRooms.length;

  const occupancyData = occupancy
    .filter((r) => bookableRooms.some((b) => b.roomNumber === r.roomNumber))
    .map((r) => ({
      name: `Room ${r.roomNumber}`,
      Occupied: r.occupied,
      Available: r.available,
      detail: `${r.occupied}/${r.capacity} beds${r.capacity ? ` · ${Math.round((r.occupied / r.capacity) * 100)}%` : ''}`,
    }));

  const bedOccupied = bookableRooms.reduce((s, r) => s + r.occupied, 0);
  const bedTotal = bookableRooms.reduce((s, r) => s + r.capacity, 0);
  const bedPct = bedTotal ? Math.round((bedOccupied / bedTotal) * 100) : 0;
  const bedDonut =
    bedTotal > 0
      ? [
          { name: 'Occupied', value: bedOccupied },
          { name: 'Available', value: bedTotal - bedOccupied },
        ]
      : [];

  const feeCollected = fees.reduce((s, f) => s + Number(f.paid), 0);
  const feeOutstanding = fees.reduce((s, f) => s + Number(f.balance), 0);
  const feeTotal = feeCollected + feeOutstanding;
  const recoveryPct = feeTotal ? Math.round((feeCollected / feeTotal) * 100) : 0;
  const feeDonut =
    feeTotal > 0
      ? [
          { name: 'Collected', value: Math.round(feeCollected) },
          { name: 'Outstanding', value: Math.round(feeOutstanding) },
        ]
      : [];

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of hostel operations" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          sub="Registered in hostel"
          tone="bg-brand-50 text-brand-600"
        />
        <StatCard
          icon={BedDouble}
          label="Total Rooms"
          value={stats.totalRooms}
          sub="Across all floors"
          tone="bg-sky-50 text-sky-600"
        />
        <StatCard
          icon={DoorOpen}
          label="Available Beds"
          value={stats.availableBeds}
          sub="Ready for allotment"
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={IndianRupee}
          label="Pending Fee Balance"
          value={formatINRShort(stats.pendingFeeBalance)}
          sub="To be collected"
          tone="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CardPanel className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Room Occupancy</h3>
              <p className="text-xs text-slate-400">
                Beds filled per room
                {maintenanceCount > 0 && ` · ${maintenanceCount} room${maintenanceCount > 1 ? 's' : ''} under maintenance excluded`}
              </p>
            </div>
            <Link
              to="/rooms"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View rooms <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mb-3 flex items-center gap-4">
            <LegendDot color="#4f46e5" label="Occupied" />
            <LegendDot color="#e2e8f0" label="Available" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={occupancyData}
                margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={76}
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                />
                <Bar dataKey="Occupied" stackId="a" fill="#4f46e5" barSize={18} />
                <Bar dataKey="Available" stackId="a" fill="#e2e8f0" barSize={18} radius={[0, 9, 9, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardPanel>

        <DonutCard
          title="Bed Occupancy"
          subtitle="Share of bookable beds filled"
          pct={bedPct}
          pctLabel="occupied"
          data={bedDonut}
          colors={['#4f46e5', '#e2e8f0']}
          legend={[
            { label: 'Occupied', color: '#4f46e5', value: bedOccupied },
            { label: 'Available', color: '#cbd5e1', value: bedTotal - bedOccupied },
          ]}
          emptyText="No bookable rooms yet."
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CardPanel className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fee Collection Trend</h3>
              <p className="text-xs text-slate-400">Payments recorded in the last 6 months</p>
            </div>
            <Link
              to="/fees"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View fees <ArrowRight size={13} />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collections} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="collectFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `\u20B9${v / 1000}k` : `\u20B9${v}`)}
                />
                <Tooltip content={<ChartTooltip money />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Collected"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#collectFill)"
                  dot={{ r: 3.5, fill: '#4f46e5', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardPanel>

        <DonutCard
          title="Fee Recovery"
          subtitle="Collected vs outstanding fees"
          pct={recoveryPct}
          pctLabel="recovered"
          data={feeDonut}
          colors={['#10b981', '#fda4af']}
          legend={[
            { label: 'Collected', color: '#10b981', value: formatINRShort(feeCollected) },
            { label: 'Outstanding', color: '#fda4af', value: formatINRShort(feeOutstanding) },
          ]}
          emptyText="No fee records yet."
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CardPanel className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Registrations</h3>
              <p className="text-xs text-slate-400">Latest student admissions</p>
            </div>
            <Link
              to="/students"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-2.5">Student</th>
                  <th className="px-3 py-2.5">ID</th>
                  <th className="px-3 py-2.5">Course</th>
                  <th className="px-3 py-2.5">Year</th>
                  <th className="px-3 py-2.5">Admitted</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                          {initials(s.fullName)}
                        </div>
                        <span className="font-semibold text-slate-800">{s.fullName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-500">{s.studentId}</td>
                    <td className="px-3 py-3 text-slate-600">{s.course}</td>
                    <td className="px-3 py-3 text-slate-600">{s.yearOfStudy}</td>
                    <td className="px-3 py-3 text-slate-600">{formatDate(s.admissionDate)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge value={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardPanel>

        <CardPanel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pending Complaints</h3>
              <p className="text-xs text-slate-400">Awaiting resolution</p>
            </div>
            <Link
              to="/complaints"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {pendingComplaints.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <ArrowRight size={18} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700">All clear</p>
              <p className="text-xs text-slate-400">No complaints pending right now.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {pendingComplaints.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[11px] font-semibold text-slate-400">
                      {c.complaintId}
                    </p>
                    <StatusBadge value={c.priority} size="sm" />
                  </div>
                  <p className="mt-1.5 truncate text-sm font-medium text-slate-800">
                    {c.studentName}
                    <span className="ml-2 text-xs font-normal text-slate-400">{c.category}</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{formatDate(c.submittedAt)}</span>
                    <StatusBadge value={c.status} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardPanel>
      </div>
    </div>
  );
}
