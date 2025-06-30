import { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

interface UserNFT {
  id: string
  name: string
  description: string
  emoji: string
  rarity: string
  level: number
  totalReps: number
  streak: number
  formScore: number
  evolutionProgress: number
  metadata: {
    createdAt: string
    lastUpdated: string
    assetId: string
  }
}

export function useUserNFTs() {
  const { activeAddress } = useWallet()
  const [nfts, setNfts] = useState<UserNFT[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (activeAddress) {
      fetchUserNFTs()
    } else {
      setNfts([])
      setIsLoading(false)
    }
  }, [activeAddress])

  const fetchUserNFTs = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call - replace with actual Algorand blockchain queries
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - replace with real blockchain data
      const mockNFT: UserNFT = {
        id: '1',
        name: 'Dedicated Lifter',
        description: 'You\'ve shown dedication to your fitness journey with consistent workouts and improving form.',
        emoji: '🏋️',
        rarity: 'Uncommon',
        level: 2,
        totalReps: 247,
        streak: 5,
        formScore: 87,
        evolutionProgress: 49.4, // 247/500 * 100
        metadata: {
          createdAt: '2024-01-15',
          lastUpdated: '2024-01-20',
          assetId: 'ASA_123456789'
        }
      }
      
      setNfts([mockNFT])
    } catch (error) {
      console.error('Error fetching user NFTs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateNFTMetadata = async (nftId: string, newStats: Partial<UserNFT>) => {
    try {
      // Here you would call the Algorand smart contract to update NFT metadata
      console.log('Updating NFT metadata:', nftId, newStats)
      
      setNfts(prev => 
        prev.map(nft => 
          nft.id === nftId 
            ? { ...nft, ...newStats, metadata: { ...nft.metadata, lastUpdated: new Date().toISOString() } }
            : nft
        )
      )
    } catch (error) {
      console.error('Error updating NFT metadata:', error)
    }
  }

  return { nfts, isLoading, refetch: fetchUserNFTs, updateNFTMetadata }
}