import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CameraOff, Play, Pause, Square, Mic, MicOff, Gamepad2, AlertCircle, Maximize2, Minimize2 } from 'lucide-react'
import { PoseDetector } from '../utils/poseDetection'
import { CurlBalanceGame } from './CurlBalanceGame'
import { FormFeedback } from './FormFeedback'
import { SessionStats } from './SessionStats'

interface WorkoutSessionProps {
  onComplete: () => void
}

export function WorkoutSession({ onComplete }: WorkoutSessionProps) {
  const [isActive, setIsActive] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [gameEnabled, setGameEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reps, setReps] = useState(0)
  const [currentAngle, setCurrentAngle] = useState(0)
  const [formScore, setFormScore] = useState(100)
  const [sessionTime, setSessionTime] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [gameScore, setGameScore] = useState(0)
  const [poseDetectionStatus, setPoseDetectionStatus] = useState<'loading' | 'ready' | 'error' | 'fallback'>('loading')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const poseDetectorRef = useRef<PoseDetector | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive])

  const startCamera = async () => {
    try {
      setPoseDetectionStatus('loading')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
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
        
        // Initialize enhanced pose detector
        poseDetectorRef.current = new PoseDetector(
          videoRef.current,
          canvasRef.current!,
          {
            onRepDetected: () => {
              setReps(prev => prev + 1)
              setGameScore(prev => prev + 15) // Increased points for reps
              
              // Enhanced audio feedback
              if (audioEnabled) {
                playRepSound()
              }
            },
            onAngleUpdate: setCurrentAngle,
            onFormScoreUpdate: setFormScore,
            onFeedbackUpdate: (newFeedback) => {
              setFeedback(newFeedback)
              
              // Enhanced voice feedback
              if (audioEnabled && 'speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(newFeedback)
                utterance.volume = 0.4
                utterance.rate = 1.1
                utterance.pitch = 1.1
                speechSynthesis.speak(utterance)
              }
            },
            onGameAction: () => setGameScore(prev => prev + 8)
          }
        )
        
        try {
          await poseDetectorRef.current.initialize()
          setPoseDetectionStatus('ready')
          setFeedback('🚀 Enhanced MediaPipe pose detection ready! AI is tracking your form with high precision.')
        } catch (error) {
          console.warn('MediaPipe failed, using enhanced fallback simulation:', error)
          setPoseDetectionStatus('fallback')
          setFeedback('🎯 Using enhanced simulation mode. For best results, ensure good lighting and full body visibility.')
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setPoseDetectionStatus('error')
      setFeedback('📷 Camera access denied. Please enable camera permissions and refresh the page.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraEnabled(false)
    setPoseDetectionStatus('loading')
    poseDetectorRef.current?.cleanup()
  }

  const toggleSession = () => {
    if (!isActive && !cameraEnabled) {
      startCamera()
    }
    setIsActive(!isActive)
    
    if (poseDetectorRef.current) {
      if (!isActive) {
        poseDetectorRef.current.start()
      } else {
        poseDetectorRef.current.stop()
      }
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const endSession = () => {
    setIsActive(false)
    stopCamera()
    
    const sessionData = {
      reps,
      formScore,
      sessionTime,
      gameScore,
      timestamp: new Date().toISOString()
    }
    
    console.log('Enhanced session completed:', sessionData)
    
    setFeedback(`🎉 Outstanding workout! You completed ${reps} reps with ${formScore}% average form score and earned ${gameScore} game points! Your technique is improving!`)
    
    setTimeout(() => onComplete(), 2500)
  }

  const playRepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create a more pleasant rep sound
      const oscillator1 = audioContext.createOscillator()
      const oscillator2 = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator1.frequency.value = 800
      oscillator2.frequency.value = 1200
      oscillator1.type = 'sine'
      oscillator2.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator1.start(audioContext.currentTime)
      oscillator2.start(audioContext.currentTime + 0.05)
      oscillator1.stop(audioContext.currentTime + 0.2)
      oscillator2.stop(audioContext.currentTime + 0.25)
    } catch (error) {
      console.log('Rep sound would play here')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = () => {
    switch (poseDetectionStatus) {
      case 'ready': return 'text-green-600'
      case 'fallback': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = () => {
    switch (poseDetectionStatus) {
      case 'loading': return 'Initializing Enhanced AI...'
      case 'ready': return 'MediaPipe Pro Ready'
      case 'fallback': return 'Enhanced Simulation'
      case 'error': return 'Camera Error'
      default: return 'Loading...'
    }
  }

  return (
    <div ref={containerRef} className={`max-w-7xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 ${isFullscreen ? 'h-screen overflow-hidden' : ''}`}>
      {/* Enhanced Session Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-hero text-gray-900 mb-1 sm:mb-2">
              🚀 <span className="gradient-text">Enhanced AI Workout</span>
            </h1>
            <div className="flex items-center space-x-3">
              <p className="text-body text-gray-700 text-sm sm:text-base font-medium">
                Advanced pose detection with real-time form analysis and gamification
              </p>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  poseDetectionStatus === 'ready' ? 'bg-green-500 neon-glow-success animate-pulse' :
                  poseDetectionStatus === 'fallback' ? 'bg-yellow-500 animate-pulse' :
                  poseDetectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400 animate-spin'
                }`}></div>
                <span className={`text-xs font-bold ${getStatusColor()}`}>{getStatusText()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-3 rounded-2xl transition-all interactive-scale glass-morphic text-gray-700"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <button
              onClick={() => setGameEnabled(!gameEnabled)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-2xl transition-all text-sm interactive-scale ${
                gameEnabled ? 'neomorphic-button text-white' : 'glass-morphic text-gray-700'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Game</span>
            </button>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 sm:p-3 rounded-2xl transition-all interactive-scale ${
                audioEnabled ? 'neomorphic-button text-white' : 'glass-morphic text-gray-700'
              }`}
            >
              {audioEnabled ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <button
              onClick={toggleSession}
              disabled={poseDetectionStatus === 'error'}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold transition-all text-sm sm:text-base interactive-scale ${
                isActive
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white neon-glow shadow-lg'
                  : poseDetectionStatus === 'error'
                  ? 'glass-morphic text-gray-400 cursor-not-allowed'
                  : 'neomorphic-button text-white shadow-lg'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Start</span>
                </>
              )}
            </button>
            <button
              onClick={endSession}
              className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 glass-morphic text-gray-700 rounded-2xl font-bold transition-all text-sm sm:text-base interactive-scale shadow-lg"
            >
              <Square className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">End</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Enhanced Camera Feed and Game */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-3 space-y-4 sm:space-y-6"
        >
          {/* Enhanced Camera Feed */}
          <div className={`glass-card p-4 sm:p-6 ${isActive ? 'neon-border pulse-glow' : 'neon-border'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-lg text-gray-900">🎯 Enhanced AI Pose Detection</h3>
              <div className="flex items-center space-x-3">
                <div className="text-xs text-gray-600 bg-white/30 px-2 py-1 rounded-lg">
                  {reps} reps | {formScore}% form | {currentAngle.toFixed(0)}°
                </div>
                {cameraEnabled && (
                  <button
                    onClick={toggleFullscreen}
                    className="p-1 glass-morphic rounded-lg interactive-scale"
                  >
                    <Maximize2 className="w-3 h-3 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            
            <div className={`relative ${isFullscreen ? 'h-[80vh]' : 'aspect-video'} bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl`}>
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
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CameraOff className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Enhanced AI Ready</h3>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                      Advanced pose detection with real-time form analysis
                    </p>
                    <button
                      onClick={startCamera}
                      className="flex items-center space-x-2 px-6 py-3 neomorphic-button text-white rounded-2xl transition-all mx-auto interactive-scale shadow-lg"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Activate Enhanced Camera</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Enhanced Status Overlays */}
              {cameraEnabled && poseDetectionStatus === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center glass-morphic">
                  <div className="text-center p-6">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm font-medium">Initializing enhanced AI pose detection...</p>
                    <p className="text-gray-500 text-xs mt-2">Loading advanced algorithms...</p>
                  </div>
                </div>
              )}

              {poseDetectionStatus === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center glass-morphic">
                  <div className="text-center p-6">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Camera Access Required</h3>
                    <p className="text-gray-600 text-sm mb-4">Enhanced pose detection needs camera access</p>
                    <button
                      onClick={startCamera}
                      className="flex items-center space-x-2 px-6 py-3 neomorphic-button text-white rounded-2xl transition-all mx-auto interactive-scale"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Retry Camera Access</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Form Feedback */}
            <FormFeedback 
              feedback={feedback}
              formScore={formScore}
              currentAngle={currentAngle}
            />
          </div>

          {/* Curl Balance Game */}
          {gameEnabled && (
            <CurlBalanceGame 
              isActive={isActive}
              reps={reps}
              currentAngle={currentAngle}
              formScore={formScore}
              onComplete={() => setGameEnabled(false)}
            />
          )}
        </motion.div>

        {/* Enhanced Session Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-1"
        >
          <SessionStats
            reps={reps}
            sessionTime={formatTime(sessionTime)}
            formScore={formScore}
            gameScore={gameScore}
            isActive={isActive}
          />
        </motion.div>
      </div>
    </div>
  )
}