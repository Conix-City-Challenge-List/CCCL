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
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">x</button>
        </div>
        <table class="records" v-if="filteredRecords.length > 0">
            <tr v-for="record in filteredRecords" class="record">
                <td class="percent">
                    <p>{{ record.percent }}%</p>
                </td>
                <td class="user">
                    <div class="user-container">
                        <a :href="record.link" target="_blank" class="type-label-lg director">{{ record.user }}</a>
                        <img class="flag" v-if="record.flag" :src="'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/' + (record.flag.toLowerCase()) + '.svg'" alt="flag">
                    </div>
                </td>
                <td class="mobile">
                    <img v-if="record.mobile" :src="'/assets/phone-landscape' + (true ? '-dark' : '') + '.svg'" alt="Mobile">
                </td>
                <td class="enjoyment">
                    <p v-if="record.enjoyment === undefined">?/10</p>
                    <p v-else>{{ record.enjoyment }}/10</p>
                </td>
                <td class="hz">
                    <p>{{ record.hz }}FPS</p>
                </td>
            </tr>
        </table>
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
 
