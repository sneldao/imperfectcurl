import { motion } from 'framer-motion'
import { Trophy, Medal, Award, TrendingUp, Users, Target } from 'lucide-react'
import { useLeaderboard } from '../hooks/useLeaderboard'

export function Leaderboard() {
  const { leaderboard, userRank, isLoading } = useLeaderboard()

  const categories = [
    { id: 'reps', label: 'Total Reps', icon: Target },
    { id: 'form', label: 'Form Score', icon: TrendingUp },
    { id: 'streak', label: 'Streak Days', icon: Award }
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>
    }
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
      case 2:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/30'
      case 3:
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
      default:
        return 'from-white/5 to-white/10 border-white/10'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Global <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Leaderboard</span>
        </h1>
        <p className="text-gray-300 text-lg">Compete with curlers worldwide</p>
      </motion.div>

      {/* User Rank Card */}
      {userRank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Your Rank</h3>
                <p className="text-gray-300">Keep pushing to climb higher!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">#{userRank.rank}</p>
              <p className="text-purple-300">{userRank.totalReps} reps</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Tabs */}
      <div className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-xl p-2">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-purple-600 text-white font-medium transition-all"
            >
              <Icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          )
        })}
      </div>

      {/* Leaderboard List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Top Performers</h2>
        </div>
        
        <div className="divide-y divide-white/10">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 bg-gradient-to-r ${getRankBg(index + 1)} border-l-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-gray-300 text-sm">{user.streak} day streak</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{user.totalReps}</p>
                  <p className="text-gray-300 text-sm">{user.formScore}% form</p>
                </div>
              </div>
              
              {index < 3 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Recent Achievement</span>
                    <span className="text-green-400 font-medium">
                      {user.recentAchievement}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">1,247</p>
          <p className="text-gray-300">Active Users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">89,432</p>
          <p className="text-gray-300">Total Reps</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">87%</p>
          <p className="text-gray-300">Avg Form Score</p>
        </motion.div>
      </div>
    </div>
  )
}