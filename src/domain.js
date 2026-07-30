export const TICKET_STATUSES = ["Open", "In Progress", "Waiting", "Resolved", "Closed"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const activeStatuses = new Set(["Open", "In Progress", "Waiting"]);

export function getTicketStats(tickets) {
  return {
    open: tickets.filter((ticket) => ticket.status === "Open").length,
    urgent: tickets.filter((ticket) => ticket.priority === "Urgent" && activeStatuses.has(ticket.status)).length,
    waiting: tickets.filter((ticket) => ticket.status === "Waiting").length,
    resolved: tickets.filter((ticket) => ticket.status === "Resolved").length
  };
}

export function getStatusCounts(tickets) {
  return TICKET_STATUSES.reduce((counts, status) => {
    counts[status] = tickets.filter((ticket) => ticket.status === status).length;
    return counts;
  }, {});
}

export function getPriorityCounts(tickets) {
  return PRIORITIES.reduce((counts, priority) => {
    counts[priority] = tickets.filter((ticket) => ticket.priority === priority).length;
    return counts;
  }, {});
}

export function filterTickets(tickets, filters = {}) {
  const status = filters.status ?? "All";
  const priority = filters.priority ?? "All";
  const query = normalize(filters.query ?? "");

  return tickets
    .filter((ticket) => status === "All" || ticket.status === status)
    .filter((ticket) => priority === "All" || ticket.priority === priority)
    .filter((ticket) => {
      if (!query) {
        return true;
      }

      const searchableText = [
        ticket.title,
        ticket.requester,
        ticket.assignee,
        ticket.channel,export const TICKET_STATUSES = ["Open", "In Progress", "Waiting", "Resolved", "Closed"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const ARCHIVED_STATUS = "Closed";

const activeStatuses = new Set(["Open", "In Progress", "Waiting"]);

export function getTicketStats(tickets) {
  return {
    open: tickets.filter((ticket) => ticket.status === "Open").length,
    urgent: tickets.filter((ticket) => ticket.priority === "Urgent" && activeStatuses.has(ticket.status)).length,
    waiting: tickets.filter((ticket) => ticket.status === "Waiting").length,
    resolved: tickets.filter((ticket) => ticket.status === "Resolved").length,
    archived: tickets.filter((ticket) => ticket.status === ARCHIVED_STATUS).length
  };
}

export function getStatusCounts(tickets) {
  return TICKET_STATUSES.reduce((counts, status) => {
    counts[status] = tickets.filter((ticket) => ticket.status === status).length;
    return counts;
  }, {});
}

export function getPriorityCounts(tickets) {
  return PRIORITIES.reduce((counts, priority) => {
    counts[priority] = tickets.filter((ticket) => ticket.priority === priority).length;
    return counts;
  }, {});
}

export function filterTickets(tickets, filters = {}) {
  const status = filters.status ?? "All";
  const priority = filters.priority ?? "All";
  const query = normalize(filters.query ?? "");
  const view = filters.view ?? "all";

  return tickets
    .filter((ticket) => {
      if (view === "active") {
        return !isArchivedTicket(ticket);
      }

      if (view === "archive") {
        return isArchivedTicket(ticket);
      }

      return true;
    })
    .filter((ticket) => status === "All" || ticket.status === status)
    .filter((ticket) => priority === "All" || ticket.priority === priority)
    .filter((ticket) => {
      if (!query) {
        return true;
      }

      const searchableText = [
        ticket.title,
        ticket.requester,
        ticket.assignee,
        ticket.channel,
        ticket.customerTier,
        ticket.notes.join(" ")
      ].join(" ");

      return normalize(searchableText).includes(query);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function archiveTicket(tickets, ticketId) {
  return tickets.map((ticket) => {
    if (ticket.id !== ticketId) {
      return ticket;
    }

    return {
      ...ticket,
      status: ARCHIVED_STATUS
    };
  });
}

export function removeTicketsByIds(tickets, ticketIds) {
  const idsToRemove = new Set(ticketIds);
  return tickets.filter((ticket) => !idsToRemove.has(ticket.id));
}

export function restoreTickets(tickets, restoredTickets) {
  const restoredIds = restoredTickets.map((ticket) => ticket.id);
  const remainingTickets = removeTicketsByIds(tickets, restoredIds);

  return [...cloneTickets(restoredTickets), ...remainingTickets];
}

export function validateTicket(ticket) {
  const errors = [];

  if (!ticket.title?.trim()) {
    errors.push("Title is required.");
  }

  if (!ticket.requester?.trim()) {
    errors.push("Requester is required.");
  }

  if (!TICKET_STATUSES.includes(ticket.status)) {
    errors.push("Choose a valid status.");
  }

  if (!PRIORITIES.includes(ticket.priority)) {
    errors.push("Choose a valid priority.");
  }

  return errors;
}

export function createTicketId(tickets) {
  const largestIdNumber = tickets.reduce((largest, ticket) => {
    const idNumber = Number.parseInt(ticket.id.replace(/\D/g, ""), 10);
    return Number.isFinite(idNumber) ? Math.max(largest, idNumber) : largest;
  }, 2400);

  return `tic-${largestIdNumber + 1}`;
}

export function isArchivedTicket(ticket) {
  return ticket.status === ARCHIVED_STATUS;
}

function cloneTickets(tickets) {
  return tickets.map((ticket) => ({
    ...ticket,
    notes: [...ticket.notes]
  }));
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}


        ticket.customerTier,
        ticket.notes.join(" ")
      ].join(" ");

      return normalize(searchableText).includes(query);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function validateTicket(ticket) {
  const errors = [];

  if (!ticket.title?.trim()) {
    errors.push("Title is required.");
  }

  if (!ticket.requester?.trim()) {
    errors.push("Requester is required.");
  }

  if (!TICKET_STATUSES.includes(ticket.status)) {
    errors.push("Choose a valid status.");
  }

  if (!PRIORITIES.includes(ticket.priority)) {
    errors.push("Choose a valid priority.");
  }

  return errors;
}

export function createTicketId(tickets) {
  const largestIdNumber = tickets.reduce((largest, ticket) => {
    const idNumber = Number.parseInt(ticket.id.replace(/\D/g, ""), 10);
    return Number.isFinite(idNumber) ? Math.max(largest, idNumber) : largest;
  }, 2400);

  return `tic-${largestIdNumber + 1}`;
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}

