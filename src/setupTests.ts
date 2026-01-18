// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock crypto.randomUUID
const cryptoMock = {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
};

if (typeof global.crypto === 'undefined') {
    Object.defineProperty(global, 'crypto', {
        value: cryptoMock
    });
} else {
    // Extend existing crypto
    Object.assign(global.crypto, cryptoMock);
}

// Mock Firebase Analytics and Performance to avoid ESM issues in Jest
jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
  initializeAnalytics: jest.fn(), // Added this
  logEvent: jest.fn(),
  isSupported: jest.fn().mockResolvedValue(false),
}));

jest.mock('firebase/performance', () => ({
  getPerformance: jest.fn(),
}));
