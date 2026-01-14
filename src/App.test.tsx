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

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random()
  }
});

// Mock matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() { return false; },
  };
};

describe('App Integration Test', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset any singleton state if necessary (SessionService is stateless besides localStorage access)
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
    // Find the first checkbox in the table
    // The first checkboxes might be something else, let's look for the one in the table row
    // Candidate names are '1', '2', '3', '4'.
    // Use getAllByText in case '1' appears elsewhere, and find the one inside a table cell or row
    const candidateCells = screen.getAllByRole('cell', { name: '1' });
    const row = candidateCells[0].closest('tr');
    const checkbox = within(row!).getByRole('checkbox');

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Verify Auto-save of confirmation
    sessions = SessionService.getSessions();
    expect(sessions[0].confirmedCandidates).toContain('1');

    // 6. Simulate "New Session"
    // Open Sidebar
    const sidebarBtn = document.querySelector('.btn-light'); // The hamburger button
    fireEvent.click(sidebarBtn!);

    // Wait for sidebar to be visible (Offcanvas animation)
    const newSessionBtn = await screen.findByText('+ Nouvelle Session');
    fireEvent.click(newSessionBtn);

    // Form should be reset
    expect(screen.getByPlaceholderText('Gestionnaire de projet')).toHaveValue('');
    expect(screen.queryByText(/Horaire du/)).not.toBeInTheDocument();

    // 7. Load the saved session
    fireEvent.click(sidebarBtn!); // Open sidebar again
    const sessionItem = await screen.findByText('Software Engineer');
    fireEvent.click(sessionItem);

    // Verify data is restored
    expect(await screen.findByPlaceholderText('Gestionnaire de projet')).toHaveValue('Software Engineer');
    expect(screen.getByLabelText('Date du jury')).toHaveValue(futureDateStr);

    // Check confirmation persistence
    // Need to re-query elements after re-render/update
    const restoredCandidateCells = screen.getAllByRole('cell', { name: '1' });
    const restoredRow = restoredCandidateCells[0].closest('tr');
    const restoredCheckbox = within(restoredRow!).getByRole('checkbox');
    expect(restoredCheckbox).toBeChecked();

    // 8. Delete Session
    fireEvent.click(sidebarBtn!);

    // The sidebar might need to be queried again.
    // We look for "Software Engineer" which is in the sidebar list item text.
    // Use findAllByText and filter for the one in the sidebar (list-group-item)
    const itemsToDelete = await screen.findAllByText('Software Engineer');
    const sessionItemToDelete = itemsToDelete.find(el => el.closest('.list-group-item'));

    expect(sessionItemToDelete).toBeDefined();

    const listGroupItem = sessionItemToDelete!.closest('.list-group-item');
    const trashBtn = within(listGroupItem as HTMLElement).getByRole('button');
    fireEvent.click(trashBtn);

    // Verify deletion
    sessions = SessionService.getSessions();
    expect(sessions.length).toBe(0);

    // Sidebar should show "Aucune session sauvegardée"
    expect(screen.getByText('Aucune session sauvegardée.')).toBeInTheDocument();
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
    const sidebarBtn = document.querySelector('.btn-light');
    fireEvent.click(sidebarBtn!);

    const itemText = await screen.findByText('Past Job');
    const item = itemText.closest('.list-group-item');
    expect(item).toHaveStyle('background-color: #ffe6e6');
  });
});
