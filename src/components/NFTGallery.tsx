import { motion } from 'framer-motion'
import { Image, Zap, Trophy, Star, ExternalLink } from 'lucide-react'
import { useUserNFTs } from '../hooks/useUserNFTs'

export function NFTGallery() {
  const { nfts, isLoading } = useUserNFTs()

  const evolutionStages = [
    { name: 'Beginner Curler', reps: 0, emoji: '💪', rarity: 'Common' },
    { name: 'Dedicated Lifter', reps: 50, emoji: '🏋️', rarity: 'Uncommon' },
    { name: 'Form Master', reps: 200, emoji: '🎯', rarity: 'Rare' },
    { name: 'Curl Champion', reps: 500, emoji: '🏆', rarity: 'Epic' },
    { name: 'Perfect Curler', reps: 1000, emoji: '⚡', rarity: 'Legendary' }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return 'from-gray-500 to-gray-600'
      case 'Uncommon':
        return 'from-green-500 to-green-600'
      case 'Rare':
        return 'from-blue-500 to-blue-600'
      case 'Epic':
        return 'from-purple-500 to-purple-600'
      case 'Legendary':
        return 'from-yellow-500 to-orange-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your NFT collection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">NFT Collection</span>
        </h1>
        <p className="text-gray-300 text-lg">Dynamic NFTs that evolve with your fitness journey</p>
      </motion.div>

      {/* Current NFT */}
      {nfts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-8 border border-purple-500/30"
        >
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-8xl shadow-2xl">
                {nfts[0].emoji}
              </div>
              <div className={`absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r ${getRarityColor(nfts[0].rarity)} rounded-full text-white text-sm font-bold`}>
                {nfts[0].rarity}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">{nfts[0].name}</h2>
              <p className="text-gray-300 mb-6">{nfts[0].description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">Total Reps</p>
                  <p className="text-white font-bold text-lg">{nfts[0].totalReps}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">Streak</p>
                  <p className="text-white font-bold text-lg">{nfts[0].streak} days</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">Form Score</p>
                  <p className="text-white font-bold text-lg">{nfts[0].formScore}%</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">Level</p>
                  <p className="text-white font-bold text-lg">{nfts[0].level}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all">
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Explorer</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
                  <Zap className="w-4 h-4" />
                  <span>Update Metadata</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Evolution Path */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Evolution Path</h2>
        
        <div className="space-y-4">
          {evolutionStages.map((stage, index) => {
            const isUnlocked = nfts.length > 0 && nfts[0].totalReps >= stage.reps
            const isCurrent = nfts.length > 0 && nfts[0].name === stage.name
            
            return (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50'
                    : isUnlocked
                    ? 'bg-white/10'
                    : 'bg-white/5 opacity-50'
                }`}
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${
                  isUnlocked ? `bg-gradient-to-r ${getRarityColor(stage.rarity)}` : 'bg-gray-600'
                }`}>
                  {isUnlocked ? stage.emoji : '🔒'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-white font-semibold">{stage.name}</h3>
                    {isCurrent && <Star className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <p className="text-gray-300 text-sm">
                    {stage.reps === 0 ? 'Starting point' : `Unlock at ${stage.reps} reps`}
                  </p>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 bg-gradient-to-r ${getRarityColor(stage.rarity)} text-white`}>
                    {stage.rarity}
                  </div>
                </div>
                
                {isUnlocked && (
                  <div className="text-green-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* NFT Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">Dynamic Updates</h3>
          <p className="text-gray-300 text-sm">Your NFT automatically updates as you complete more reps and improve your form</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">Verifiable Progress</h3>
          <p className="text-gray-300 text-sm">All your fitness achievements are permanently recorded on the Algorand blockchain</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">Unique Rarity</h3>
          <p className="text-gray-300 text-sm">Each evolution stage has different rarity levels, making your NFT truly unique</p>
        </motion.div>
      </div>
    </div>
  )
}