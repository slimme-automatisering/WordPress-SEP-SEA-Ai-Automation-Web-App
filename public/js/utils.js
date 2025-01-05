// Utility functions voor de applicatie
export function formatDate(date) {
  try {
    return new Intl.DateTimeFormat("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch (error) {
    console.error("Fout bij het formatteren van datum:", error);
    return "Ongeldige datum";
  }
}

export function formatNumber(number) {
  try {
    return new Intl.NumberFormat("nl-NL", {
      maximumFractionDigits: 1,
    }).format(number);
  } catch (error) {
    console.error("Fout bij het formatteren van nummer:", error);
    return "Ongeldig nummer";
  }
}

export function showNotification(message, type = "info") {
  try {
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white ${
      type === "error"
        ? "bg-red-500"
        : type === "success"
          ? "bg-green-500"
          : "bg-blue-500"
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  } catch (error) {
    console.error("Fout bij het tonen van notificatie:", error);
  }
}

// Fallback voor oude code die nog window.app gebruikt
export function initializeLegacySupport() {
  if (typeof window !== "undefined") {
    window.app = {
      formatDate,
      formatNumber,
      showNotification,
    };
  }
}
