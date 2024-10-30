<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import ProductManager from './components/ProductManager.vue'
import CodeVerification from './components/CodeVerification.vue'
import HomePage from './components/HomePage.vue'
import OrderManager from './components/OrderManager.vue'
import TabMenu from 'primevue/tabmenu'
import Button from 'primevue/button'
import UserProfile from './components/UserProfile.vue'
import NotificationCenter from './components/NotificationCenter.vue'
import { supabase } from '@/supabase'
import Toast from 'primevue/toast'
import OverlayPanel from 'primevue/overlaypanel'
import Dialog from 'primevue/dialog'

const isVerified = ref(false)

const items = ref([
  {
    label: '首頁',
    icon: 'pi pi-home',
    command: () => activeIndex.value = 0
  },
  {
    label: '庫存管理',
    icon: 'pi pi-box',
    command: () => activeIndex.value = 1
  },
  {
    label: '訂單管理',
    icon: 'pi pi-shopping-cart',
    command: () => activeIndex.value = 2
  }
])

const activeIndex = ref(1)

const showUserProfile = ref(false)
const userCode = ref('')

const showNotifications = ref(false)
const isAdmin = ref(false)

// 添加登入狀態
const isAuthenticated = ref(false)

// 添加 ref 用於控制懸浮面板
const notificationPanel = ref()
const userPanel = ref()

// 添加未讀通知數量
const unreadNotifications = ref<number>(0)

// 添加最近通知的 ref
const recentNotifications = ref<any[]>([])

// 修改獲取最近通知的方法
const fetchRecentNotifications = async () => {
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('code', userCode.value)
      .single()

    if (!userData) return

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:users(name)
      `)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) throw error
    
    // 更新通知列表
    recentNotifications.value = data
    
    // 計算未讀數量
    const unread = data.filter(notification => 
      !notification.read_by?.includes(userData.id)
    ).length
    
    unreadNotifications.value = unread
  } catch (error) {
    console.error('Error fetching recent notifications:', error)
  }
}

// 添加定期刷新通知的功能
let notificationInterval: number | undefined

onMounted(() => {
  // 初始加載
  if (isVerified.value) {
    fetchRecentNotifications()
  }
  
  // 設置定期刷新（每30秒）
  notificationInterval = window.setInterval(() => {
    if (isVerified.value) {
      fetchRecentNotifications()
    }
  }, 30000)
})

// 清理定時器
onUnmounted(() => {
  if (notificationInterval) {
    clearInterval(notificationInterval)
  }
})

// 監聽驗證狀態變化
watch(() => isVerified.value, (newValue) => {
  if (newValue) {
    fetchRecentNotifications()
  }
})

// 修改點擊鈴鐺的處理方法
const handleBellClick = (event: Event) => {
  notificationPanel.value?.toggle(event)
}

// 添加處理查看全部通知的方法
const showAllNotifications = () => {
  showNotifications.value = true
  notificationPanel.value?.hide()
}

// 修改 userActions
const userActions = computed(() => [
  { 
    label: '個人資料', 
    icon: 'pi pi-user',
    command: () => {
      showUserProfile.value = true
      if (userPanel.value) {
        userPanel.value.hide()
      }
    }
  },
  ...(isAdmin.value ? [{
    label: '發送通知', 
    icon: 'pi pi-bell',
    class: 'text-blue-600',
    command: () => {
      showNotifications.value = true
      if (userPanel.value) {
        userPanel.value.hide()
      }
    }
  }] : []),
  { 
    label: '登出', 
    icon: 'pi pi-power-off',
    class: 'text-red-600',
    command: async () => {
      await supabase.auth.signOut()
      isVerified.value = false
      if (userPanel.value) {
        userPanel.value.hide()
      }
    }
  }
])

// 檢查是否為管理員
const checkAdminStatus = async (code: string) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('code', code)
      .single()
    
    if (error) throw error
    isAdmin.value = userData.is_admin
  } catch (error) {
    console.error('Error checking admin status:', error)
  }
}

const handleVerification = async (success: boolean, code: string) => {
  if (success) {
    isVerified.value = true
    userCode.value = code
    isAuthenticated.value = true
    await checkAdminStatus(code)
  }
}

// 添加用戶名稱的 ref
const userName = ref('')

// 修改 initAuth 方法
const initAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    
    if (session) {
      isAuthenticated.value = true
      // 檢查是否有對應的用戶記錄
      const { data: userData } = await supabase
        .from('users')
        .select('code, name')  // 添加 name
        .eq('auth_id', session.user.id)
        .single()

      if (userData) {
        isVerified.value = true
        userCode.value = userData.code
        userName.value = userData.name  // 設置用戶名稱
        await checkAdminStatus(userData.code)
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
  }
}

onMounted(async () => {
  await initAuth()
})

// 添加 Supabase auth 狀態監聽
onMounted(() => {
  supabase.auth.onAuthStateChange((event, session) => {
    isAuthenticated.value = !!session
    console.log('Auth state changed:', event, session)
  })
})

const updateUnreadCount = (count: number) => {
  unreadNotifications.value = count
}

const showInstallPrompt = ref(false)
const showGuideDialog = ref(false)

// 檢查是否需要顯示安裝提示
const checkInstallPrompt = () => {
  // 檢查是否為 iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  // 檢查是否為 Safari
  const isSafari = /Safari/.test(navigator.userAgent)
  // 檢查是否已經安裝（是否為獨立視窗模式）
  const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone

  showInstallPrompt.value = isIOS && isSafari && !isStandalone
}

// 顯示安裝指南
const showInstallGuide = () => {
  showGuideDialog.value = true
}

onMounted(() => {
  checkInstallPrompt()
})
</script>

<template>
  <Toast />
  
  <template v-if="!isVerified">
    <CodeVerification @verify="handleVerification" />
  </template>

  <template v-else>
    <!-- 主應用內容 -->
    <div class="app-container">
      <!-- 導航欄 -->
      <div class="navbar">
        <div class="navbar-content">
          <div class="logo">
            <i class="pi pi-shopping-bag"></i>
            <span>儀優管理系統</span>
          </div>
          <TabMenu :model="items" :activeIndex="activeIndex" />
          <div class="user-info">
            <div class="notification-wrapper">
              <Button 
                icon="pi pi-bell" 
                class="p-button-rounded p-button-text notification-btn"
                @click="notificationPanel?.toggle($event)"
                :badge="String(unreadNotifications)"
                :badge-severity="unreadNotifications > 0 ? 'danger' : 'secondary'"
              />
              <OverlayPanel ref="notificationPanel" class="notification-panel">
                <div class="notification-header">
                  <h3>通知中心</h3>
                  <Button 
                    label="查看全部" 
                    link 
                    @click="showAllNotifications"
                  />
                </div>
                <!-- 添加預覽列表 -->
                <div class="notification-preview-list">
                  <div v-if="!recentNotifications.length" class="empty-state">
                    <i class="pi pi-bell-slash"></i>
                    <p>暫無新通知</p>
                  </div>
                  <div v-else class="notification-items">
                    <div v-for="notification in recentNotifications.slice(0, 3)" 
                         :key="notification.id" 
                         class="notification-preview-item"
                         :class="{ 'unread': !notification.read_by?.includes(userCode) }"
                    >
                      <div v-if="!notification.read_by?.includes(userCode)" class="unread-dot"></div>
                      <h4>{{ notification.title }}</h4>
                      <p>{{ notification.message }}</p>
                      <div class="notification-meta">
                        <span>{{ new Date(notification.created_at).toLocaleString() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </OverlayPanel>
            </div>

            <div class="user-wrapper">
              <Button 
                icon="pi pi-user" 
                class="p-button-rounded p-button-text user-btn"
                @click="userPanel?.toggle($event)"
              />
              <OverlayPanel ref="userPanel" class="user-panel">
                <div class="user-panel-header">
                  <div class="user-avatar">
                    <i class="pi pi-user"></i>
                  </div>
                  <div class="user-info-text">
                    <h3>{{ userName || userCode }}</h3>
                    <span class="user-role">{{ isAdmin ? '管理員' : '一般用戶' }}</span>
                  </div>
                </div>
                <div class="user-actions">
                  <Button 
                    v-for="action in userActions" 
                    :key="action.label"
                    :label="action.label"
                    :icon="action.icon"
                    :class="action.class"
                    text
                    class="w-full justify-start"
                    @click="action.command"
                  />
                </div>
              </OverlayPanel>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加用戶個人主頁對話框 -->
      <UserProfile
    :visible="showUserProfile"
    @update:visible="showUserProfile = $event"
    :userCode="userCode"
  />

      <!-- 添加通知中心組件 -->
      <NotificationCenter
        v-model:visible="showNotifications"
        :is-admin="isAdmin"
        :user-code="userCode"
        @update:unreadCount="updateUnreadCount"
      />

      <!-- 主要內容區域 -->
      <div class="main-container">
        <div class="content-wrapper">
          <div class="content-inner">
            <ProductManager v-if="activeIndex === 1" />
            <HomePage v-else-if="activeIndex === 0" />
            <OrderManager v-else-if="activeIndex === 2" />
          </div>
        </div>
      </div>

      <!-- 頁腳 -->
      <footer class="footer">
        <div class="footer-content">
          <p>© 2024 儀優管理系統 宥任版權所有</p>
        </div>
      </footer>
    </div>
  </template>

  <Button
    v-if="showInstallPrompt"
    icon="pi pi-plus"
    label="新增至主畫面"
    class="install-button p-button-outlined"
    @click="showInstallGuide"
  />
  
  <!-- 安裝指南對話框 -->
  <Dialog
    v-model:visible="showGuideDialog"
    :modal="true"
    header="新增至主畫面"
    :style="{ width: '90vw', maxWidth: '400px' }"
  >
    <div class="install-guide">
      <div class="guide-step">
        <i class="pi pi-share-alt"></i>
        <p>1. 點擊瀏覽器底部的分享按鈕 <i class="pi pi-share-alt" style="font-size: 1.2rem"></i></p>
      </div>
      <div class="guide-step">
        <i class="pi pi-plus"></i>
        <p>2. 向上滑動並選擇「加入主畫面」選項</p>
      </div>
      <div class="guide-step">
        <i class="pi pi-check"></i>
        <p>3. 點擊「新增」即可完成安裝</p>
      </div>
      <div class="guide-note">
        <i class="pi pi-info-circle"></i>
        <p>安裝後可以像使用 App 一樣從主畫面直接開啟</p>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>

/* 導航欄優化 */
.navbar {
  background: rgba(255, 255, 255, 0.98);
  height: 70px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: var(--shadow-md);
  z-index: 1000;
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
}

.navbar-content {
  max-width: 1400px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo 優化 */
.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
  transition: all 0.3s ease;
}

.logo i {
  font-size: 1.75rem;
  color: var(--primary-color);
}

.logo span {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

/* TabMenu 樣式優化 */
:deep(.p-tabmenu) {
  background: transparent;
}

:deep(.p-tabmenu .p-tabmenu-nav) {
  background: transparent;
  border: none;
  padding: 0;
  gap: 0.5rem;
}

:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem) {
  margin: 0;
}

:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link) {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* 圖標樣式 */
.p-menuitem-icon {
  font-size: 1.2rem;
  margin-right: 0.75rem;
}

/* 文字樣式 */
.p-menuitem-text {
  font-weight: 500;
  font-size: 1rem;
}

/* 選中狀態 */
:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem.p-highlight .p-menuitem-link) {
  background: var(--primary-light);
  color: var(--primary-color);
  font-weight: 600;
  
  /* 添加微妙的陰影效果 */
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
}

/* 懸停效果 */
:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link:not(.p-disabled):hover) {
  background: rgba(33, 150, 243, 0.05);
  transform: translateY(-1px);
}

/* 用戶信息區域優化 */
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
  justify-content: flex-end;
}

:deep(.p-button.p-button-text) {
  color: var(--text-secondary);
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--primary-light);
    color: var(--primary-color);
    transform: translateY(-1px);
  }
}

/* 主容器優化 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.main-container {
  flex: 1;
  margin-top: 70px;
  padding: 2rem;
  background: var(--background-color);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.content-wrapper {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.content-inner {
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  width: 100%;
  min-height: calc(100vh - 200px);
}

/* 頁腳優化 */
.footer {
  width: 100%;
  padding: 1.5rem 0;
  background: white;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
}

.footer-content {
  max-width: 1400px;
  width: 100%;
  padding: 0 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 響應式設計優化 */
@media screen and (max-width: 768px) {
  .navbar {
    position: relative;
    height: auto;
    padding: 1rem 0;
  }

  .navbar-content {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .logo {
    justify-content: center;
    min-width: auto;
  }

  :deep(.p-tabmenu) {
    margin: 0.5rem 0;
    width: 100%;
  }

  .user-info {
    width: 100%;
    justify-content: center;
    min-width: auto;
  }

  .main-container {
    margin-top: 0;
    padding: 1rem;
  }

  /* 修改菜單項的排列方式 */
  :deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link) {
    flex-direction: column;  /* 改為垂直排列 */
    padding: 0.75rem;       /* 調整內邊距 */
    gap: 0.5rem;           /* 調整圖標和文字的間距 */
    min-width: 80px;       /* 設置最小寬度 */
    text-align: center;    /* 文字居中 */
  }

  :deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link .p-menuitem-icon) {
    font-size: 1.5rem;     /* 增大圖標尺寸 */
    margin-right: 0;       /* 移除右邊距 */
  }

  :deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link .p-menuitem-text) {
    font-size: 0.875rem;   /* 稍微縮小文字 */
  }

  :deep(.p-tabmenu .p-tabmenu-nav) {
    justify-content: center; /* 確保菜單項居中 */
    gap: 0.5rem;            /* 調整項目間距 */
  }
}

/* iOS 安全區域適配 */
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
  --safe-area-inset-right: env(safe-area-inset-right);
}

.app-container {
  padding-top: var(--safe-area-inset-top);
  padding-bottom: var(--safe-area-inset-bottom);
  padding-left: var(--safe-area-inset-left);
  padding-right: var(--safe-area-inset-right);
}

/* iOS 風格優化 */
.navbar {
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

/* 禁用文本選擇 */
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* 允許輸入框文本選擇 */
input, textarea {
  -webkit-user-select: text;
  user-select: text;
}

/* iOS 點擊高亮效果 */
a, button {
  -webkit-tap-highlight-color: transparent;
}

/* 滾動優化 */
.content-inner {
  -webkit-overflow-scrolling: touch;
}

/* 添加懸浮面板相關樣式 */
.notification-wrapper,
.user-wrapper {
  position: relative;
}

:deep(.notification-panel),
:deep(.user-panel) {
  min-width: 300px;
  padding: 1rem;
}

.notification-header,
.user-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.notification-header h3,
.user-panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.empty-notification {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-color-secondary);
}

.empty-notification i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.user-panel-header {
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.user-info-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.user-role {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

:deep(.user-actions .p-button) {
  padding: 0.75rem;
  font-size: 0.875rem;
}

:deep(.user-actions .p-button:hover) {
  background: var(--surface-hover);
}

/* 徽章樣式 */
:deep(.p-badge) {
  font-size: 0.75rem;
  min-width: 1.5rem;
  height: 1.5rem;
  line-height: 1.5rem;
}

.notification-preview-list {
  padding: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.notification-preview-item {
  position: relative;
  padding: 0.75rem;
  border-radius: 6px;
  background: var(--surface-card);
  margin-bottom: 0.5rem;
  border: 1px solid var(--surface-border);
}

.notification-preview-item.unread {
  background: var(--primary-50);
}

.notification-preview-item h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.notification-preview-item p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.notification-preview-item .notification-meta {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.unread-dot {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary-color);
}

.empty-state {
  text-align: center;
  padding: 1rem;
  color: var(--text-color-secondary);
}

.empty-state i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.install-guide {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.guide-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-ground);
  border-radius: 8px;
}

.guide-step i {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-top: 0.2rem;
}

.guide-step p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

.guide-note {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--primary-50);
  border-radius: 8px;
  margin-top: 1rem;
}

.guide-note i {
  font-size: 1.2rem;
  color: var(--primary-color);
  margin-top: 0.2rem;
}

.guide-note p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--primary-700);
}

.install-button {
  margin-left: 0.5rem;
}

/* 移動端樣式優化 */
@media screen and (max-width: 768px) {
  .install-button {
    width: auto;
    margin: 0.5rem;
  }
  
  .guide-step {
    font-size: 0.875rem;
  }
}
</style>
