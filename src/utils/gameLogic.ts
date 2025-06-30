import { GameObject } from './weightDatabase'

export interface GameHint {
  type: 'category' | 'subcategory' | 'range' | 'precise'
  message: string
  unlockAtReps: number
}

export interface GameSession {
  startTime: number
  firstRepTime?: number
  timeRemaining: number
  hintsUnlocked: GameHint[]
  isTimerActive: boolean
}

// Generate hints for an object
export function generateHints(object: GameObject): GameHint[] {
  const hints: GameHint[] = []
  
  // Category hint (10 reps)
  if (object.emoji.includes('🐕') || object.emoji.includes('🐱')) {
    hints.push({
      type: 'category',
      message: "It's an animal",
      unlockAtReps: 10
    })
  } else if (object.emoji.includes('👶')) {
    hints.push({
      type: 'category', 
      message: "It's a person",
      unlockAtReps: 10
    })
  } else {
    hints.push({
      type: 'category',
      message: "It's an object",
      unlockAtReps: 10
    })
  }
  
  // Subcategory hint (20 reps)
  if (object.name.includes('Cat')) {
    hints.push({
      type: 'subcategory',
      message: "It's a small domestic pet",
      unlockAtReps: 20
    })
  } else if (object.name.includes('Labrador')) {
    hints.push({
      type: 'subcategory',
      message: "It's a medium-sized dog breed",
      unlockAtReps: 20
    })
  } else if (object.name.includes('German Shepherd')) {
    hints.push({
      type: 'subcategory',
      message: "It's a large working dog",
      unlockAtReps: 20
    })
  } else if (object.name.includes('Toddler')) {
    hints.push({
      type: 'subcategory',
      message: "It's a young child",
      unlockAtReps: 20
    })
  } else {
    hints.push({
      type: 'subcategory',
      message: `It's a ${object.description.toLowerCase()}`,
      unlockAtReps: 20
    })
  }
  
  // Range hint (30 reps)
  const weight = object.weight
  const rangeSize = Math.max(10, Math.floor(weight * 0.3))
  const lowerBound = Math.max(1, weight - rangeSize)
  const upperBound = weight + rangeSize
  
  hints.push({
    type: 'range',
    message: `Weight is between ${lowerBound}-${upperBound} lbs`,
    unlockAtReps: 30
  })
  
  // Precise hint (40 reps)
  const preciseRange = Math.max(2, Math.floor(weight * 0.1))
  const preciseLower = Math.max(1, weight - preciseRange)
  const preciseUpper = weight + preciseRange
  
  hints.push({
    type: 'precise',
    message: `Weight is ${preciseLower}-${preciseUpper} lbs`,
    unlockAtReps: 40
  })
  
  return hints
}

// Check which hints should be unlocked based on current reps
export function getUnlockedHints(allHints: GameHint[], currentReps: number): GameHint[] {
  return allHints.filter(hint => currentReps >= hint.unlockAtReps)
}

// Get the latest hint that was just unlocked
export function getLatestHint(allHints: GameHint[], currentReps: number, previousReps: number): GameHint | null {
  const newlyUnlocked = allHints.filter(hint => 
    currentReps >= hint.unlockAtReps && previousReps < hint.unlockAtReps
  )
  
  return newlyUnlocked.length > 0 ? newlyUnlocked[0] : null
}

// Calculate final score with bonuses and penalties
export function calculateFinalScore(
  accuracy: number,
  timeUsed: number,
  totalTime: number,
  reps: number,
  hintsUsed: number
): {
  accuracyScore: number
  timeBonus: number
  repEfficiency: number
  hintPenalty: number
  finalScore: number
} {
  const accuracyScore = Math.round(accuracy)
  
  // Time bonus: finish early = bonus points (max 20 points)
  const timeBonus = Math.round(Math.max(0, (totalTime - timeUsed) / totalTime * 20))
  
  // Rep efficiency: fewer reps for same accuracy = bonus (max 15 points)
  const repEfficiency = Math.round(Math.max(0, (50 - reps) / 50 * 15))
  
  // Hint penalty: -2 points per hint used
  const hintPenalty = hintsUsed * 2
  
  const finalScore = Math.max(0, accuracyScore + timeBonus + repEfficiency - hintPenalty)
  
  return {
    accuracyScore,
    timeBonus,
    repEfficiency,
    hintPenalty,
    finalScore
  }
}

// Check if session meets minimum requirements
export function isValidSession(reps: number, timeUsed: number): { valid: boolean; reason?: string } {
  if (reps < 5) {
    return { valid: false, reason: 'Minimum 5 reps required' }
  }
  
  if (timeUsed < 10) {
    return { valid: false, reason: 'Session too short' }
  }
  
  return { valid: true }
}
