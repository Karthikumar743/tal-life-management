import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonthlyPremiumForm from '../components/MonthlyPremiumForm';

async function fillValidBase(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Name/i), 'Test User');
  await user.type(screen.getByLabelText(/Age Next Birthday/i), '35');
  await user.type(screen.getByLabelText(/Date of Birth/i), '07/1990');
  await user.type(screen.getByLabelText(/Sum Insured/i), '500000');
}

describe('MonthlyPremiumForm', () => {
  test('calculates premium when occupation is selected (valid inputs)', async () => {
    const user = userEvent.setup();
    render(<MonthlyPremiumForm />);

    await fillValidBase(user);

    const select = screen.getByRole('combobox', { name: /Usual Occupation/i });
    await user.selectOptions(select, 'Doctor');

    const expected = (500000 * 1.5 * 1.0) / 1000 * 12;
    const expectedFormatted = expected.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    await waitFor(() => {
      expect(screen.getByText(expectedFormatted)).toBeInTheDocument();
      expect(screen.getByText(/Selected Occupation Rating/i)).toBeInTheDocument();
    });
  });

  test('updates premium when occupation changes', async () => {
    const user = userEvent.setup();
    render(<MonthlyPremiumForm />);

    await fillValidBase(user);

    const select = screen.getByRole('combobox', { name: /Usual Occupation/i });

    await user.selectOptions(select, 'Doctor');
    const doctorExpected = (500000 * 1.5 * 1.0) / 1000 * 12;
    const doctorFormatted = doctorExpected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    await waitFor(() => expect(screen.getByText(doctorFormatted)).toBeInTheDocument());

    await user.selectOptions(select, 'Cleaner');
    const cleanerExpected = (500000 * 11.5 * 1.0) / 1000 * 12;
    const cleanerFormatted = cleanerExpected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    await waitFor(() => expect(screen.getByText(cleanerFormatted)).toBeInTheDocument());
  });

  test('does not calculate premium when inputs are invalid (age too low)', async () => {
    const user = userEvent.setup();
    render(<MonthlyPremiumForm />);

    await user.type(screen.getByLabelText(/Name/i), 'Invalid Age');
    await user.type(screen.getByLabelText(/Age Next Birthday/i), '18'); // invalid (<21)
    await user.type(screen.getByLabelText(/Date of Birth/i), '07/2007');
    await user.type(screen.getByLabelText(/Sum Insured/i), '100000');

    const select = screen.getByRole('combobox', { name: /Usual Occupation/i });
    await user.selectOptions(select, 'Doctor');

    await waitFor(() => {
      // No premium number should be present
      expect(screen.queryByText(/\d{1,3}(?:,\d{3})*\.\d{2}/)).not.toBeInTheDocument();
      // Validation message for age should be visible
      expect(screen.getByText(/Enter a valid age/i)).toBeInTheDocument();
    });
  });

  test('clearing occupation removes the displayed premium', async () => {
    const user = userEvent.setup();
    render(<MonthlyPremiumForm />);

    await fillValidBase(user);

    const select = screen.getByRole('combobox', { name: /Usual Occupation/i });
    await user.selectOptions(select, 'Doctor');

    const expected = (500000 * 1.5 * 1.0) / 1000 * 12;
    const formatted = expected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    await waitFor(() => expect(screen.getByText(formatted)).toBeInTheDocument());

    // clear occupation
    await user.selectOptions(select, '');
    await waitFor(() => {
       expect(screen.queryByText(formatted)).not.toBeInTheDocument();
    });
  });
});