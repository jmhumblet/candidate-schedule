import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ScheduleTable from '../ScheduleTable';
import Time from '../domain/time';
import { JuryWelcomeSlot } from '../domain/interviewSlot';

// Mock react-clipboard.js
jest.mock('react-clipboard.js', () => {
  return ({ children, onSuccess, component: Component = 'div', ...props }: any) => {
    return (
      <Component onClick={() => onSuccess && onSuccess()} {...props}>
        {children}
      </Component>
    );
  };
});

test('ScheduleTable renders and copy interaction', async () => {
    const startTime = new Time(9, 0);
    const slots = [new JuryWelcomeSlot(startTime)];
    const date = '2023-10-27';

    render(<ScheduleTable schedule={slots} date={date} confirmedCandidates={[]} onConfirmCandidate={() => {}} />);

    // Verify title is present
    expect(screen.getByText(/Horaire du/)).toBeInTheDocument();

    // In the current implementation, the component is an 'h2'.
    // We search for the text inside the h2.
    const title = screen.getByText(/Horaire du/);
    expect(title).toBeInTheDocument();

    // Find the Copy button
    // It should have text "Copier" initially.
    const copyButton = screen.getByText(/Copier/i);
    expect(copyButton).toBeInTheDocument();

    // Trigger copy
    fireEvent.click(copyButton);

    // Expect "Copié !" to appear.
    const feedback = await screen.findByText(/Copié !/i);
    expect(feedback).toBeInTheDocument();
});
