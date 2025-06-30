import { WalletButton } from '@txnlab/use-wallet-ui-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { Dumbbell, Trophy, Image, BarChart3, Gamepad2 } from 'lucide-react'
import { motion } from 'framer-motion'

type AppView = 'game' | 'workout' | 'dashboard' | 'leaderboard' | 'nfts'

interface HeaderProps {
  currentView: AppView
  onViewChange: (view: AppView) => void
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { activeAddress } = useWallet()

  const navItems = [
    { id: 'game', label: 'Game', icon: Gamepad2 },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'nfts', label: 'NFTs', icon: Image },
  ] as const

  return (
    <header className="frosted-nav sticky top-0 z-50 safe-area-top">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-8 min-w-0">
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => onViewChange('game')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 neomorphic-button flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="nav-title text-lg sm:text-2xl gradient-text truncate">
                Imperfect Curl
              </h1>
            </motion.div>

            {activeAddress && (
              <nav className="hidden sm:flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => onViewChange(item.id as AppView)}
                      className={`nav-item flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-2xl transition-all text-sm interactive-scale ${
                        currentView === item.id
                          ? 'neomorphic-button text-white'
                          : 'glass-morphic text-gray-700 hover:text-gray-900'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </motion.button>
                  )
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="scale-75 sm:scale-100 origin-right">
              <WalletButton />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {activeAddress && (
          <div className="sm:hidden pb-3 border-t border-white/10 mt-3">
            <div className="flex justify-between space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as AppView)}
                    className={`nav-item flex flex-col items-center space-y-1 px-2 py-2 rounded-2xl transition-all flex-1 interactive-scale ${
                      currentView === item.id
                        ? 'neomorphic-button text-white'
                        : 'glass-morphic text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}