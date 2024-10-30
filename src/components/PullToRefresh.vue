<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  refresh: []
}>()

const refreshing = ref(false)
const startY = ref(0)
const currentY = ref(0)
const maxPull = 100

const handleTouchStart = (e: TouchEvent) => {
  startY.value = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent) => {
  currentY.value = e.touches[0].clientY
  const pull = currentY.value - startY.value
  
  if (pull > 0 && window.scrollY === 0) {
    e.preventDefault()
    const element = document.querySelector('.pull-to-refresh')
    if (element) {
      const scale = Math.min(1 + (pull / maxPull) * 0.2, 1.2)
      element.style.transform = `scale(${scale})`
    }
  }
}

const handleTouchEnd = async () => {
  const pull = currentY.value - startY.value
  
  if (pull > maxPull && window.scrollY === 0) {
    refreshing.value = true
    await emit('refresh')
    refreshing.value = false
  }
  
  const element = document.querySelector('.pull-to-refresh')
  if (element) {
    element.style.transform = ''
  }
}
</script>

<template>
  <div 
    class="pull-to-refresh"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <slot></slot>
  </div>
</template> 