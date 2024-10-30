<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const emit = defineEmits<{
  'verify': [success: boolean, code: string]
}>()

const code = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const codeInput = ref<HTMLElement | null>(null)

// 驗證碼檢查函數
const verifyCode = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  const inputCode = code.value.trim()
  
  try {
    console.log('正在驗證碼:', inputCode)
    
    // 先檢查用戶表中是否有對應的驗證碼
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('code', inputCode)
      .single()

    if (userError) {
      if (userError.code === 'PGRST116') {
        errorMessage.value = '驗證碼錯誤，請重新輸入'
        code.value = ''
        return
      }
      throw userError
    }

    if (userData) {
      // 驗證成功
      console.log('驗證成功，用戶數據:', userData)
      emit('verify', true, inputCode)
    } else {
      // 未找到對應用戶
      errorMessage.value = '驗證碼錯誤，請重新輸入'
      code.value = ''
    }
  } catch (error) {
    console.error('驗證碼檢查失敗:', error)
    errorMessage.value = '系統錯誤，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

// 修改自動聚焦邏輯
onMounted(() => {
  // 使用可選鏈和類型斷言
  (codeInput.value as HTMLInputElement)?.focus?.()
})
</script>

<template>
  <div class="verification-container">
    <div class="verification-box">
      <div class="logo-section">
        <i class="pi pi-shopping-bag"></i>
        <h1>儀優管理系統</h1>
        <p class="subtitle">庫存管理系統</p>
      </div>
      
      <div class="form-section">
        <div class="welcome-text">
          <h2>系統驗證</h2>
          <p>請輸入驗證碼以繼續</p>
        </div>
        
        <div class="input-group">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-lock"></i>
            <InputText 
              ref="codeInput"
              v-model="code" 
              type="password"
              placeholder="請輸入驗證碼"
              class="w-full"
              @keyup.enter="verifyCode"
            />
          </span>
          <small class="error-message" v-if="errorMessage">{{ errorMessage }}</small>
        </div>
        
        <Button 
          label="驗證" 
          @click="verifyCode"
          :loading="isLoading"
          class="verify-button p-button-primary"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.verification-container {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #f6f8fb 0%, #ffffff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.verification-box {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  animation: slideUp 0.5s ease-out;
}

.logo-section {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  padding: 3rem 2rem;
  text-align: center;
  color: white;
}

.logo-section i {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

.logo-section h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.subtitle {
  margin-top: 0.5rem;
  opacity: 0.9;
  font-size: 1rem;
}

.form-section {
  padding: 2.5rem;
}

.welcome-text {
  text-align: center;
  margin-bottom: 2rem;
}

.welcome-text h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.welcome-text p {
  color: #64748b;
  margin-top: 0.5rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

:deep(.p-inputtext) {
  padding: 1.25rem 1rem 1.25rem 3rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  font-size: 1rem;
  background: #f8fafc;
}

:deep(.p-inputtext:focus) {
  border-color: #4CAF50;
  background: white;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
}

.p-input-icon-left i {
  left: 1.25rem;
  color: #64748b;
}

.error-message {
  color: #ef4444;
  display: block;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  animation: shake 0.5s ease-in-out;
}

.verify-button {
  width: 100%;
  padding: 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.verify-button:hover {
  transform: translateY(-2px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@media (max-width: 768px) {
  .verification-box {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .logo-section {
    padding: 2rem 1.5rem;
  }
  
  .form-section {
    padding: 2rem 1.5rem;
  }
}
</style>