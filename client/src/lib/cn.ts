import { extendTailwindMerge } from 'tailwind-merge';

// Merges Tailwind classes so a later class wins over an earlier conflicting one
// (e.g. Card's default `bg-white` vs an override `bg-accent-50`). `shadow-card` is our custom shadow token.
const twMerge = extendTailwindMerge({ extend: { classGroups: { shadow: [{ shadow: ['card'] }] } } });

export const cn = (...classes: (string | false | null | undefined)[]) => twMerge(classes.filter(Boolean).join(' '));
