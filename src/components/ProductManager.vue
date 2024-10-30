<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import AddProductDialog from './AddProductDialog.vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

// 添加 Product 介面定義
interface Product {
  id: string
  name: string
  quantity: number
  retail_price?: number
  wholesale_price?: number
  created_at?: string
}

const products = ref<Product[]>([])
const showAddDialog = ref(false)
const selectedProduct = ref<Product | null>(null)
const showQuantityDialog = ref(false)
const showProductDetails = ref(false)
const selectedProductDetails = ref<Product | null>(null)

// 載入商品列表
const loadProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    products.value = data || []
  } catch (error) {
    console.error('Error loading products:', error)
    alert('載入商品列表失敗')
  }
}   

// 处理新增商品
const handleAddProduct = async (product) => {
  try {
    const { error } = await supabase
      .from('products')
      .insert([product])
      .select()

    if (error) throw error

    await loadProducts()
    showAddDialog.value = false
  } catch (error) {
    console.error('Error adding product:', error)
    alert('新增商品失敗')
  }
}

// 更新庫存
const updateQuantity = async (change: number) => {
  if (!selectedProduct.value) return
  
  try {
    const newQuantity = (selectedProduct.value.quantity || 0) + change
    if (newQuantity < 0) return

    const { error } = await supabase
      .from('products')
      .update({ quantity: newQuantity })
      .eq('id', selectedProduct.value.id)

    if (error) throw error

    // 更新本地數據
    const index = products.value.findIndex(p => p.id === selectedProduct.value?.id)
    if (index !== -1) {
      products.value[index].quantity = newQuantity
      selectedProduct.value.quantity = newQuantity
    }
  } catch (error) {
    console.error('Error updating quantity:', error)
    alert('更新庫存失敗')
  }
}

const openQuantityDialog = (product: Product) => {
  selectedProduct.value = product
  showQuantityDialog.value = true
}

const openProductDetails = (product: Product) => {
  selectedProductDetails.value = product
  showProductDetails.value = true
}

// 在詳情頁面點擊編輯庫存時的處理函數
const handleEditQuantity = () => {
  selectedProduct.value = selectedProductDetails.value
  showQuantityDialog.value = true
}

// 如果需要編輯功能，添加以下函數
const editProduct = async (product: Product) => {
  try {
    const { error } = await supabase
      .from('products')
      .update(product)
      .eq('id', product.id)

    if (error) throw error

    await loadProducts()
    showProductDetails.value = false
  } catch (error) {
    console.error('Error editing product:', error)
    alert('編輯商品失敗')
  }
}

// 初始載入
onMounted(async () => {
  await loadProducts()
})
</script>

<template>
  <div class="inventory-manager card animate-fadeIn">
    <!-- 商品列表視圖 v-if="!showProductDetails" -->
    <div v-if="!showProductDetails">
      <!-- 頂部工具欄 -->
      <div class="toolbar">
        <div class="title-section">
          <h2 class="page-title">庫存管理</h2>
          <p class="page-subtitle">管理商品庫存</p>
        </div>
        <Button 
          label="新增商品" 
          icon="pi pi-plus"
          @click="showAddDialog = true"
          class="p-button-success add-button"
        />
      </div>

      <!-- 商品列表 -->
      <div class="products-grid">
        <div 
          v-for="product in products" 
          :key="product.id"
          class="product-card"
          @click="openProductDetails(product)"
        >
          <div class="product-info">
            <span class="product-name">{{ product.name }}</span>
          </div>
          <div class="card-right">
            <div class="quantity-badge">
              <i class="pi pi-box"></i>
              <span>{{ product.quantity }}</span>
            </div>
            <i class="pi pi-angle-right arrow-icon"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品詳情視圖 v-else -->
    <div v-else class="product-details-view">
      <!-- 返回按鈕 -->
      <div class="toolbar">
        <Button 
          icon="pi pi-arrow-left" 
          class="p-button-text" 
          @click="showProductDetails = false"
        />
        <h2 class="page-title">商品詳情</h2>
      </div>

      <!-- 詳情內容 -->
      <div class="details-container">
        <div class="detail-section">
          <!-- 商品名稱 -->
          <div class="detail-group">
            <label>商品名稱</label>
            <div class="detail-input">
              <i class="pi pi-tag"></i>
              <span>{{ selectedProductDetails?.name }}</span>
            </div>
          </div>
          
          <!-- 售價 -->
          <div class="detail-group">
            <label>售價</label>
            <div class="detail-input">
              <i class="pi pi-dollar"></i>
              <span>NT$ {{ selectedProductDetails?.retail_price?.toLocaleString() }}</span>
            </div>
          </div>
          
          <!-- 批發價 -->
          <div class="detail-group">
            <label>批發價</label>
            <div class="detail-input">
              <i class="pi pi-shopping-cart"></i>
              <span>NT$ {{ selectedProductDetails?.wholesale_price?.toLocaleString() }}</span>
            </div>
          </div>
          
          <!-- 庫存 -->
          <div class="detail-group">
            <label>目前庫存</label>
            <div class="detail-input clickable" @click="handleEditQuantity">
              <i class="pi pi-box"></i>
              <span>{{ selectedProductDetails?.quantity }} 件</span>
              <i class="pi pi-pencil edit-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增商品對話框 -->
    <AddProductDialog
      v-model:visible="showAddDialog"
      @add="handleAddProduct"
    />

    <!-- 修改庫存對話框 -->
    <Dialog
      v-model:visible="showQuantityDialog"
      :modal="true"
      class="quantity-dialog"
    >
      <div class="quantity-dialog-content">
        <!-- 標題區域 -->
        <div class="dialog-header">
          <h2>修改庫存</h2>
          <p class="subtitle">調整 "{{ selectedProduct?.name }}" 的庫存數量</p>
        </div>

        <!-- 當前庫存顯示 -->
        <div class="current-quantity">
          <div class="quantity-display">
            <i class="pi pi-box"></i>
            <span class="quantity-number">{{ selectedProduct?.quantity }}</span>
            <span class="quantity-unit">件</span>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="quantity-actions">
          <Button
            icon="pi pi-minus"
            @click="updateQuantity(-1)"
            :disabled="selectedProduct?.quantity <= 0"
            class="p-button-outlined p-button-rounded p-button-lg"
          />
          <Button
            icon="pi pi-plus"
            @click="updateQuantity(1)"
            class="p-button-success p-button-rounded p-button-lg"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* 保留基礎布局樣式 */
.inventory-manager {
  width: 100%;
  padding: 2rem;
  margin: 0 auto;
  max-width: 100%;
  overflow: hidden;
}

/* 修改標題區域樣式 */
.title-section {
  margin-bottom: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  padding: 0;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
  padding: 0;
}

/* 修改工具欄樣式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 0;
  gap: 1rem;
}

.add-button {
  margin-top: 0.5rem;
}

/* Dialog 樣式調整 */
:deep(.p-dialog) {
  max-width: 500px;
  margin: 0 1rem;
}

:deep(.p-dialog-content) {
  padding: 0 !important;
  background: var(--surface-ground, #f8f9fa) !important;
}

:deep(.p-dialog-header) {
  background: var(--surface-ground, #f8f9fa);
  padding: 1.5rem;
}

/* 商品詳情內容樣式 */
.product-details-content {
  padding: 0;
  background: var(--surface-ground, #f8f9fa);
}

.white-container {
  background: white;
  margin: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
}

/* 商品列表樣式 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.product-card {
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--surface-border, #dee2e6);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-info {
  flex: 1;
  min-width: 0;
  margin-right: 1rem;
}

.product-name {
  font-weight: 500;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.card-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.quantity-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--surface-ground);
  border-radius: 6px;
  min-width: 80px;
  justify-content: center;
}

.quantity-badge i {
  color: var(--primary-color);
  font-size: 0.875rem;
  margin-right: 0.25rem;
}

.quantity-badge span {
  color: var(--text-color);
  font-size: 0.875rem;
  line-height: 1;
  display: inline-block;
}

.arrow-icon {
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.product-card:hover .arrow-icon {
  transform: translateX(4px);
  color: var(--primary-color);
}

/* 詳情頁面樣式 */
.details-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.details-header h2 {
  font-size: 1.25rem;
  color: var(--text-color);
  margin: 0;
  font-weight: 600;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0.5rem 0 0 0;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-group label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-left: 0.25rem;
}

.detail-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--surface-ground, #f8f9fa);
  border: 1px solid var(--surface-border, #dee2e6);
  border-radius: 8px;
  min-height: 2.75rem;
}

.detail-input i {
  color: var(--primary-color);
  font-size: 1rem;
  flex-shrink: 0;
}

.detail-input span {
  flex: 1;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-input.clickable {
  cursor: pointer;
  position: relative;
}

.detail-input.clickable:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.edit-icon {
  color: var(--primary-color);
  font-size: 0.875rem;
  flex-shrink: 0;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .white-container {
    margin: 1rem;
    padding: 1.25rem;
  }
  
  .details-header {
    margin-bottom: 1.5rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-card {
    padding: 0.875rem 1rem;
  }
}

/* 商品詳情視圖樣式 */
.product-details-view {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.details-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.toolbar .page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

/* 庫存修改對話框樣式 */
:deep(.quantity-dialog) {
  max-width: 400px;
}

:deep(.quantity-dialog .p-dialog-content) {
  padding: 0 !important;
}

.quantity-dialog-content {
  padding: 2rem;
  background: white;
}

.dialog-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dialog-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.dialog-header .subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0.5rem 0 0 0;
}

.current-quantity {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.quantity-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--surface-ground);
  border-radius: 12px;
}

.quantity-display i {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.quantity-number {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1;
}

.quantity-unit {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-left: 0.25rem;
}

.quantity-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

:deep(.quantity-actions .p-button) {
  width: 3.5rem;
  height: 3.5rem;
}

:deep(.quantity-actions .p-button .p-button-icon) {
  font-size: 1.25rem;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .quantity-dialog-content {
    padding: 1.5rem;
  }

  .dialog-header {
    margin-bottom: 1.5rem;
  }

  .quantity-display {
    padding: 0.75rem 1.5rem;
  }

  .quantity-number {
    font-size: 1.75rem;
  }

  :deep(.quantity-actions .p-button) {
    width: 3rem;
    height: 3rem;
  }
}
</style>