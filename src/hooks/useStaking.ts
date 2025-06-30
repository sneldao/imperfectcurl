import { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

interface StakedAsset {
  id: string
  type: 'Token' | 'NFT'
  name: string
  amount: number
  stakedAt: string
  boost: {
    type: 'hintFrequency' | 'bonusPoints'
    value: number
    durationDays: number
  }
  status: 'active' | 'expired' | 'withdrawn'
}

export function useStaking() {
  const { activeAddress } = useWallet()
  const [stakedAssets, setStakedAssets] = useState<StakedAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (activeAddress) {
      fetchStakedAssets()
    } else {
      setStakedAssets([])
      setIsLoading(false)
    }
  }, [activeAddress])

  const fetchStakedAssets = async () => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual Algorand smart contract queries
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - replace with real blockchain data
      const mockStakedAssets: StakedAsset[] = [
        {
          id: 'stake1',
          type: 'Token',
          name: 'ALGO',
          amount: 10,
          stakedAt: new Date().toISOString(),
          boost: {
            type: 'hintFrequency',
            value: 20, // 20% increase in hint frequency
            durationDays: 7
          },
          status: 'active'
        }
      ]
      
      setStakedAssets(mockStakedAssets)
    } catch (error) {
      console.error('Error fetching staked assets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const stakeAsset = async (assetType: 'Token' | 'NFT', assetId: string, amount: number, boostType: 'hintFrequency' | 'bonusPoints') => {
    try {
      // Here you would call the Algorand smart contract to stake assets
      console.log('Staking asset:', assetType, assetId, amount, boostType)
      
      const newStakedAsset: StakedAsset = {
        id: `stake${Math.random().toString(36).substring(2, 7)}`,
        type: assetType,
        name: assetType === 'Token' ? 'ALGO' : 'Fitness NFT',
        amount,
        stakedAt: new Date().toISOString(),
        boost: {
          type: boostType,
          value: boostType === 'hintFrequency' ? 20 : 10, // Example values
          durationDays: 7
        },
        status: 'active'
      }
      
      setStakedAssets(prev => [...prev, newStakedAsset])
    } catch (error) {
      console.error('Error staking asset:', error)
    }
  }

  const withdrawAsset = async (stakeId: string) => {
    try {
      // Here you would call the Algorand smart contract to withdraw staked assets
      console.log('Withdrawing staked asset:', stakeId)
      
      setStakedAssets(prev => 
        prev.map(asset => 
          asset.id === stakeId 
            ? { ...asset, status: 'withdrawn' }
            : asset
        )
      )
    } catch (error) {
      console.error('Error withdrawing staked asset:', error)
    }
  }

  return { stakedAssets, isLoading, refetch: fetchStakedAssets, stakeAsset, withdrawAsset }
}
