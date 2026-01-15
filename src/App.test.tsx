import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { SessionService } from './domain/session';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});


describe('App Integration Test', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Complete flow: Create, Save, Load, Confirm, Delete', async () => {
    // 1. Render App
    const { unmount, rerender } = render(<App />);

    // 2. Fill Form
    const jobTitleInput = screen.getByPlaceholderText('Gestionnaire de projet');
    fireEvent.change(jobTitleInput, { target: { value: 'Software Engineer' } });

    const juryDateInput = screen.getByLabelText('Date du jury');
    // Set a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    fireEvent.change(juryDateInput, { target: { value: futureDateStr } });

    // Click Generate
    const generateBtn = screen.getByText(/Générer/i);
    fireEvent.click(generateBtn);

    // 3. Verify Schedule is generated
    expect(await screen.findByText(/Horaire du/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();

    // 4. Verify Auto-save
    let sessions = SessionService.getSessions();
    expect(sessions.length).toBe(1);
    expect(sessions[0].jobTitle).toBe('Software Engineer');
    expect(sessions[0].juryDate).toBe(futureDateStr);

    // 5. Confirm a candidate
    const candidateCells = screen.getAllByRole('cell', { name: '1' });
    const row = candidateCells[0].closest('tr');
    const checkbox = within(row!).getByRole('checkbox');

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Verify Auto-save of confirmation
    sessions = SessionService.getSessions();
    expect(sessions[0].confirmedCandidates).toContain('1');

    // 6. Simulate "New Session"
    // Sidebar is always visible.
    const newSessionBtns = screen.getAllByLabelText('Nouvelle Session');
    const newSessionBtn = newSessionBtns[0];
    fireEvent.click(newSessionBtn);

    // Form should be reset
    expect(screen.getByPlaceholderText('Gestionnaire de projet')).toHaveValue('');
    expect(screen.queryByText(/Horaire du/)).not.toBeInTheDocument();

    // 7. Load the saved session
    const sessionItem = await screen.findByText('Software Engineer');
    fireEvent.click(sessionItem);

    // Verify data is restored
    expect(await screen.findByPlaceholderText('Gestionnaire de projet')).toHaveValue('Software Engineer');
    expect(screen.getByLabelText('Date du jury')).toHaveValue(futureDateStr);

    // Check confirmation persistence
    const restoredCandidateCells = screen.getAllByRole('cell', { name: '1' });
    const restoredRow = restoredCandidateCells[0].closest('tr');
    const restoredCheckbox = within(restoredRow!).getByRole('checkbox');
    expect(restoredCheckbox).toBeChecked();

    // 8. Delete Session
    const itemText = await screen.findByText('Software Engineer');
    const sidebarItem = itemText.closest('.sidebar-item');
    expect(sidebarItem).toBeInTheDocument();

    const deleteBtn = within(sidebarItem as HTMLElement).getByLabelText('Supprimer');
    fireEvent.click(deleteBtn);

    // Verify deletion
    sessions = SessionService.getSessions();
    expect(sessions.length).toBe(0);

    // Sidebar should show "Aucune session trouvée."
    expect(screen.getByText('Aucune session trouvée.')).toBeInTheDocument();
  });

  test('Past sessions are highlighted', async () => {
    // Manually inject a past session
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    const session = {
        id: 'past-session',
        createdAt: new Date().toISOString(),
        juryDate: pastDateStr,
        jobTitle: 'Past Job',
        parameters: {
            candidates: [],
            jurorsStartTime: '09:00',
            interviewParameters: {
                welcomeDuration: '00:15',
                casusDuration: '01:00',
                correctionDuration: '00:15',
                interviewDuration: '01:00',
                debriefingDuration: '00:15',
            },
            lunchTargetTime: '12:45',
            lunchDuration: '00:30',
            finalDebriefingDuration: '00:15',
        },
        confirmedCandidates: []
    };
    SessionService.saveSession(session);

    render(<App />);

    const itemText = await screen.findByText('Past Job');
    const item = itemText.closest('.sidebar-item');
    expect(item).toHaveClass('text-muted');
  });
});
