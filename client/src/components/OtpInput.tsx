import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

interface Props { value: string; onChange: (value: string) => void; disabled?: boolean; hasError?: boolean }
const LENGTH = 6;

/** Six single-digit boxes. Supports typing, backspace, arrow keys and pasting a full code. */
export function OtpInput({ value, onChange, disabled, hasError }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  const focus = (i: number) => refs.current[Math.min(Math.max(i, 0), LENGTH - 1)]?.focus();

  const setDigit = (i: number, d: string) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join(''));
  };

  // Fires for deletions, mobile keyboards and one-time-code autofill (a whole code lands in one box).
  const handleChange = (i: number, raw: string) => {
    const typed = raw.replace(/\D/g, '');
    if (typed.length > 1) {
      const next = (value.slice(0, i) + typed).slice(0, LENGTH);
      onChange(next);
      focus(next.length);
      return;
    }
    setDigit(i, typed);
    if (typed) focus(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Digit keys are handled here, not in onChange: re-typing the SAME digit that is already in the
    // box produces no change event, which used to leave focus stuck on that box.
    if (/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setDigit(i, e.key);
      focus(i + 1);
    } else if (e.key === 'Backspace' && !digits[i]) focus(i - 1);
    else if (e.key === 'ArrowLeft') focus(i - 1);
    else if (e.key === 'ArrowRight') focus(i + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focus(pasted.length);
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={hasError}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`size-12 rounded-lg border bg-white text-center text-xl font-semibold text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:size-14 ${hasError ? 'border-danger' : 'border-line'}`}
        />
      ))}
    </div>
  );
}
