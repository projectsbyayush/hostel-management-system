import { useCallback, useEffect, useMemo, useState } from 'react';
import { BedDouble, MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Progress,
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
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormModal from '../components/ui/FormModal';
import { FormInput, FormSelect } from '../components/ui/FormFields';
import StatusBadge, { RoomStatusBadge } from '../components/ui/StatusBadge';
import { formatINR } from '../utils/format';

const PAGE_SIZE = 8;

const emptyForm = {
  roomNumber: '',
  floorNo: '',
  roomType: 'SINGLE',
  capacity: '',
  monthlyFee: '',
  status: 'AVAILABLE',
};

export default function Rooms() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (status) params.set('status', status);
      if (type) params.set('type', type);
      const { data } = await api.get(`/rooms?${params.toString()}`);
      setRooms(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [q, status, type]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [q, status, type]);

  const pageCount = Math.max(1, Math.ceil(rooms.length / PAGE_SIZE));
  const pageRows = rooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      roomNumber: r.roomNumber,
      floorNo: String(r.floorNo),
      roomType: r.roomType,
      capacity: String(r.capacity),
      monthlyFee: String(r.monthlyFee),
      status: r.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.roomNumber.trim()) errors.roomNumber = 'Room number is required';
    if (!form.floorNo && form.floorNo !== '0') errors.floorNo = 'Floor is required';
    if (!form.capacity) errors.capacity = 'Capacity is required';
    else if (Number(form.capacity) < 1) errors.capacity = 'Capacity must be at least 1';
    if (!form.monthlyFee) errors.monthlyFee = 'Monthly fee is required';
    else if (Number(form.monthlyFee) < 0) errors.monthlyFee = 'Fee cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        roomNumber: form.roomNumber.trim(),
        floorNo: Number(form.floorNo),
        roomType: form.roomType,
        capacity: Number(form.capacity),
        monthlyFee: Number(form.monthlyFee),
        status: form.status,
      };
      if (editing) {
        await api.put(`/rooms/${editing.id}`, payload);
        toast.success(`Room ${payload.roomNumber} updated`);
      } else {
        await api.post('/rooms', payload);
        toast.success(`Room ${payload.roomNumber} added`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/rooms/${deleteTarget.id}`);
      toast.success(`Room ${deleteTarget.roomNumber} deleted`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filterSummary = useMemo(() => {
    const available = rooms.filter((r) => r.status !== 'MAINTENANCE' && r.occupied < r.capacity)
      .reduce((sum, r) => sum + (r.capacity - r.occupied), 0);
    return `${rooms.length} rooms \u00B7 ${available} beds free`;
  }, [rooms]);

  return (
    <div>
      <PageHeader title="Rooms" description={filterSummary}>
        <Input
          isClearable
          placeholder="Search room number\u2026"
          startContent={<Search size={16} className="text-slate-400" />}
          value={q}
          onValueChange={setQ}
          variant="bordered"
          radius="md"
          className="w-56"
          classNames={{ input: 'text-sm', inputWrapper: 'h-9' }}
        />
        <Select
          placeholder="Type"
          selectedKeys={type ? [type] : []}
          onSelectionChange={(keys) => {
            const v = [...keys][0] || '';
            setType(v === 'ALL' ? '' : v);
          }}
          variant="bordered"
          radius="md"
          className="w-40"
          classNames={{ trigger: 'h-9', value: 'text-sm' }}
        >
          <SelectItem key="ALL" value="ALL">All types</SelectItem>
          {['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'].map((t) => (
            <SelectItem key={t} value={t}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </Select>
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
          <SelectItem key="AVAILABLE" value="AVAILABLE">Available</SelectItem>
          <SelectItem key="MAINTENANCE" value="MAINTENANCE">Maintenance</SelectItem>
          <SelectItem key="FULL" value="FULL">Full</SelectItem>
          <SelectItem key="PARTIAL" value="PARTIAL">Partially Occupied</SelectItem>
        </Select>
        <button
          onClick={openAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus size={16} /> Add Room
        </button>
      </PageHeader>

      {loading ? (
        <PageSpinner />
      ) : error ? (
        <EmptyState
          title="Could not load rooms"
          message={error}
          actionLabel="Retry"
          onAction={load}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <Table
            aria-label="Rooms table"
            isCompact
            isStriped
            removeWrapper
            bottomContent={
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="text-xs text-slate-400">
                  Showing {rooms.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                  {(page - 1) * PAGE_SIZE + pageRows.length} of {rooms.length}
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
              table: 'min-w-[860px] tabular-nums',
            }}
          >
            <TableHeader>
              <TableColumn>ROOM</TableColumn>
              <TableColumn>FLOOR</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>OCCUPANCY</TableColumn>
              <TableColumn>MONTHLY FEE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn className="text-right">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={pageRows}
              emptyContent={
                <div className="py-10">
                  <EmptyState
                    title="No rooms found"
                    message={
                      q || status || type
                        ? 'Try adjusting your search or filters.'
                        : 'Add the first room to get started.'
                    }
                    actionLabel={!q && !status && !type ? 'Add Room' : undefined}
                    onAction={!q && !status && !type ? openAdd : undefined}
                    icon={BedDouble}
                  />
                </div>
              }
            >
              {(item) => {
                const pct = item.capacity ? Math.round((item.occupied / item.capacity) * 100) : 0;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="text-sm font-bold text-slate-800">{item.roomNumber}</p>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">Floor {item.floorNo}</TableCell>
                    <TableCell>
                      <StatusBadge value={item.roomType} />
                    </TableCell>
                    <TableCell>
                      <div className="flex w-44 items-center gap-3">
                        <Progress
                          aria-label={`${item.occupied} of ${item.capacity} beds occupied`}
                          value={pct}
                          color={pct >= 100 ? 'danger' : pct > 0 ? 'primary' : 'default'}
                          size="sm"
                          className="flex-1"
                        />
                        <span className="w-16 text-xs font-medium text-slate-500">
                          {item.occupied}/{item.capacity} beds
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-700">
                      {formatINR(item.monthlyFee)}
                    </TableCell>
                    <TableCell>
                      <RoomStatusBadge room={item} />
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
                            aria-label="Room actions"
                            onAction={(key) => {
                              if (key === 'edit') openEdit(item);
                              if (key === 'delete') setDeleteTarget(item);
                            }}
                          >
                            <DropdownItem key="edit" startContent={<Pencil size={15} />}>
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-rose-500"
                              startContent={<Trash2 size={15} />}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>
        </div>
      )}

      <FormModal
        open={modalOpen}
        onOpenChange={(open) => {
          if (!submitting) setModalOpen(open);
        }}
        title={editing ? 'Edit Room' : 'Add Room'}
        subtitle={editing ? `Editing room ${editing.roomNumber}` : 'Create a new room'}
        submitLabel={editing ? 'Save Changes' : 'Add Room'}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            label="Room Number"
            placeholder="e.g. 205"
            required
            isRequired
            value={form.roomNumber}
            onValueChange={(v) => setForm({ ...form, roomNumber: v })}
            isInvalid={!!formErrors.roomNumber}
            errorMessage={formErrors.roomNumber}
          />
          <FormInput
            label="Floor"
            placeholder="e.g. 2"
            type="number"
            min={0}
            required
            isRequired
            value={form.floorNo}
            onValueChange={(v) => setForm({ ...form, floorNo: v })}
            isInvalid={!!formErrors.floorNo}
            errorMessage={formErrors.floorNo}
          />
          <FormSelect
            label="Room Type"
            required
            value={form.roomType}
            onChange={(v) => setForm({ ...form, roomType: v })}
            error={formErrors.roomType}
            options={['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'].map((t) => ({
              value: t,
              label: t.charAt(0) + t.slice(1).toLowerCase(),
            }))}
          />
          <FormInput
            label="Total Capacity (beds)"
            placeholder="e.g. 2"
            type="number"
            min={1}
            required
            isRequired
            value={form.capacity}
            onValueChange={(v) => setForm({ ...form, capacity: v })}
            isInvalid={!!formErrors.capacity}
            errorMessage={formErrors.capacity}
          />
          <FormInput
            label="Monthly Fee (\u20B9)"
            placeholder="e.g. 4500"
            type="number"
            min={0}
            step="0.01"
            required
            isRequired
            value={form.monthlyFee}
            onValueChange={(v) => setForm({ ...form, monthlyFee: v })}
            isInvalid={!!formErrors.monthlyFee}
            errorMessage={formErrors.monthlyFee}
          />
          <FormSelect
            label="Status"
            required
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            error={formErrors.status}
            options={[
              { value: 'AVAILABLE', label: 'Available' },
              { value: 'MAINTENANCE', label: 'Maintenance' },
            ]}
          />
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete room"
        message={
          deleteTarget
            ? `Are you sure you want to delete room ${deleteTarget.roomNumber}? Rooms with past or present allocation records cannot be deleted.`
            : ''
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
