export const TICKET_STORAGE_KEY = "support-ticket-system:tickets";

export function loadTickets(storage, fallbackTickets) {
  try {
    if (!storage) {
      return cloneTickets(fallbackTickets);
    }

    const savedTickets = storage.getItem(TICKET_STORAGE_KEY);

    if (!savedTickets) {
      return cloneTickets(fallbackTickets);
    }

    const parsedTickets = JSON.parse(savedTickets);
    return Array.isArray(parsedTickets) ? cloneTickets(parsedTickets) : cloneTickets(fallbackTickets);
  } catch {
    return cloneTickets(fallbackTickets);
  }
}

export function saveTickets(storage, tickets) {
  try {
    if (!storage) {
      return false;
    }

    storage.setItem(TICKET_STORAGE_KEY, JSON.stringify(tickets));
    return true;
  } catch {
    return false;
  }
}

export function clearSavedTickets(storage) {
  try {
    if (!storage) {
      return false;
    }

    storage.removeItem(TICKET_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function cloneTickets(tickets) {
  return tickets.map((ticket) => ({
    ...ticket,
    notes: [...ticket.notes]
  }));
}
