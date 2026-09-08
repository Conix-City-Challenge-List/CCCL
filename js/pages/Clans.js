import { store } from "../main.js";
import { computeClanLeaderboard, computeClanChallenges } from "../content.js";
import { localize } from "../util.js";
import Spinner from "../components/Spinner.js";
import Copy from "../components/Copy.js";
import Copied from "../components/Copied.js";
import Errors from "../components/Sidebar/Errors.js";

const DIFFICULTY_NAMES = ["", "Beginner", "Easy", "Medium", "Hard", "Insane", "Extreme", "Mythical", "Supreme", "Ethereal", "Divine", "Apocalyptic", "Catastrophic", "Legendary", "Silent", "Impossible"];

export default {
    components: { Spinner, Copy, Copied, Errors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list page-clans">
            <div class="list-container">
                <p v-if="!clanLeaderboard.length" class="type-body" style="padding: 1rem;">
                    No clans yet — create one with <code>/clan create</code> on Discord.
                </p>
                <table class="list" v-else>
                    <tr v-for="(clan, index) in clanLeaderboard" :key="clan.tag">
                        <td class="rank">
                            <p class="type-label-lg">#{{ index + 1 }}</p>
                        </td>
                        <td class="level">
                            <button
                                @click="select(clan)"
                                class="pack-name"
                                :class="{ active: selected && selected.tag === clan.tag }"
                            >
                                <span class="type-label-lg">[{{ clan.tag }}] {{ clan.name }}</span>
                            </button>
                        </td>
                        <td class="total">
                            <p class="type-label-lg">{{ localize(clan.total) }}</p>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="level-container">
                <div v-if="!selected" class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>Pick a clan to see its roster.</p>
                </div>
                <div v-else class="level clan-detail">
                    <div class="copy-container">
                        <h1 class="copy-name">[{{ selected.tag }}] {{ selected.name }}</h1>
                        <Copy v-if="!copied" @click="copyURL(); copied = true"></Copy>
                        <Copied v-if="copied" @click="copyURL(); copied = true"></Copied>
                    </div>

                    <h3>{{ localize(selected.total) }} points &middot; {{ selected.members.length }} member(s)</h3>

                    <h2>Owner</h2>
                    <p class="type-body">
                        <a class="director link" :href="'https://conixchallengelist.pages.dev/#/leaderboard/user/' + selected.ownerUsername.toLowerCase().replaceAll(' ', '_')">{{ selected.ownerUsername }}</a>
                    </p>

                    <h2>Members ({{ selected.members.length }})</h2>
                    <div class="clan-members">
                        <a
                            v-for="member in sortedMembers"
                            :key="member.username"
                            class="director link clan-member"
                            :href="'https://conixchallengelist.pages.dev/#/leaderboard/user/' + member.username.toLowerCase().replaceAll(' ', '_')"
                        >
                            {{ member.username }}
                            <span v-if="member.username.toLowerCase() === selected.ownerUsername.toLowerCase()" class="clan-owner-badge">Owner</span>
                            <span class="type-label-sm">{{ localize(member.total) }} pts</span>
                        </a>
                    </div>

                    <template v-if="hardestChallenge">
                        <h2>Hardest Challenge Completed</h2>
                        <div class="pack-level-detail">
                            <div class="pack-level-detail-rank">
                                <p class="type-label-lg">#{{ hardestChallenge.rank }}</p>
                            </div>
                            <div class="pack-level-detail-main">
                                <a class="director type-title-sm pack-level-detail-name" :href="'https://conixchallengelist.pages.dev/#/level/' + hardestChallenge.path">{{ hardestChallenge.name }}</a>
                                <p class="type-body pack-level-detail-creators">by {{ hardestChallenge.completedBy.join(', ') }}</p>
                            </div>
                            <div class="pack-level-detail-meta">
                                <p class="type-label-sm">{{ DIFFICULTY_NAMES[hardestChallenge.difficulty] }}</p>
                            </div>
                        </div>
                    </template>

                    <h2>All Challenges Completed ({{ completedChallenges.length }})</h2>
                    <div class="pack-level-details" v-if="completedChallenges.length">
                        <a
                            v-for="lvl in completedChallenges"
                            :key="lvl.path"
                            class="pack-level-detail"
                            :href="'https://conixchallengelist.pages.dev/#/level/' + lvl.path"
                        >
                            <div class="pack-level-detail-rank">
                                <p class="type-label-lg">#{{ lvl.rank }}</p>
                            </div>
                            <div class="pack-level-detail-main">
                                <p class="director type-title-sm pack-level-detail-name">{{ lvl.name }}</p>
                                <p class="type-body pack-level-detail-creators">by {{ lvl.completedBy.join(', ') }}</p>
                            </div>
                            <div class="pack-level-detail-meta">
                                <p class="type-label-sm">{{ DIFFICULTY_NAMES[lvl.difficulty] }}</p>
                            </div>
                        </a>
                    </div>
                    <p v-else class="type-body">No challenges completed by this clan yet.</p>
                </div>
            </div>

            <div class="meta-container">
                <div class="meta">
                    <Errors :errors="errors" />
                    <div class="type-title-sm">About Clans</div>
                    <p class="type-body">
                        A clan's score is the sum of all its members' leaderboard totals.
                        Manage clans with <code>/clan</code> on Discord — create, invite,
                        kick, leave, transfer, delete, and info are all there.
                    </p>
                </div>
            </div>
        </main>
    `,

    data: () => ({
        loading: true,
        store,
        list: [],
        clans: [],
        leaderboard: [],
        errors: [],
        selected: null,
        copied: false,
        DIFFICULTY_NAMES,
    }),

    methods: {
        localize,
        select(clan) {
            this.selected = clan;
            this.copied = false;
        },
        copyURL() {
            navigator.clipboard?.writeText(
                "https://conixchallengelist.pages.dev/#/clans/clan/" + this.selected.tag.toLowerCase()
            );
        },
        selectFromParam() {
            if (this.$route.params.tag) {
                const match = this.clanLeaderboard.find(
                    (c) => c.tag.toLowerCase() === this.$route.params.tag.toLowerCase()
                );
                if (match) this.select(match);
                else this.errors.push(`No clan with tag [${this.$route.params.tag}] exists.`);
            }
        },
    },

    computed: {
        clanLeaderboard() {
            return computeClanLeaderboard(this.clans, this.leaderboard);
        },
        sortedMembers() {
            if (!this.selected) return [];
            return [...this.selected.memberEntries].sort((a, b) => b.total - a.total);
        },
        completedChallenges() {
            if (!this.selected || !this.list.length) return [];
            return computeClanChallenges(this.selected, this.list);
        },
        hardestChallenge() {
            return this.completedChallenges[0] || null;
        },
    },

    async mounted() {
        this.list = this.store.list || [];
        this.clans = this.store.clans || [];
        const [leaderboard, err] = this.store.leaderboard || [[], []];
        this.leaderboard = leaderboard || [];
        this.errors = err || [];

        this.selectFromParam();

        this.loading = false;
    },

    watch: {
        store: {
            handler(updated) {
                this.list = updated.list || [];
                this.clans = updated.clans || [];
                this.leaderboard = (updated.leaderboard && updated.leaderboard[0]) || [];
                if (this.selected) {
                    const refreshed = this.clanLeaderboard.find((c) => c.tag === this.selected.tag);
                    if (refreshed) this.selected = refreshed;
                }
            },
            deep: true,
        },
    },
};
