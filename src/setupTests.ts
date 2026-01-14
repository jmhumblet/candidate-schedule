// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const matchMediaMock = (function() {
    const cache: Record<string, any> = {};
    return (query: string) => {
        if (!cache[query]) {
            cache[query] = {
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(), // deprecated
                removeListener: jest.fn(), // deprecated
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            };
        }
        return cache[query];
    };
})();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

// Polyfill for crypto.randomUUID
if (!global.crypto) {
    Object.defineProperty(global, 'crypto', {
        value: {
            randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 11)
        }
    });
} else {
    // @ts-ignore
    if (!global.crypto.randomUUID) {
         Object.defineProperty(global.crypto, 'randomUUID', {
            value: () => 'test-uuid-' + Math.random().toString(36).substring(2, 11)
        });
    }
}
