import type pm2 from 'pm2'
import type { createValueMapping } from './metrics'

const mibiByteConversion = 1.04858

/**
 * Gets the value from the raw metric with the mapping
 * @param data The raw metric data
 * @param mapper The value mapping for the metric
 * @returns The value from the raw metric (converted if with unit)
 */
export function getValueFromRawMetricWithMapping(data: pm2.ProcessDescription, mapper: ReturnType<typeof createValueMapping>) {
  let _value = data

  // Iterate through mapping to get the value
  for (const key of mapper.mapping) {
    // @ts-expect-error Nested pm2 object -> key used to go to the value
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    _value = _value?.[key]
  }

  // @ts-expect-error After value has been reached, it can be either be a atomic value or contain a unit
  const value: number | { unit: string; value: number | string } = _value

  if (mapper.withUnit && typeof value === 'object') {
    return convertValueWithUnit(value.value, value.unit) ?? 0
  } else {
    return getValue(value as number)
  }
}

/**
 * Gets the value from the raw metric with the mapping
 * @param value The value to convert
 * @returns The value to change to a number
 */
function getValue(value: string | number) {
  if (typeof value === 'string') {
    if (value == 'online') {
      value = 1
    } else if (value == 'stopped') {
      value = 0
    } else {
      value = isNaN(Number(value)) ? value : Number(value)
    }
  }
  return value ?? 0
}

/**
 * Converts the value with the unit convert it to bytes, milliseconds, etc.
 * @param value The value to convert
 * @param unit The unit of the value
 * @returns
 */
function convertValueWithUnit(value: number | string, unit: string) {
  value = getValue(value) as number
  unit = (unit || '').replace('req/', '').toUpperCase()
  switch (unit) {
    case 'KB':
      return value * 1024
    case 'MB':
      return value * 1024 * 1024
    case 'GB':
      return value * 1024 * 1024 * 1024
    case 'TB':
      return value * 1024 * 1024 * 1024 * 1024
    case 'KIB':
      return value * mibiByteConversion * 1024
    case 'MIB':
      return value * mibiByteConversion * 1024 * 1024
    case 'GIB':
      return value * mibiByteConversion * 1024 * 1024 * 1024
    case 'TIB':
      return value * mibiByteConversion * 1024 * 1024 * 1024 * 1024
    case 'MS':
      return value
    case 'S':
      return value * 1000
    case 'MIN':
      return value * 1000 * 60
    case 'H':
      return value * 1000 * 60 * 60
    case 'D':
      return value * 1000 * 60 * 60 * 24
    case 'W':
      return value * 1000 * 60 * 60 * 24 * 7
    case 'M':
      return value * 1000 * 60 * 60 * 24 * 30
    case 'Y':
      return value * 1000 * 60 * 60 * 24 * 365
    case '%':
      return value / 100
    default:
      return value
  }
}
