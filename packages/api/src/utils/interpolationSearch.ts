/**
 * Finds the index of the element which value is the closest to the target
 * @param arr - An array of numbers to search from
 * @param target - The target number to find
 * @returns The index of the closest to the target value array element
 */

export function interpolationSearch(arr: number[], target: number): number {
  let left = 0
  let right = arr.length - 1
  while (left < right) {
    const rangeDelta = arr[right] - arr[left]
    const indexDelta = right - left
    const valueDelta = target - arr[left]
    if (valueDelta < 0) {
      throw new Error('Unable to find text node')
    }
    if (!rangeDelta) {
      return left
    }
    const middleIndex =
      left + Math.floor((valueDelta * indexDelta) / rangeDelta)
    if (target < arr[middleIndex]) {
      right = middleIndex
    } else if (target >= arr[middleIndex + 1]) {
      left = middleIndex + 1
    } else {
      return middleIndex
    }
  }
  throw new Error('Unable to find text node')
}
