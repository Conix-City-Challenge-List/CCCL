// Same live-read-from-store pattern as js/clans.js's findClanForUser —
// reads store.staff fresh on every call so it stays reactive when used
// from a template/computed.
import { store } from './main.js';

// Matches the section order components/Sidebar/Staff.js already uses —
// if someone is somehow listed under more than one role in
// data/_staff.json, the highest-ranked one wins for the badge.
const STAFF_ROLE_ORDER = ['owner', 'admin', 'helper', 'dev', 'trial'];

export const STAFF_ROLE_LABELS = {
    owner: 'Owner',
    admin: 'Admin',
    helper: 'Moderator',
    dev: 'Dev',
    trial: 'Helper',
};

/** Returns the role key ("owner"/"admin"/"helper"/"dev"/"trial") for `username`, or null. */
export function findStaffRoleForUser(username) {
    if (!username || !store.staff || !Array.isArray(store.staff)) return null;
    const lower = username.toLowerCase();
    const matches = store.staff.filter((s) => s.name && s.name.toLowerCase() === lower);
    if (matches.length === 0) return null;
    matches.sort((a, b) => STAFF_ROLE_ORDER.indexOf(a.role) - STAFF_ROLE_ORDER.indexOf(b.role));
    return matches[0].role;
}
