import test from "node:test";
import assert from "node:assert/strict";
import { tickets } from "../src/data.js";
import {
  archiveTicket,
  createTicketId,
  filterTickets,
  getPriorityCounts,
  getStatusCounts,
  getTicketStats,
  removeTicketsByIds,
  restoreTickets,
  validateTicket
} from "../src/domain.js";

test("filters tickets by status", () => {
  const openTickets = filterTickets(tickets, { status: "Open" });

  assert.equal(openTickets.length, 2);
  assert.equal(openTickets[0].id, "tic-2405");
});

test("filters tickets by priority", () => {
  const urgentTickets = filterTickets(tickets, { priority: "Urgent" });

  assert.equal(urgentTickets.length, 1);
  assert.equal(urgentTickets[0].title, "Billing export missing June invoices");
});

test("searches across common ticket fields", () => {
  const results = filterTickets(tickets, { query: "month-end" });

  assert.equal(results.length, 1);
  assert.equal(results[0].requester, "Priya Shah");
});

test("counts ticket statuses and priorities", () => {
  const statusCounts = getStatusCounts(tickets);
  const priorityCounts = getPriorityCounts(tickets);

  assert.equal(statusCounts.Open, 2);
  assert.equal(statusCounts.Resolved, 1);
  assert.equal(priorityCounts.High, 2);
  assert.equal(priorityCounts.Urgent, 1);
});

test("summarizes support queue stats", () => {
  const stats = getTicketStats(tickets);

  assert.deepEqual(stats, {
    open: 2,
    urgent: 1,
    waiting: 1,
    resolved: 1,
    archived: 1
  });
});

test("filters active and archived ticket views", () => {
  const activeTickets = filterTickets(tickets, { view: "active" });
  const archivedTickets = filterTickets(tickets, { view: "archive" });

  assert.equal(activeTickets.length, 5);
  assert.equal(activeTickets.some((ticket) => ticket.status === "Closed"), false);
  assert.equal(archivedTickets.length, 1);
  assert.equal(archivedTickets[0].id, "tic-2406");
});

test("validates required ticket fields", () => {
  const errors = validateTicket({
    title: "",
    requester: "",
    status: "Open",
    priority: "Medium"
  });

  assert.deepEqual(errors, ["Title is required.", "Requester is required."]);
});

test("creates a predictable next ticket id", () => {
  assert.equal(createTicketId(tickets), "tic-2407");
});

test("archives a ticket by moving it to closed", () => {
  const archivedTickets = archiveTicket(tickets, "tic-2404");
  const archivedTicket = archivedTickets.find((ticket) => ticket.id === "tic-2404");

  assert.equal(archivedTicket.status, "Closed");
  assert.equal(tickets.find((ticket) => ticket.id === "tic-2404").status, "Resolved");
});

test("removes tickets by id", () => {
  const remainingTickets = removeTicketsByIds(tickets, ["tic-2401", "tic-2406"]);

  assert.equal(remainingTickets.length, 4);
  assert.equal(remainingTickets.some((ticket) => ticket.id === "tic-2401"), false);
  assert.equal(remainingTickets.some((ticket) => ticket.id === "tic-2406"), false);
});

test("restores demo tickets without duplicating existing demo ids", () => {
  const customTicket = {
    id: "tic-3001",
    title: "Custom ticket",
    requester: "Jordan Fox",
    assignee: "Unassigned",
    status: "Open",
    priority: "Medium",
    createdAt: "2026-07-30",
    channel: "Email",
    customerTier: "Standard",
    notes: ["Keep this custom record."]
  };
  const modifiedDemoTicket = {
    ...tickets[3],
    status: "Closed"
  };

  const restoredTickets = restoreTickets([customTicket, modifiedDemoTicket], tickets);

  assert.equal(restoredTickets.length, 7);
  assert.equal(restoredTickets.filter((ticket) => ticket.id === "tic-2404").length, 1);
  assert.equal(restoredTickets.find((ticket) => ticket.id === "tic-2404").status, "Resolved");
  assert.equal(restoredTickets.some((ticket) => ticket.id === "tic-3001"), true);
});

