import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, MoreVertical, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
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
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormModal from '../components/ui/FormModal';
import { FormDate, FormInput, FormSelect, FormTextarea } from '../components/ui/FormFields';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDate } from '../utils/format';

const PAGE_SIZE = 8;

const emptyForm = {
  studentId: '',
  fullName: '',
  email: '',
  phone: '',
  course: '',
  yearOfStudy: '',
  guardianName: '',
  guardianContact: '',
  address: '',
  admissionDate: '',
  status: 'ACTIVE',
};

export default function Students() {
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [viewing, setViewing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (status) params.set('status', status);
      const { data } = await api.get(`/students?${params.toString()}`);
      setStudents(data);
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

  const filtered = useMemo(() => students, [students]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      studentId: s.studentId,
      fullName: s.fullName,
      email: s.email,
      phone: s.phone,
      course: s.course,
      yearOfStudy: String(s.yearOfStudy),
      guardianName: s.guardianName,
      guardianContact: s.guardianContact,
      address: s.address || '',
      admissionDate: s.admissionDate,
      status: s.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.studentId.trim()) errors.studentId = 'Student ID is required';
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\d{10,15}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Enter a valid 10-15 digit phone number';
    }
    if (!form.course.trim()) errors.course = 'Course is required';
    if (!form.yearOfStudy) errors.yearOfStudy = 'Year of study is required';
    if (!form.guardianName.trim()) errors.guardianName = 'Guardian name is required';
    if (!form.guardianContact.trim()) errors.guardianContact = 'Guardian contact is required';
    if (!form.admissionDate) errors.admissionDate = 'Admission date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        studentId: form.studentId.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        yearOfStudy: Number(form.yearOfStudy),
      };
      if (editing) {
        await api.put(`/students/${editing.id}`, payload);
        toast.success(`Updated ${payload.fullName}`);
      } else {
        await api.post('/students', payload);
        toast.success(`Added ${payload.fullName}`);
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
      await api.delete(`/students/${deleteTarget.id}`);
      toast.success(`${deleteTarget.fullName} deleted`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Students"
        description={`${students.length} student records`}
      >
        <Input
          isClearable
          placeholder="Search name, ID or phone\u2026"
          startContent={<Search size={16} className="text-slate-400" />}
          value={q}
          onValueChange={setQ}
          variant="bordered"
          radius="md"
          className="w-64"
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
          className="w-44"
          classNames={{ trigger: 'h-9', value: 'text-sm' }}
        >
          <SelectItem key="ALL" value="ALL">All statuses</SelectItem>
          <SelectItem key="ACTIVE" value="ACTIVE">Active</SelectItem>
          <SelectItem key="INACTIVE" value="INACTIVE">Inactive</SelectItem>
        </Select>
        <button
          onClick={openAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus size={16} /> Add Student
        </button>
      </PageHeader>

      {loading ? (
        <PageSpinner />
      ) : error ? (
        <EmptyState
          title="Could not load students"
          message={error}
          actionLabel="Retry"
          onAction={load}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <Table
              aria-label="Students table"
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
                table: 'min-w-[900px] tabular-nums',
              }}
            >
              <TableHeader>
                <TableColumn>STUDENT</TableColumn>
                <TableColumn>ID</TableColumn>
                <TableColumn>COURSE</TableColumn>
                <TableColumn>YEAR</TableColumn>
                <TableColumn>PHONE</TableColumn>
                <TableColumn>ADMITTED</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn className="text-right">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={pageRows}
                emptyContent={
                  <div className="py-10">
                    <EmptyState
                      title="No students found"
                      message={
                        q || status
                          ? 'Try adjusting your search or filters.'
                          : 'Add the first student to get started.'
                      }
                      actionLabel={!q && !status ? 'Add Student' : undefined}
                      onAction={!q && !status ? openAdd : undefined}
                      icon={Users}
                    />
                  </div>
                }
              >
                {(item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                          {item.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.fullName}</p>
                          <p className="text-xs text-slate-400">{item.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-slate-600">{item.studentId}</span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{item.course}</TableCell>
                    <TableCell className="text-sm text-slate-600">{item.yearOfStudy}</TableCell>
                    <TableCell className="text-sm text-slate-600">{item.phone}</TableCell>
                    <TableCell className="text-sm text-slate-600">{formatDate(item.admissionDate)}</TableCell>
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
                          <DropdownMenu aria-label="Student actions" onAction={(key) => {
                            if (key === 'view') setViewing(item);
                            if (key === 'edit') openEdit(item);
                            if (key === 'delete') setDeleteTarget(item);
                          }}>
                            <DropdownItem key="view" startContent={<Eye size={15} />}>View details</DropdownItem>
                            <DropdownItem key="edit" startContent={<Pencil size={15} />}>Edit</DropdownItem>
                            <DropdownItem key="delete" className="text-rose-500" startContent={<Trash2 size={15} />}>
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
        </>
      )}

      <FormModal
        open={modalOpen}
        onOpenChange={(open) => {
          if (!submitting) setModalOpen(open);
        }}
        title={editing ? 'Edit Student' : 'Add Student'}
        subtitle={editing ? `Editing ${editing.studentId}` : 'Create a new student record'}
        submitLabel={editing ? 'Save Changes' : 'Add Student'}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            label="Student ID"
            placeholder="STU-2026-017"
            required
            isRequired
            value={form.studentId}
            onValueChange={(v) => setForm({ ...form, studentId: v })}
            isInvalid={!!formErrors.studentId}
            errorMessage={formErrors.studentId}
            isDisabled={!!editing}
          />
          <FormInput
            label="Full Name"
            placeholder="e.g. Aarav Sharma"
            required
            isRequired
            value={form.fullName}
            onValueChange={(v) => setForm({ ...form, fullName: v })}
            isInvalid={!!formErrors.fullName}
            errorMessage={formErrors.fullName}
          />
          <FormInput
            label="Email"
            placeholder="student@mail.com"
            type="email"
            required
            isRequired
            value={form.email}
            onValueChange={(v) => setForm({ ...form, email: v })}
            isInvalid={!!formErrors.email}
            errorMessage={formErrors.email}
          />
          <FormInput
            label="Phone"
            placeholder="9876500001"
            required
            isRequired
            value={form.phone}
            onValueChange={(v) => setForm({ ...form, phone: v })}
            isInvalid={!!formErrors.phone}
            errorMessage={formErrors.phone}
          />
          <FormInput
            label="Course / Department"
            placeholder="B.Tech Computer Science"
            required
            isRequired
            value={form.course}
            onValueChange={(v) => setForm({ ...form, course: v })}
            isInvalid={!!formErrors.course}
            errorMessage={formErrors.course}
          />
          <FormSelect
            label="Year of Study"
            required
            value={form.yearOfStudy}
            onChange={(v) => setForm({ ...form, yearOfStudy: v })}
            error={formErrors.yearOfStudy}
            options={['1', '2', '3', '4', '5'].map((y) => ({ value: y, label: `Year ${y}` }))}
          />
          <FormInput
            label="Guardian Name"
            placeholder="e.g. Rajesh Sharma"
            required
            isRequired
            value={form.guardianName}
            onValueChange={(v) => setForm({ ...form, guardianName: v })}
            isInvalid={!!formErrors.guardianName}
            errorMessage={formErrors.guardianName}
          />
          <FormInput
            label="Guardian Contact"
            placeholder="9876500011"
            required
            isRequired
            value={form.guardianContact}
            onValueChange={(v) => setForm({ ...form, guardianContact: v })}
            isInvalid={!!formErrors.guardianContact}
            errorMessage={formErrors.guardianContact}
          />
          <div className="sm:col-span-2">
            <FormTextarea
              label="Address"
              placeholder="Street, city, state"
              minRows={2}
              value={form.address}
              onValueChange={(v) => setForm({ ...form, address: v })}
            />
          </div>
          <FormDate
            label="Admission Date"
            required
            value={form.admissionDate}
            onChange={(v) => setForm({ ...form, admissionDate: v })}
            errorMessage={formErrors.admissionDate}
          />
          <FormSelect
            label="Hostel Status"
            required
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            error={formErrors.status}
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete student"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.fullName} (${deleteTarget.studentId})? Deletion is only possible when the student has no allocation, fee or complaint records.`
            : ''
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />

      {viewing && (
        <FormModal
          open
          onOpenChange={() => setViewing(null)}
          title="Student Details"
          subtitle={viewing.studentId}
          submitLabel="Close"
          onSubmit={() => setViewing(null)}
        >
          <div className="grid grid-cols-1 gap-4">
            {[
              ['Full Name', viewing.fullName],
              ['Student ID', viewing.studentId],
              ['Email', viewing.email],
              ['Phone', viewing.phone],
              ['Course', viewing.course],
              ['Year of Study', `Year ${viewing.yearOfStudy}`],
              ['Guardian Name', viewing.guardianName],
              ['Guardian Contact', viewing.guardianContact],
              ['Admission Date', formatDate(viewing.admissionDate)],
              ['Status', null],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {label}
                </p>
                {label === 'Status' ? (
                  <div className="mt-1">
                    <StatusBadge value={viewing.status} />
                  </div>
                ) : (
                  <p className="mt-1 text-sm font-medium text-slate-800">{value || '\u2014'}</p>
                )}
              </div>
            ))}
            <div className="sm:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Address
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {viewing.address || '\u2014'}
              </p>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
