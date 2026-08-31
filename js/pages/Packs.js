import { store } from "../main.js";
import { embed, rgbaBind, copyURL } from "../util.js";
import { score, packScore, packColor, legacyLimit } from "../config.js";
import { averageEnjoyment } from "../content.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";
import Copy from "../components/Copy.js";
import Copied from "../components/Copied.js";
import TemplateDisclaimer from "../components/Sidebar/TemplateDisclaimer.js";
import PacksInfo from "../components/Sidebar/PacksInfo.js"
import PackDifficulty from "../components/Sidebar/PackDifficulty.js"
import CacheDisclaimer from "../components/Sidebar/CacheDisclaimer.js";
import Level from "../components/List/Level.js";
import Errors from "../components/Sidebar/Errors.js";
 
export default {
    components: { Spinner, LevelAuthors, Copy, Copied, TemplateDisclaimer, PacksInfo, PackDifficulty, CacheDisclaimer, Level, Errors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="packs && errored !== 'The pack data is malformed, please alert staff!'">
                    <tr v-for="(pack, index) in packs" :key="index">
                        <td class="level">
                            <button @click="selectPack(index, pack)" @mouseover="hoverIndex = index" @mouseleave="hoverIndex = null" class="pack-name" :style="{ 'background': reactiveOpaque(packColor(pack.difficulty), index) }" :class="{ 'error': !pack }">
                                <span class="type-label-lg">
                                    {{ pack.name }}
                                </span>
                            </button>
                            <tr v-if="selectedPack && selectedPackIndex == index" v-for="(packLevel, availableIndex) in displayLevels" :key="availableIndex" class="pack-level-list">
                                <td class="rank pack-rank">
                                    <p v-if="packLevel.rank === null || packLevel.difficulty === -50" class="type-label-lg">&mdash;</p>
                                    <p v-else class="type-label-lg">#{{ packLevel.rank }}</p>
                                </td>
                                <td class="pack-level level" :class="{ 'active': availableIndex == selected, 'error': !packLevel || packLevel.difficulty === -50 }"> <!-- active when level is selected -->
                                    <button class="type-label-lg" @click="selected = availableIndex">
                                        {{ packLevel.name }}
                                    </button>
                                </td>
                            </tr>
                        </td>
                    </tr>
                </table>
            </div>
 
            <!-- super secret error handling! -->
            <div class="level-container">
                <div v-if="errored !== null" class="level" style="height: 100%; justify-content: center; align-items: center; text-align: center; text-wrap: pretty;">
                    <img src="https://uploads.dailydot.com/2023/10/Shocked-Meme.jpg?auto=compress&fm=pjpg" style=height:13rem;margin-bottom:3rem;>
                    <h2>Error detected, loser!</h2>
                    <p>Please let a list mod know that the pack you just clicked on might be broken, and show them this message (if there is one):</p>
                    <p>{{ errored }}</p>
                </div>
                    
                
                <!-- level page :shocked: -->
                <Level v-else-if="selected !== null && selectedPackIndex !== null && displayLevels.length" :level="level" :list="list" :fromPacksPage="true" />
                <!-- pack info page -->
                <div class="level" v-else-if="selectedPackIndex !== null && selected === null">
                <div class="copy-container">
                    <h1 class="copy-name">  
                        {{ selectedPack.name }}
                    </h1>
                    <Copy v-if="!copied" @click="copyURL('https://conixchallengelist.pages.dev/#/packs/pack/' + selectedPack.name.toLowerCase().replaceAll(' ', '_')); copied = true"></Copy>
                    <Copied v-if="copied" @click="copyURL('https://conixchallengelist.pages.dev/#/packs/pack/' + selectedPack.name.toLowerCase().replaceAll(' ', '_')); copied = true"></Copied>
                </div>
                    <h2>Difficulty: {{ ["", "Easy", "Medium", "Hard", "Insane", "Mythical", "Extreme", "Supreme", "Ethereal", "Legendary", "Silent"][selectedPack.difficulty] }}</h2>
                    <div class="pack-score">
                        <h3>Points: {{ selectedPack.score }}</h3>
                    </div>
                    <h2>Levels ({{ displayLevels.length }})</h2>
                    <div class="pack-level-details">
                        <div v-for="lvl in displayLevels" :key="lvl.path" class="pack-level-detail" :class="{ 'error': lvl.difficulty === -50 }" :style="{ 'border-inline-start-color': rgbaBind(packColor(lvl.difficulty === -50 ? null : lvl.difficulty), 0) }">
                            <div class="pack-level-detail-rank">
                                <p v-if="lvl.rank === null || lvl.difficulty === -50" class="type-label-lg">&mdash;</p>
                                <p v-else class="type-label-lg">#{{ lvl.rank }}</p>
                            </div>
                            <div class="pack-level-detail-main">
                                <button class="director type-title-sm pack-level-detail-name" :disabled="lvl.difficulty === -50" @click="selected = displayLevels.indexOf(lvl)">{{ lvl.name }}</button>
                                <p v-if="lvl.creators && lvl.creators.length" class="type-body pack-level-detail-creators">
                                    by
                                    <template v-for="(creator, index) in lvl.creators">
                                        <a class="director link" :href="'https://conixchallengelist.pages.dev/#/leaderboard/user/' + creator.toLowerCase().replaceAll(' ', '_')">{{ creator }}</a><span v-if="index < lvl.creators.length - 1">, </span>
                                    </template>
                                </p>
                            </div>
                            <div class="pack-level-detail-meta" v-if="lvl.difficulty !== -50">
                                <p class="type-label-sm">{{ ["Beginner", "Easy", "Medium", "Hard", "Insane", "Mythical", "Extreme", "Supreme", "Ethereal", "Legendary", "Silent", "Impossible"][lvl.difficulty] }}</p>
                                <p class="type-label-sm">{{ score(lvl.rank, lvl.difficulty, 100, lvl.percentToQualify, list) }} pts</p>
                            </div>
                        </div>
                    </div>
                    <h2>Records ({{ selectedPack.records.length }})</h2>
                    <div class="pack-records">
                        <p v-for="record in selectedPack.records">
                            <a class="director" :href="'https://conixchallengelist.pages.dev/#/leaderboard/user/' + record.toLowerCase().replaceAll(' ', '_')">{{ record }}</a>
                        </p>
                    </div>
                </div>
                <!-- whatever this is -->
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <Errors :errors="errors" />
                    <TemplateDisclaimer />
                    <hr class="divider">
                    <PacksInfo />
                    <hr class="divider">
                    <PackDifficulty />
                    <hr class="divider">
                    <CacheDisclaimer />
                </div>
            </div>
        </main>
    `,
 
    data: () => ({
        loading: true,
        list: [],
        packs: [],
        errors: [],
        errored: null,
        hoverIndex: null,
        selectedPackIndex: null,
        selectedPack: null,
        selected: null,
        store,
        toggledShowcase: false,
        copied: false,
    }),
 
    methods: {
        embed,
        score,
        packScore,
        averageEnjoyment,
        rgbaBind,
        packColor,
        copyURL,
 
        // initialize the selected pack
        selectPack(index, pack) {
            this.errored = null;
 
            if (!Array.isArray(pack) && this.packs[0] !== "err") {
                try {
                    this.selected = null;
                    this.selectedPack = pack;
                    this.selectedPack["score"] = packScore(pack);
                    this.selectedPackIndex = index;
 
                    if (pack.levels) {
                        let erroredIndex = pack.levels.findIndex(
                            (level) => typeof level === "string"
                        );
 
                        if (erroredIndex !== -1) {
                            this.errors.push(
                                `${pack.levels[erroredIndex]}.json not found`
                            );
                            pack.levels[erroredIndex] = {
                                name: `Not found: ${pack.levels[erroredIndex]}.json`,
                                difficulty: -50,
                            };
                        }
                    }
                    return;
                } catch (e) {
                    this.errored = e;
                    return;
                }
            } else {
                this.errored =
                    "The pack data is malformed, please alert staff!";
                return;
            }
        },
        selectFromParam() {
            if (this.$route.params.pack) {
                const returnedIndex = this.packs.findIndex(
                    (pack) =>
                        pack.name.toLowerCase().replaceAll(" ", "_") ===
                        this.$route.params.pack
                );
 
                if (returnedIndex === -1)
                    this.errors.push(
                        `The pack ${this.$route.params.pack} does not exist, please double check the URL.`
                    );
                else this.selectPack(returnedIndex, this.packs[returnedIndex]);
            }
        },
        reactiveOpaque(color, index) {
            try {
                if (this.selectedPackIndex === index) {
                    return rgbaBind(color, 0.1);
                } else if (this.hoverIndex === index) {
                    return rgbaBind(color, 0.45);
                } else {
                    return rgbaBind(color, 0.6);
                }
            } catch (e) {
                console.error(`Failed to color pack: ${e}`);
                return `rgba(110, 110, 110, 0.7)`;
            }
        },
    },
 
    computed: {
        // Custom packs already carry a resolved `levels` array (see
        // fetchList in content.js, which replaces each path string with
        // the full level object). Tier packs don't — they're just
        // "difficulty X", so their levels are whatever's currently in that
        // tier, computed live from the main list instead.
        tierLevels() {
            if (!this.selectedPack || this.selectedPack.levels || !this.list) return [];
            return this.list
                .filter(([err, rank, lvl]) =>
                    lvl && !err && lvl.id !== 0 &&
                    lvl.difficulty === this.selectedPack.difficulty &&
                    rank !== null && rank <= legacyLimit // exclude anything that's fallen into Legacy
                )
                .map(([err, rank, lvl]) => lvl)
                .sort((a, b) => a.rank - b.rank);
        },
        displayLevels() {
            if (!this.selectedPack) return [];
            return this.selectedPack.levels || this.tierLevels;
        },
 
        level() {
            this.packs = this.store.packs;
            try {
                return this.displayLevels[this.selected] || null;
            } catch (e) {
                this.errored = e;
                return;
            }
        },
 
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }
 
            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
 
        songDownload() {
            if (!this.level.songLink.includes('drive.google.com')) {
                return this.level.songLink;
            }
            const id = this.level.songLink.match(/[-\w]{25,}/)?.[0];
            if (!id) {
                return this.level.songLink;
            }
            return `https://drive.usercontent.google.com/uc?id=${id}&export=download`;
        },
    },
 
    async mounted() {
        // Fetch list and packs from store
        this.list = this.store.list;
        this.packs = this.store.packs;
 
        // Error handling
        if (!this.list || !this.packs || this.packs[0] === "err") {
            this.errors = [
                "Failed to load list or packs. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.store.errors.forEach((err) =>
                this.errors.push(`Failed to load level. (${err}.json)`)
            );
        }
 
        // It's easier to initialize the site like this
        this.selectPack(0, this.packs[0]);
 
        this.selectFromParam();
 
        // Hide loading spinner
        this.loading = false;
    },
 
    watch: {
        store: {
            handler(updated) {
                this.list = updated.list;
                this.packs = updated.packs;
                this.selectPack(
                    this.selectedPackIndex,
                    this.packs[this.selectedPackIndex]
                );
                this.selectFromParam();
                updated.errors.forEach((err) =>
                    this.errors.push(`Failed to load level. (${err}.json)`)
                );
            },
            deep: true,
        },
    },
};
