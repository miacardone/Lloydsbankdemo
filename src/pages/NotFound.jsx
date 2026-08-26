import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Glyph } from '@/components/brand/Glyph';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Glyph size={34} animated />
      <h1 className="mt-4 font-display text-[2.5rem] font-semibold leading-none text-ink">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-cf-body text-ink-muted">
        That address does not match a page in the portal. It may have been renamed, or the link that
        brought you here may be out of date.
      </p>
      <Button as={Link} to="/" className="mt-5">
        Back to the dashboard
      </Button>
    </div>
  );
}

export default NotFound;
