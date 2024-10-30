<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/supabase'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

interface User {
  id: string
  name: string
  investment: number
  code: string
  created_at: string
}

const props = defineProps<{
  visible: boolean
  userCode: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const user = ref<User | null>(null)
const totalInvestment = ref(10000)

// 載入用戶數據
const loadUserData = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('code', props.userCode)
      .single()

    if (error) throw error
    user.value = data
  } catch (error) {
    console.error('載入用戶數據失敗:', error)
  }
}

// 監聽 visible 變化
watch(() => props.visible, (newValue) => {
  if (newValue) {
    loadUserData()
  }
})

// 處理對話框關閉
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog 
    :visible="visible"
    @update:visible="handleClose"
    modal 
    :header="user?.name + ' 的個人主頁'"
    class="user-profile-dialog"
    :style="{ width: '90%', maxWidth: '600px' }"
  >
    <div class="profile-content">
      <!-- 投資金額卡片 -->
      <div class="investment-card">
        <div class="investment-header">
          <i class="pi pi-money-bill"></i>
          <h3>投資金額</h3>
        </div>
        <div class="investment-amount">
          <span class="currency">NT$</span>
          <span class="amount">{{ user?.investment?.toLocaleString() }}</span>
        </div>
        <div class="investment-percentage">
          <div class="percentage-bar">
            <div 
              class="percentage-fill"
              :style="{ width: `${(user?.investment || 0) / totalInvestment * 100}%` }"
            ></div>
          </div>
          <span class="percentage-text">
            {{ ((user?.investment || 0) / totalInvestment * 100).toFixed(1) }}% 占比
          </span>
        </div>
      </div>

      <!-- 其他信息 -->
      <div class="info-section">
        <div class="info-row">
          <span class="label">加入時間</span>
          <span class="value">{{ new Date(user?.created_at || '').toLocaleDateString() }}</span>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.profile-content {
  padding: 1rem;
}

.investment-card {
  background: var(--surface-ground);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.investment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.investment-header i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.investment-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-color);
}

.investment-amount {
  margin-bottom: 1rem;
}

.currency {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-right: 0.5rem;
}

.amount {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
}

.investment-percentage {
  margin-top: 1rem;
}

.percentage-bar {
  height: 8px;
  background: var(--surface-border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.percentage-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.percentage-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-row .label {
  color: var(--text-secondary);
}

.info-row .value {
  color: var(--text-color);
  font-weight: 500;
}
</style> 