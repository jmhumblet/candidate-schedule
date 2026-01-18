import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionSidebar from './SessionSidebar';
import { AuthProvider } from '../contexts/AuthContext';
import { SessionWithStatus } from '../repositories/types';

const mockSessions: SessionWithStatus[] = [
    {
        id: '1',
        createdAt: '2023-10-27T10:00:00Z',
        juryDate: '2023-11-01',
        jobTitle: 'Developer',
        parameters: {} as any, // We don't need full params for this test
        confirmedCandidates: [],
        syncStatus: 'local'
    }
];

describe('SessionSidebar', () => {
    test('renders delete button with accessibility attributes', () => {
        const onLoadSession = jest.fn();
        const onDeleteSession = jest.fn();
        const onNewSession = jest.fn();
        const onOpenTemplateEditor = jest.fn();
        const onShareSession = jest.fn();
        const setWidth = jest.fn();
        const setCollapsed = jest.fn();

        render(
            <AuthProvider>
                <SessionSidebar
                    sessions={mockSessions}
                    onLoadSession={onLoadSession}
                    onDeleteSession={onDeleteSession}
                    onNewSession={onNewSession}
                    onOpenTemplateEditor={onOpenTemplateEditor}
                    onShareSession={onShareSession}
                    isCloud={false}
                    width={300}
                    setWidth={setWidth}
                    collapsed={false}
                    setCollapsed={setCollapsed}
                />
            </AuthProvider>
        );

        // This should find the button by its aria-label
        const deleteButtons = screen.getAllByLabelText('Supprimer');
        expect(deleteButtons.length).toBeGreaterThan(0);

        // Test interaction
        fireEvent.click(deleteButtons[0]);
        expect(onDeleteSession).toHaveBeenCalledWith('1');
    });
});
