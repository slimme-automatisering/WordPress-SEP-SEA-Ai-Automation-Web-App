import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ROICalculator from '../ROICalculator';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../../theme';

global.fetch = jest.fn();

describe('ROICalculator Component', () => {
  const mockRoiData = {
    metrics: {
      cost: 1000000000, // €1000
      value: 2000000000, // €2000
      roi: 100, // 100%
      impressions: 10000,
      clicks: 1000,
      conversions: 100
    }
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  it('laadt ROI data bij initialisatie', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRoiData)
      })
    );

    render(
      <ThemeProvider theme={theme}>
        <ROICalculator accountId="123" campaignId="456" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('ROI Overzicht')).toBeInTheDocument();
    });

    expect(screen.getByText('€1.000,00')).toBeInTheDocument(); // Kosten
    expect(screen.getByText('€2.000,00')).toBeInTheDocument(); // Waarde
    expect(screen.getByText('100,00%')).toBeInTheDocument(); // ROI
  });

  it('update data bij wijziging van datumbereik', async () => {
    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRoiData)
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockRoiData,
            metrics: { ...mockRoiData.metrics, cost: 1500000000 }
          })
        })
      );

    render(
      <ThemeProvider theme={theme}>
        <ROICalculator accountId="123" campaignId="456" />
      </ThemeProvider>
    );

    // Verander de datum
    const startDateInput = screen.getByLabelText('Start Datum');
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' }});

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('toont prestatie metrics correct', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRoiData)
      })
    );

    render(
      <ThemeProvider theme={theme}>
        <ROICalculator accountId="123" campaignId="456" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('10.000')).toBeInTheDocument(); // Impressies
      expect(screen.getByText('1.000')).toBeInTheDocument(); // Clicks
      expect(screen.getByText('100')).toBeInTheDocument(); // Conversies
    });
  });
});
