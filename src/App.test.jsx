import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock fetch
global.fetch = vi.fn();

// Mock lucide-react icons to avoid rendering complex SVGs
vi.mock('lucide-react', async (importOriginal) => {
  const original = await importOriginal();
  const mockIcons = new Proxy({}, {
    get: (target, prop) => () => <div data-testid={`icon-${String(prop).toLowerCase()}`} />,
  });
  return {
    ...original,
    ...mockIcons,
  };
});

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fetch.mockClear();
    // Mock successful games fetch by default
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { id: 'game1', name: 'Test Game 1', description: 'Description for game 1', codeVariants: ['code1'] }
      ]),
    });
  });

  it('renders the header and main sections', async () => {
    render(<App />);
    expect(screen.getByText('GameInterpreter')).toBeInTheDocument();
    expect(screen.getByText('Describe your game')).toBeInTheDocument();
    expect(screen.getByText('Generated Python Code (PyGambit)')).toBeInTheDocument();
    expect(screen.getByText('Nash Equilibria Solver')).toBeInTheDocument();
  });

  it('enables "Generate Code" button when prompt is entered', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const generateButton = screen.getByRole('button', { name: /Generate Code/i });
    expect(generateButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/Two firms are competing/i);
    await user.type(textarea, 'A simple game');

    expect(generateButton).toBeEnabled();
  });

  it('loads example games into the dropdown', async () => {
    render(<App />);
    
    // Wait for the fetch call to resolve and the component to re-render
    await waitFor(() => {
      expect(screen.getByText('Test Game 1')).toBeInTheDocument();
    });
  });

  it('populates textarea when an example game is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => screen.getByText('Test Game 1'));

    const dropdown = screen.getByRole('combobox');
    await user.selectOptions(dropdown, 'game1');

    const textarea = screen.getByPlaceholderText(/Two firms are competing/i);
    expect(textarea.value).toBe('Description for game 1');
  });

  it('calls the generate endpoint and displays the code on "Generate Code" click', async () => {
    const user = userEvent.setup();
    // Reset default mock for this specific test
    fetch.mockClear();
    // First fetch for games
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    // Second fetch for generate
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ code: 'print("Generated Code")' }),
    });

    render(<App />);

    const textarea = screen.getByPlaceholderText(/Two firms are competing/i);
    await user.type(textarea, 'A new game');

    const generateButton = screen.getByRole('button', { name: /Generate Code/i });
    await user.click(generateButton);

    // Check for loading state
    expect(screen.getByText(/Generating PyGambit model/i)).toBeInTheDocument();

    // Wait for the code to be displayed
    await waitFor(() => {
      expect(screen.getByText('print("Generated Code")')).toBeInTheDocument();
    });

    // Check if fetch was called correctly
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/generate', expect.any(Object));
    const fetchBody = JSON.parse(fetch.mock.calls[1][1].body);
    expect(fetchBody.prompt).toBe('A new game');
  });

  it('displays an error in the code window if generation fails', async () => {
    const user = userEvent.setup();
    fetch.mockClear();
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // games
    fetch.mockResolvedValueOnce({ // generate
      ok: true,
      json: () => Promise.resolve({ error: 'Something went wrong' }),
    });

    render(<App />);
    const textarea = screen.getByPlaceholderText(/Two firms are competing/i);
    await user.type(textarea, 'A faulty game');
    
    const generateButton = screen.getByRole('button', { name: /Generate Code/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Error: Something went wrong/i)).toBeInTheDocument();
    });
  });
});