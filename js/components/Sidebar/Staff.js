import { fetchStaff } from "../../content.js"
import { store } from '../../main.js'
import Spinner from "../Spinner.js";
 
// Display order and section headings for each role — sections with no
// members are simply skipped (see visibleRoles), so adding a "dev" or
// "trial" staffer to data/_staff.json later just works without any code
// change here.
const ROLE_ORDER = ["owner", "admin", "helper", "dev", "trial"];
const ROLE_LABELS = {
    owner: "Owners",
    admin: "Admins",
    helper: "Moderators",
    dev: "Developers",
    trial: "Trial Helpers",
};
 
export default {
    data: () => ({
        staff: [],
        roleIconMap: {
            owner: 'crown',
            admin: 'user-gear',
            helper: 'user-shield',
            dev: 'code',
            trial: 'user-lock',
        },
        roleOrder: ROLE_ORDER,
        roleLabels: ROLE_LABELS,
    }),
    components: { Spinner },
    template: `
        <template v-if="staff">
            <h3>List Staff</h3>
            <div class="staff-groups">
                <div class="staff-group" v-for="role in visibleRoles" :key="role">
                    <h4 class="staff-group-label">{{ roleLabels[role] }}</h4>
                    <ul class="staff">
                        <li v-for="editor in groupedStaff[role]" :key="editor.name">
                            <img :src="'/assets/' + roleIconMap[editor.role] + (true ? '-dark' : '') + '.svg'" :alt="editor.role">
                            <a class="type-label-lg link director" target="_blank" :href="editor.link">{{ editor.name }}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </template>
        <Spinner v-else />
    `,
    computed: {
        // Members grouped by role, preserving _staff.json's original order
        // within each group.
        groupedStaff() {
            const groups = {};
            for (const editor of this.staff) {
                (groups[editor.role] = groups[editor.role] || []).push(editor);
            }
            return groups;
        },
        // Only the roles that actually have someone in them, in
        // ROLE_ORDER's fixed order (Owners, then Admins, then Moderators...).
        visibleRoles() {
            return this.roleOrder.filter((role) => this.groupedStaff[role]?.length > 0);
        },
    },
    async mounted() {
        this.staff = store.staff;
    },
    watch: {
        store: {
            deep: true,
            handler(updated) {
                this.staff = updated.staff
            }
        }
    }
}
