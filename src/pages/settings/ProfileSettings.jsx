import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { DataTable } from '@/components/table/DataTable';
import { useTableState } from '@/hooks/useTableState';
import { currentUser, loginHistory } from '@/data/users';
import { cn } from '@/lib/cn';

/* Each rule carries its own test, so the checklist can tick itself as the
   reader types rather than being a static list they have to self-assess. */
const PASSWORD_RULES = [
  { label: 'Between 14 and 25 characters', test: (v) => v.length >= 14 && v.length <= 25 },
  { label: 'At least one number', test: (v) => /\d/.test(v) },
  { label: 'At least one capital letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'At least one lowercase letter', test: (v) => /[a-z]/.test(v) },
  {
    label: 'At least one special character (!, ?, and so on)',
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
  {
    label: 'Must not contain your username',
    test: (v, username) => Boolean(v) && !v.toLowerCase().includes(username.toLowerCase()),
  },
];

export function ProfileSettings() {
  const { notify } = useToast();
  const [email, setEmail] = useState(currentUser.email);
  const [saved, setSaved] = useState(false);
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState(null);

  const results = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password.next, currentUser.username),
  }));
  const allPassed = results.every((rule) => rule.passed);
  const matches = password.next.length > 0 && password.next === password.confirm;

  const changePassword = () => {
    if (!password.current) {
      setError('Enter your current password.');
      return;
    }
    if (!allPassed) {
      setError('The new password does not meet every rule above.');
      return;
    }
    if (!matches) {
      setError('The two new passwords do not match.');
      return;
    }
    setError(null);
    setPassword({ current: '', next: '', confirm: '' });
    notify('Password changed. Sign in with it next time.');
  };

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
              <Button
                onClick={() => {
                  setSaved(true);
                  notify('Email address saved.');
                }}
              >
                Save email
              </Button>
            </div>
            {saved ? <p className="mt-2 text-cf-body text-positive">Email saved.</p> : null}
          </Card>

          <Card>
            <CardHeader title="Change password" />
            <div className="rounded-cf bg-brand-lightest p-3">
              <p className="text-cf-label uppercase text-brand">Your password must have</p>
              <ul className="mt-1.5 space-y-0.5">
                {results.map((rule) => (
                  <li
                    key={rule.label}
                    className={cn(
                      'flex items-start gap-1.5 text-cf-body',
                      rule.passed ? 'text-positive' : 'text-ink-muted',
                    )}
                  >
                    <span aria-hidden="true">{rule.passed ? '✓' : '·'}</span>
                    <span>{rule.label}</span>
                    {rule.passed ? <span className="sr-only">met</span> : null}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 space-y-3">
              <Input
                label="Current password"
                type="password"
                autoComplete="current-password"
                value={password.current}
                onChange={(event) => {
                  setPassword((current) => ({ ...current, current: event.target.value }));
                  setError(null);
                }}
              />
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                value={password.next}
                onChange={(event) => {
                  setPassword((current) => ({ ...current, next: event.target.value }));
                  setError(null);
                }}
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                value={password.confirm}
                error={
                  password.confirm && !matches ? 'These do not match your new password.' : undefined
                }
                onChange={(event) => {
                  setPassword((current) => ({ ...current, confirm: event.target.value }));
                  setError(null);
                }}
              />
              {error ? <p className="text-cf-body text-negative">{error}</p> : null}
              <Button onClick={changePassword}>Change password</Button>
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
