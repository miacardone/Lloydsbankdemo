import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { DataTable } from '@/components/table/DataTable';
import { useTableState } from '@/hooks/useTableState';
import { currentUser, loginHistory } from '@/data/users';

const PASSWORD_RULES = [
  'Between 14 and 25 characters',
  'At least one number',
  'At least one capital letter',
  'At least one lowercase letter',
  'At least one special character (!, ?, and so on)',
  'Must not contain your username',
];

export function ProfileSettings() {
  const [email, setEmail] = useState(currentUser.email);
  const [saved, setSaved] = useState(false);

  const table = useTableState(loginHistory, {
    searchKeys: ['ip', 'at'],
    initialSort: { key: 'at', direction: 'desc' },
    initialPageSize: 10,
  });

  return (
    <>
      <PageHeader
        title="Your profile"
        description="Your sign-in details and a record of where your account has been used."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader title="Email address" description="Where we send your notifications." />
            <div className="flex flex-wrap items-end gap-2">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSaved(false);
                }}
                className="min-w-56 flex-1"
              />
              <Button onClick={() => setSaved(true)}>Save email</Button>
            </div>
            {saved ? <p className="mt-2 text-cf-body text-positive">Email saved.</p> : null}
          </Card>

          <Card>
            <CardHeader title="Change password" />
            <div className="rounded-cf bg-brand-lightest p-3">
              <p className="text-cf-label uppercase text-brand">Your password must have</p>
              <ul className="mt-1.5 space-y-0.5">
                {PASSWORD_RULES.map((rule) => (
                  <li key={rule} className="text-cf-body text-ink-muted">
                    · {rule}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 space-y-3">
              <Input label="Current password" type="password" autoComplete="current-password" />
              <Input label="New password" type="password" autoComplete="new-password" />
              <Input label="Confirm new password" type="password" autoComplete="new-password" />
              <Button>Change password</Button>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="mb-2 text-cf-section text-ink">Sign-in history</h2>
          <p className="mb-2 text-cf-body text-ink-muted">
            If you see an address you do not recognize, change your password and tell your account
            administrator.
          </p>
          <DataTable
            columns={[
              { key: 'ip', header: 'IP address' },
              { key: 'at', header: 'Date and time' },
            ]}
            state={table}
            caption="Sign-in history"
            exportName="sign-in-history"
            dense
          />
        </div>
      </div>
    </>
  );
}

export default ProfileSettings;
