import { ref, onUnmounted } from 'vue'

export const useAutoScroll = () => {
  const isScrolling = ref(false)
  const speed = ref(1) // 1 (Slow) to 10 (Fast)
  let scrollInterval: ReturnType<typeof setInterval> | null = null

  const startScroll = () => {
    if (isScrolling.value) return
    isScrolling.value = true

    // Clear any existing interval just in case
    if (scrollInterval) clearInterval(scrollInterval)

    // Setup interval - faster speed means smaller interval or larger step
    // Let's stick to a smooth 60fps-ish feel if possible, or just a simple interval
    // Simple approach: Scroll by 1px every X ms
    // Speed 1: very slow. Speed 10: fast.
    
    const tick = () => {
      if (!isScrolling.value) return
      
      // Check if we reached bottom
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        stopScroll()
        return
      }

      // Scroll amount depends on speed
      // Let's say base speed is 1px every (50ms / speed)
      // Speed 1 -> 50ms (20px/s)
      // Speed 5 -> 10ms (100px/s)
      // Or scroll by speed pixels every fixed interval
      
      window.scrollBy(0, 1)
    }

    // Calculate interval based on speed
    // Map speed 1-10 to interval 100ms - 10ms
    const calculateInterval = (s: number) => {
      // Inverse relationship: Higher speed = Lower interval
      // Speed 1 => 50ms
      // Speed 10 => 5ms
      return Math.max(5, 55 - (s * 5))
    }

    scrollInterval = setInterval(tick, calculateInterval(speed.value))
  }

  const stopScroll = () => {
    isScrolling.value = false
    if (scrollInterval) {
      clearInterval(scrollInterval)
      scrollInterval = null
    }
  }

  const toggleScroll = () => {
    if (isScrolling.value) {
      stopScroll()
    } else {
      startScroll()
    }
  }

  const setSpeed = (newSpeed: number) => {
    speed.value = newSpeed
    // If currently scrolling, restart with new speed
    if (isScrolling.value) {
      stopScroll()
      startScroll()
    }
  }

  onUnmounted(() => {
    stopScroll()
  })

  return {
    isScrolling,
    speed,
    startScroll,
    stopScroll,
    toggleScroll,
    setSpeed
  }
}

