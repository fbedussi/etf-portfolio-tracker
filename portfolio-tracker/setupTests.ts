import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};