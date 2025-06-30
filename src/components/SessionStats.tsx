import { motion } from 'framer-motion'
import { Target, Clock, TrendingUp, Gamepad2, Zap } from 'lucide-react'

interface SessionStatsProps {
  reps: number
  sessionTime: string
  formScore: number
  gameScore: number
  isActive: boolean
}

export function SessionStats({ reps, sessionTime, formScore, gameScore, isActive }: SessionStatsProps) {
  const stats = [
    {
      label: 'Reps',
      value: reps,
      icon: Target,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Time',
      value: sessionTime,
      icon: Clock,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Form',
      value: `${formScore}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Game',
      value: gameScore,
      icon: Gamepad2,
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Session Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-4 sm:p-6 ${isActive ? 'pulse-glow' : ''}`}
      >
        <div className="flex items-center space-x-3 mb-3 sm:mb-4">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse neon-glow-success' : 'bg-gray-400'}`}></div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            {isActive ? 'Session Active' : 'Session Paused'}
          </h2>
        </div>
        
        {isActive && (
          <div className="flex items-center space-x-2 text-green-600">
            <Zap className="w-4 h-4" />
            <span className="text-sm">AI tracking your form...</span>
          </div>
        )}
      </motion.div>

      {/* Stats Grid - 2x2 on mobile, single column on larger screens */}
      <div className="grid grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-3 sm:p-4 xl:p-6 interactive-scale"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center flex-shrink-0 neon-glow`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6 text-white" />
                </div>
                <div className="text-right min-w-0 flex-1 ml-2">
                  <p className="text-lg sm:text-xl xl:text-2xl font-bold text-gray-800 truncate">{stat.value}</p>
                  <p className="text-gray-600 text-xs sm:text-sm truncate">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Rep Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4 sm:p-6"
      >
        <h3 className="text-gray-800 font-medium mb-3 sm:mb-4 text-sm sm:text-base">Today's Goal</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-800">{reps}/20 reps</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 neomorphic-inset">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full neon-glow"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((reps / 20) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {reps >= 20 ? '🎉 Goal achieved!' : `${20 - reps} reps to go!`}
          </p>
        </div>
      </motion.div>

      {/* NFT Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 sm:p-6"
      >
        <h3 className="text-gray-800 font-medium mb-3 sm:mb-4 text-sm sm:text-base">NFT Evolution</h3>
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-3 floating">
            <span className="text-lg sm:text-2xl">💪</span>
          </div>
          <p className="text-gray-800 font-medium text-sm sm:text-base">Beginner Curler</p>
          <p className="text-gray-600 text-xs sm:text-sm">Complete 50 reps to evolve</p>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-2 neomorphic-inset">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1 rounded-full neon-glow"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((reps / 50) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}