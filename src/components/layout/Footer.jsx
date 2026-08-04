import { useBrand } from '@/hooks/useBrand';
import { APP } from '@/config/app';

export function Footer() {
  const { brand } = useBrand();
  return (
    <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line px-1 py-4 text-[0.75rem] text-ink-subtle">
      <p>
        © {APP.copyrightYear} {brand.legalName}. Powered by {brand.name}.
      </p>
      {APP.isDemo ? (
        <p className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-[#8a5600]">
          Demo data — no live accounts connected
        </p>
      ) : null}
    </footer>
  );
}

export default Footer;
