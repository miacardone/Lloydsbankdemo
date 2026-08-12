import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Route, ShieldCheck, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBrand } from '@/hooks/useBrand';
import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';

/* Generic, brand-agnostic — describes what every tenant's portal does, not
   what one tenant sells, so it never needs editing when a tenant is added. */
const FEATURES = [
  {
    icon: Wallet,
    title: 'One queue for volume, approvals and cost',
    description: 'Transactions, settlements and reporting in one place.',
  },
  {
    icon: Route,
    title: 'Routing you can see',
    description: 'Every acquirer, every decision, one dashboard.',
  },
  {
    icon: ShieldCheck,
    title: 'Disputes before they escalate',
    description: 'Risk notices surface problems ahead of the scheme deadline.',
  },
];

export function Login() {
  const { brand } = useBrand();
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname ?? '/'} replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (login(username, password)) {
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } else {
      setError('Incorrect username or password.');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-surface-nav p-10 text-white lg:flex">
        <Wordmark tone="inverse" size="lg" />

        <div className="max-w-sm space-y-8">
          <h1 className="font-display text-[1.75rem] font-semibold leading-tight">
            {brand.tagline}
          </h1>
          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-cf bg-white/10">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-[0.8125rem] text-white/70">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[0.8125rem] text-white/60">
          {brand.legalName} · {brand.content?.portalName}
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="mb-2">
            <Wordmark size="lg" />
          </div>

          <div>
            <h2 className="font-display text-[1.75rem] leading-tight text-ink">Sign in</h2>
            <p className="mt-1 text-cf-body text-ink-muted">
              Use your {brand.name} operator account to continue.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Username"
              required
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={error}
            />
            <Button type="submit" size="lg" className="w-full">
              Sign in
            </Button>
          </form>

          <div className="rounded-cf border border-line bg-surface-sunken p-3">
            <p className="mb-1 text-cf-label uppercase text-ink-subtle">Demo credentials</p>
            <p className="text-cf-body text-ink">
              {brand.content?.demoUsername} / {brand.content?.demoPassword}
            </p>
          </div>

          <p className="text-[0.8125rem] text-ink-subtle">
            Trouble signing in? Contact{' '}
            <a className="text-brand hover:underline" href={`mailto:${brand.supportEmail}`}>
              {brand.supportEmail}
            </a>
            .
          </p>

          {brand.content?.disclaimer ? (
            <p className="text-[0.75rem] text-ink-subtle">{brand.content.disclaimer}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Login;
