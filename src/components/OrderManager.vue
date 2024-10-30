<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'

// 訂單狀態類型
type OrderStatus = '待處理' | '處理中' | '已完成' | '已取消'

// 訂單介面
interface Order {
  id: string
  customer: string
  amount: number
  status: OrderStatus
  date: string
  platform: string
  items: number
}

// 模擬訂單數據
const orders = ref<Order[]>([
  {
    id: 'ORD001',
    customer: '測試',
    amount: 10,
    status: '待處理',
    date: '2024-01-15',
    platform: '蝦皮',
    items: 2
  },
  // 可以添加更多訂單...
])

// 訂單狀態標籤顏色
const statusColors = {
  '待處理': 'var(--warning-color)',
  '處理中': 'var(--primary-color)',
  '已完成': 'var(--success-color)',
  '已取消': 'var(--danger-color)'
}

// 平台圖標
const platformIcons = {
  '蝦皮': 'pi pi-shopping-cart',
  '賣貨便': 'pi pi-shopping-bag'
}
</script>

<template>
  <div class="order-manager">
    <!-- 頂部統計區域 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>今日訂單</h3>
          <p class="stat-number">{{ orders.length }}</p>
        </div>
        <div class="stat-card">
          <h3>待處理</h3>
          <p class="stat-number">{{ orders.filter(o => o.status === '待處理').length }}</p>
        </div>
        <div class="stat-card">
          <h3>本月營收</h3>
          <p class="stat-number">NT$ {{ orders.reduce((sum, order) => sum + order.amount, 0).toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- 訂單列表區域 -->
    <div class="orders-section">
      <div class="section-header">
        <h2>訂單列表</h2>
        <div class="header-actions">
          <Button 
            label="新增訂單" 
            icon="pi pi-plus"
            class="p-button-success"
          />
        </div>
      </div>

      <!-- 訂單列表 -->
      <div class="orders-grid">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-platform">
              <i :class="platformIcons[order.platform]"></i>
              <span>{{ order.platform }}</span>
            </div>
            <div class="order-id">{{ order.id }}</div>
          </div>
          
          <div class="order-content">
            <div class="order-info">
              <div class="info-row">
                <span class="label">客戶：</span>
                <span class="value">{{ order.customer }}</span>
              </div>
              <div class="info-row">
                <span class="label">金額：</span>
                <span class="value">NT$ {{ order.amount.toLocaleString() }}</span>
              </div>
              <div class="info-row">
                <span class="label">商品數：</span>
                <span class="value">{{ order.items }} 件</span>
              </div>
              <div class="info-row">
                <span class="label">日期：</span>
                <span class="value">{{ order.date }}</span>
              </div>
            </div>
            
            <div class="order-status" :style="{ '--status-color': statusColors[order.status] }">
              {{ order.status }}
            </div>
          </div>

          <div class="order-actions">
            <Button 
              label="查看詳情" 
              icon="pi pi-eye"
              class="p-button-outlined"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-manager {
  padding: 2rem;
}

/* 統計卡片樣式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  text-align: center;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stat-card h3 {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
}

/* 訂單列表區域樣式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.order-platform {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
}

.order-id {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.order-content {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.info-row .label {
  color: var(--text-secondary);
  width: 70px;
}

.info-row .value {
  color: var(--text-color);
  font-weight: 500;
}

.order-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--status-color);
  background: color-mix(in srgb, var(--status-color) 15%, transparent);
  margin-top: 1rem;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .order-manager {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1.5rem;
  }
}
</style> 