// Renders the collapsible "Position History" table seen on a level's page
// (pointercrate has the same feature). Each entry comes from
// level.positionHistory, which the Discord bot appends to whenever a
// challenge's rank changes — see syncAffectedChallenges in the bot's
// lib/github.js for how entries get written, and note-worthy: entries can
// be missing entirely for challenges added before this feature existed
// (nothing to backfill from without the one-off backfill script the bot
// repo ships for reconstructing the last ~7 days from GitHub's commit
// history).
export default {
    props: {
        history: {
            type: Array,
            required: false,
            default: () => [],
        },
    },
    data: () => ({
        expanded: true,
    }),
    template: `
        <div class="position-history" v-if="history && history.length > 0">
            <div
                class="position-history-header"
                style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; user-select:none;"
                @click="expanded = !expanded"
            >
                <h2 style="margin:0">Position History</h2>
                <span style="display:inline-block; transition: transform 0.15s;" :style="{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }">&#9650;</span>
            </div>
            <table v-if="expanded" class="position-history-table" style="width:100%; border-collapse:collapse; margin-top:0.5rem;">
                <tr style="background:#1c6fc9;">
                    <th style="padding:0.5rem; text-align:left; color:#fff;">Date</th>
                    <th style="padding:0.5rem; text-align:left; color:#fff;">Change</th>
                    <th style="padding:0.5rem; text-align:left; color:#fff;">New Position</th>
                    <th style="padding:0.5rem; text-align:left; color:#fff;">Reason</th>
                </tr>
                <tr v-for="(entry, index) in orderedHistory" :key="index" :style="rowStyle(entry)">
                    <td style="padding:0.5rem;">{{ entry.date }}</td>
                    <td style="padding:0.5rem;">
                        <span v-if="entry.change === null || entry.change === undefined">-</span>
                        <span v-else-if="entry.change > 0">&#8595; {{ entry.change }}</span>
                        <span v-else-if="entry.change < 0">&#8593; {{ -entry.change }}</span>
                        <span v-else>-</span>
                    </td>
                    <td style="padding:0.5rem;">#{{ entry.position }}</td>
                    <td style="padding:0.5rem;">{{ entry.reason }}</td>
                </tr>
            </table>
        </div>
    `,
    computed: {
        // Oldest first, matching the screenshot (list was added at the top).
        orderedHistory() {
            return [...this.history].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
        },
    },
    methods: {
        rowStyle(entry) {
            if (entry.change === null || entry.change === undefined) {
                // First entry — added to the list.
                return { background: "rgba(255, 230, 150, 0.25)" };
            }
            if (entry.change > 0) {
                // Position number went up — got worse.
                return { background: "rgba(255, 90, 90, 0.15)" };
            }
            if (entry.change < 0) {
                // Position number went down — improved.
                return { background: "rgba(90, 200, 110, 0.15)" };
            }
            return {};
        },
    },
}
