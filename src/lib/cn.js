import clsx from 'clsx';

/** Thin alias so components read consistently and swapping in tailwind-merge later is a one-file change. */
export const cn = (...inputs) => clsx(inputs);

export default cn;
