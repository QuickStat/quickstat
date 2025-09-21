import { NativeMetricTypes, Plugin } from '@quickstat/core'

import { PerformanceObserver } from 'perf_hooks'

import { NODEJS_METRICS } from './metrics/metrics'

import type { MultiCounter, MultiGauge, MultiHistogram, PluginOptions } from '@quickstat/core'
import type { NODEJS_AVAILABLE_METRICS } from './metrics/metrics'

interface ProcessWithInternals extends NodeJS.Process {
  _getActiveHandles?(): unknown[]
  _getActiveRequests?(): unknown[]
}

/**
 * The options for the node.js plugin.
 */
export type NodeJsPluginOptions = Omit<PluginOptions<NODEJS_AVAILABLE_METRICS>, 'metrics'>

/**
 * The node.js plugin to collect Node.js runtime metrics
 */
export class NodeJsPlugin extends Plugin {
  private eventLoopMonitor?: ReturnType<typeof setInterval>
  private gcObserver?: PerformanceObserver

  /**
   * The node.js plugin to collect Node.js runtime metrics
   * @param options The options for the node.js plugin
   */
  constructor(options: NodeJsPluginOptions = {}) {
    super({ ...options, metrics: NODEJS_METRICS })
  }

  /**
   * Called once the client registers the plugin
   */
  public onRegister() {
    this.setupEventLoopMonitoring()
    this.setupGCMonitoring()
    return null
  }

  /**
   * Sets up event loop latency monitoring
   */
  private setupEventLoopMonitoring() {
    let start = process.hrtime.bigint()

    this.eventLoopMonitor = setInterval(() => {
      const delta = process.hrtime.bigint() - start
      const lag = Number(delta) / 1e9 // Convert nanoseconds to seconds

      this.setMetricValue('nodejs_event_loop_lag', [], lag)
      start = process.hrtime.bigint()
    }, 1000)
  }

  /**
   * Sets up garbage collection monitoring
   */
  private setupGCMonitoring() {
    try {
      this.gcObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'gc') {
            const detail = entry.detail as { kind?: number } | undefined
            const gcKind = this.getGCKind(detail?.kind)
            this.observeMetricValue('nodejs_gc_duration', [gcKind], entry.duration / 1000) // Convert ms to seconds
          }
        }
      })

      this.gcObserver.observe({ entryTypes: ['gc'] })
    } catch (error) {
      // GC monitoring might not be available in all Node.js versions
      console.warn('GC monitoring not available:', error)
    }
  }

  /**
   * Gets the GC kind name from the GC kind number
   * @param kind The GC kind number
   * @returns The GC kind name
   */
  private getGCKind(kind?: number): string {
    if (kind === 1) return 'scavenge'
    if (kind === 2) return 'mark_sweep_compact'
    if (kind === 4) return 'incremental_marking'
    if (kind === 8) return 'weak_phantom'
    if (kind === 15) return 'all'
    return 'unknown'
  }

  /**
   * Sets the value of a gauge or counter metric
   * @param metricName The name of the metric
   * @param labels The labels for the metric
   * @param value The value to set
   */
  private setMetricValue(metricName: string, labels: string[], value: number) {
    const metric = this.client?.metrics.get(metricName)
    if (!metric) return

    switch (metric.type) {
      case NativeMetricTypes.Counter:
        ;(metric as MultiCounter).set(labels, value)
        break
      case NativeMetricTypes.Gauge:
        ;(metric as MultiGauge).set(labels, value)
        break
    }
  }

  /**
   * Observes a value for a histogram metric
   * @param metricName The name of the metric
   * @param labels The labels for the metric
   * @param value The value to observe
   */
  private observeMetricValue(metricName: string, labels: string[], value: number) {
    const metric = this.client?.metrics.get(metricName)
    if (!metric) return

    if (metric.type === NativeMetricTypes.Histogram) {
      ;(metric as MultiHistogram).observe(labels, value)
    }
  }

  /**
   * Collect the Node.js runtime metrics
   * @param timestamp The timestamp to collect the metrics at
   * @returns The collected metrics
   */
  public async onCollect(timestamp: number) {
    await this.collectMemoryMetrics()
    await this.collectProcessMetrics()
    await this.collectHandleMetrics()

    // Misc metrics
    this.setMetricValue('nodejs_uptime', [], process.uptime())

    return super.onCollect(timestamp)
  }

  /**
   * Collects memory related metrics
   */
  private async collectMemoryMetrics() {
    const memUsage = process.memoryUsage()

    // Heap metrics
    this.setMetricValue('nodejs_heap_size', [], memUsage.heapTotal)
    this.setMetricValue('nodejs_heap_size_used', [], memUsage.heapUsed)
    this.setMetricValue('nodejs_external_memory', [], memUsage.external)

    // Process memory metrics
    this.setMetricValue('nodejs_process_resident_memory', [], memUsage.rss)
    this.setMetricValue('nodejs_process_heap_memory', [], memUsage.heapUsed)

    // Heap space metrics (if available)
    try {
      const v8 = await import('v8')
      const heapSpaceStats = v8.getHeapSpaceStatistics()

      for (const space of heapSpaceStats) {
        const spaceName = space.space_name
        this.setMetricValue('nodejs_heap_space_size', [spaceName], space.space_size)
        this.setMetricValue('nodejs_heap_space_size_used', [spaceName], space.space_used_size)
        this.setMetricValue('nodejs_heap_space_size_available', [spaceName], space.space_available_size)
      }
    } catch {
      // V8 might not be available in all environments
    }
  }

  /**
   * Collects process related metrics
   */
  private async collectProcessMetrics() {
    const cpuUsage = process.cpuUsage()

    // CPU metrics (convert microseconds to seconds)
    this.setMetricValue('nodejs_process_cpu_user', [], cpuUsage.user / 1e6)
    this.setMetricValue('nodejs_process_cpu_system', [], cpuUsage.system / 1e6)
    this.setMetricValue('nodejs_process_cpu', [], (cpuUsage.user + cpuUsage.system) / 1e6)

    // File descriptor metrics (Linux/Unix only)
    try {
      const fs = await import('fs')
      const procStat = fs.readFileSync('/proc/self/stat', 'utf8')
      const stats = procStat.split(' ')
      const virtualMemory = parseInt(stats[22]!, 10)

      this.setMetricValue('nodejs_process_virtual_memory', [], virtualMemory)

      // Try to get file descriptor limits and current count
      try {
        const limits = fs.readFileSync('/proc/self/limits', 'utf8')
        const maxFdsMatch = limits.match(/Max open files\s+(\d+)/)
        if (maxFdsMatch) {
          this.setMetricValue('nodejs_process_max_fds', [], parseInt(maxFdsMatch[1]!, 10))
        }

        const fdDir = fs.readdirSync('/proc/self/fd')
        this.setMetricValue('nodejs_process_open_fds', [], fdDir.length)
      } catch {
        // File descriptor info might not be available
      }
    } catch {
      // /proc filesystem not available (not Linux)
    }
  }

  /**
   * Collects handle and request metrics
   */
  private async collectHandleMetrics() {
    // Active handles and requests
    const proc = process as ProcessWithInternals
    const handles = (proc._getActiveHandles?.())?.length ?? 0
    const requests = (proc._getActiveRequests?.())?.length ?? 0

    this.setMetricValue('nodejs_active_handles', [], handles)
    this.setMetricValue('nodejs_active_requests', [], requests)

    // Active resources (if available)
    try {
      const asyncHooks = await import('async_hooks')
      const resources = asyncHooks.executionAsyncResource()

      this.setMetricValue('nodejs_active_resources', [], resources ? 1 : 0)
    } catch {
      // async_hooks might not be available
    }
  }

  /**
   * Cleanup resources when the plugin is destroyed
   */
  public destroy() {
    if (this.eventLoopMonitor) {
      clearInterval(this.eventLoopMonitor)
    }

    if (this.gcObserver) {
      this.gcObserver.disconnect()
    }
  }
}
