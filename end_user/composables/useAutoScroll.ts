import { ref, onUnmounted } from 'vue'

export const useAutoScroll = () => {
  const isScrolling = ref(false)
  const speed = ref(0.5) // 0.1 (Slow) to 10 (Fast)
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
    // Inverse relationship: Higher speed = Lower interval
    // Using inverse formula for smooth exponential feel:
    // Speed 0.1 => 300ms (very slow, ~3px/s)
    // Speed 0.5 => 60ms (slow, ~17px/s)
    // Speed 1 => 30ms (moderate, ~33px/s)
    // Speed 5 => 6ms (fast, ~166px/s)
    // Speed 10 => 5ms (very fast, 200px/s)
    const calculateInterval = (s: number) => {
      return Math.max(5, 30 / s)
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

