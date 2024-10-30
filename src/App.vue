<script setup lang="ts">
import { ref } from 'vue'
import ProductManager from './components/ProductManager.vue'
import CodeVerification from './components/CodeVerification.vue'
import HomePage from './components/HomePage.vue'
import OrderManager from './components/OrderManager.vue'
import TabMenu from 'primevue/tabmenu'
import Button from 'primevue/button'
import UserProfile from './components/UserProfile.vue'

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

const handleVerification = async (success: boolean, code: string) => {
  isVerified.value = success
  if (success) {
    userCode.value = code
  }
}
</script>

<template>
  <!-- 驗證組件 -->
  <CodeVerification 
    v-if="!isVerified"
    @verify="handleVerification"
  />

  <!-- 主應用內容 -->
  <div class="app-container" v-else>
    <!-- 導航欄 -->
    <div class="navbar">
      <div class="navbar-content">
        <div class="logo">
          <i class="pi pi-shopping-bag"></i>
          <span>儀優管理系統</span>
        </div>
        <TabMenu :model="items" :activeIndex="activeIndex" />
        <div class="user-info">
          <Button icon="pi pi-bell" class="p-button-rounded p-button-text notification-btn" />
          <Button 
            icon="pi pi-user" 
            class="p-button-rounded p-button-text user-btn"
            @click="showUserProfile = true"
          />
        </div>
      </div>
    </div>

    <!-- 添加用戶個人主頁對話框 -->
    <UserProfile
  :visible="showUserProfile"
  @update:visible="showUserProfile = $event"
  :userCode="userCode"
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
</style>
