import { store } from "../main.js";
import { computeClanLeaderboard, computeClanChallenges, computeClanCreated, computeClanVerified } from "../content.js";
import { localize, rgbaBind } from "../util.js";
import { legacyLimit, packColor } from "../config.js";
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
                <div class="search-container" v-if="clanLeaderboard.length">
                    <input
                        type="text"
                        class="search"
                        id="search-bar"
                        placeholder="Search..."
                        v-model="searchQuery"
                    />
                    <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">x</button>
                </div>
                <p v-if="!clanLeaderboard.length" class="type-body" style="padding: 1rem;">
                    No clans yet — create one with <code>/clan create</code> on Discord.
                </p>
                <p v-else-if="!filteredClanLeaderboard.length" class="level" style="padding:1.1rem">
                    No clans found.
                </p>
                <table class="list" v-else>
                    <tr v-for="({ clan, rank } ) in filteredClanLeaderboard" :key="clan.tag">
                        <td class="rank">
                            <p class="type-label-lg">#{{ rank }}</p>
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
                        <div class="pack-level-detail" :style="{ 'border-inline-start-color': tierBorderColor(hardestChallenge) }">
                            <div class="pack-level-detail-rank">
                                <p class="type-label-lg">#{{ hardestChallenge.rank }}</p>
                            </div>
                            <div class="pack-level-detail-main">
                                <a class="director type-title-sm pack-level-detail-name" :href="'https://conixchallengelist.pages.dev/#/level/' + hardestChallenge.path">{{ hardestChallenge.name }}</a>
                                <p class="type-body pack-level-detail-creators">Completed By {{ hardestChallenge.completedBy.join(', ') }}</p>
                            </div>
                            <div class="pack-level-detail-meta">
                                <p class="type-label-sm">{{ hardestChallenge.rank > legacyLimit ? 'Legacy' : DIFFICULTY_NAMES[hardestChallenge.difficulty] }}</p>
                            </div>
                        </div>
                    </template>
 
                    <h2>Created ({{ createdChallenges.length }})</h2>
                    <div class="pack-level-details" v-if="createdChallenges.length">
                        <a
                            v-for="lvl in createdChallenges"
                            :key="lvl.path"
                            class="pack-level-detail"
                            :style="{ 'border-inline-start-color': tierBorderColor(lvl) }"
                            :href="'https://conixchallengelist.pages.dev/#/level/' + lvl.path"
                        >
                            <div class="pack-level-detail-rank">
                                <p class="type-label-lg">#{{ lvl.rank }}</p>
                            </div>
                            <div class="pack-level-detail-main">
                                <p class="director type-title-sm pack-level-detail-name">{{ lvl.name }}</p>
                                <p class="type-body pack-level-detail-creators">Created by {{ lvl.createdBy.join(', ') }}</p>
                            </div>
                            <div class="pack-level-detail-meta">
                                <p class="type-label-sm">{{ lvl.rank > legacyLimit ? 'Legacy' : DIFFICULTY_NAMES[lvl.difficulty] }}</p>
                            </div>
                        </a>
                    </div>
                    <p v-else class="type-body">No challenges created by this clan's members yet.</p>
 
                    <h2>Verified ({{ verifiedChallenges.length }})</h2>
                    <div class="pack-level-details" v-if="verifiedChallenges.length">
                        <a
                            v-for="lvl in verifiedChallenges"
                            :key="lvl.path"
                            class="pack-level-detail"
                            :style="{ 'border-inline-start-color': tierBorderColor(lvl) }"
                            :href="'https://conixchallengelist.pages.dev/#/level/' + lvl.path"
                        >
                            <div class="pack-level-detail-rank">
                                <p class="type-label-lg">#{{ lvl.rank }}</p>
                            </div>
                            <div class="pack-level-detail-main">
                                <p class="director type-title-sm pack-level-detail-name">{{ lvl.name }}</p>
                                <p class="type-body pack-level-detail-creators">Verified by {{ lvl.verifiedBy }}</p>
                            </div>
                            <div class="pack-level-detail-meta">
                                <p class="type-label-sm">{{ lvl.rank > legacyLimit ? 'Legacy' : DIFFICULTY_NAMES[lvl.difficulty] }}</p>
                            </div>
                        </a>
                    </div>
                    <p v-else class="type-body">No challenges verified by this clan's members yet.</p>
 
                    <h2>Challenges Completed ({{ mainCompletedChallenges.length }})</h2>
                    <div class="pack-level-details" v-if="mainCompletedChallenges.length">
                        <a
                            v-for="lvl in mainCompletedChallenges"
                            :key="lvl.path"
                            class="pack-level-detail"
                            :style="{ 'border-inline-start-color': tierBorderColor(lvl) }"
                            :href="'https://conixchallengelist.pages.dev/#/level/' + lvl.path"
                        >
                            <div class="pack-level-detail-rank">
                                <p class="type-label-lg">#{{ lvl.rank }}</p>
                            </div>
                            <div class="pack-level-detail-main">
                                <p class="director type-title-sm pack-level-detail-name">{{ lvl.name }}</p>
                                <p class="type-body pack-level-detail-creators">Completed by {{ lvl.completedBy.join(', ') }}</p>
                            </div>
                            <div class="pack-level-detail-meta">
                                <p class="type-label-sm">{{ DIFFICULTY_NAMES[lvl.difficulty] }}</p>
                            </div>
                        </a>
                    </div>
                    <p v-else class="type-body">No challenges completed by this clan yet.</p>
 
                    <h2>Legacy Challenges Completed ({{ legacyCompletedChallenges.length }})</h2>
                    <div class="pack-level-details" v-if="legacyCompletedChallenges.length">
                        <a
                            v-for="lvl in legacyCompletedChallenges"
                            :key="lvl.path"
                            class="pack-level-detail"
                            :style="{ 'border-inline-start-color': tierBorderColor(lvl) }"
                            :href="'https://conixchallengelist.pages.dev/#/level/' + lvl.path"
                        >
                            <div class="pack-level-detail-rank">
                                <p class="type-label-lg">#{{ lvl.rank }}</p>
                            </div>
                            <div class="pack-level-detail-main">
                                <p class="director type-title-sm pack-level-detail-name">{{ lvl.name }}</p>
                                <p class="type-body pack-level-detail-creators">Completed by {{ lvl.completedBy.join(', ') }}</p>
                            </div>
                            <div class="pack-level-detail-meta">
                                <p class="type-label-sm">Legacy</p>
                            </div>
                        </a>
                    </div>
                    <p v-else class="type-body">No legacy challenges completed by this clan yet.</p>
                </div>
            </div>
 
            <div class="meta-container">
                <div class="meta">
                    <Errors :errors="errors" />
                    <h3>About Clans</h3>
                    <p class="type-body">
                        Clans are user created teams where you can either join another
                        user's clan, or create your own. Clans are ranked by points in
                        their own leaderboard and the points are decided by the sum of
                        all its members' leaderboard totals. Create, Manage, or Join
                        Clans through the discord server by running the respective
                        commands.
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
        searchQuery: '',
        DIFFICULTY_NAMES,
        legacyLimit,
    }),
 
    methods: {
        localize,
        rgbaBind,
        packColor,
 
        // Same helper as the Packs and main list tabs — some tier colors
        // (Silent's near-black, in particular) are too close to the row
        // background to read as a visible accent border, so this scales
        // the color up (preserving its hue) until it clears a minimum
        // luminance.
        accentColor(color, difficulty) {
            if (!color) return color;
            // Impossible (15) is exempted so it always renders as EXACTLY
            // packColor(15) everywhere — main list, packs, and clans pages
            // all need to show the identical shade, matching the color
            // used on the Impossible Pack button itself, rather than the
            // brightened version this correction would otherwise produce
            // for such a dark color.
            if (difficulty === 15) return color;
            const [r, g, b, a] = color;
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            const minLuminance = 45;
            if (luminance <= 0 || luminance >= minLuminance) return color;
            const scale = minLuminance / luminance;
            return [Math.min(255, r * scale), Math.min(255, g * scale), Math.min(255, b * scale), a];
        },
        // Legacy challenges (rank > legacyLimit) no longer belong to a
        // tier, so they get a neutral grey border instead of a tier color.
        tierBorderColor(lvl) {
            const color = lvl.rank > legacyLimit ? [110, 110, 110, 0.7] : packColor(lvl.difficulty);
            return this.rgbaBind(this.accentColor(color, lvl.difficulty), 0);
        },
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
        filteredClanLeaderboard() {
            const query = this.searchQuery.toLowerCase().trim();
            return this.clanLeaderboard
                .map((clan, index) => ({ clan, rank: index + 1 }))
                .filter(({ clan }) =>
                    !query ||
                    clan.name.toLowerCase().includes(query) ||
                    clan.tag.toLowerCase().includes(query)
                );
        },
        sortedMembers() {
            if (!this.selected) return [];
            const ownerLower = this.selected.ownerUsername.toLowerCase();
            return [...this.selected.memberEntries].sort((a, b) => {
                const aIsOwner = a.username.toLowerCase() === ownerLower;
                const bIsOwner = b.username.toLowerCase() === ownerLower;
                if (aIsOwner !== bIsOwner) return aIsOwner ? -1 : 1;
                return b.total - a.total;
            });
        },
        completedChallenges() {
            if (!this.selected || !this.list.length) return [];
            return computeClanChallenges(this.selected, this.list);
        },
        // completedChallenges is sorted rank-ascending, and Legacy
        // challenges (rank > legacyLimit) always sort after every real
        // main-list rank — so splitting on that boundary keeps both halves
        // already correctly ordered without needing to re-sort.
        mainCompletedChallenges() {
            return this.completedChallenges.filter((lvl) => lvl.rank <= this.legacyLimit);
        },
        legacyCompletedChallenges() {
            return this.completedChallenges.filter((lvl) => lvl.rank > this.legacyLimit);
        },
        createdChallenges() {
            if (!this.selected || !this.list.length) return [];
            return computeClanCreated(this.selected, this.list);
        },
        verifiedChallenges() {
            if (!this.selected || !this.list.length) return [];
            return computeClanVerified(this.selected, this.list);
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
 
