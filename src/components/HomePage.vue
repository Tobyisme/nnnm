<script setup lang="ts">
import Button from 'primevue/button'

// 定義賣場連結
const marketplaces = [
  {
    name: '蝦皮賣場',
    url: 'https://s.shopee.tw/8UrJoMNI8X',
    icon: 'pi pi-shopping-cart',
    color: '#EE4D2D'
  },
  {
    name: '賣貨便',
    url: 'https://myship.7-11.com.tw/general/detail/GM2410285954504#',
    icon: 'pi pi-shopping-bag',
    color: '#0066FF'
  },
]

// 開啟連結
const openMarketplace = (url: string) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1>儀優管理系統</h1>
      <p class="subtitle">操你媽</p>
    </div>

    <div class="marketplace-section">
      <h2>我的賣場</h2>
      <div class="marketplace-grid">
        <div 
          v-for="(shop, index) in marketplaces" 
          :key="index"
          class="marketplace-card"
          @click="openMarketplace(shop.url)"
        >
          <div class="card-content">
            <i :class="shop.icon" :style="{ color: shop.color }"></i>
            <h3>{{ shop.name }}</h3>
            <p>點擊前往賣場</p>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <h2>銷售概況</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>今日訂單</h3>
          <p class="stat-number">0</p>
        </div>
        <div class="stat-card">
          <h3>本月銷售</h3>
          <p class="stat-number">0</p>
        </div>
        <div class="stat-card">
          <h3>商品總數</h3>
          <p class="stat-number">0</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 添加網格樣式 */
.marketplace-grid,
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

/* 容器樣式優化 */
.home-container {
  width: 100%;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: 1;  /* 確保不會被導航欄遮擋 */
}

/* 歡迎區域優化 */
.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 1rem;  /* 減少上方間距 */
}

.welcome-section h1 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-weight: 600;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

/* 賣場卡片優化 */
.marketplace-card {
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  height: 100%;
  overflow: visible;
  position: relative;
  z-index: 1;
}

.card-content {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.card-content i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.card-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  position: relative;
  z-index: 2;
}

.card-content p {
  color: var(--text-secondary);
  margin: 0;
  position: relative;
  z-index: 2;
}

.marketplace-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

/* 統計卡片優化 */
.stats-section {
  position: relative;
  z-index: 1;
}

.stats-section h2 {
  position: relative;
  z-index: 2;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  text-align: center;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  overflow: visible;
}

.stat-card h3 {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  position: relative;
  z-index: 3;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
  position: relative;
  z-index: 3;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 標題統一樣式 */
.marketplace-section h2,
.stats-section h2 {
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 2rem;
  font-weight: 600;
}

/* 響應式優化 */
@media (max-width: 768px) {
  .home-container {
    padding: 1.5rem;
    margin: 0;  /* 移除邊距 */
    border-radius: 12px;
  }

  .welcome-section {
    padding-top: 0.5rem;
  }

  .welcome-section h1 {
    font-size: 2rem;
  }

  .marketplace-section,
  .stats-section {
    padding: 0;  /* 移除內邊距 */
  }

  .marketplace-grid,
  .stats-grid {
    grid-template-columns: 1fr;  /* 手機版改為單列 */
    gap: 1rem;
  }

  .card-content {
    padding: 1.5rem;
  }
}
</style> 