import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionSidebar from '../SessionSidebar';
import { SavedSession } from '../domain/session';

const mockSessions: SavedSession[] = [
    {
        id: '1',
        createdAt: '2023-10-27T10:00:00Z',
        juryDate: '2023-11-01',
        jobTitle: 'Developer',
        parameters: {} as any, // We don't need full params for this test
        confirmedCandidates: []
    }
];

describe('SessionSidebar', () => {
    test('renders delete button with accessibility attributes', () => {
        const onHide = jest.fn();
        const onLoadSession = jest.fn();
        const onDeleteSession = jest.fn();
        const onNewSession = jest.fn();

        render(
            <SessionSidebar
                show={true}
                onHide={onHide}
                sessions={mockSessions}
                onLoadSession={onLoadSession}
                onDeleteSession={onDeleteSession}
                onNewSession={onNewSession}
            />
        );

        // This should find the button by its aria-label
        const deleteButton = screen.getByRole('button', { name: /Supprimer la session/i });

        expect(deleteButton).toBeInTheDocument();

        // Test interaction
        fireEvent.click(deleteButton);
        expect(onDeleteSession).toHaveBeenCalledWith('1');
    });
});
