/**
 * Normalizes the name of the label to be used as a key in the labels map.
 * @param name The name of the label
 * @returns The normalized name of the label
 */
export function normalizeLabelName(name: string): Lowercase<string> {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_') as Lowercase<string>
}

/**
 * Gets the metric key from the name and labels.
 * @param name The name of the metric
 * @param labels The labels for the metric
 * @returns Composite key for the metric based on the name and labels
 */
export function getMetricKey(name: string, labels: string[]) {
  return name + (labels.length > 0 ? `{${labels.join(',')}}` : '')
}

/**
 * Gets the labels from the mapped keys
 * @param labels The mapped keys
 * @returns The labels
 */
export function getLabelsFromRecord(labels: Record<string, any>) {
  return Object.keys(labels)
}
