
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import TimelineVisualization from './components/TimelineVisualization';
import ScheduleTable from './components/ScheduleTable';

// Mock the child components as React.memo(jest.fn()) to simulate memoization behavior
// and allow tracking of the inner render function.

jest.mock('./components/TimelineVisualization', () => {
    const React = require('react');
    return {
        __esModule: true,
        default: React.memo(jest.fn(() => null))
    };
});

jest.mock('./components/ScheduleTable', () => {
    const React = require('react');
    return {
        __esModule: true,
        default: React.memo(jest.fn(() => null))
    };
});

jest.mock('./components/ThemeToggle', () => {
    return () => null;
});

describe('App Performance', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Child components do not re-render when typing in Job Title', () => {
        render(<App />);

        // Get the inner mock functions
        // TimelineVisualization is the Memo object. .type is the inner component (the mock).
        const timelineMock = (TimelineVisualization as any).type as jest.Mock;
        const scheduleMock = (ScheduleTable as any).type as jest.Mock;

        // 1. Initial render
        // App renders.

        // 2. Submit form to generate schedule
        const generateButton = screen.getByText(/Générer/i);
        fireEvent.click(generateButton);

        // Now schedule is set.
        // ScheduleTable and TimelineVisualization should render.

        expect(timelineMock).toHaveBeenCalled();
        expect(scheduleMock).toHaveBeenCalled();

        const timelineRenderCountBefore = timelineMock.mock.calls.length;
        const scheduleRenderCountBefore = scheduleMock.mock.calls.length;

        // 3. Type in "Poste" (Job Title)
        const jobTitleInput = screen.getByPlaceholderText('Gestionnaire de projet');
        fireEvent.change(jobTitleInput, { target: { value: 'A' } });
        fireEvent.change(jobTitleInput, { target: { value: 'AB' } });
        fireEvent.change(jobTitleInput, { target: { value: 'ABC' } });

        const timelineRenderCountAfter = timelineMock.mock.calls.length;
        const scheduleRenderCountAfter = scheduleMock.mock.calls.length;

        // Debug output
        console.log(`Timeline renders: ${timelineRenderCountAfter} (was ${timelineRenderCountBefore})`);
        console.log(`Schedule renders: ${scheduleRenderCountAfter} (was ${scheduleRenderCountBefore})`);

        // Assertion
        // We expect 0 extra renders because:
        // 1. App passes stable props (useMemo).
        // 2. Components are memoized (React.memo in the mock).
        expect(timelineRenderCountAfter).toBe(timelineRenderCountBefore);
        expect(scheduleRenderCountAfter).toBe(scheduleRenderCountBefore);
    });
});
