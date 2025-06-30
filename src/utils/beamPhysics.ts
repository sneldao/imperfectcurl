// Physics calculations for the balance beam

export interface BeamState {
  leftWeight: number
  rightWeight: number
  rotation: number // in radians
  isBalanced: boolean
  balanceAccuracy: number
}

// Calculate beam rotation based on weights
export function calculateBeamRotation(leftWeight: number, rightWeight: number): number {
  const maxRotation = Math.PI / 6 // 30 degrees max
  const weightDifference = rightWeight - leftWeight
  const totalWeight = leftWeight + rightWeight || 1
  
  // Normalize the difference and apply rotation
  const normalizedDiff = weightDifference / totalWeight
  return normalizedDiff * maxRotation
}

// Check if beam is balanced within tolerance
export function isBeamBalanced(leftWeight: number, rightWeight: number, tolerance: number = 0.1): boolean {
  const totalWeight = leftWeight + rightWeight || 1
  const difference = Math.abs(leftWeight - rightWeight)
  return (difference / totalWeight) <= tolerance
}

// Calculate balance accuracy percentage
export function calculateBalanceAccuracy(leftWeight: number, rightWeight: number): number {
  const difference = Math.abs(leftWeight - rightWeight)
  const average = (leftWeight + rightWeight) / 2 || 1
  const accuracy = Math.max(0, 100 - (difference / average) * 100)
  return Math.round(accuracy * 10) / 10
}

// Get beam state for rendering
export function getBeamState(leftWeight: number, rightWeight: number): BeamState {
  const rotation = calculateBeamRotation(leftWeight, rightWeight)
  const isBalanced = isBeamBalanced(leftWeight, rightWeight)
  const balanceAccuracy = calculateBalanceAccuracy(leftWeight, rightWeight)
  
  return {
    leftWeight,
    rightWeight,
    rotation,
    isBalanced,
    balanceAccuracy
  }
}

// Smooth rotation transition for animations
export function smoothRotation(currentRotation: number, targetRotation: number, deltaTime: number, speed: number = 5): number {
  const difference = targetRotation - currentRotation
  const maxChange = speed * deltaTime
  
  if (Math.abs(difference) <= maxChange) {
    return targetRotation
  }
  
  return currentRotation + Math.sign(difference) * maxChange
}
