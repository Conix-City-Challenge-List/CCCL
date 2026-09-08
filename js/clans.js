// Small shared helper so every place a username is rendered (records,
// leaderboard, level page creators/verifier) can look up "does this
// person have a clan tag?" without each component re-implementing the
// same search over store.clans. Deliberately reads `store.clans` live on
// every call (rather than caching a map once) so it stays reactive to
// Vue's tracking when called from inside a template/computed — store is
// a Vue.reactive() object, and property access during render is what
// Vue's reactivity system tracks, so this "just works" the same way
// other components already read `store.list`/`store.packs` directly.
import { store } from './main.js';

/**
 * Returns the clan `{ tag, name, ... }` that `username` currently belongs
 * to, case-insensitively, or null if they're not in a clan (or clan data
 * hasn't loaded yet).
 */
export function findClanForUser(username) {
    if (!username || !store.clans || !Array.isArray(store.clans)) return null;
    const lower = username.toLowerCase();
    return (
        store.clans.find(
            (clan) => Array.isArray(clan.members) && clan.members.some((m) => m.toLowerCase() === lower)
        ) || null
    );
}

export function clanProfileHref(tag) {
    return '#/clans/clan/' + tag.toLowerCase();
}
