/**
 * Normalizes the name of the label to be used as a key in the labels map.
 * @param name The name of the label
 * @returns The normalized name of the label
 */
export function normalizeLabelName(name: string): Lowercase<string> {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_') as Lowercase<string>
}
