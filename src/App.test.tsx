import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { LocalSessionRepository } from './repositories/LocalSessionRepository';
import { AuthProvider } from './contexts/AuthContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('App Integration Test', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset any singleton state if necessary
  });

  test('Complete flow: Create, Save, Load, Confirm, Delete', async () => {
      // 1. Render App wrapped in AuthProvider
      const { unmount } = render(
          <AuthProvider>
              <App />
          </AuthProvider>
      );

      // 2. Fill Form
      const jobTitleInput = screen.getByPlaceholderText('Gestionnaire de projet');
      fireEvent.change(jobTitleInput, { target: { value: 'Gestionnaire de projet' } });

      const candidatesInput = screen.getByLabelText('Candidats');
      fireEvent.change(candidatesInput, { target: { value: '1' } });

      // Click Generate
      const generateBtn = screen.getByText(/Générer/i);
      fireEvent.click(generateBtn);

      // 3. Verify Schedule is generated
      expect(await screen.findByText(/Horaire du/)).toBeInTheDocument();

      // Wait for session to be saved and appear in Sidebar
      // This ensures the internal 'sessions' state in App is updated via the useSessions hook
      await waitFor(() => {
          const sessions = LocalSessionRepository.readAll();
          expect(sessions.length).toBe(1);
      });

      // Also verify it appears in UI (Sidebar)
      // "Gestionnaire de projet" should appear in Sidebar (Input value is not found by getByText)
      await waitFor(() => {
          const textElements = screen.getAllByText('Gestionnaire de projet');
          expect(textElements.length).toBeGreaterThan(0);
      });

      // 4. Confirm a candidate
      // Find the checkbox for candidate 1
      // Assuming candidate name is "Candidat 1" or similar based on default generation
      // The candidates input was '1', so typically it generates "Candidat 1"
      const checkbox = await screen.findByRole('checkbox', { name: /Confirmer/i });
      fireEvent.click(checkbox);

      // Verify Auto-save of confirmation (UI State)
      expect(checkbox).toBeChecked();

      // 6. Simulate "New Session"
      // Sidebar is always visible.
      // Click "Nouvelle Session" button (Primary button with FaPlus)
      // There are multiple "Nouvelle Session" buttons (collapsed vs expanded).
      // We target the one in the expanded sidebar content header usually, or just by aria-label.
      const newSessionBtns = screen.getAllByLabelText('Nouvelle Session');
      fireEvent.click(newSessionBtns[0]);

      // Verify fields cleared
      await waitFor(() => {
          expect(jobTitleInput).toHaveValue('');
      });
      expect(screen.queryByText(/Horaire du/)).not.toBeInTheDocument();

      // 7. Load Session from Sidebar
      const sessionItem = screen.getAllByText('Gestionnaire de projet')[0]; // The sidebar item (first one found might be it if input is empty)
      // Actually input is empty now. So only Sidebar has it?
      // Wait, sidebar item renders job title.
      // Let's click the sidebar item.
      fireEvent.click(sessionItem);

      // Verify Loaded
      expect(await screen.findByText(/Horaire du/)).toBeInTheDocument();
      expect(jobTitleInput).toHaveValue('Gestionnaire de projet');

      // 8. Delete Session
      const deleteBtn = screen.getByLabelText('Supprimer');
      fireEvent.click(deleteBtn);

      // Verify Deleted (UI Update)
      // Session should disappear from sidebar and form should reset
      await waitFor(() => {
           // Sidebar item should be gone
           const sidebarItems = screen.queryAllByText('Gestionnaire de projet');
           // Might still find input if it didn't reset yet?
           // But handleNewSession resets jobTitle.
           // getByText doesn't find input value. So queryAllByText should be 0.
           expect(sidebarItems.length).toBe(0);
      });
      // await waitFor(() => {
      //    expect(jobTitleInput).toHaveValue('');
      // });
  });
});
