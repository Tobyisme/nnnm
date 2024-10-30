import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.yiyou.inventory',
  appName: '儀優管理系統',
  webDir: 'dist',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#ffffff',
    scheme: 'yiyou',
    limitsNavigationsToAppBoundDomains: true
  },
  server: {
    url: 'http://localhost:5173',
    cleartext: true
  }
}

export default config
