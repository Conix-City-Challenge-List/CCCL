import ClanTag from '../ClanTag.js';

export default {
    components: { ClanTag },
    props: {
        creators: {
            type: Array,
            required: true,
        },
        verifier: {
            type: String,
            required: true,
        },
        enjoyment: {
            type: Number,
            required: false,
        },
    },

    template: `
        <div class="level-authors">
            <template v-if="selfVerified">
                <div class="type-title-sm">Creator & Verifier</div>
                <p class="type-body">
                    <ClanTag :username="creators[0]" />
                    <a class="director link" :href="'https://conixchallengelist.pages.dev/#/leaderboard/user/' + creators[0].toLowerCase().replaceAll(' ', '_')">{{ creators[0] }}<span v-if="enjoyment"> ({{ enjoyment }}/10)</span></a>
                </p>
            </template>
            <template v-else-if="creators.length === 1">
                <div class="type-title-sm">Creator</div>
                <p class="type-body">
                    <ClanTag :username="creators[0]" />
                    <a class="director link" :href="'https://conixchallengelist.pages.dev/#/leaderboard/user/' + creators[0].toLowerCase().replaceAll(' ', '_')">{{ creators[0] }}</a>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <ClanTag :username="verifier" />
                    <a class="director link" :href="'https://conixchallengelist.pages.dev/#/leaderboard/user/' + verifier.toLowerCase().replaceAll(' ', '_')">{{ verifier }}<span v-if="enjoyment"> ({{ enjoyment }}/10)</span></a>
                </p>
            </template>
            <template v-else>
                <div class="type-title-sm">Creators</div>
                <p class="type-body">
                    <template v-for="(creator, index) in creators">
                        <ClanTag :username="creator" />
                        <a class="director link" :href="'https://conixchallengelist.pages.dev/#/leaderboard/user/' + creator.toLowerCase().replaceAll(' ', '_')">{{ creator }}</a>
                        <span v-if="index < creators.length - 1">, </span>
                    </template>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <ClanTag :username="verifier" />
                    <a class="director link" :href="'https://conixchallengelist.pages.dev/#/leaderboard/user/' + verifier.toLowerCase().replaceAll(' ', '_')">{{ verifier }}<span v-if="enjoyment"> ({{ enjoyment }}/10)</span></a>
                </p>
            </template>
        </div>
    `,

    computed: {
        selfVerified() {
            return this.creators[0] === this.verifier && this.creators.length === 1;
        },
    },
};
