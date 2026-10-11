import { Chip } from '@heroui/react';

const MAP = {
  ACTIVE: { label: 'Active', color: 'success' },
  INACTIVE: { label: 'Inactive', color: 'default' },
  AVAILABLE: { label: 'Available', color: 'success' },
  MAINTENANCE: { label: 'Maintenance', color: 'warning' },
  FULL: { label: 'Full', color: 'danger' },
  CHECKED_OUT: { label: 'Checked Out', color: 'default' },
  PAID: { label: 'Paid', color: 'success' },
  PARTIALLY_PAID: { label: 'Partially Paid', color: 'warning' },
  PENDING: { label: 'Pending', color: 'danger' },
  OPEN: { label: 'Open', color: 'danger' },
  IN_PROGRESS: { label: 'In Progress', color: 'warning' },
  RESOLVED: { label: 'Resolved', color: 'success' },
  HIGH: { label: 'High', color: 'danger' },
  MEDIUM: { label: 'Medium', color: 'warning' },
  LOW: { label: 'Low', color: 'default' },
  SINGLE: { label: 'Single', color: 'primary' },
  DOUBLE: { label: 'Double', color: 'primary' },
  TRIPLE: { label: 'Triple', color: 'primary' },
  QUAD: { label: 'Quad', color: 'primary' },
  CASH: { label: 'Cash', color: 'default' },
  UPI: { label: 'UPI', color: 'primary' },
  BANK_TRANSFER: { label: 'Bank Transfer', color: 'default' },
  CARD: { label: 'Card', color: 'default' },
};

export default function StatusBadge({ value, color, label, variant = 'flat', size = 'sm' }) {
  const entry = MAP[value] || { label: value ?? '\u2014', color: 'default' };
  return (
    <Chip size={size} color={color || entry.color} variant={variant} className="font-medium">
      {label || entry.label}
    </Chip>
  );
}

export function RoomStatusBadge({ room }) {
  if (!room) return <StatusBadge value={null} />;
  if (room.status === 'MAINTENANCE') return <StatusBadge value="MAINTENANCE" />;
  if (room.occupied >= room.capacity) return <StatusBadge value="FULL" />;
  if (room.occupied === 0) return <StatusBadge value="AVAILABLE" />;
  return <StatusBadge label="Partially Occupied" color="warning" />;
}
