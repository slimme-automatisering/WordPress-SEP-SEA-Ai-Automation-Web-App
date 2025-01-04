import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ABTesting from '../ABTesting';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../../theme';

global.fetch = jest.fn();

describe('ABTesting Component', () => {
  const mockExperiments = [
    {
      resource_name: 'customers/123/experiments/456',
      name: 'Test Experiment',
      type: 'SEARCH_CUSTOM',
      status: 'ENABLED',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      metrics: {
        impressions: 1000,
        clicks: 100,
        conversions: 10
      }
    }
  ];

  beforeEach(() => {
    fetch.mockClear();
  });

  it('laadt experimenten bij initialisatie', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockExperiments)
      })
    );

    render(
      <ThemeProvider theme={theme}>
        <ABTesting accountId="123" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Experiment')).toBeInTheDocument();
    });
  });

  it('kan een nieuw experiment aanmaken', async () => {
    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockExperiments)
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([...mockExperiments, {
            resource_name: 'customers/123/experiments/789',
            name: 'New Experiment'
          }])
        })
      );

    render(
      <ThemeProvider theme={theme}>
        <ABTesting accountId="123" />
      </ThemeProvider>
    );

    // Open het nieuwe experiment dialoog
    fireEvent.click(screen.getByText('Nieuwe Test'));

    // Vul het formulier in
    const nameInput = screen.getByLabelText('Naam');
    fireEvent.change(nameInput, { target: { value: 'New Experiment' }});

    // Sla het experiment op
    fireEvent.click(screen.getByText('Opslaan'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('toont prestatie metrics correct', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockExperiments)
      })
    );

    render(
      <ThemeProvider theme={theme}>
        <ABTesting accountId="123" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('1.000')).toBeInTheDocument(); // Impressies
      expect(screen.getByText('100')).toBeInTheDocument(); // Clicks
      expect(screen.getByText('10')).toBeInTheDocument(); // Conversies
    });
  });
});
