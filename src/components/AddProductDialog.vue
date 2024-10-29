<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'

interface Product {
  name: string
  retail_price: number
  wholesale_price: number
  quantity: number
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'save': [product: Product]
}>()

const newProduct = ref<Product>({
  name: '',
  retail_price: 0,
  wholesale_price: 0,
  quantity: 0
})

const handleSave = () => {
  if (!newProduct.value.name) {
    alert('請輸入商品名稱')
    return
  }
  emit('save', { ...newProduct.value })
  newProduct.value = {
    name: '',
    retail_price: 0,
    wholesale_price: 0,
    quantity: 0
  }
}
</script>

<template>
  <Dialog 
    :visible="visible"
    @update:visible="(value) => emit('update:visible', value)"
    :header="''"
    :modal="true"
    :style="{ width: '500px', margin: '0 1rem' }"
    class="add-product-dialog"
  >
    <template #header>
      <div class="custom-header">
        <span class="dialog-title">新增商品</span>
      </div>
    </template>
    <div class="dialog-content">
      <div class="field">
        <label class="field-label">商品名稱</label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-shopping-bag"></i>
          <InputText 
            v-model="newProduct.name" 
            class="w-full"
            placeholder="請輸入商品名稱"
          />
        </span>
      </div>
      <div class="field">
        <label class="field-label">售價</label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-dollar"></i>
          <InputNumber 
            v-model="newProduct.retail_price" 
            mode="currency" 
            currency="TWD" 
            locale="zh-TW"
            class="w-full"
            placeholder="請輸入售價"
          />
        </span>
      </div>
      <div class="field">
        <label class="field-label">批發價</label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-dollar"></i>
          <InputNumber 
            v-model="newProduct.wholesale_price" 
            mode="currency" 
            currency="TWD" 
            locale="zh-TW"
            class="w-full"
            placeholder="請輸入批發價"
          />
        </span>
      </div>
      <div class="field">
        <label class="field-label">初始庫存</label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-box"></i>
          <InputNumber 
            v-model="newProduct.quantity" 
            :min="0" 
            showButtons
            class="w-full"
            placeholder="請輸入初始庫存"
          />
        </span>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <Button 
          label="取消" 
          @click="emit('update:visible', false)" 
          class="p-button-outlined p-button-secondary" 
          icon="pi pi-times"
        />
        <Button 
          label="確認新增" 
          @click="handleSave" 
          class="p-button-success"
          icon="pi pi-check"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.add-product-dialog :deep(.p-dialog-header) {
  padding: 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.add-product-dialog :deep(.p-dialog-title) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-product-dialog :deep(.p-dialog-title)::before {
  content: '';
  display: inline-block;
  width: 28px;
  height: 28px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFFFFF"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>') no-repeat center;
  margin-right: 1rem;
}

.add-product-dialog :deep(.p-dialog-header-close) {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: transparent;
  color: #64748b;
  transition: all 0.2s ease;
}

.add-product-dialog :deep(.p-dialog-header-close:hover) {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.add-product-dialog :deep(.p-dialog-header-close-icon) {
  font-size: 1.25rem;
}

.add-product-dialog :deep(.p-dialog) {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dialog-content {
  padding: 2rem;
}

.field {
  margin-bottom: 1.8rem;
}

.field-label {
  display: block;
  margin-bottom: 0.8rem;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1rem;
}

.p-input-icon-left {
  width: 100%;
  position: relative;
}

.p-input-icon-left i {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0.75rem;
  color: #666;
  z-index: 1;
}

:deep(.p-inputtext),
:deep(.p-inputnumber-input) {
  padding: 1rem 1rem 1rem 2.5rem !important;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  font-size: 1rem;
  width: 100%;
}

:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-inputnumber .p-inputtext) {
  border-radius: 8px;
  width: 100%;
}

:deep(.p-inputtext:hover),
:deep(.p-inputnumber-input:hover) {
  border-color: #4CAF50;
}

:deep(.p-inputtext:focus),
:deep(.p-inputnumber-input:focus) {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.custom-header {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 3rem;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
}

@media (max-width: 768px) {
  .add-product-dialog :deep(.p-dialog-header) {
    padding: 1.25rem;
  }

  .add-product-dialog :deep(.p-dialog-title) {
    font-size: 1.25rem;
  }

  .add-product-dialog :deep(.p-dialog-title)::before {
    width: 24px;
    height: 24px;
    margin-right: 0.75rem;
  }

  .add-product-dialog :deep(.p-dialog-header-close) {
    width: 2rem;
    height: 2rem;
  }

  .add-product-dialog :deep(.p-dialog) {
    width: calc(100% - 2rem) !important;
    max-width: 500px;
    margin: 0 1rem;
  }
  
  .dialog-content {
    padding: 1.5rem;
  }
  
  .field {
    margin-bottom: 1.5rem;
  }

  :deep(.p-dialog-content) {
    padding: 0 1rem;
  }

  :deep(.p-inputtext),
  :deep(.p-inputnumber-input) {
    padding: 0.875rem 1rem 0.875rem 2.5rem !important;
    font-size: 16px;
  }

  .dialog-footer {
    padding: 1.25rem 1rem;
  }

  .custom-header {
    padding: 0.75rem 2.5rem;
  }

  .dialog-title {
    font-size: 1.125rem;
  }
}
</style> 