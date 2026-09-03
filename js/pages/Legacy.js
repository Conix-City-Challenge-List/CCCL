import { store } from '../main.js';
import { averageEnjoyment } from '../content.js';
import { legacyLimit } from '../config.js';
import Spinner from '../components/Spinner.js';
import Scroll from '../components/Scroll.js'
import Level from '../components/List/Level.js'
import CacheDisclaimer from '../components/Sidebar/CacheDisclaimer.js';
import RecordRules from '../components/Sidebar/RecordRules.js';
import TemplateDisclaimer from '../components/Sidebar/TemplateDisclaimer.js';
import Staff from '../components/Sidebar/Staff.js';
import Errors from '../components/Sidebar/Errors.js';

// Same page as List.js, but scoped to only the Legacy section (levels
// whose rank has fallen past legacyLimit) — their own tab instead of
// being shown inline at the bottom of the main list. No tier dividers
// here since Legacy isn't tiered; every row's rank column is just a dash,
// since a Legacy level's underlying numeric rank is no longer a real
// position (see content.js — legacy levels don't count toward tier stats
// or pack thresholds, and List.js's own consistency checks skip them too).
export default {
    components: { Spinner, Scroll, Level, CacheDisclaimer, RecordRules, TemplateDisclaimer, Staff, Errors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
        <div class="list-container">
            <div class="search-container">
                <input
                    type="text"
                    class="search"
                    id="search-bar"
                    placeholder="Search..."
                    v-model="searchQuery"
                />
                <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">x</button>
            </div>
            <div class="button-bar" :class="true ? 'dark' : ''">
                <Scroll alt="Scroll to selected" @click="scrollToSelected()" />
                <select v-model="sortOption">
                    <option value="0">Ranking</option>
                    <option value="1">Enjoyment</option>
                </select>
                <p style="font-size: 9.5px; opacity: 30%;" class="director" @click="descending = !descending">{{ descending === true ? 'Descending' : 'Ascending' }}</p>
            </div>
            <table class="list" v-if="filteredLevels.length > 0">
                <tr v-for="({ item: [err, rank, level], index }, i) in filteredLevels" :key="index">
                    <td class="rank">
                        <p class="type-label-lg" style="width:2.7rem">&mdash;</p>
                    </td>
                    <td class="level" :class="{ 'active': selected == index, 'error': err !== null }" :ref="selected == index ? 'selected' : undefined">
                        <button @click="selected = index">
                            <span class="type-label-lg">{{ level?.name || 'Error (' + err + '.json)' }}</span>
                        </button>
                    </td>
                </tr>
            </table>
            <p class="level" style="padding:1.1rem" v-else>No legacy challenges yet.</p>
        </div>
            <div class="level-container">
                <Level :level="level" :list="list" :key="level.rank" v-if="level && level.id!=0" />
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <Errors :errors="errors" />
                    <TemplateDisclaimer />
                    <hr class="divider">
                    <Staff />
                    <hr class="divider">
                    <RecordRules />
                    <CacheDisclaimer />
                </div>
            </div>
        </main>
    `,

    data: () => ({
        loading: true,
        list: [],
        staff: [],
        errors: [],
        selected: 0,
        store,
        searchQuery: '',
        sortOption: 0,
        descending: true,
        legacyLimit,
    }),

    methods: {
        search(query) {
            if (this.searchQuery === query) {
                this.searchQuery = '';
            } else {
                this.searchQuery = query;
            }
        },
        selectFromParam() {
            if (this.$route.params.level) {
                const returnedIndex = this.legacyList.findIndex(
                    ([err, rank, lvl]) =>
                        lvl.path === this.$route.params.level
                );

                if (returnedIndex !== -1) this.selected = returnedIndex;
            }
        },
        scrollToSelected() {
            this.$nextTick(() => {
                const selectedElement = this.$refs.selected;
                if (selectedElement && selectedElement[0] && selectedElement[0].firstChild) {
                    selectedElement[selectedElement.length - 1].firstChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    },

    computed: {
        // Only the Legacy entries, in their original (pre-demotion) rank
        // order — that ordering is preserved even though it's no longer a
        // "real" rank, so more-recently-demoted challenges naturally sort
        // near the top of Legacy under "Ranking" without needing a
        // separate timestamp field.
        legacyList() {
            return (this.list || []).filter(
                ([err, rank, level]) => rank !== null && rank > this.legacyLimit
            );
        },
        level() {
            return this.legacyList && this.legacyList[this.selected] && this.legacyList[this.selected][2];
        },
        filteredLevels() {
            const query = this.searchQuery.toLowerCase();
            let list = this.legacyList;
            let sortOption = parseInt(this.sortOption)

            list = list.map((item, index) => ({ index, item }));

            if (query.trim()) {
                list = list.filter(({ item: [err, rank, level] }) =>
                    (level?.name.toLowerCase())
                        .includes(query)
                )
            }

            if (sortOption === 1) {
                list = list.filter(({ item }) =>
                            averageEnjoyment(item[2]?.records) !== "?"
                        )
                    .sort((a, b) => {
                            const enjoymentA = averageEnjoyment(a.item[2].records);
                            const enjoymentB = averageEnjoyment(b.item[2].records);

                            return enjoymentB - enjoymentA;
                        })
            }

            if (!this.descending) {
                list = list.reverse()
            }

            return list
        },
    },

    async mounted() {
        this.list = this.store.list;
        this.staff = store.staff;

        this.selectFromParam()

        if (!this.list) {
            this.errors = [
                'Failed to load list. Retry in a few minutes or notify list staff.',
            ];
        } else {
            this.store.errors.forEach((err) =>
                this.errors.push(`Failed to load level. (${err}.json)`))

            if (!this.staff) {
                this.errors.push('Failed to load list staff.');
            }
        }

        this.loading = false;
    },

    watch: {
        store: {
            handler(updated) {
                this.list = updated.list;
                this.staff = updated.staff;
                updated.errors.forEach(err => {
                    this.errors.push(`Failed to load level. (${err}.json)`);
                })
                this.selectFromParam()
            },
            deep: true
        }
    },
};
