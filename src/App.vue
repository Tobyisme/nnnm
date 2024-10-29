<script setup lang="ts">
import { ref } from 'vue'
import ProductManager from './components/ProductManager.vue'
import CodeVerification from './components/CodeVerification.vue'
import HomePage from './components/HomePage.vue'
import TabMenu from 'primevue/tabmenu'
import Button from 'primevue/button'

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

const handleVerification = (success: boolean) => {
  isVerified.value = success
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
          <Button icon="pi pi-user" class="p-button-rounded p-button-text user-btn" />
        </div>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="main-container">
      <div class="content-wrapper">
        <div class="content-inner">
          <ProductManager v-if="activeIndex === 1" />
          <HomePage v-else-if="activeIndex === 0" />
          <div v-else-if="activeIndex === 2" class="page-content orders">
            <h2 class="page-title">訂單管理</h2>
          </div>
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
}

.navbar-content {
  max-width: 1920px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: relative;
  z-index: 1001;
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

/* TabMenu 優化 */
:deep(.p-tabmenu) {
  margin: 0 2rem;
  flex: 1;
}

:deep(.p-tabmenu .p-tabmenu-nav) {
  justify-content: center;
  border: none;
  background: transparent;
}

:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link) {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: none;
}

:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem.p-highlight .p-menuitem-link) {
  background: var(--primary-light);
  color: var(--primary-color);
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
.main-container {
  margin-top: 90px;
  padding: 2rem;
  background: var(--background-color);
  min-height: calc(100vh - 70px);
}

.content-wrapper {
  max-width: 1920px;
  margin: 0 auto;
}

.content-inner {
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  min-height: calc(100vh - 250px);
}

/* 頁腳優化 */
.footer {
  margin-top: auto;
  padding: 1.5rem 0;
  background: white;
  border-top: 1px solid var(--border-color);
}

.footer-content {
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
}
</style>
