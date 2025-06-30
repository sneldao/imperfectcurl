export interface GameObject {
  id: string
  name: string
  weight: number // in lbs
  emoji: string
  description: string
  color: string
}

export const dailyObjects: GameObject[] = [
  // Easy objects (10-30 lbs)
  {
    id: 'cat',
    name: 'House Cat',
    weight: 12,
    emoji: '🐱',
    description: 'A small domestic feline',
    color: '#8B4513'
  },
  {
    id: 'toddler',
    name: 'Toddler',
    weight: 25,
    emoji: '👶',
    description: 'A young child learning to walk',
    color: '#FFB6C1'
  },
  
  // Medium objects (30-70 lbs)
  {
    id: 'labrador',
    name: 'Labrador Retriever',
    weight: 65,
    emoji: '🐕',
    description: 'A friendly, medium-sized dog breed',
    color: '#D2691E'
  },
  {
    id: 'suitcase',
    name: 'Large Suitcase',
    weight: 45,
    emoji: '🧳',
    description: 'A packed travel suitcase',
    color: '#4169E1'
  },
  
  // Hard objects (70-150 lbs)
  {
    id: 'german_shepherd',
    name: 'German Shepherd',
    weight: 85,
    emoji: '🐕‍🦺',
    description: 'A large working dog breed',
    color: '#8B4513'
  },
  {
    id: 'washing_machine',
    name: 'Washing Machine',
    weight: 120,
    emoji: '🧺',
    description: 'A household laundry appliance',
    color: '#C0C0C0'
  }
]

// Get today's object based on user skill level
export function getTodaysObject(userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): GameObject {
  const today = new Date().toDateString()
  const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  
  let availableObjects: GameObject[]
  
  switch (userLevel) {
    case 'beginner':
      availableObjects = dailyObjects.filter(obj => obj.weight <= 30)
      break
    case 'intermediate':
      availableObjects = dailyObjects.filter(obj => obj.weight > 30 && obj.weight <= 70)
      break
    case 'advanced':
      availableObjects = dailyObjects.filter(obj => obj.weight > 70)
      break
    default:
      availableObjects = dailyObjects.filter(obj => obj.weight <= 30)
  }
  
  const index = seed % availableObjects.length
  return availableObjects[index]
}

// Calculate accuracy percentage
export function calculateAccuracy(targetWeight: number, actualWeight: number): number {
  const diff = Math.abs(targetWeight - actualWeight)
  const accuracy = Math.max(0, 100 - (diff / targetWeight) * 100)
  return Math.round(accuracy * 10) / 10 // Round to 1 decimal
}

// Get accuracy grade
export function getAccuracyGrade(accuracy: number): { grade: string; color: string; message: string } {
  if (accuracy >= 95) {
    return { grade: 'PERFECT!', color: '#10B981', message: 'Incredible precision!' }
  } else if (accuracy >= 85) {
    return { grade: 'EXCELLENT', color: '#059669', message: 'Outstanding balance!' }
  } else if (accuracy >= 75) {
    return { grade: 'GREAT', color: '#F59E0B', message: 'Well done!' }
  } else if (accuracy >= 60) {
    return { grade: 'GOOD', color: '#EF4444', message: 'Keep practicing!' }
  } else {
    return { grade: 'TRY AGAIN', color: '#DC2626', message: 'Better luck next time!' }
  }
}
