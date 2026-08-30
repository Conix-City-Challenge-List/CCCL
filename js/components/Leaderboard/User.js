import { packColor } from "../../config.js"
import { copyURL, localize, rgbaBind } from "../../util.js"
import Copied from "../Copied.js"
import Copy from "../Copy.js"
import Section from "./Section.js"

export default {
    props: {
        rank: {
            type: Number,
            required: true
        },
        entry: {
            type: Object,
            required: true,
        }
    },
    components: { Copy, Copied, Section },
    template: `
        <div class="player-container">
            <div class="player">
                <div class="copy-container">
                    <h1 class="copy-name" style="padding-right:0.3rem;">
                        #{{ rank }} {{ entry.user }}
                    </h1>
                    <img class="flag" v-if="entry.flag" :src="'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/' + entry.flag.toLowerCase() + '.svg'" alt="flag" style="margin-right: 10px;width:50px">
                    <Copy
                        v-if="!copied"
                        @click="copyURL('https://conixchallengelist.pages.dev/#/leaderboard/user/' + entry.user.toLowerCase().replaceAll(' ', '_')); copied = true"
                    ></Copy>
                    <Copied
                        v-if="copied"
                        @click="copyURL('https://conixchallengelist.pages.dev/#/leaderboard/user/' + entry.user.toLowerCase().replaceAll(' ', '_')); copied = true"
                    ></Copied>
                </div>
                <h4>{{ localize(entry.total) + " / " + localize(entry.possibleMax) }}</h4>
                <div class="pack-container" v-if="entry.userPacks.length > 0">
                    <a v-for="pack in entry.userPacks" class="pack" :style="{ 'background': rgbaBind(packColor(pack.difficulty), 0.2) }" :href="'https://conixchallengelist.pages.dev/#/packs/pack/' + pack.name.toLowerCase().replaceAll(' ', '_')">{{ pack.name }} (+{{ pack.score }})</a>
                </div>
                <Section label="Created" :scores="entry.created" />
                <Section label="Verified" :scores="mainVerified" />
                <Section label="Completed" :scores="mainCompleted" />
                <Section label="Progressed" :scores="entry.progressed" />
                <Section label="Legacy" :scores="legacyCombined" />
            </div>
        </div>
    `,
    methods: {
        copyURL,
        localize,
        rgbaBind,
        packColor,
    },
    computed: {
        // Legacy completions/verifications don't earn points (see
        // config.js's legacyLimit), so they're pulled out of the normal
        // Completed/Verified sections and shown in their own Legacy
        // section instead — otherwise they'd sit in those lists showing
        // "N/A" next to everyone else's real point totals.
        mainCompleted() {
            return this.entry.completed.filter((s) => !s.legacy);
        },
        mainVerified() {
            return this.entry.verified.filter((s) => !s.legacy);
        },
        legacyCombined() {
            const legacyCompleted = this.entry.completed.filter((s) => s.legacy);
            const legacyVerified = this.entry.verified.filter((s) => s.legacy);
            // A verifier's completion of their own level is already
            // represented once in "completed" — only add the "verified"
            // copy for someone who verified but isn't already listed via
            // the completed entry (avoids duplicate rows).
            const alreadyListed = new Set(legacyCompleted.map((s) => s.level));
            return [
                ...legacyCompleted,
                ...legacyVerified.filter((s) => !alreadyListed.has(s.level)),
            ];
        },
    }
}
