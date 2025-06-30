import {
  NetworkId,
  WalletId,
  WalletManager,
  WalletProvider,
} from '@txnlab/use-wallet-react'
import { WalletUIProvider } from '@txnlab/use-wallet-ui-react'
import { useState } from 'react'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { WorkoutSession } from './components/WorkoutSession'
import { Leaderboard } from './components/Leaderboard'
import { NFTGallery } from './components/NFTGallery'
import { GameLanding } from './components/GameLanding'

const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.LUTE,
    WalletId.EXODUS,
    {
      id: WalletId.WALLETCONNECT,
      options: { projectId: 'fcfde0713d43baa0d23be0773c80a72b' },
    },
  ],
  defaultNetwork: NetworkId.TESTNET,
})

type AppView = 'game' | 'workout' | 'dashboard' | 'leaderboard' | 'nfts'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('game')

  const renderView = () => {
    switch (currentView) {
      case 'game':
        return <GameLanding onStartWorkout={() => setCurrentView('workout')} />
      case 'workout':
        return <WorkoutSession onComplete={() => setCurrentView('game')} />
      case 'dashboard':
        return <Dashboard onStartWorkout={() => setCurrentView('workout')} />
      case 'leaderboard':
        return <Leaderboard />
      case 'nfts':
        return <NFTGallery />
      default:
        return <GameLanding onStartWorkout={() => setCurrentView('workout')} />
    }
  }

  return (
    <WalletProvider manager={walletManager}>
      <WalletUIProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-blue-50">
          {/* Ambient Background Effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          </div>
          
          <Header currentView={currentView} onViewChange={setCurrentView} />
          <main className="container mx-auto px-4 py-8 relative z-10">
            {renderView()}
          </main>
        </div>
      </WalletUIProvider>
    </WalletProvider>
  )
}

export default App