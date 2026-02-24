import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock for ResizeObserver, which can cause errors in JSDOM
global.ResizeObserver = vi.fn().mockImplementation(() => ({ disconnect: vi.fn(), observe: vi.fn(), unobserve: vi.fn() }));