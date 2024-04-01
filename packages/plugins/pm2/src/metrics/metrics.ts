import { NativeMetricTypes } from '@quickstat/core'

/**
 * The base labels for the pm2 metrics
 */
export const PM2_BASE_LABELS = {
  /**
   * label: mapping path to the pm2 list data
   */
  'name': createValueMapping(['name']),
  /*   'pid': createValueMapping(['pid']), */
  'pm2_id': createValueMapping(['pm_id']),
}

/**
 * The available metrics for the pm2 plugin
 */
export type PM2_AVAILABLE_METRICS =
  /*  | 'pm2_data' */
  | 'pm2_unstable_restarts'
  | 'pm2_restart_time'
  | 'pm2_uptime'
  | 'pm2_status'
  | 'pm2_memory_rss'
  | 'pm2_cpu_usage'
  | 'pm2_heap_size_used'
  | 'pm2_heap_usage'
  | 'pm2_heap_size'
  | 'pm2_event_loop_latency_p95'
  | 'pm2_event_loop_latency'
  | 'pm2_active_handles'
  | 'pm2_active_requests'
  | 'pm2_http_requests'
  | 'pm2_http_latency_p95'
  | 'pm2_http_latency_mean'

/**
 * Contains the metadata and the mapping for the metrics to the pm2 raw list data
 */
export const PM2_METRICS_RAW = [
  /*   {
    // Contains all the data from pm2 for list view
    key: 'pm2_data',
    type: NativeMetricTypes.Counter,
    description: 'All the data from pm2 for list view',
    labels: {
      ...PM2_BASE_LABELS,
      'node_version': createValueMapping(['pm2_env', 'node_version']),
      'version': createValueMapping(['pm2_env', 'version']),
      'unstable_restarts': createValueMapping(['pm2_env', 'unstable_restarts']),
      'restart_time': createValueMapping(['pm2_env', 'restart_time']),
      'created_at': createValueMapping(['pm2_env', 'created_at']),
      'used_heap_size': createValueMapping(['pm2_env', 'axm_monitor', 'Used Heap Size'], true),
      'heap_usage': createValueMapping(['pm2_env', 'axm_monitor', 'Heap Usage'], true),
      'heap_size': createValueMapping(['pm2_env', 'axm_monitor', 'Heap Size'], true),
      'event_loop_latency_p95': createValueMapping(['pm2_env', 'axm_monitor', 'Event Loop Latency p95'], true),
      'event_loop_latency': createValueMapping(['pm2_env', 'axm_monitor', 'Event Loop Latency'], true),
      'active_handles': createValueMapping(['pm2_env', 'axm_monitor', 'Active handles'], true),
      'active_requests': createValueMapping(['pm2_env', 'axm_monitor', 'Active requests'], true),
      'http_requests': createValueMapping(['pm2_env', 'axm_monitor', 'HTTP'], true),
      'http_latency_p95': createValueMapping(['pm2_env', 'axm_monitor', 'HTTP P95 Latency'], true),
      'http_latency_mean': createValueMapping(['pm2_env', 'axm_monitor', 'HTTP Mean Latency'], true),
      'pm_uptime': createValueMapping(['pm2_env', 'pm_uptime']),
      'status': createValueMapping(['pm2_env', 'status']),
      'user': createValueMapping(['pm2_env', 'USER']),
      'versioning_url': createValueMapping(['pm2_env', 'versioning', 'url']),
      'versioning_revision': createValueMapping(['pm2_env', 'versioning', 'revision']),
      'versioning_branch': createValueMapping(['pm2_env', 'versioning', 'branch']),
      'versioning_remote': createValueMapping(['pm2_env', 'versioning', 'remote']),
      'versioning_update_time': createValueMapping(['pm2_env', 'versioning', 'update_time']),
      'monit_memory': createValueMapping(['monit', 'memory']),
      'monit_cpu': createValueMapping(['monit', 'cpu']),
    },
  }, */
  {
    key: 'pm2_unstable_restarts',
    type: NativeMetricTypes.Gauge,
    description: 'Number of unstable restarts',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'unstable_restarts']),
  },
  {
    key: 'pm2_restart_time',
    type: NativeMetricTypes.Gauge,
    description: 'The amount of restarts',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'restart_time']),
  },
  {
    key: 'pm2_uptime',
    type: NativeMetricTypes.Gauge,
    description: 'PM2 uptime (in milliseconds)',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'pm_uptime']),
  },
  {
    key: 'pm2_status',
    type: NativeMetricTypes.Gauge,
    description: 'PM2 process status',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'status']),
  },
  {
    key: 'pm2_memory_rss',
    type: NativeMetricTypes.Gauge,
    description: 'Memory usage of the PM2 process (in bytes)',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['monit', 'memory']),
  },
  {
    key: 'pm2_cpu_usage',
    type: NativeMetricTypes.Gauge,
    description: 'CPU usage of the PM2 process (percentage)',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['monit', 'cpu']),
  },
  {
    key: 'pm2_heap_size_used',
    type: NativeMetricTypes.Gauge,
    description: 'Used heap size of V8 runtime (in MiB)',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'axm_monitor', 'Used Heap Size'], true),
  },
  {
    key: 'pm2_heap_usage',
    type: NativeMetricTypes.Gauge,
    description: 'Heap memory usage (percentage)',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'axm_monitor', 'Heap Usage'], true),
  },
  {
    key: 'pm2_heap_size',
    type: NativeMetricTypes.Gauge,
    description: 'Total heap size of V8 runtime (in MiB)',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'axm_monitor', 'Heap Size'], true),
  },
  {
    key: 'pm2_event_loop_latency_p95',
    type: NativeMetricTypes.Gauge,
    description: '95th percentile of event loop latency (in milliseconds)',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'axm_monitor', 'Event Loop Latency p95'], true),
    /*     buckets: [0.1, 0.3, 1.2, 5.0], */
  },
  {
    key: 'pm2_event_loop_latency',
    type: NativeMetricTypes.Gauge,
    description: '50th percentile of event loop latency (in milliseconds)',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'axm_monitor', 'Event Loop Latency'], true),
    /*   buckets: [0.1, 0.3, 1.2, 5.0], */
  },
  {
    key: 'pm2_active_handles',
    type: NativeMetricTypes.Gauge,
    description: 'Number of active handles in libuv',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'axm_monitor', 'Active handles'], true),
  },
  {
    key: 'pm2_active_requests',
    type: NativeMetricTypes.Gauge,
    description: 'Number of active requests in libuv',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'axm_monitor', 'Active requests'], true),
  },
  {
    key: 'pm2_http_requests',
    type: NativeMetricTypes.Gauge,
    description: 'HTTP requests per minute',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'axm_monitor', 'HTTP'], true),
  },
  {
    key: 'pm2_http_latency_p95',
    type: NativeMetricTypes.Gauge,
    description: '95th percentile of HTTP latency (in milliseconds)',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'axm_monitor', 'HTTP P95 Latency'], true),
    /*     buckets: [0.1, 0.3, 1.2, 5.0], */
  },
  {
    key: 'pm2_http_latency_mean',
    type: NativeMetricTypes.Gauge,
    description: 'Mean HTTP latency (in milliseconds)',
    labels: PM2_BASE_LABELS,
    value: createValueMapping(['pm2_env', 'axm_monitor', 'HTTP Mean Latency'], true),
    /*    buckets: [0.1, 0.3, 1.2, 5.0], */
  },
]

/**
 * Creates the value mapping for the metric
 * @param mapping The mapping for the metric from the pm2 data object to the metric
 * @param hasUnit If the value has a unit
 * @returns The object containing the info on how to map the value
 */
export function createValueMapping(mapping: string[], hasUnit: boolean = false) {
  return {
    mapping,
    withUnit: hasUnit,
  }
}
