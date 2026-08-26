import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBrand } from '@/hooks/useBrand';
import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';

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
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken p-6">
      <div className="w-full max-w-sm space-y-6 rounded-cf-lg border border-line bg-surface p-8 shadow-cf-raised">
        <Wordmark size="lg" className="w-full justify-center" />

        <div>
          <h2 className="font-display text-[1.75rem] font-semibold leading-tight text-ink">
            Sign in
          </h2>
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
      </div>
    </div>
  );
}

export default Login;
