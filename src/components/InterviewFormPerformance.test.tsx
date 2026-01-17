import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from '../App';
import InterviewForm from './InterviewForm';

// Mock child components
jest.mock('./InterviewForm', () => {
    const React = require('react');
    const MockComponent = jest.fn(() => <div data-testid="interview-form">Mock Interview Form</div>);
    return {
        __esModule: true,
        default: React.memo(MockComponent)
    };
});

jest.mock('./ScheduleTable', () => () => <div data-testid="schedule-table" />);
jest.mock('./TimelineVisualization', () => () => <div data-testid="timeline" />);
jest.mock('./SessionSidebar', () => ({ setCollapsed }: any) => (
    <div data-testid="session-sidebar">
        <button className="me-3" onClick={() => setCollapsed && setCollapsed(true)}>Toggle Sidebar</button>
    </div>
));
jest.mock('./ThemeToggle', () => () => <div />);
jest.mock('./EmailTemplateEditor', () => () => <div />);

describe('InterviewForm Performance', () => {
    test('InterviewForm does not re-render when Sidebar is toggled', () => {
        const { container } = render(<App />);

        // Get the mock function
        // InterviewForm is the default export (React.memo). .type is the inner component (the mock).
        const interviewFormMock = (InterviewForm as any).type as jest.Mock;

        // Expect 1 render (Mount)
        expect(interviewFormMock).toHaveBeenCalledTimes(1);

        const sidebarButton = container.querySelector('button.me-3');
        if (!sidebarButton) throw new Error('Sidebar button not found');

        fireEvent.click(sidebarButton);

        // Expect still 1 render
        expect(interviewFormMock).toHaveBeenCalledTimes(1);
    });
});
