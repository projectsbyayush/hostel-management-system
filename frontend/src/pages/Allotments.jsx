import { useCallback, useEffect, useMemo, useState } from 'react';
import { DoorOpen, CheckCircle2, Plus, Search } from 'lucide-react';
import {
  Button,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Tab,
} from '@heroui/react';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import PageSpinner from '../components/ui/PageSpinner';
import EmptyState from '../components/ui/EmptyState';
import FormModal from '../components/ui/FormModal';
import { FormDate, FormSelect } from '../components/ui/FormFields';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate, todayISO } from '../utils/format';

const PAGE_SIZE = 8;

const emptyForm = {
  studentId: '',
  roomId: '',
  allotmentDate: todayISO(),
};

export default function Allotments() {
  const { toast } = useToast();
  const [allocations, setAllocations] = useState([]);
  const [activeAllocations, setActiveAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('active');
  const [page, setPage] = useState(1);

  const [allotOpen, setAllotOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingOut, setCheckingOut] = useState(null);

  const statusParam = tab === 'active' ? 'ACTIVE' : 'CHECKED_OUT';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allocRes, activeRes, stuRes, roomRes] = await Promise.all([
        api.get(`/allocations?status=${statusParam}${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ''}`),
        api.get('/allocations?status=ACTIVE'),
        api.get('/students?status=ACTIVE'),
        api.get('/rooms'),
      ]);
      setAllocations(allocRes.data);
      setActiveAllocations(activeRes.data);
      setStudents(stuRes.data);
      setRooms(roomRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [q, statusParam]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [q, tab]);

  const pageCount = Math.max(1, Math.ceil(allocations.length / PAGE_SIZE));
  const pageRows = allocations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const eligibleStudents = useMemo(() => {
    const allocatedIds = new Set(activeAllocations.map((a) => a.studentId));
    return students.filter((s) => !allocatedIds.has(s.studentId));
  }, [students, activeAllocations]);

  const availableRooms = useMemo(
    () =>
      rooms.filter((r) => r.status !== 'MAINTENANCE' && r.occupied < r.capacity),
    [rooms]
  );

  const openAllot = () => {
    setForm(emptyForm);
    setFormErrors({});
    setAllotOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.studentId) errors.studentId = 'Select a student';
    if (!form.roomId) errors.roomId = 'Select a room';
    if (!form.allotmentDate) errors.allotmentDate = 'Allotment date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAllot = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/allocations', {
        studentId: Number(form.studentId),
        roomId: Number(form.roomId),
        allotmentDate: form.allotmentDate,
      });
      const student = students.find((s) => String(s.id) === String(form.studentId));
      const room = rooms.find((r) => String(r.id) === String(form.roomId));
      toast.success(`${student?.fullName || 'Student'} allotted to room ${room?.roomNumber || ''}`);
      setAllotOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async (item) => {
    setCheckingOut(item.id);
    try {
      await api.post(`/allocations/${item.id}/checkout`);
      toast.success(`${item.studentName} checked out of room ${item.roomNumber}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Room Allotment"
        description="Assign students to rooms and record check-outs"
      >
        <Input
          isClearable
          placeholder="Search student or room\u2026"
          startContent={<Search size={16} className="text-slate-400" />}
          value={q}
          onValueChange={setQ}
          variant="bordered"
          radius="md"
          className="w-64"
          classNames={{ input: 'text-sm', inputWrapper: 'h-9' }}
        />
        <button
          onClick={openAllot}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus size={16} /> New Allotment
        </button>
      </PageHeader>

      <Tabs
        aria-label="Allotment tabs"
        selectedKey={tab}
        onSelectionChange={setTab}
        classNames={{ base: 'mb-4', tabList: 'gap-2 rounded-xl bg-slate-200/60 p-1 w-fit', tab: 'rounded-lg px-4 py-1.5 text-sm font-semibold', cursor: 'bg-white shadow-sm' }}
      >
        <Tab key="active" title={`Active (${allocations.length > 0 ? allocations.filter((a) => a.status === 'ACTIVE').length : 0})`} />
        <Tab key="history" title="History" />
      </Tabs>

      {loading ? (
        <PageSpinner />
      ) : error ? (
        <EmptyState title="Could not load allotments" message={error} actionLabel="Retry" onAction={load} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <Table
            aria-label="Allotments table"
            isCompact
            isStriped
            removeWrapper
            bottomContent={
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="text-xs text-slate-400">
                  Showing {allocations.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                  {(page - 1) * PAGE_SIZE + pageRows.length} of {allocations.length}
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
              table: 'min-w-[820px] tabular-nums',
            }}
          >
            <TableHeader>
              <TableColumn>STUDENT</TableColumn>
              <TableColumn>STUDENT ID</TableColumn>
              <TableColumn>ROOM</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>ALLOTMENT DATE</TableColumn>
              <TableColumn>CHECKOUT DATE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn className="text-right">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={pageRows}
              emptyContent={
                <div className="py-10">
                  <EmptyState
                    title={tab === 'active' ? 'No active allotments' : 'No checkout history'}
                    message={
                      tab === 'active'
                        ? 'Allot a student to a room to see it here.'
                        : 'Checked-out allotments will appear here.'
                    }
                    actionLabel={tab === 'active' ? 'New Allotment' : undefined}
                    onAction={tab === 'active' ? openAllot : undefined}
                    icon={DoorOpen}
                  />
                </div>
              }
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm font-semibold text-slate-800">
                    {item.studentName}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-500">{item.studentId}</span>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-slate-800">{item.roomNumber}</TableCell>
                  <TableCell>
                    <StatusBadge value={item.roomType} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{formatDate(item.allotmentDate)}</TableCell>
                  <TableCell className="text-sm text-slate-600">{formatDate(item.checkoutDate)}</TableCell>
                  <TableCell>
                    <StatusBadge value={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      {item.status === 'ACTIVE' ? (
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          startContent={
                            checkingOut === item.id ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-600/30 border-t-emerald-600" />
                            ) : (
                              <CheckCircle2 size={14} />
                            )
                          }
                          isDisabled={checkingOut !== null}
                          onPress={() => handleCheckout(item)}
                        >
                          Check Out
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">\u2014</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <FormModal
        open={allotOpen}
        onOpenChange={(open) => {
          if (!submitting) setAllotOpen(open);
        }}
        title="New Room Allotment"
        subtitle="Assign a student to an available room"
        submitLabel="Allot Room"
        onSubmit={handleAllot}
        loading={submitting}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="sm:col-span-2">
            <FormSelect
              label="Student"
              required
              value={form.studentId}
              onChange={(v) => setForm({ ...form, studentId: v })}
              error={formErrors.studentId}
              placeholder={
                eligibleStudents.length
                  ? 'Select a student (without an active room)'
                  : 'No eligible students'
              }
              options={eligibleStudents.map((s) => ({
                value: String(s.id),
                label: `${s.fullName} \u00B7 ${s.studentId}`,
              }))}
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Only students without an active room allocation are listed.
            </p>
          </div>
          <div className="sm:col-span-2">
            <FormSelect
              label="Room"
              required
              value={form.roomId}
              onChange={(v) => setForm({ ...form, roomId: v })}
              error={formErrors.roomId}
              placeholder={availableRooms.length ? 'Select a room with a free bed' : 'No rooms available'}
              options={availableRooms.map((r) => ({
                value: String(r.id),
                label: `Room ${r.roomNumber} \u00B7 ${r.roomType.toLowerCase()} \u00B7 ${r.capacity - r.occupied} bed${r.capacity - r.occupied > 1 ? 's' : ''} free \u00B7 \u20B9${Number(r.monthlyFee).toLocaleString('en-IN')}/mo`,
              }))}
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Rooms under maintenance and rooms at full capacity are excluded.
            </p>
          </div>
          <FormDate
            label="Allotment Date"
            required
            value={form.allotmentDate}
            onChange={(v) => setForm({ ...form, allotmentDate: v })}
            errorMessage={formErrors.allotmentDate}
          />
        </div>
      </FormModal>
    </div>
  );
}
