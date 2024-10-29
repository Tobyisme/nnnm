import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'

// PrimeVue
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import TabMenu from 'primevue/tabmenu'

// 導入 PrimeVue 樣式
import 'primevue/resources/themes/saga-blue/theme.css'     // 主題
import 'primevue/resources/primevue.min.css'              // 核心樣式
import 'primeicons/primeicons.css'                        // 圖標
import 'primeflex/primeflex.css'                          // PrimeFlex

const app = createApp(App)

// 配置 PrimeVue
app.use(PrimeVue, {
    ripple: true,
    inputStyle: "filled"
})

// 註冊組件
app.component('Button', Button)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('TabMenu', TabMenu)

app.mount('#app')
