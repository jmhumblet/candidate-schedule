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
        const onLoadSession = jest.fn();
        const onDeleteSession = jest.fn();
        const onNewSession = jest.fn();
        const onOpenTemplateEditor = jest.fn();
        const setWidth = jest.fn();
        const setCollapsed = jest.fn();

        render(
            <SessionSidebar
                sessions={mockSessions}
                onLoadSession={onLoadSession}
                onDeleteSession={onDeleteSession}
                onNewSession={onNewSession}
                onOpenTemplateEditor={onOpenTemplateEditor}
                width={300}
                setWidth={setWidth}
                collapsed={false}
                setCollapsed={setCollapsed}
            />
        );

        // This should find the button by its aria-label
        const deleteButton = screen.getByRole('button', { name: /Supprimer/i });

        expect(deleteButton).toBeInTheDocument();

        // Test interaction
        fireEvent.click(deleteButton);
        expect(onDeleteSession).toHaveBeenCalledWith('1');
    });
});
