/// <reference types="vite/client" />

// Vue
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// PrimeVue
declare module 'primevue/config' {
  const content: any
  export default content
}

declare module 'primevue/tabmenu' {
  const content: any
  export default content
}

declare module 'primevue/button' {
  const content: any
  export default content
}

declare module 'primevue/card' {
  const content: any
  export default content
}

declare module 'primevue/datatable' {
  const content: any
  export default content
}

declare module 'primevue/column' {
  const content: any
  export default content
}

declare module 'primevue/inputtext' {
  const content: any
  export default content
}

declare module 'primevue/inputnumber' {
  const content: any
  export default content
} 