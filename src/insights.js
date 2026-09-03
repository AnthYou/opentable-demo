/**
 * insights.js — queryID propagation, click and conversion events.
 *
 * CLAUDE.md §8 asks for this from the start rather than at the end: conversion from
 * search into bookings is the stated business goal (§1), so the prototype has to be able
 * to measure it. It is also the prerequisite for everything in §9 — personalization,
 * Recommend, and A/B testing ranking strategies against booking conversion all consume
 * this event stream and none of them can be retrofitted onto a demo that never emitted
 * one.
 *
 * Three things have to line up for an event to be attributable, and all three are here:
 *
 * 1. **`clickAnalytics: true`** on the search, so Algolia returns a `queryID`. That is in
 *    `searchParams.js`, on both parameter sets.
 * 2. **A `userToken`**, so events from one visitor can be tied together.
 * 3. **The `insights` middleware**, registered through `<InstantSearch insights={...}>`,
 *    which pairs each event with the `queryID` of the search that produced the hit.
 *    Firing a click without it produces an event Algolia cannot attribute to a search,
 *    which is worse than no event: it looks like data.
 */

import insightsClient from 'search-insights';
import { appId, searchApiKey } from './searchClient.js';

/**
 * Event names. Algolia groups analytics by these strings, so they are constants rather
 * than literals at the call sites — a typo would silently split one funnel into two.
 */
export const EVENT_CLICKED = 'Restaurant Clicked';
export const EVENT_BOOKED = 'Table Booked';

const USER_TOKEN_KEY = 'opentable-demo.userToken';

/**
 * A stable anonymous token per browser.
 *
 * `useCookie: false` and our own token rather than letting search-insights set one. The
 * two are the same tracking either way, but a value we write ourselves is inspectable
 * and removable, and it keeps the demo from setting a cookie nobody consented to.
 *
 * **This is a demo-grade decision.** In production this token is where consent handling
 * belongs: no token until the visitor agrees, and a logged-in user's own identifier once
 * there is one, so events survive across devices. Persisting an identifier without
 * asking is exactly what a privacy review would stop.
 */
function resolveUserToken() {
  // Rendered on a server, or a browser with storage blocked: fall back to a per-session
  // token so events still carry one, rather than dropping them.
  if (typeof window === 'undefined' || !window.localStorage) {
    return `anonymous-${Math.random().toString(36).slice(2, 12)}`;
  }
  try {
    const existing = window.localStorage.getItem(USER_TOKEN_KEY);
    if (existing) return existing;
    const fresh = `anonymous-${crypto.randomUUID()}`;
    window.localStorage.setItem(USER_TOKEN_KEY, fresh);
    return fresh;
  } catch {
    return `anonymous-${Math.random().toString(36).slice(2, 12)}`;
  }
}

export const userToken = resolveUserToken();

/**
 * The Insights client uses the **search** key, not the write key. Insights is a separate
 * endpoint from indexing and needs no write permission; passing a write key here would
 * put it in the browser bundle, which is the one thing §7 exists to prevent.
 */
insightsClient('init', {
  appId,
  apiKey: searchApiKey,
  useCookie: false,
});

insightsClient('setUserToken', userToken);

/**
 * Props for `<InstantSearch insights={...}>`.
 *
 * `onEvent` is not decoration. An event stream is invisible by construction — you cannot
 * tell a working integration from a broken one by looking at the page — so in
 * development every event is logged with its queryID, objectIDs and positions. That is
 * also what makes the instrumentation demonstrable to a client: the funnel is visible in
 * the console as it is being used, rather than promised.
 *
 * It still forwards to the real client, so logging does not replace sending.
 */
export const insightsProps = {
  insightsClient,
  onEvent(event, client) {
    if (import.meta.env.DEV) {
      const payload = event.payload ?? {};
      // eslint-disable-next-line no-console
      console.info(
        `[insights] ${event.insightsMethod ?? 'unknown'} · ${payload.eventName ?? '(no name)'}`,
        {
          queryID: payload.queryID ?? '(none — not attributable to a search)',
          objectIDs: payload.objectIDs,
          positions: payload.positions,
          index: payload.index,
        }
      );
    }
    if (event.insightsMethod) {
      client(event.insightsMethod, event.payload);
    }
  },
};
