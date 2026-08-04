import { useState } from 'react';
import { KeyRound, Lock, Pencil, Plus, ShieldCheck, Unlock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Field';
import { useTableState } from '@/hooks/useTableState';
import { users as seedUsers } from '@/data/users';
import { formatDate } from '@/lib/format';

const STATUS_TONE = { active: 'positive', locked: 'negative', invited: 'caution' };
const STATUS_LABEL = { active: 'Active', locked: 'Locked', invited: 'Invited' };

export function UserManagement() {
  const [users, setUsers] = useState(seedUsers);
  const [inviteOpen, setInviteOpen] = useState(false);

  const table = useTableState(users, {
    searchKeys: ['firstName', 'lastName', 'username', 'email', 'role'],
    initialSort: { key: 'lastName', direction: 'asc' },
  });

  const toggleLock = (id) =>
    setUsers((current) =>
      current.map((user) =>
        user.id === id ? { ...user, status: user.status === 'locked' ? 'active' : 'locked' } : user,
      ),
    );

  const columns = [
    { key: 'role', header: 'Role' },
    { key: 'firstName', header: 'First name' },
    { key: 'lastName', header: 'Last name' },
    { key: 'username', header: 'Username' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={STATUS_TONE[row.status]} dot>
          {STATUS_LABEL[row.status]}
        </Badge>
      ),
      value: (row) => STATUS_LABEL[row.status],
    },
    { key: 'email', header: 'Email' },
    {
      key: 'midPermissions',
      header: 'MIDs',
      align: 'right',
      value: (row) => row.midPermissions,
    },
    { key: 'lastActive', header: 'Last active', render: (row) => formatDate(row.lastActive) },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={row.status === 'locked' ? Unlock : Lock}
            label={row.status === 'locked' ? `Unlock ${row.username}` : `Lock ${row.username}`}
            onClick={() => toggleLock(row.id)}
          />
          <IconButton icon={Pencil} label={`Edit ${row.username}`} />
          <IconButton icon={ShieldCheck} label={`MID permissions for ${row.username}`} />
          <IconButton icon={KeyRound} label={`Send password reset to ${row.username}`} />
        </div>
      ),
      value: () => '',
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="Who can sign in, what they can see, and which MIDs they are allowed to work."
        actions={
          <Button icon={Plus} onClick={() => setInviteOpen(true)}>
            Add user
          </Button>
        }
      />

      <DataTable columns={columns} state={table} caption="Users" exportName="users" />

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Add user"
        description="They will receive an email invitation to set their own password."
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setInviteOpen(false)}>Send invitation</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="First name" required placeholder="Priya" />
          <Input label="Last name" required placeholder="Raman" />
          <Input
            label="Email"
            type="email"
            required
            placeholder="priya.raman@example.com"
            className="sm:col-span-2"
          />
          <Select
            label="Role"
            required
            options={['Merchant admin', 'Merchant full service', 'Analyst', 'Read only']}
          />
          <Select label="MID access" options={['All MIDs', 'Selected MIDs']} />
        </div>
      </Modal>
    </>
  );
}

export default UserManagement;
