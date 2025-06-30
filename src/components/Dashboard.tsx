import { useWallet } from '@txnlab/use-wallet-react'
import { useAccountInfo } from '@txnlab/use-wallet-ui-react'
import { motion } from 'framer-motion'
import { Dumbbell, Trophy, Target, Zap, TrendingUp, Calendar } from 'lucide-react'
import { useUserStats } from '../hooks/useUserStats'

interface DashboardProps {
  onStartWorkout: () => void
}

export function Dashboard({ onStartWorkout }: DashboardProps) {
  const { activeAddress } = useWallet()
  const accountQuery = useAccountInfo()
  const { stats, isLoading } = useUserStats()

  if (!activeAddress) {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto glass-card p-8 floating"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 neomorphic-button flex items-center justify-center mx-auto mb-6">
            <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-4">
            Welcome to Imperfect Curl
          </h2>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">
            Connect your Algorand wallet to start tracking your bicep curls with AI-powered form analysis and earn dynamic NFTs!
          </p>
        </motion.div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Reps',
      value: stats?.totalReps || 0,
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      change: '+12 today'
    },
    {
      title: 'Current Streak',
      value: `${stats?.currentStreak || 0} days`,
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
      change: 'Keep it up!'
    },
    {
      title: 'Form Score',
      value: `${stats?.averageFormScore || 0}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      change: '+5% this week'
    },
    {
      title: 'Leaderboard Rank',
      value: `#${stats?.leaderboardRank || '--'}`,
      icon: Trophy,
      color: 'from-orange-500 to-red-500',
      change: 'Global ranking'
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8 px-3 sm:px-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 sm:py-12"
      >
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 mb-4">
          Ready to <span className="gradient-text">Curl?</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Track your bicep curls with AI-powered form analysis, earn dynamic NFTs, and compete on the global leaderboard.
        </p>
        <motion.button
          onClick={onStartWorkout}
          className="liquid-button text-white px-6 sm:px-8 py-3 sm:py-4 font-semibold text-base sm:text-lg interactive-scale"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2" />
          Start Workout Session
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4 sm:p-6 interactive-scale"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${card.color} rounded-2xl flex items-center justify-center neon-glow`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm text-green-600 font-medium">{card.change}</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{card.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Recent Activity</h2>
        <div className="space-y-3 sm:space-y-4">
          {stats?.recentSessions?.length ? (
            stats.recentSessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 sm:p-4 glass-morphic rounded-2xl">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 neomorphic-button flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-800 font-medium text-sm sm:text-base">{session.reps} reps completed</p>
                    <p className="text-gray-500 text-xs sm:text-sm">{session.date}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-green-600 font-medium text-sm sm:text-base">{session.formScore}% form</p>
                  <p className="text-gray-500 text-xs sm:text-sm">{session.duration}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-500 text-sm sm:text-base">No workout sessions yet. Start your first workout!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}