import { useState } from 'react';
import { KeyRound, Lock, Pencil, Plus, ShieldCheck, Unlock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { useTableState } from '@/hooks/useTableState';
import { users as seedUsers } from '@/data/users';
import { formatDate } from '@/lib/format';

const STATUS_TONE = { active: 'positive', locked: 'negative', invited: 'caution' };
const STATUS_LABEL = { active: 'Active', locked: 'Locked', invited: 'Invited' };

const ROLES = ['Merchant admin', 'Merchant full service', 'Analyst', 'Read only'];
const BLANK_INVITE = {
  firstName: '',
  lastName: '',
  email: '',
  role: ROLES[3],
  midAccess: 'All MIDs',
};

export function UserManagement() {
  const { notify } = useToast();
  const [users, setUsers] = useState(seedUsers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState(BLANK_INVITE);
  const [editing, setEditing] = useState(null);
  const [permissions, setPermissions] = useState(null);

  const setField = (patch) => setInvite((current) => ({ ...current, ...patch }));

  const inviteReady =
    invite.firstName.trim() && invite.lastName.trim() && /.+@.+\..+/.test(invite.email.trim());

  const sendInvitation = () => {
    const first = invite.firstName.trim();
    const last = invite.lastName.trim();
    const username = `${first.toLowerCase()}.${last.toLowerCase()}`;
    setUsers((current) => [
      {
        id: `user-${current.length + 1}-${username}`,
        firstName: first,
        lastName: last,
        username,
        email: invite.email.trim(),
        role: invite.role,
        status: 'invited',
        midPermissions: invite.midAccess === 'All MIDs' ? 12 : 1,
        lastActive: null,
      },
      ...current,
    ]);
    setInvite(BLANK_INVITE);
    setInviteOpen(false);
    notify(`Invitation sent to ${invite.email.trim()}.`);
  };

  const saveEdit = () => {
    setUsers((current) =>
      current.map((user) => (user.id === editing.id ? { ...user, ...editing } : user)),
    );
    notify(`${editing.firstName} ${editing.lastName} updated.`);
    setEditing(null);
  };

  const savePermissions = () => {
    setUsers((current) =>
      current.map((user) =>
        user.id === permissions.id
          ? { ...user, midPermissions: Number(permissions.midPermissions) || 0 }
          : user,
      ),
    );
    notify(`MID access updated for ${permissions.username}.`);
    setPermissions(null);
  };

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
    {
      key: 'lastActive',
      header: 'Last active',
      render: (row) => (row.lastActive ? formatDate(row.lastActive) : 'Never signed in'),
    },
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
          <IconButton
            icon={Pencil}
            label={`Edit ${row.username}`}
            onClick={() => setEditing({ ...row })}
          />
          <IconButton
            icon={ShieldCheck}
            label={`MID permissions for ${row.username}`}
            onClick={() => setPermissions({ ...row })}
          />
          <IconButton
            icon={KeyRound}
            label={`Send password reset to ${row.username}`}
            onClick={() => notify(`Password reset sent to ${row.email}.`)}
          />
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
            <Button disabled={!inviteReady} onClick={sendInvitation}>
              Send invitation
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="First name"
            required
            placeholder="Priya"
            value={invite.firstName}
            onChange={(event) => setField({ firstName: event.target.value })}
          />
          <Input
            label="Last name"
            required
            placeholder="Raman"
            value={invite.lastName}
            onChange={(event) => setField({ lastName: event.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            placeholder="priya.raman@example.com"
            className="sm:col-span-2"
            value={invite.email}
            onChange={(event) => setField({ email: event.target.value })}
          />
          <Select
            label="Role"
            required
            options={ROLES}
            value={invite.role}
            onChange={(event) => setField({ role: event.target.value })}
          />
          <Select
            label="MID access"
            options={['All MIDs', 'Selected MIDs']}
            value={invite.midAccess}
            onChange={(event) => setField({ midAccess: event.target.value })}
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.firstName} ${editing.lastName}` : ''}
        description="Changes take effect the next time they sign in."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="First name"
              value={editing.firstName}
              onChange={(event) =>
                setEditing((current) => ({ ...current, firstName: event.target.value }))
              }
            />
            <Input
              label="Last name"
              value={editing.lastName}
              onChange={(event) =>
                setEditing((current) => ({ ...current, lastName: event.target.value }))
              }
            />
            <Input
              label="Email"
              type="email"
              className="sm:col-span-2"
              value={editing.email}
              onChange={(event) =>
                setEditing((current) => ({ ...current, email: event.target.value }))
              }
            />
            <Select
              label="Role"
              options={ROLES}
              value={editing.role}
              onChange={(event) =>
                setEditing((current) => ({ ...current, role: event.target.value }))
              }
            />
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'locked', label: 'Locked' },
                { value: 'invited', label: 'Invited' },
              ]}
              value={editing.status}
              onChange={(event) =>
                setEditing((current) => ({ ...current, status: event.target.value }))
              }
            />
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(permissions)}
        onClose={() => setPermissions(null)}
        size="sm"
        title={permissions ? `MID access for ${permissions.username}` : ''}
        description="How many of your MIDs this person can work."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPermissions(null)}>
              Cancel
            </Button>
            <Button onClick={savePermissions}>Save access</Button>
          </>
        }
      >
        {permissions ? (
          <Input
            label="MIDs this user can see"
            type="number"
            min="0"
            max="12"
            value={permissions.midPermissions}
            onChange={(event) =>
              setPermissions((current) => ({ ...current, midPermissions: event.target.value }))
            }
            hint="Set to 0 to remove their access entirely."
          />
        ) : null}
      </Modal>
    </>
  );
}

export default UserManagement;
