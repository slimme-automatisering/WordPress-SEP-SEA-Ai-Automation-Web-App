import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BudgetManagement from "../BudgetManagement";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../../theme";

// Mock de fetch calls
global.fetch = jest.fn();

describe("BudgetManagement Component", () => {
  const mockBudgetData = {
    campaign_budget: {
      amount_micros: 1000000000, // €1000
      delivery_method: "STANDARD",
    },
    metrics: {
      cost_micros: 500000000,
      conversions: 10,
      conversions_value: 2000000000,
    },
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  it("laadt budget informatie bij initialisatie", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBudgetData),
      }),
    );

    render(
      <ThemeProvider theme={theme}>
        <BudgetManagement accountId="123" campaignId="456" />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Budget Overzicht")).toBeInTheDocument();
    });

    expect(screen.getByText("€1.000,00")).toBeInTheDocument();
  });

  it("toont een foutmelding bij API fouten", async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error("API Error")));

    render(
      <ThemeProvider theme={theme}>
        <BudgetManagement accountId="123" campaignId="456" />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("API Error")).toBeInTheDocument();
    });
  });

  it("kan het budget bijwerken", async () => {
    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBudgetData),
        }),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ...mockBudgetData,
              campaign_budget: { amount_micros: 2000000000 },
            }),
        }),
      );

    render(
      <ThemeProvider theme={theme}>
        <BudgetManagement accountId="123" campaignId="456" />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Budget Overzicht")).toBeInTheDocument();
    });

    // Open het edit dialoog
    fireEvent.click(screen.getByTestId("edit-button"));

    // Update het budget
    const input = screen.getByLabelText("Dagelijks Budget (€)");
    fireEvent.change(input, { target: { value: "2000" } });

    // Sla de wijzigingen op
    fireEvent.click(screen.getByText("Opslaan"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
