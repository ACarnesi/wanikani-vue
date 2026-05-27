import { createMemoryHistory, createRouter } from 'vue-router';
import ConnectionPage from './pages/ConnectionPage.vue';
import SummaryPage from './pages/SummaryPage.vue';

const routes = [
    { path: '', component: ConnectionPage, alias: '/connection' },
    { path: '/home', component: SummaryPage },
];

const router = createRouter({
    history: createMemoryHistory(),
    routes,
});

export default router;