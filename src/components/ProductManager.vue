<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import AddProductDialog from './AddProductDialog.vue'

const products = ref<Product[]>([])
const showAddDialog = ref(false)
const selectedProduct = ref<Product | null>(null)
const showQuantityDialog = ref(false)

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

// 初始載入
onMounted(() => {
  loadProducts()
})
</script>

<template>
  <div class="inventory-manager">
    <!-- 頂部工具欄 -->
    <div class="toolbar">
      <div class="title-section">
        <h2 class="page-title">庫存管理</h2>
        <p class="page-subtitle">管理您的商品庫存</p>
      </div>
      <Button 
        label="新增商品" 
        icon="pi pi-plus"
        @click="showAddDialog = true"
        class="p-button-success add-button"
      />
    </div>

    <!-- 商品列表 -->
    <DataTable 
      :value="products"
      class="product-table"
      responsiveLayout="scroll"
      :paginator="true"
      :rows="10"
      stripedRows
      :rowsPerPageOptions="[10,20,50]"
      currentPageReportTemplate="顯示第 {first} 到第 {last} 筆，共 {totalRecords} 筆"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    >
      <Column field="name" header="商品名稱" sortable style="min-width: 200px">
        <template #header>
          <div class="column-header">
            商品名稱
            <i class="pi pi-sort-alt"></i>
          </div>
        </template>
        <template #body="slotProps">
          <div class="product-name">
            {{ slotProps.data.name }}
          </div>
        </template>
      </Column>
      <Column field="retail_price" header="售價" sortable style="min-width: 150px">
        <template #header>
          <div class="column-header">
            售價
            <i class="pi pi-sort-alt"></i>
          </div>
        </template>
        <template #body="slotProps">
          <div class="price">
            NT$ {{ slotProps.data.retail_price.toLocaleString() }}
          </div>
        </template>
      </Column>
      <Column field="wholesale_price" header="批發價" sortable style="min-width: 150px">
        <template #header>
          <div class="column-header">
            批發價
            <i class="pi pi-sort-alt"></i>
          </div>
        </template>
        <template #body="slotProps">
          <div class="price">
            NT$ {{ slotProps.data.wholesale_price.toLocaleString() }}
          </div>
        </template>
      </Column>
      <Column field="quantity" header="庫存" sortable style="min-width: 150px">
        <template #body="slotProps">
          <div class="quantity-display" @click="openQuantityDialog(slotProps.data)">
            <span class="quantity">{{ slotProps.data.quantity }}</span>
            <i class="pi pi-pencil edit-icon"></i>
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 庫存修改對話框 -->
    <Dialog
      v-model:visible="showQuantityDialog"
      :modal="true"
      :header="'修改庫存 - ' + selectedProduct?.name"
      :style="{ width: '450px' }"
      class="quantity-dialog"
    >
      <div class="quantity-edit-content">
        <div class="stock-info">
          <i class="pi pi-box stock-icon"></i>
          <div class="stock-details">
            <span class="current-quantity">{{ selectedProduct?.quantity || 0 }}</span>
            <span class="quantity-label">目前庫存</span>
          </div>
        </div>
        <div class="quantity-controls">
          <Button 
            icon="pi pi-minus" 
            class="p-button-rounded p-button-outlined control-button"
            @click="updateQuantity(-1)"
            :disabled="!selectedProduct?.quantity"
          />
          <span class="quantity-value">{{ selectedProduct?.quantity || 0 }}</span>
          <Button 
            icon="pi pi-plus" 
            class="p-button-rounded p-button-outlined control-button"
            @click="updateQuantity(1)"
          />
        </div>
      </div>
    </Dialog>

    <AddProductDialog
      v-model:visible="showAddDialog"
      @save="handleAddProduct"
    />
  </div>
</template>

<style scoped>
.inventory-manager {
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  padding: 2rem;
}

/* 確保表格寬度 100% */
:deep(.p-datatable) {
  width: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

.add-button {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

/* 表格樣式 */
.product-table {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  overflow: hidden;
}

:deep(.p-datatable-header) {
  background: #f8fafc;
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #1e293b;
  font-weight: 600;
  padding: 1rem 1.5rem;
  border-color: #e2e8f0;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1e293b;
  font-weight: 600;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 1.5rem;
  border-color: #e2e8f0;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f1f5f9;
}

/* 庫存修改對話框 */
.quantity-dialog :deep(.p-dialog-header) {
  padding: 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.quantity-edit-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  width: 100%;
}

.stock-icon {
  font-size: 2rem;
  color: #4CAF50;
}

.stock-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.current-quantity {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.quantity-label {
  color: #64748b;
  font-size: 0.875rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.control-button {
  width: 3rem;
  height: 3rem;
}

.quantity-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  min-width: 3rem;
  text-align: center;
}

/* RWD 適配 */
@media (max-width: 768px) {
  .inventory-manager {
    padding: 1rem;
    border-radius: 12px;
  }

  .toolbar {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .add-button {
    width: 100%;
  }

  .quantity-edit-content {
    padding: 1.5rem 1rem;
  }

  .stock-info {
    padding: 1rem;
  }

  .quantity-controls {
    padding: 0.75rem;
    gap: 1.5rem;
  }

  .control-button {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>