import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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
  Tabs,
  Tab,
} from '@heroui/react';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import PageSpinner from '../components/ui/PageSpinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormModal from '../components/ui/FormModal';
import { FormInput, FormSelect, FormTextarea } from '../components/ui/FormFields';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate } from '../utils/format';

const PAGE_SIZE = 8;

const emptyForm = {
  studentId: '',
  roomId: '',
  category: '',
  description: '',
  priority: 'MEDIUM',
};

const CATEGORIES = [
  'Plumbing',
  'Electricity',
  'Cleanliness',
  'Noise',
  'Wi-Fi',
  'Furniture',
  'Water Supply',
  'Other',
];

export default function Complaints() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusAction, setStatusAction] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (status) params.set('status', status);
      const { data } = await api.get(`/complaints?${params.toString()}`);
      setComplaints(data);
      const [stuRes, roomRes] = await Promise.all([
        api.get('/students?status=ACTIVE'),
        api.get('/rooms'),
      ]);
      setStudents(stuRes.data);
      setRooms(roomRes.data);
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
  }, [q, status, priority]);

  const filtered = useMemo(() => {
    if (!priority) return complaints;
    return complaints.filter((c) => c.priority === priority);
  }, [complaints, priority]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, studentId: '', roomId: '', category: '', description: '', priority: 'MEDIUM' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      studentId: c.studentDbId != null ? String(c.studentDbId) : '',
      roomId: c.roomDbId != null ? String(c.roomDbId) : '',
      category: c.category,
      description: c.description,
      priority: c.priority,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.studentId) errors.studentId = 'Select a student';
    if (!form.category.trim()) errors.category = 'Category is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    else if (form.description.trim().length < 10)
      errors.description = 'Please describe the complaint (at least 10 characters)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        studentId: Number(form.studentId),
        roomId: form.roomId ? Number(form.roomId) : null,
        category: form.category.trim(),
        description: form.description.trim(),
        priority: form.priority,
      };
      if (editing) {
        await api.put(`/complaints/${editing.id}`, payload);
        toast.success(`Complaint ${editing.complaintId} updated`);
      } else {
        await api.post('/complaints', payload);
        toast.success('Complaint registered');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusAction) return;
    try {
      await api.patch(`/complaints/${statusAction.id}/status`, {
        status: statusAction.next,
      });
      toast.success(
        `Complaint ${statusAction.id} marked as ${statusAction.next.replace('_', ' ')}`
      );
      setStatusAction(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/complaints/${deleteTarget.id}`);
      toast.success(`Complaint ${deleteTarget.complaintId} deleted`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const nextStatus = (current) => {
    if (current === 'OPEN') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'RESOLVED';
    return 'OPEN';
  };

  const nextLabel = (current) => {
    if (current === 'OPEN') return 'Start Progress';
    if (current === 'IN_PROGRESS') return 'Mark Resolved';
    return 'Reopen';
  };

  return (
    <div>
      <PageHeader
        title="Complaints"
        description="Track and resolve student complaints"
      >
        <Input
          isClearable
          placeholder="Search complaints\u2026"
          startContent={<Search size={16} className="text-slate-400" />}
          value={q}
          onValueChange={setQ}
          variant="bordered"
          radius="md"
          className="w-60"
          classNames={{ input: 'text-sm', inputWrapper: 'h-9' }}
        />
        <Select
          placeholder="Priority"
          selectedKeys={priority ? [priority] : []}
          onSelectionChange={(keys) => {
            const v = [...keys][0] || '';
            setPriority(v === 'ALL' ? '' : v);
          }}
          variant="bordered"
          radius="md"
          className="w-44"
          classNames={{ trigger: 'h-9', value: 'text-sm' }}
        >
          <SelectItem key="ALL" value="ALL">All priorities</SelectItem>
          {['HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <SelectItem key={p} value={p}>
              {p.charAt(0) + p.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </Select>
        <button
          onClick={openAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus size={16} /> Add Complaint
        </button>
      </PageHeader>

      <Tabs
        aria-label="Complaint status tabs"
        selectedKey={status || 'all'}
        onSelectionChange={(key) => setStatus(key === 'all' ? '' : key)}
        classNames={{ base: 'mb-4', tabList: 'gap-2 rounded-xl bg-slate-200/60 p-1 w-fit', tab: 'rounded-lg px-4 py-1.5 text-sm font-semibold', cursor: 'bg-white shadow-sm' }}
      >
        <Tab key="all" title="All" />
        <Tab key="OPEN" title="Open" />
        <Tab key="IN_PROGRESS" title="In Progress" />
        <Tab key="RESOLVED" title="Resolved" />
      </Tabs>

      {loading ? (
        <PageSpinner />
      ) : error ? (
        <EmptyState title="Could not load complaints" message={error} actionLabel="Retry" onAction={load} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <Table
            aria-label="Complaints table"
            isCompact
            isStriped
            removeWrapper
            bottomContent={
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="text-xs text-slate-400">
                  Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                  {(page - 1) * PAGE_SIZE + pageRows.length} of {filtered.length}
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
              <TableColumn>ID</TableColumn>
              <TableColumn>STUDENT</TableColumn>
              <TableColumn>ROOM</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>PRIORITY</TableColumn>
              <TableColumn>SUBMITTED</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn className="text-right">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={pageRows}
              emptyContent={
                <div className="py-10">
                  <EmptyState
                    title="No complaints found"
                    message={
                      q || status || priority
                        ? 'Try adjusting your search or filters.'
                        : 'No complaints registered yet.'
                    }
                    actionLabel={!q && !status && !priority ? 'Add Complaint' : undefined}
                    onAction={!q && !status && !priority ? openAdd : undefined}
                  />
                </div>
              }
            >
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      {item.complaintId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.studentName}</p>
                      <p className="font-mono text-[11px] text-slate-400">{item.studentId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {item.roomNumber || '\u2014'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.category}</TableCell>
                  <TableCell>
                    <p className="max-w-56 text-sm text-slate-600 line-clamp-2">
                      {item.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={item.priority} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(item.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {item.status !== 'RESOLVED' && (
                        <button
                          onClick={() =>
                            setStatusAction({ id: item.id, next: nextStatus(item.status) })
                          }
                          className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-100"
                          title={nextLabel(item.status)}
                        >
                          {item.status === 'OPEN' ? (
                            <Clock size={12} />
                          ) : (
                            <CheckCircle2 size={12} />
                          )}
                          {nextLabel(item.status)}
                        </button>
                      )}
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
                          aria-label="Complaint actions"
                          onAction={(key) => {
                            if (key === 'edit') openEdit(item);
                            if (key === 'resolve' && item.status !== 'RESOLVED') {
                              setStatusAction({ id: item.id, next: 'RESOLVED' });
                            }
                            if (key === 'reopen' && item.status === 'RESOLVED') {
                              setStatusAction({ id: item.id, next: 'OPEN' });
                            }
                            if (key === 'delete') setDeleteTarget(item);
                          }}
                        >
                          <DropdownItem key="edit" startContent={<Pencil size={15} />}>
                            Edit Details
                          </DropdownItem>
                          {item.status !== 'RESOLVED' ? (
                            <DropdownItem key="resolve" startContent={<CheckCircle2 size={15} />}>
                              Mark Resolved
                            </DropdownItem>
                          ) : (
                            <DropdownItem key="reopen" startContent={<Clock size={15} />}>
                              Reopen
                            </DropdownItem>
                          )}
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
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <FormModal
        open={modalOpen}
        onOpenChange={(open) => {
          if (!submitting) setModalOpen(open);
        }}
        title={editing ? 'Edit Complaint' : 'Add Complaint'}
        subtitle={editing ? `Editing ${editing.complaintId}` : 'Register a new student complaint'}
        submitLabel={editing ? 'Save Changes' : 'Register Complaint'}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            label="Student"
            required
            value={form.studentId}
            onChange={(v) => setForm({ ...form, studentId: v })}
            error={formErrors.studentId}
            placeholder="Select a student"
            options={students.map((s) => ({
              value: String(s.id),
              label: `${s.fullName} \u00B7 ${s.studentId}`,
            }))}
          />
          <FormSelect
            label="Room (optional)"
            value={form.roomId}
            onChange={(v) => setForm({ ...form, roomId: v })}
            error={formErrors.roomId}
            placeholder="Select room if applicable"
            allowEmpty
            emptyLabel="No specific room"
            options={rooms.map((r) => ({
              value: String(r.id),
              label: `Room ${r.roomNumber} (Floor ${r.floorNo})`,
            }))}
          />
          <FormSelect
            label="Category"
            required
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            error={formErrors.category}
            placeholder="Select a category"
            options={CATEGORIES}
          />
          <FormSelect
            label="Priority"
            required
            value={form.priority}
            onChange={(v) => setForm({ ...form, priority: v })}
            error={formErrors.priority}
            options={[
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' },
            ]}
          />
          <div className="sm:col-span-2">
            <FormTextarea
              label="Description"
              placeholder="Describe the issue in detail\u2026"
              minRows={3}
              required
              isRequired
              value={form.description}
              onValueChange={(v) => setForm({ ...form, description: v })}
              isInvalid={!!formErrors.description}
              errorMessage={formErrors.description}
            />
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete complaint"
        message={
          deleteTarget
            ? `Are you sure you want to delete complaint ${deleteTarget.complaintId}? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!statusAction}
        title="Update complaint status"
        message={
          statusAction
            ? `Mark complaint ${statusAction.id} as "${statusAction.next.replace('_', ' ')}"? The change will be saved to the database.`
            : ''
        }
        confirmLabel="Update Status"
        danger={false}
        onConfirm={handleStatusChange}
        onClose={() => setStatusAction(null)}
      />
    </div>
  );
}
