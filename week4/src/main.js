import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import "primeicons/primeicons.css"; // 如果表格里使用图标（可保留）

import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap 样式

const app = createApp(App);

app.use(PrimeVue);

app.mount("#app");

