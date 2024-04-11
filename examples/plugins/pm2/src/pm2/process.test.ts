// Import the function to test
import { vi, describe, it, expect } from 'vitest'
import { allocateRandomMemory } from './process.js'

// Mock console.log to prevent output during tests
console.log = vi.fn()

describe('allocateRandomMemory', () => {
  it('should allocate memory of random size', () => {
    const result = allocateRandomMemory()
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThanOrEqual(0)
    expect(result.length).toBeLessThanOrEqual(1000000) // Maximum size of 1MB
    expect(console.log).toHaveBeenCalledWith(`Allocated ${result.length} bytes of memory`)
  })
})
