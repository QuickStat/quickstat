// IMPORTANT: NOT RELEVANT -> A demo process allocating and deallocating memory for stats change

/**
 * Allocates random memory
 */
export function allocateRandomMemory() {
  const size = Math.floor(Math.random() * 1000000) // Random size up to 1MB
  const arr = new Array(size).fill('x') as string[] // Allocate memory
  console.log(`Allocated ${size} bytes of memory`)
  return arr
}

/**
 * Crash with an unsafe exit code
 */
/* function crash() {
  process.exit(5)
}
 */
/**
 * Calls allocateRandomMemory every 2 seconds, gc will deallocate the memory
 * and the process will eventually crash
 */
function main(): void {
  let crashAfterIterations = Math.random() * 100

  setInterval(() => {
    const res = allocateRandomMemory()
    console.log('Memory allocated', res.length)
    crashAfterIterations--

    if (crashAfterIterations <= 0) {
      // crash();
    }
  }, 2000) // Allocate every 2 seconds
}

main()
