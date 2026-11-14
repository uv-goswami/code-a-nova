import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OtpInput } from '../src/components/OtpInput';

function Harness({ initial = '' }: { initial?: string }) {
  const [v, setV] = useState(initial);
  return (<><OtpInput value={v} onChange={setV} /><output data-testid="value">{v}</output></>);
}

describe('OtpInput', () => {
  it('moves focus forward while typing', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByLabelText('Digit 1'));
    await user.keyboard('4829');
    expect(screen.getByTestId('value')).toHaveTextContent('4829');
    expect(screen.getByLabelText('Digit 5')).toHaveFocus();
  });

  it('ignores non-digits', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByLabelText('Digit 1'));
    await user.keyboard('a1b2');
    expect(screen.getByTestId('value')).toHaveTextContent('12');
  });

  it('fills every box when a full code is pasted', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByLabelText('Digit 1'));
    await user.paste('482 913');
    expect(screen.getByTestId('value')).toHaveTextContent('482913');
  });

  it('backspace on an empty box returns to the previous one', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByLabelText('Digit 1'));
    await user.keyboard('12');
    await user.keyboard('{Backspace}{Backspace}');
    expect(screen.getByLabelText('Digit 2')).toHaveFocus();
  });

  it('retyping over an existing code works even when a digit is unchanged (regression: stuck focus)', async () => {
    const user = userEvent.setup();
    render(<Harness initial="000000" />);
    await user.click(screen.getByLabelText('Digit 1'));
    await user.keyboard('408213'); // digits 2 and 5 repeat nothing, but 0 at position 2 equals the old value
    expect(screen.getByTestId('value')).toHaveTextContent('408213');
  });

  it('accepts a whole code arriving in one box (one-time-code autofill)', () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText('Digit 1'), { target: { value: '482913' } });
    expect(screen.getByTestId('value')).toHaveTextContent('482913');
    expect(screen.getByLabelText('Digit 6')).toHaveFocus();
  });
});
