import React, { useState, useEffect } from 'react';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Outer scope counter
let renderCount = 0;

// Consumer must be memoized to avoid re-renders caused by parent re-rendering.
// We want to track re-renders caused by Context changes.
const Consumer = React.memo(() => {
    useAuth(); // consume context
    renderCount++;
    return null;
});

const TestApp = () => {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        // Force a re-render after mount
        setTick(1);
    }, []);

    // Even if TestApp re-renders and passes new children to AuthProvider,
    // AuthProvider will pass them to Provider.
    // Provider will render them.
    // Since Consumer is React.memo and has no props, it should only re-render if Context changes.
    return (
        <AuthProvider>
            <Consumer />
        </AuthProvider>
    );
};

describe('AuthContext Performance', () => {
    beforeEach(() => {
        renderCount = 0;
    });

    test('Consumer does not re-render when AuthProvider re-renders with same state', async () => {
        await act(async () => {
            render(<TestApp />);
        });

        console.log('Final render count:', renderCount);

        // Expect at most 2 renders:
        // 1. Initial (loading: true)
        // 2. AuthProvider loading state change (loading: false)
        // 3. TestApp update -> AuthProvider update -> Context Value Memoized -> Consumer (memo) SHOULD NOT re-render.
        // If Context Value was NOT memoized, Consumer would re-render a 3rd time.

        expect(renderCount).toBeLessThanOrEqual(2);
    });
});
