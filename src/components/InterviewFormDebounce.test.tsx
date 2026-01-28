import React, { act } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import InterviewForm from './InterviewForm';
import SchedulingService from '../domain/schedulingService';

describe('InterviewForm Debounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test('generateSchedule is debounced when typing candidates', () => {
        const generateScheduleSpy = jest.spyOn(SchedulingService, 'generateSchedule');
        generateScheduleSpy.mockClear();

        render(<InterviewForm
            onSubmit={() => {}}
            juryDate="2023-01-01"
            setJuryDate={() => {}}
            jobTitle=""
            setJobTitle={() => {}}
            isLocked={false}
        />);

        // Initial render calls it once
        const initialCalls = generateScheduleSpy.mock.calls.length;
        console.log('Initial calls:', initialCalls);

        const input = screen.getByPlaceholderText(/Un nom par ligne.../i);

        // Simulate typing "John" rapidly
        // Each change triggers a re-render of component, but useDebounce prevents useMemo update
        fireEvent.change(input, { target: { value: 'J' } });
        fireEvent.change(input, { target: { value: 'Jo' } });
        fireEvent.change(input, { target: { value: 'Joh' } });
        fireEvent.change(input, { target: { value: 'John' } });

        // At this point, debounced value hasn't updated yet.
        // generateSchedule should NOT have been called again yet.
        const callsAfterTyping = generateScheduleSpy.mock.calls.length;
        console.log('Calls after typing (before debounce):', callsAfterTyping);

        expect(callsAfterTyping).toBe(initialCalls);

        // Fast forward time to trigger debounce
        act(() => {
            jest.advanceTimersByTime(500);
        });

        const finalCalls = generateScheduleSpy.mock.calls.length;
        console.log('Final calls:', finalCalls);

        // Should be called exactly once more
        expect(finalCalls).toBe(initialCalls + 1);
    });
});
