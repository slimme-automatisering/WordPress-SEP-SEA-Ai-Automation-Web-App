import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AutomationRules from "../AutomationRules";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../../theme";

global.fetch = jest.fn();

describe("AutomationRules Component", () => {
  const mockRules = [
    {
      _id: "123",
      name: "Test Rule",
      conditions: [
        {
          metric: "CPC",
          operator: "GREATER_THAN",
          value: "1.00",
        },
      ],
      actions: [
        {
          type: "ADJUST_BUDGET",
          value: "-10%",
        },
      ],
      schedule: {
        frequency: "DAILY",
        time: "09:00",
        daysOfWeek: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      },
    },
  ];

  beforeEach(() => {
    fetch.mockClear();
  });

  it("laadt automatiseringsregels bij initialisatie", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRules),
      }),
    );

    render(
      <ThemeProvider theme={theme}>
        <AutomationRules accountId="123" />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Rule")).toBeInTheDocument();
    });
  });

  it("kan een nieuwe regel aanmaken", async () => {
    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRules),
        }),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              ...mockRules,
              {
                _id: "456",
                name: "New Rule",
              },
            ]),
        }),
      );

    render(
      <ThemeProvider theme={theme}>
        <AutomationRules accountId="123" />
      </ThemeProvider>,
    );

    // Open het nieuwe regel dialoog
    fireEvent.click(screen.getByText("Nieuwe Regel"));

    // Vul het formulier in
    const nameInput = screen.getByLabelText("Naam");
    fireEvent.change(nameInput, { target: { value: "New Rule" } });

    // Sla de regel op
    fireEvent.click(screen.getByText("Opslaan"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it("kan een regel handmatig uitvoeren", async () => {
    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRules),
        }),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        }),
      );

    render(
      <ThemeProvider theme={theme}>
        <AutomationRules accountId="123" />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Rule")).toBeInTheDocument();
    });

    // Voer de regel uit
    const runButton = screen.getByTestId("run-rule-123");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch.mock.calls[1][0]).toContain("/execute");
    });
  });
});
