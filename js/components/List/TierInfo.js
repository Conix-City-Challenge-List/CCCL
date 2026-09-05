import { averageEnjoyment, fetchHighestEnjoyment, fetchLowestEnjoyment, fetchTierLength, fetchTotalScore } from "../../content.js";
import { legacyLimit, score } from "../../config.js";
import { localize, round } from "../../util.js";
 
export default {
    props: {
        level: {
            type: Object,
            required: true,
        },
        list: {
            type: Array,
            required: true,
        },
        descending: {
            type: Boolean,
            required: true,
        }
    },
    template: `
        <div class="tier" style="height: 100%; justify-content: center; align-items: center;">
            <h1>{{ level.name }}</h1>
            <h2 style="padding-top:1rem"># of levels in tier: {{ isLegacyDivider ? legacyCount : fetchTierLength(list, level.difficulty) }}</h2>
            <h2 style="padding-bottom:1rem">Points in tier: {{ isLegacyDivider ? legacyPoints : localize(fetchTotalScore(list, level.difficulty)) }}</h2>
            <tr style="justify-content: center; align-items: center;">
                <td><h3 class="tier-info">Highest enjoyment: {{ (isLegacyDivider ? legacyHighestEnjoyment : fetchHighestEnjoyment(list, level.difficulty)) || "N/A" }}</h3></td>
            </tr>
            <tr style="justify-content: center; align-items: center;">
                <td><h3 class="tier-info" style="padding-bottom:0.5rem">Lowest enjoyment: {{ (isLegacyDivider ? legacyLowestEnjoyment : fetchLowestEnjoyment(list, level.difficulty)) || "N/A" }}</h3></td>
            </tr>
            <p style="padding-top:1.5rem" v-if="isLegacyDivider">The levels {{ descending ? 'below' : 'above' }} are Legacy Challenges.</p>
            <p style="padding-top:1.5rem" v-else>The levels {{ descending ? 'below' : 'above' }} are {{ ["", "Beginner", "Easy", "Medium", "Hard", "Insane", "Extreme", "Mythical", "Supreme", "Ethereal", "Divine", "Apocalyptic", "Catastrophic", "Legendary", "Silent", "Impossible"][level.difficulty] }} Challenges.</p>
 
        </div>
    `,
    methods: {
        fetchTierLength,
        localize,
        fetchTotalScore,
        fetchHighestEnjoyment,
        fetchLowestEnjoyment,
        // Picks the highest- or lowest-enjoyment level out of an arbitrary
        // set of levels. Legacy levels don't share one difficulty value to
        // filter by (each keeps whatever difficulty it had before falling
        // off), so this can't reuse fetchHighestEnjoyment/fetchLowestEnjoyment
        // as-is — same output format as those, just over a different set.
        pickEnjoyment(levels, isBetter) {
            let best = null;
            let bestLevel = null;
            levels.forEach((lvl) => {
                const enjoyment = averageEnjoyment(lvl.records);
                if (enjoyment === "?") return;
                if (best === null || isBetter(enjoyment, best)) {
                    best = enjoyment;
                    bestLevel = lvl;
                }
            });
            if (bestLevel === null) return null;
            return ` ${best}/10 (${bestLevel.name})`;
        },
    },
    computed: {
        // data/legacychallenges.json is the only divider with difficulty
        // set to null (every real difficulty divider has a real 0-11
        // value) — that's what marks this as the Legacy section header.
        isLegacyDivider() {
            return this.level.difficulty === null;
        },
        // Same rank > legacyLimit check used everywhere else on the site
        // (Level.js, LevelMeta.js) to decide if a level is Legacy — not a
        // shared difficulty value, since Legacy levels keep whatever
        // difficulty they had before falling off.
        legacyLevels() {
            if (!this.isLegacyDivider) return [];
            return this.list
                .map(([err, rank, lvl]) =>
                    (lvl && lvl.id !== 0 && rank !== null && rank > legacyLimit) ? lvl : null
                )
                .filter(Boolean);
        },
        legacyCount() {
            return this.legacyLevels.length;
        },
        legacyPoints() {
            // Always 0 in practice, since score() already zeroes anything
            // ranked past legacyLimit — computed rather than hardcoded so
            // this stays correct if that logic ever changes.
            const total = this.legacyLevels.reduce(
                (sum, lvl) => sum + score(lvl.rank, lvl.difficulty, 100, lvl.percentToQualify, this.list),
                0
            );
            return localize(round(total));
        },
        legacyHighestEnjoyment() {
            return this.pickEnjoyment(this.legacyLevels, (a, b) => a > b);
        },
        legacyLowestEnjoyment() {
            return this.pickEnjoyment(this.legacyLevels, (a, b) => a < b);
        },
    },
}
