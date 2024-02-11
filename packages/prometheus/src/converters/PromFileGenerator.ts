import { DataPoint, Gauge, NativeCounter, type DataSourceCollectMetric, type DataPointLabelValue, NativeHistogram, type INativeMetric } from '@quickstat/core'
/**
 * The prometheus file generator which generates the prometheus file from the collected metrics.
 */
export class PromFileGenerator {
  /**
   * The collected metrics containing the data and the metric.
   */
  collectedMetrics: DataSourceCollectMetric[]
  /**
   * The prometheus file generator which generates the prometheus file from the collected metrics.
   * @param collectedMetrics The collected metrics containing the data and the metric.
   */
  constructor(collectedMetrics: DataSourceCollectMetric[]) {
    this.collectedMetrics = collectedMetrics
  }

  /**
   * Get the prometheus file from the collected metrics.
   */
  get() {
    const lines = this.collectedMetrics.flatMap(this.getMetricSection.bind(this))
    return lines.join('\n')
  }

  /**
   * Get the metric section from the collected metric.
   * @param collectedMetric The collected metric containing the data and the metric.
   */
  getMetricSection(collectedMetric: DataSourceCollectMetric) {
    const { data, metric } = collectedMetric

    if (metric instanceof Gauge) {
      return this.getLinearMetricSection(data, metric, MetricNameSuffix.Total)
    } else if (metric instanceof NativeCounter) {
      return this.getLinearMetricSection(data, metric, MetricNameSuffix.Sum)
    } else if (metric instanceof NativeHistogram) {
      return this.getObservableMetricSection(data, metric, MetricNameSuffix.Bucket)
    }

    return []
  }

  /**
   * Get the linear metric section from the collected metric e.g. counter, gauge.
   * @param data The data of the metric
   * @param metric The metric
   * @param suffix The suffix for the metric name
   */
  getLinearMetricSection(data: DataPoint, metric: NativeCounter | Gauge, suffix: MetricNameSuffix) {
    const metricName = this.getSuffixedMetricName(metric.name, suffix)
    const lines = [
      ...this.getHeaderMetricSection(metricName, metric),
    ]

    if (metric.labels.length === 0) {
      lines.push(`${metricName} ${data.value}`)
    } else {
      data.values.forEach(value => {
        lines.push(`${metricName}{${this.getLabelValueMapForDataPoint(metric.labels, value)}} ${value.value}`)
      })
    }

    return lines
  }

  /**
   * Get oberserable Metric section from the collected metric e.g. histogram, summary.
   * @param data The data of the metric
   * @param metric The metric
   * @param suffix The suffix for the metric name
   */
  getObservableMetricSection(data: DataPoint, metric: NativeHistogram, suffix: MetricNameSuffix) {
    const clonedData = data.clone()

    const metricName = this.getSuffixedMetricName(metric.name, suffix)
    const countMetricName = this.getSuffixedMetricName(metric.name, MetricNameSuffix.Total)
    const sumMetricName = this.getSuffixedMetricName(metric.name, MetricNameSuffix.Sum)

    // Labels without le label
    const labelsWithoutLe = metric.labels.slice(1)

    const lines = [
      ...this.getHeaderMetricSection(metricName, metric),
    ]

    clonedData.values.forEach(value => {
      lines.push(`${metricName}{${this.getLabelValueMapForDataPoint(metric.labels, value)}} ${value.value}`)

      if (value.labels[0] === '+Inf') {
        value.labels.shift() // Remove the le label
        lines.push(`${countMetricName}{${this.getLabelValueMapForDataPoint(labelsWithoutLe, value)}} ${value.value}`)

        // The sum of the observed values e.g. the total latency in seconds
        lines.push(`${sumMetricName}{${this.getLabelValueMapForDataPoint(labelsWithoutLe, value)}} ${value.sum}`)
      }
    })

    return lines
  }

  /**
   * Get the header metric section which contains the help message and the type of the metric.
   * @param metricName The label of the metric
   * @param metric The metric instance
   */
  getHeaderMetricSection(metricName: string, metric: INativeMetric) {
    return [
      `# HELP ${metricName} ${metric.description}`,
      `# TYPE ${metricName} ${metric.type}`,
    ]
  }

  /**
   * Get the label value map for the data point.
   * @param labels The labels of the metric
   * @param value The value of the data point
   */
  getLabelValueMapForDataPoint(labels: string[], value: DataPointLabelValue) {
    return labels.map((label, index) => `${label}="${value.labels[index]}"`).join(',')
  }

  /**
   * Get the suffixed metric name.
   * @param metricName The label of the metric
   * @param suffix The suffix for the metric name
   */
  getSuffixedMetricName(metricName: string, suffix: MetricNameSuffix) {
    return `${metricName}_${suffix}`
  }
}

/**
 * The metric name suffix.
 */
enum MetricNameSuffix {
  /** The sum suffix for the metric name */
  Sum = 'sum',
  /** The bucket suffix for the metric name */
  Bucket = 'bucket',
  /** The count suffix for the metric name */
  Total = 'total',
}
