<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/supabase'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  visible: boolean
  isAdmin: boolean
  userCode: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:unreadCount': [count: number]
}>()

// 使用計算屬性來處理 visible 狀態
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const toast = useToast()
const notifications = ref<any[]>([])
const showNewNotificationDialog = ref(false)
const isLoading = ref(false)

const newNotification = ref({
  title: '',
  message: ''
})

// 重置表單
const resetForm = () => {
  newNotification.value = {
    title: '',
    message: ''
  }
}

// 關閉對話框
const handleClose = () => {
  showNewNotificationDialog.value = false
  resetForm()
}

// 獲取通知列表
const fetchNotifications = async () => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('code', props.userCode)
      .single()

    if (userError) throw userError

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:users(name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    notifications.value = data

    // 計算未讀通知數量
    const unread = data.filter(notification => 
      !notification.read_by?.includes(userData.id)
    ).length
    
    emit('update:unreadCount', unread)
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    toast.add({
      severity: 'error',
      summary: '錯誤',
      detail: error.message || '獲取通知失敗',
      life: 3000
    })
  }
}

// 標記通知為已讀
const markAsRead = async (notificationId: string) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('code', props.userCode)
      .single()

    if (userError) throw userError

    // 先獲取當前通知
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('read_by')
      .eq('id', notificationId)
      .single()

    if (fetchError) throw fetchError

    // 準備新的已讀列表
    const currentReadBy = notification.read_by || []
    if (!currentReadBy.includes(userData.id)) {
      const newReadBy = [...currentReadBy, userData.id]

      // 更新通知
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read_by: newReadBy })
        .eq('id', notificationId)

      if (updateError) throw updateError
    }

    await fetchNotifications()
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
  }
}

// 發送通知
const sendNotification = async () => {
  if (!newNotification.value.title || !newNotification.value.message) {
    toast.add({
      severity: 'warn',
      summary: '警告',
      detail: '請填寫完整通知內容',
      life: 3000
    })
    return
  }

  isLoading.value = true
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .eq('code', props.userCode)
      .single()

    if (userError) throw userError

    const { error } = await supabase
      .from('notifications')
      .insert({
        title: newNotification.value.title,
        message: newNotification.value.message,
        sender_id: userData.id,
        created_at: new Date().toISOString(),
        read_by: []
      })

    if (error) throw error

    toast.add({
      severity: 'success',
      summary: '成功',
      detail: '通知發送成功',
      life: 3000
    })

    resetForm()
    handleClose()
    await fetchNotifications()
  } catch (error: any) {
    console.error('Error sending notification:', error)
    toast.add({
      severity: 'error',
      summary: '錯誤',
      detail: error.message || '發送通知失敗',
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
}

// 點擊通知時標記為已讀
const handleNotificationClick = async (notification: any) => {
  if (!notification.read_by?.includes(props.userCode)) {
    await markAsRead(notification.id)
  }
}

// 監聽對話框顯示狀態
watch(() => dialogVisible.value, (newValue) => {
  if (newValue) {
    fetchNotifications()
  }
})

onMounted(() => {
  fetchNotifications()
})

// 添加通知排序和分組功能
const sortedNotifications = computed(() => {
  return notifications.value.sort((a, b) => {
    // 未讀優先
    const aUnread = !a.read_by?.includes(props.userCode)
    const bUnread = !b.read_by?.includes(props.userCode)
    if (aUnread !== bUnread) return bUnread ? 1 : -1
    
    // 其次按時間排序
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

// 添加時間格式化方法
const formatTime = (date: string) => {
  const now = new Date()
  const notificationDate = new Date(date)
  const diffInHours = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes} 分鐘前`
    }
    return `${Math.floor(diffInHours)} 小時前`
  }
  
  return notificationDate.toLocaleString()
}
</script>

<template>
  <Dialog 
    v-model:visible="dialogVisible"
    :modal="true"
    :style="{ width: '90vw', maxWidth: '600px' }"
    class="notification-dialog"
  >
    <template #header>
      <div class="dialog-header">
        <h2>通知中心</h2>
        <template v-if="isAdmin">
          <Button
            icon="pi pi-plus"
            label="發送通知"
            class="p-button-sm"
            @click="showNewNotificationDialog = true"
          />
        </template>
      </div>
    </template>

    <div class="notification-list">
      <div v-if="!notifications.length" class="empty-state">
        <i class="pi pi-bell-slash"></i>
        <p>暫無通知</p>
      </div>
      <div v-else class="notification-items">
        <div v-for="notification in sortedNotifications" 
             :key="notification.id" 
             class="notification-item"
             :class="{ 
               'unread': !notification.read_by?.includes(userCode),
               'system-notification': !notification.sender?.name 
             }"
             @click="markAsRead(notification.id)"
        >
          <div class="notification-content">
            <div class="notification-header">
              <h3>{{ notification.title }}</h3>
              <div v-if="!notification.read_by?.includes(userCode)" class="unread-dot"></div>
            </div>
            <p>{{ notification.message }}</p>
            <div class="notification-meta">
              <span class="sender">
                <i :class="notification.sender?.name ? 'pi pi-user' : 'pi pi-bell'"></i>
                {{ notification.sender?.name || '系統通知' }}
              </span>
              <span class="time">{{ formatTime(notification.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>

  <Dialog
    v-model:visible="showNewNotificationDialog"
    :modal="true"
    :style="{ width: '90vw', maxWidth: '500px' }"
    header="發送新通知"
    class="new-notification-dialog"
  >
    <div class="form-content">
      <div class="form-field">
        <label>標題</label>
        <InputText v-model="newNotification.title" placeholder="請輸入通知標題" />
      </div>
      <div class="form-field">
        <label>內容</label>
        <Textarea 
          v-model="newNotification.message" 
          placeholder="請輸入通知內容"
          rows="5" 
        />
      </div>
    </div>
    <template #footer>
      <Button 
        label="取消" 
        icon="pi pi-times" 
        class="p-button-text"
        @click="showNewNotificationDialog = false"
      />
      <Button 
        label="發送" 
        icon="pi pi-send" 
        @click="sendNotification"
        :loading="isLoading"
      />
    </template>
  </Dialog>

  <Toast position="top-center" />
</template>

<style scoped>
.notification-list {
  padding: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.notification-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  position: relative;
  background: var(--surface-card);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.notification-item.unread {
  background: var(--primary-50);
  border-color: var(--primary-200);
}

.notification-item.system-notification {
  border-left: 4px solid var(--primary-color);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-top: 0.75rem;
}

.sender {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sender i {
  font-size: 0.875rem;
}

.time {
  font-size: 0.75rem;
}

.unread-dot {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
}

.form-field {
  margin-bottom: 1rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}
</style> 