import { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

interface LeaderboardEntry {
  id: string
  name: string
  totalReps: number
  formScore: number
  streak: number
  recentAchievement: string
}

interface UserRank {
  rank: number
  totalReps: number
}

export function useLeaderboard() {
  const { activeAddress } = useWallet()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<UserRank | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [activeAddress])

  const fetchLeaderboard = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call - replace with actual Algorand blockchain queries
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - replace with real blockchain data
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          id: '1',
          name: 'CurlMaster2024',
          totalReps: 1247,
          formScore: 96,
          streak: 28,
          recentAchievement: 'Perfect Form Streak'
        },
        {
          id: '2',
          name: 'FlexGuru',
          totalReps: 1156,
          formScore: 94,
          streak: 21,
          recentAchievement: '1000 Rep Milestone'
        },
        {
          id: '3',
          name: 'BicepBeast',
          totalReps: 1089,
          formScore: 92,
          streak: 15,
          recentAchievement: 'Form Master Badge'
        },
        {
          id: '4',
          name: 'IronArms',
          totalReps: 987,
          formScore: 90,
          streak: 12,
          recentAchievement: 'Consistency King'
        },
        {
          id: '5',
          name: 'CurlQueen',
          totalReps: 876,
          formScore: 89,
          streak: 18,
          recentAchievement: 'Weekly Champion'
        },
        {
          id: '6',
          name: 'FlexFighter',
          totalReps: 743,
          formScore: 87,
          streak: 9,
          recentAchievement: 'Rising Star'
        },
        {
          id: '7',
          name: 'MuscleBuilder',
          totalReps: 692,
          formScore: 85,
          streak: 7,
          recentAchievement: 'Dedication Award'
        },
        {
          id: '8',
          name: 'PowerLifter',
          totalReps: 634,
          formScore: 83,
          streak: 11,
          recentAchievement: 'Comeback Kid'
        }
      ]
      
      setLeaderboard(mockLeaderboard)
      
      // Mock user rank
      if (activeAddress) {
        setUserRank({
          rank: 23,
          totalReps: 247
        })
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { leaderboard, userRank, isLoading, refetch: fetchLeaderboard }
}