import { useState, useEffect } from 'react'

interface UserProfile {
  weightPerRep: number
  totalSessions: number
  bestAccuracy: number
  averageAccuracy: number
  lastSessionDate: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  totalReps: number
}

const STORAGE_KEY = 'curl_balance_user_profile'

const defaultProfile: UserProfile = {
  weightPerRep: 10,
  totalSessions: 0,
  bestAccuracy: 0,
  averageAccuracy: 0,
  lastSessionDate: '',
  skillLevel: 'beginner',
  totalReps: 0
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile
    } catch {
      return defaultProfile
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  const updateWeightPerRep = (weight: number) => {
    setProfile(prev => ({ ...prev, weightPerRep: Math.max(1, weight) }))
  }

  const recordSession = (accuracy: number, reps: number) => {
    setProfile(prev => {
      const newTotalSessions = prev.totalSessions + 1
      const newTotalReps = prev.totalReps + reps
      const newAverageAccuracy = ((prev.averageAccuracy * prev.totalSessions) + accuracy) / newTotalSessions
      
      // Determine skill level based on performance
      let newSkillLevel = prev.skillLevel
      if (newTotalSessions >= 5 && prev.averageAccuracy >= 80) {
        newSkillLevel = 'intermediate'
      }
      if (newTotalSessions >= 10 && prev.averageAccuracy >= 90) {
        newSkillLevel = 'advanced'
      }
      
      return {
        ...prev,
        totalSessions: newTotalSessions,
        totalReps: newTotalReps,
        bestAccuracy: Math.max(prev.bestAccuracy, accuracy),
        averageAccuracy: Math.round(newAverageAccuracy * 10) / 10,
        lastSessionDate: new Date().toISOString(),
        skillLevel: newSkillLevel
      }
    })
  }

  const resetProfile = () => {
    setProfile(defaultProfile)
  }

  return {
    profile,
    updateWeightPerRep,
    recordSession,
    resetProfile
  }
}
