import { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

interface UserStats {
  totalReps: number
  currentStreak: number
  averageFormScore: number
  leaderboardRank: number
  recentSessions: Array<{
    reps: number
    formScore: number
    date: string
    duration: string
  }>
}

export function useUserStats() {
  const { activeAddress } = useWallet()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (activeAddress) {
      fetchUserStats()
    } else {
      setStats(null)
      setIsLoading(false)
    }
  }, [activeAddress])

  const fetchUserStats = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call - replace with actual Algorand blockchain queries
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - replace with real blockchain data
      const mockStats: UserStats = {
        totalReps: 247,
        currentStreak: 5,
        averageFormScore: 87,
        leaderboardRank: 23,
        recentSessions: [
          {
            reps: 15,
            formScore: 92,
            date: 'Today',
            duration: '8 min'
          },
          {
            reps: 12,
            formScore: 85,
            date: 'Yesterday',
            duration: '6 min'
          },
          {
            reps: 18,
            formScore: 89,
            date: '2 days ago',
            duration: '10 min'
          }
        ]
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { stats, isLoading, refetch: fetchUserStats }
}