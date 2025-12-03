<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranspose } from '~/composables/useTranspose'

interface Props {
  originalKey?: string
  transposeSteps: number
  isScrolling: boolean
  scrollSpeed: number
  fontSize: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:transpose', value: number): void
  (e: 'toggleScroll'): void
  (e: 'update:speed', value: number): void
  (e: 'update:fontSize', value: number): void
}>()

const { transposeNote } = useTranspose()

// Helper to show current key
const currentKey = computed(() => {
  if (!props.originalKey) return '?'
  return transposeNote(props.originalKey, props.transposeSteps)
})

// Mobile drawer state
const showMobileDrawer = ref(false)
const activeTab = ref<'transpose' | 'scroll' | 'font'>('transpose')

const openDrawer = (tab: 'transpose' | 'scroll' | 'font') => {
  activeTab.value = tab
  showMobileDrawer.value = true
}

const closeDrawer = () => {
  showMobileDrawer.value = false
}

</script>

<template>
  <div>
    <!-- DESKTOP VIEW (Sticky Sidebar) -->
    <div class="hidden lg:flex flex-col gap-6 sticky top-24">
      <!-- Transpose Card -->
      <div class="bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm">
        <div class="text-xs font-bold text-text-muted uppercase mb-3">Transpose</div>
        <div class="flex items-center justify-between bg-surface-muted rounded-lg p-1 mb-2">
          <button 
            class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-base transition-colors"
            @click="emit('update:transpose', transposeSteps - 1)"
          >
            -
          </button>
          <span class="font-mono font-bold text-lg">{{ currentKey }}</span>
          <button 
             class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-base transition-colors"
             @click="emit('update:transpose', transposeSteps + 1)"
          >
            +
          </button>
        </div>
        <div class="text-center text-xs text-text-muted">
          Original: {{ originalKey }}
        </div>
      </div>

      <!-- Auto Scroll Card -->
      <div class="bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm">
        <div class="text-xs font-bold text-text-muted uppercase mb-3">Auto Scroll</div>
        <button 
          class="w-full px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center mb-3"
          :class="isScrolling ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#FF2E93] text-white hover:bg-[#ff5ca6]'"
          @click="emit('toggleScroll')"
        >
          {{ isScrolling ? 'Stop' : 'Start' }}
        </button>
        
        <div class="flex items-center gap-2">
          <span class="text-xs text-text-muted">Speed</span>
          <input 
            type="range" 
            min="1" 
            max="10" 
            :value="scrollSpeed" 
            @input="e => emit('update:speed', Number((e.target as HTMLInputElement).value))"
            class="w-full accent-[#FF2E93]"
          >
        </div>
      </div>

      <!-- Font Size Card -->
      <div class="bg-surface-base border border-border-subtle rounded-xl p-4 shadow-sm">
         <div class="text-xs font-bold text-text-muted uppercase mb-3">Font Size</div>
         <div class="flex items-center justify-between bg-surface-muted rounded-lg p-1">
           <button 
             class="flex-1 py-1 text-sm font-bold hover:bg-surface-base rounded"
             @click="emit('update:fontSize', Math.max(0.8, fontSize - 0.1))"
           >
             A-
           </button>
           <span class="w-px h-4 bg-border-subtle"></span>
           <button 
             class="flex-1 py-1 text-lg font-bold hover:bg-surface-base rounded"
             @click="emit('update:fontSize', Math.min(2.0, fontSize + 0.1))"
           >
             A+
           </button>
         </div>
      </div>
    </div>

    <!-- MOBILE VIEW (Fixed Bottom Bar) -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-base border-t border-border-subtle px-4 py-3 z-50 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
       <button 
        class="flex flex-col items-center gap-1 text-text-muted active:text-[#FF2E93]"
        @click="openDrawer('transpose')"
      >
        <span class="font-mono font-bold text-lg leading-none">{{ currentKey }}</span>
        <span class="text-[10px]">Transpose</span>
       </button>

       <button 
         class="w-12 h-12 rounded-full bg-[#FF2E93] text-white flex items-center justify-center shadow-lg -mt-6"
         @click="emit('toggleScroll')"
       >
         <span v-if="isScrolling">II</span>
         <span v-else>▶</span>
       </button>

       <button 
         class="flex flex-col items-center gap-1 text-text-muted active:text-[#FF2E93]"
         @click="openDrawer('scroll')"
       >
         <span class="text-lg leading-none">⚡</span>
         <span class="text-[10px]">Speed</span>
       </button>
    </div>

    <!-- MOBILE DRAWER (Overlay) -->
    <div 
      v-if="showMobileDrawer" 
      class="lg:hidden fixed inset-0 z-[60]"
    >
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDrawer"></div>
      
      <div class="absolute bottom-0 left-0 right-0 bg-surface-base rounded-t-2xl p-6 animate-slide-up">
        <div class="w-12 h-1 bg-border-subtle rounded-full mx-auto mb-6"></div>

        <!-- Transpose Tab -->
        <div v-if="activeTab === 'transpose'" class="space-y-6">
          <h3 class="text-lg font-bold text-center">Transpose Key</h3>
          
          <div class="flex items-center justify-center gap-6">
             <button 
              class="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center text-2xl"
              @click="emit('update:transpose', transposeSteps - 1)"
            >
              -
            </button>
            
            <div class="text-center">
              <div class="text-4xl font-bold font-mono text-[#FF2E93]">{{ currentKey }}</div>
              <div class="text-sm text-text-muted mt-1">Original: {{ originalKey }}</div>
            </div>

            <button 
               class="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center text-2xl"
               @click="emit('update:transpose', transposeSteps + 1)"
            >
              +
            </button>
          </div>

          <div class="bg-surface-muted rounded-xl p-4 text-center">
            <div class="text-sm text-text-muted mb-1">Recommended Capo</div>
             <!-- Simple capo logic: if negative transposition, maybe capo? Just placeholder for now -->
            <div class="font-bold">None</div>
          </div>
        </div>

         <!-- Scroll/Speed Tab -->
        <div v-else-if="activeTab === 'scroll'" class="space-y-6">
          <h3 class="text-lg font-bold text-center">Auto Scroll Speed</h3>
          
          <div class="px-4">
             <input 
              type="range" 
              min="1" 
              max="10" 
              :value="scrollSpeed" 
              @input="e => emit('update:speed', Number((e.target as HTMLInputElement).value))"
              class="w-full accent-[#FF2E93] h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer"
            >
            <div class="flex justify-between text-xs text-text-muted mt-2">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

           <div class="flex items-center justify-between bg-surface-muted rounded-xl p-4">
            <span class="text-sm font-bold">Font Size</span>
            <div class="flex items-center gap-4">
               <button 
                 class="w-8 h-8 rounded bg-surface-base shadow text-sm"
                 @click="emit('update:fontSize', Math.max(0.8, fontSize - 0.1))"
               >
                 A-
               </button>
               <span class="text-sm">{{ Math.round(fontSize * 100) }}%</span>
               <button 
                 class="w-8 h-8 rounded bg-surface-base shadow text-lg"
                 @click="emit('update:fontSize', Math.min(2.0, fontSize + 0.1))"
               >
                 A+
               </button>
            </div>
          </div>
        </div>

        <button class="w-full px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center hover:bg-surface-muted text-text-muted mt-6 py-4" @click="closeDrawer">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>

