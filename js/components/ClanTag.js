import { findClanForUser, clanProfileHref } from '../clans.js';

export default {
    props: {
        username: {
            type: String,
            required: true,
        },
    },
    template: `
        <a
            v-if="clan"
            class="clan-tag"
            :href="clanProfileHref(clan.tag)"
            :title="clan.name"
            @click.stop
        >[{{ clan.tag }}]</a>
    `,
    computed: {
        clan() {
            return findClanForUser(this.username);
        },
    },
    methods: {
        clanProfileHref,
    },
};
