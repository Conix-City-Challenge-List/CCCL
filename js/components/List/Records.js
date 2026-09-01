export default {
    props: {
        records: {
            type: Array,
            required: true
        },
        percentToQualify: {
            type: Number,
            required: false,
        },
        isLegacy: {
            type: Boolean,
            required: false,
            default: false,
        }
    },
    template: `
        <h2>Records ({{ records.length }})</h2>
        <p v-if="isLegacy">This challenge does not accept new records.</p>
        <p v-else><strong>{{ percentToQualify }}%</strong> or better to qualify</p>
        <div class="search-container records-search-container" v-if="records.length > 0">
            <input
                type="text"
                class="search"
                id="records-search-bar"
                placeholder="Search users..."
                v-model="searchQuery"
                style="margin-left: 0; width: 100%; max-width: 100%;"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">x</button>
        </div>
        <div class="records" v-if="filteredRecords.length > 0">
            <div class="records-row record-header">
                <span class="percent">Progress</span>
                <span class="user">Record Holder</span>
                <span class="mobile"></span>
                <span class="enjoyment">Enjoyment</span>
                <span class="hz">FPS</span>
                <span class="proof">Video Proof</span>
            </div>
            <div v-for="record in filteredRecords" class="records-row record">
                <span class="percent">{{ record.percent }}%</span>
                <span class="user">
                    <span class="user-container">
                        <span class="username-clip">
                            <a :href="'https://conixchallengelist.pages.dev/#/leaderboard/user/' + record.user.toLowerCase().replaceAll(' ', '_')" class="type-label-lg director link">{{ record.user }}</a>
                        </span>
                        <img class="flag" v-if="record.flag" :src="'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/' + (record.flag.toLowerCase()) + '.svg'" alt="flag">
                    </span>
                </span>
                <span class="mobile">
                    <img v-if="record.mobile" :src="'/assets/phone-landscape' + (true ? '-dark' : '') + '.svg'" alt="Mobile">
                </span>
                <span class="enjoyment">
                    <template v-if="record.enjoyment === undefined">?/10</template>
                    <template v-else>{{ record.enjoyment }}/10</template>
                </span>
                <span class="hz">{{ record.hz }}FPS</span>
                <span class="proof">
                    <a :href="record.link" target="_blank" class="type-label-lg director">Link</a>
                </span>
            </div>
        </div>
        <p class="record" style="padding:1.1rem" v-else-if="records.length > 0">No users found.</p>
    `,
 
    data: () => ({
        searchQuery: '',
    }),
 
    computed: {
        filteredRecords() {
            if (!this.searchQuery.trim()) return this.records;
 
            const query = this.searchQuery.toLowerCase().replace(/\s/g, '');
 
            return this.records.filter((record) =>
                record.user.toLowerCase().replace(/\s/g, '').includes(query)
            );
        },
    },
 
}
 
 
