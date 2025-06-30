import { useWallet } from '@txnlab/use-wallet-react'
import { motion } from 'framer-motion'
import { Dumbbell, Gamepad2, Zap, Target, Trophy, Star, Play, Camera, Sparkles, Settings, CameraOff } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { CatLauncherGame } from './CatLauncherGame'
import { PoseDetector } from '../utils/poseDetection'

interface GameLandingProps {
  onStartWorkout: () => void
}

export function GameLanding({ onStartWorkout }: GameLandingProps) {
  const { activeAddress } = useWallet()
  const [isGameActive, setIsGameActive] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [reps, setReps] = useState(0)
  const [currentAngle, setCurrentAngle] = useState(0)
  const [formScore, setFormScore] = useState(100)
  const [gameScore, setGameScore] = useState(0)
  const [poseDetectionStatus, setPoseDetectionStatus] = useState<'loading' | 'ready' | 'error' | 'fallback'>('loading')
  const [showSettings, setShowSettings] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const poseDetectorRef = useRef<PoseDetector | null>(null)

  const startCamera = async () => {
    try {
      setPoseDetectionStatus('loading')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        await new Promise((resolve) => {
          videoRef.current!.onloadedmetadata = () => {
            videoRef.current!.play()
            resolve(true)
          }
        })
        
        setCameraEnabled(true)
        
        poseDetectorRef.current = new PoseDetector(
          videoRef.current,
          canvasRef.current!,
          {
            onRepDetected: () => {
              setReps(prev => prev + 1)
              setGameScore(prev => prev + 10)
            },
            onAngleUpdate: setCurrentAngle,
            onFormScoreUpdate: setFormScore,
            onFeedbackUpdate: () => {},
            onGameAction: () => setGameScore(prev => prev + 5)
          }
        )
        
        try {
          await poseDetectorRef.current.initialize()
          setPoseDetectionStatus('ready')
        } catch (error) {
          console.warn('MediaPipe failed, using fallback simulation:', error)
          setPoseDetectionStatus('fallback')
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setPoseDetectionStatus('error')
    }
  }

  const stopCamera = () => {
    // Stop video stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    // Cleanup pose detector
    if (poseDetectorRef.current) {
      poseDetectorRef.current.cleanup()
      poseDetectorRef.current = null
    }
    
    setCameraEnabled(false)
    setPoseDetectionStatus('loading')
  }

  const startGame = async () => {
    if (!cameraEnabled) {
      await startCamera()
    }
    setIsGameActive(true)
    if (poseDetectorRef.current) {
      poseDetectorRef.current.start()
    }
  }

  const stopGame = () => {
    setIsGameActive(false)
    
    // Stop pose detection
    if (poseDetectorRef.current) {
      poseDetectorRef.current.stop()
    }
    
    // Stop camera and clear state
    stopCamera()
    
    // Reset game state
    setReps(0)
    setGameScore(0)
    setCurrentAngle(0)
    setFormScore(100)
  }

  const resetGame = () => {
    setReps(0)
    setGameScore(0)
    setCurrentAngle(0)
    setFormScore(100)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  if (!activeAddress) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-3 sm:px-4">
        {/* Quick Start Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <motion.div
            className="w-20 h-20 sm:w-24 sm:h-24 neomorphic-button flex items-center justify-center mx-auto mb-6 floating"
            whileHover={{ scale: 1.1 }}
          >
            <Target className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </motion.div>
          <h1 className="text-hero gradient-text mb-4">
            Imperfect Curl
          </h1>
          <p className="text-lg sm:text-xl text-body text-gray-600 mb-8 max-w-3xl mx-auto">
            The world's first <span className="font-bold text-purple-600">pinball-style fitness game</span> where your bicep curls launch cats at targets!
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 mb-6"
          >
            <h3 className="card-title text-xl text-gray-800 mb-4">🚀 Ready to Play?</h3>
            <p className="text-body text-gray-600 mb-4">
              Connect your Algorand wallet to unlock the full experience with NFT rewards and global leaderboards.
            </p>
          </motion.div>
        </motion.div>

        {/* Demo Preview */}
        <CatLauncherGame 
          isActive={false}
          reps={0}
          gameScore={0}
          currentAngle={90}
          formScore={85}
          onScoreUpdate={() => {}}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 px-3 sm:px-4">
      {/* Quick Action Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              🎯 <span className="gradient-text">Cat Launcher</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Curl to charge power, launch cats at targets! 
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {poseDetectionStatus === 'ready' ? '✓ AI Ready' : 
                 poseDetectionStatus === 'fallback' ? '⚡ Simulation' : 
                 poseDetectionStatus === 'error' ? '❌ Camera Error' : '⏳ Loading...'}
              </span>
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 glass-morphic rounded-xl interactive-scale"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            
            {!isGameActive ? (
              <motion.button
                onClick={startGame}
                className="liquid-button text-white px-6 py-3 text-lg font-bold interactive-scale"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5 inline mr-2" />
                Launch Game!
              </motion.button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={resetGame}
                  className="glass-morphic text-gray-700 px-4 py-2 rounded-xl interactive-scale"
                >
                  Reset
                </button>
                <button
                  onClick={stopGame}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl interactive-scale"
                >
                  Stop Game
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Bar */}
        {isGameActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-white/20"
          >
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{reps}</div>
                <div className="text-xs text-gray-600">Reps</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{gameScore}</div>
                <div className="text-xs text-gray-600">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{formScore}%</div>
                <div className="text-xs text-gray-600">Form</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{currentAngle.toFixed(0)}°</div>
                <div className="text-xs text-gray-600">Angle</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Main Game Area - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Camera Feed - Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className={`glass-card p-4 sm:p-6 ${isGameActive ? 'neon-border pulse-glow' : 'neon-border'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-lg text-gray-800">📹 AI Pose Detection</h3>
              <div className="flex items-center space-x-2">
                <div className="text-xs bg-white/20 px-2 py-1 rounded-lg">
                  {cameraEnabled ? 'Live Feed' : 'Camera Off'}
                </div>
                {cameraEnabled && (
                  <button
                    onClick={stopCamera}
                    className="p-1 glass-morphic rounded-lg interactive-scale"
                    title="Turn off camera"
                  >
                    <CameraOff className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {!cameraEnabled && (
                <div className="absolute inset-0 flex items-center justify-center glass-morphic">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Imperfect Curl</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Ready for your next workout!
                    </p>
                    <p className="text-gray-500 text-xs">
                      Click "Launch Game!" to start
                    </p>
                  </div>
                </div>
              )}

              {/* Game Status Overlay */}
              {isGameActive && cameraEnabled && (
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="text-white text-sm font-bold">
                    🎮 GAME ACTIVE
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {cameraEnabled ? 'Position yourself in frame for best tracking' : 'Camera ready to activate'}
              </div>
              <button
                onClick={onStartWorkout}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Full Workout Mode →
              </button>
            </div>
          </div>
        </motion.div>

        {/* Cat Launcher Game - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <CatLauncherGame 
            isActive={isGameActive}
            reps={reps}
            gameScore={gameScore}
            currentAngle={currentAngle}
            formScore={formScore}
            onScoreUpdate={setGameScore}
          />
        </motion.div>
      </div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 sm:p-6"
      >
        <h3 className="card-title text-lg text-gray-800 mb-4">🎯 Quick Start Guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="w-12 h-12 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">1</span>
            </div>
            <p className="text-gray-600">Click "Launch Game!" to start instantly</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">2</span>
            </div>
            <p className="text-gray-600">Curl to charge power, peak curl launches cat</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">3</span>
            </div>
            <p className="text-gray-600">Aim for targets, avoid obstacles, have fun!</p>
          </div>
        </div>
      </motion.div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card p-4 sm:p-6"
        >
          <h3 className="card-title text-lg text-gray-800 mb-4">⚙️ Game Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pose Detection Mode
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-lg bg-white">
                <option>Auto (Recommended)</option>
                <option>MediaPipe Only</option>
                <option>Simulation Mode</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game Difficulty
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-lg bg-white">
                <option>Easy</option>
                <option>Normal</option>
                <option>Hard</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}