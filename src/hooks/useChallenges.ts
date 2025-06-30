import { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

interface Challenge {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  requiredReps: number
  requiredAccuracy: number
  reward: {
    type: 'NFT' | 'Token'
    name: string
    amount: number
  }
  status: 'active' | 'completed' | 'expired'
  userProgress: {
    reps: number
    bestAccuracy: number
  }
}

export function useChallenges() {
  const { activeAddress } = useWallet()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (activeAddress) {
      fetchChallenges()
    } else {
      setChallenges([])
      setIsLoading(false)
    }
  }, [activeAddress])

  const fetchChallenges = async () => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual Algorand smart contract queries
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - replace with real blockchain data
      const mockChallenges: Challenge[] = [
        {
          id: 'ch1',
          name: 'Weekly Curl Challenge',
          description: 'Achieve 100 reps with at least 80% accuracy in one week to earn a special NFT.',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
          requiredReps: 100,
          requiredAccuracy: 80,
          reward: {
            type: 'NFT',
            name: 'Challenge Champion',
            amount: 1
          },
          status: 'active',
          userProgress: {
            reps: 0,
            bestAccuracy: 0
          }
        }
      ]
      
      setChallenges(mockChallenges)
    } catch (error) {
      console.error('Error fetching challenges:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitChallengeProgress = async (challengeId: string, reps: number, accuracy: number) => {
    try {
      // Here you would call the Algorand smart contract to submit progress and claim rewards
      console.log('Submitting challenge progress:', challengeId, reps, accuracy)
      
      setChallenges(prev => 
        prev.map(challenge => 
          challenge.id === challengeId 
            ? { 
                ...challenge, 
                userProgress: { 
                  reps: Math.max(challenge.userProgress.reps, reps),
                  bestAccuracy: Math.max(challenge.userProgress.bestAccuracy, accuracy)
                },
                status: reps >= challenge.requiredReps && accuracy >= challenge.requiredAccuracy ? 'completed' : challenge.status
              }
            : challenge
        )
      )
    } catch (error) {
      console.error('Error submitting challenge progress:', error)
    }
  }

  return { challenges, isLoading, refetch: fetchChallenges, submitChallengeProgress }
}
