// Performance monitoring utilities for memory and runtime analysis

interface PerformanceMetrics {
  memoryUsage: {
    used: number
    total: number
    usedPercent: number
  }
  timing: {
    domContentLoaded: number
    loadComplete: number
    firstPaint: number
    firstContentfulPaint: number
  }
  bundleInfo: {
    totalScripts: number
    totalSize: string
  }
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}

  constructor() {
    this.init()
  }

  private init() {
    // Monitor when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.measureDOMLoad.bind(this))
    } else {
      this.measureDOMLoad()
    }

    // Monitor when page is fully loaded
    if (document.readyState === 'complete') {
      this.measureFullLoad()
    } else {
      window.addEventListener('load', this.measureFullLoad.bind(this))
    }

    // Memory monitoring
    this.startMemoryMonitoring()
  }

  private measureDOMLoad() {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (perfData) {
      this.metrics.timing = {
        ...this.metrics.timing,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      }
    }

    // Measure paint metrics
    const paintMetrics = performance.getEntriesByType('paint')
    const fpEntry = paintMetrics.find(entry => entry.name === 'first-paint')
    const fcpEntry = paintMetrics.find(entry => entry.name === 'first-contentful-paint')

    if (fpEntry || fcpEntry) {
      this.metrics.timing = {
        ...this.metrics.timing,
        firstPaint: fpEntry?.startTime || 0,
        firstContentfulPaint: fcpEntry?.startTime || 0,
      }
    }
  }

  private measureFullLoad() {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (perfData) {
      this.metrics.timing = {
        ...this.metrics.timing,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      }
    }

    // Measure bundle information
    this.measureBundleInfo()
  }

  private startMemoryMonitoring() {
    // Check if Performance Memory API is available
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory
        const used = Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100
        const total = Math.round((memory.totalJSHeapSize / 1024 / 1024) * 100) / 100
        const usedPercent = Math.round((used / total) * 100)

        this.metrics.memoryUsage = {
          used,
          total,
          usedPercent,
        }
      }

      // Initial measurement
      checkMemory()

      // Monitor every 30 seconds
      setInterval(checkMemory, 30000)
    }
  }

  private measureBundleInfo() {
    const scripts = document.querySelectorAll('script[src]')
    this.metrics.bundleInfo = {
      totalScripts: scripts.length,
      totalSize: 'Dynamic - check Network tab',
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  logMetrics() {
    console.group('🚀 Performance Metrics')

    if (this.metrics.timing) {
      console.log('⏱️ Timing Metrics:')
      Object.entries(this.metrics.timing).forEach(([key, value]) => {
        console.log(`  ${key}: ${value.toFixed(2)}ms`)
      })
    }

    if (this.metrics.memoryUsage) {
      console.log('🧠 Memory Usage:')
      console.log(`  Used: ${this.metrics.memoryUsage.used}MB`)
      console.log(`  Total: ${this.metrics.memoryUsage.total}MB`)
      console.log(`  Usage: ${this.metrics.memoryUsage.usedPercent}%`)
    }

    if (this.metrics.bundleInfo) {
      console.log('📦 Bundle Info:')
      console.log(`  Scripts Loaded: ${this.metrics.bundleInfo.totalScripts}`)
      console.log(`  Total Size: ${this.metrics.bundleInfo.totalSize}`)
    }

    console.groupEnd()
  }

  // Alert if memory usage is too high
  checkMemoryThreshold(threshold = 75) {
    if (this.metrics.memoryUsage && this.metrics.memoryUsage.usedPercent > threshold) {
      console.warn(`⚠️ High memory usage detected: ${this.metrics.memoryUsage.usedPercent}%`)
      return true
    }
    return false
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Development helper - expose to global scope in dev mode
if (import.meta.env.DEV) {
  ;(window as any).performanceMonitor = performanceMonitor
}