import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export const initializeCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    // 設置狀態欄
    try {
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#ffffff' })
    } catch (error) {
      console.error('Status bar error:', error)
    }

    // 隱藏啟動畫面
    try {
      await SplashScreen.hide()
    } catch (error) {
      console.error('Splash screen error:', error)
    }
  }
}

// 觸覺反饋
export const vibrate = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Light })
  }
} 