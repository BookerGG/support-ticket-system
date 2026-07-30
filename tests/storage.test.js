import test from "node:test";
import assert from "node:assert/strict";
import { tickets } from "../src/data.js";
import { TICKET_STORAGE_KEY, clearSavedTickets, loadTickets, saveTickets } from "../src/storage.js";

test("loads fallback tickets when storage is empty", () => {
  const storage = createMemoryStorage();
  const loadedTickets = loadTickets(storage, tickets);

  assert.equal(loadedTickets.length, tickets.length);
  assert.notEqual(loadedTickets, tickets);
  assert.notEqual(loadedTickets[0].notes, tickets[0].notes);
});

test("loads saved tickets from storage", () => {
  const storage = createMemoryStorage({
    [TICKET_STORAGE_KEY]: JSON.stringify([
      {
        id: "tic-3001",
        title: "Saved ticket",
        requester: "Jordan Fox",
        assignee: "Unassigned",
        status: "Open",
        priority: "Medium",
        createdAt: "2026-07-30",
        channel: "Email",
        customerTier: "Standard",
        notes: ["Persisted locally."]
      }
    ])
  });

  const loadedTickets = loadTickets(storage, tickets);

  assert.equal(loadedTickets.length, 1);
  assert.equal(loadedTickets[0].id, "tic-3001");
  assert.deepEqual(loadedTickets[0].notes, ["Persisted locally."]);
});

test("falls back to mock data when storage has invalid JSON", () => {
  const storage = createMemoryStorage({
    [TICKET_STORAGE_KEY]: "{not-json"
  });

  const loadedTickets = loadTickets(storage, tickets);

  assert.equal(loadedTickets.length, tickets.length);
});

test("falls back to mock data when storage is unavailable", () => {
  const loadedTickets = loadTickets(null, tickets);

  assert.equal(loadedTickets.length, tickets.length);
});

test("saves and clears tickets", () => {
  const storage = createMemoryStorage();

  assert.equal(saveTickets(storage, tickets), true);
  assert.equal(JSON.parse(storage.getItem(TICKET_STORAGE_KEY)).length, tickets.length);

  assert.equal(clearSavedTickets(storage), true);
  assert.equal(storage.getItem(TICKET_STORAGE_KEY), null);
});

test("reports failed writes when storage is unavailable", () => {
  assert.equal(saveTickets(null, tickets), false);
  assert.equal(clearSavedTickets(null), false);
});

function createMemoryStorage(initialValues = {}) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    }
  };
}
