import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Trophy, Target, Zap, Heart, Star } from 'lucide-react'

interface GameObject {
  id: string
  x: number
  y: number
  type: 'fish' | 'raindrop' | 'powerup'
  speed: number
  size: number
}

interface Cat {
  x: number
  y: number
  lives: number
  direction: 'left' | 'right' | 'idle'
  isJumping: boolean
  powerUpActive: boolean
}

interface IntegratedGameViewProps {
  isActive: boolean
  reps: number
  gameScore: number
  currentAngle: number
  formScore: number
  onScoreUpdate: (score: number) => void
}

export function IntegratedGameView({ 
  isActive, 
  reps, 
  gameScore, 
  currentAngle, 
  formScore,
  onScoreUpdate 
}: IntegratedGameViewProps) {
  const [cat, setCat] = useState<Cat>({ 
    x: 50, 
    y: 80, 
    lives: 3, 
    direction: 'idle',
    isJumping: false,
    powerUpActive: false
  })
  const [gameObjects, setGameObjects] = useState<GameObject[]>([])
  const [fishCaught, setFishCaught] = useState(0)
  const [raindropsAvoided, setRaindropsAvoided] = useState(0)
  const [gameTime, setGameTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [lastRepCount, setLastRepCount] = useState(0)
  const [curlPhase, setCurlPhase] = useState<'down' | 'up' | 'transition'>('down')
  const [gameSpeed, setGameSpeed] = useState(1)
  
  const gameLoopRef = useRef<number>()
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const lastAngleRef = useRef(currentAngle)

  // Enhanced game loop with curl-responsive mechanics
  useEffect(() => {
    if (isActive && !isPaused) {
      startGameLoop()
    } else {
      stopGameLoop()
    }

    return () => stopGameLoop()
  }, [isActive, isPaused])

  // CORE FEATURE: Direct curl motion integration
  useEffect(() => {
    if (!isActive) return

    const angleDiff = currentAngle - lastAngleRef.current
    lastAngleRef.current = currentAngle

    // Determine curl phase based on angle
    if (currentAngle > 140) {
      setCurlPhase('down')
    } else if (currentAngle < 50) {
      setCurlPhase('up')
    } else {
      setCurlPhase('transition')
    }

    // Move cat based on curl motion
    if (Math.abs(angleDiff) > 5) { // Significant movement detected
      const direction = angleDiff > 0 ? 'right' : 'left'
      const intensity = Math.min(Math.abs(angleDiff) / 10, 1) // Normalize movement intensity
      
      moveCatWithCurl(direction, intensity)
    }

    // Special actions based on curl phase
    if (curlPhase === 'up' && currentAngle < 40) {
      // Peak curl - trigger jump/special action
      triggerCatJump()
    }

    // Adjust game speed based on form score
    const speedMultiplier = 0.5 + (formScore / 100) * 1.5 // Better form = faster game
    setGameSpeed(speedMultiplier)

  }, [currentAngle, formScore, isActive, curlPhase])

  // Rep-based game events
  useEffect(() => {
    if (reps > lastRepCount) {
      setLastRepCount(reps)
      
      // Major game event on rep completion
      triggerRepReward()
      
      // Increase difficulty every 5 reps
      if (reps % 5 === 0) {
        increaseDifficulty()
      }
    }
  }, [reps, lastRepCount])

  const startGameLoop = () => {
    let lastTime = 0
    let createItemCounter = 0
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      if (deltaTime > 16) { // ~60 FPS
        updateGame(createItemCounter)
        createItemCounter++
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }

  const stopGameLoop = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
  }

  const updateGame = (frameCounter: number) => {
    setGameTime(prev => prev + 1)

    // Spawn objects based on game progression and curl activity
    const spawnRate = isActive ? 0.015 + (reps * 0.002) : 0.01
    if (Math.random() < spawnRate * gameSpeed) {
      spawnGameObject()
    }

    // Create items every other frame (like original game)
    const shouldCreateItem = frameCounter % 2 === 0

    // Update objects
    setGameObjects(prev => {
      const updated = prev
        .map(obj => ({ 
          ...obj, 
          y: obj.y + (obj.speed * gameSpeed)
        }))
        .filter(obj => {
          if (obj.y >= 100) {
            // Object fell off screen
            if (obj.type === 'raindrop') {
              setRaindropsAvoided(count => count + 1)
            }
            return false
          }
          return true
        })

      // Check collisions with enhanced detection
      const remaining = updated.filter(obj => {
        const distance = Math.abs(obj.x - cat.x) + Math.abs(obj.y - cat.y)
        const collisionThreshold = cat.isJumping ? 15 : 10 // Larger hitbox when jumping
        
        if (distance < collisionThreshold) {
          handleCollision(obj)
          return false
        }
        return true
      })

      // Add new items if needed
      if (shouldCreateItem && Math.random() < 0.3) {
        const newItem = createRandomItem()
        if (newItem) {
          remaining.push(newItem)
        }
      }

      return remaining
    })

    // Update cat state
    setCat(prev => ({
      ...prev,
      isJumping: prev.isJumping && Math.random() > 0.1, // Gradually end jump
      powerUpActive: prev.powerUpActive && Math.random() > 0.02 // Gradually end power-up
    }))
  }

  const moveCatWithCurl = (direction: 'left' | 'right', intensity: number) => {
    setCat(prev => {
      const moveAmount = 8 + (intensity * 12) // 8-20 pixel movement based on curl intensity
      const newX = direction === 'left' 
        ? Math.max(5, prev.x - moveAmount)
        : Math.min(95, prev.x + moveAmount)
      
      return {
        ...prev,
        x: newX,
        direction
      }
    })
  }

  const triggerCatJump = () => {
    setCat(prev => ({
      ...prev,
      isJumping: true,
      y: 70 // Jump up slightly
    }))
    
    // Return to ground after jump
    setTimeout(() => {
      setCat(prev => ({ ...prev, y: 80 }))
    }, 300)
  }

  const triggerRepReward = () => {
    // Spawn bonus fish on rep completion
    const bonusFish: GameObject = {
      id: `bonus-${Date.now()}`,
      x: cat.x + (Math.random() - 0.5) * 20, // Near cat position
      y: 10,
      type: 'fish',
      speed: 1.5,
      size: 1.5 // Larger bonus fish
    }
    
    setGameObjects(prev => [...prev, bonusFish])
    
    // Visual feedback
    setCat(prev => ({ ...prev, powerUpActive: true }))
  }

  const increaseDifficulty = () => {
    // Spawn power-up as reward for reaching milestone
    const powerUp: GameObject = {
      id: `powerup-${Date.now()}`,
      x: Math.random() * 80 + 10,
      y: 0,
      type: 'powerup',
      speed: 1,
      size: 1.2
    }
    
    setGameObjects(prev => [...prev, powerUp])
  }

  const createRandomItem = (): GameObject | null => {
    // Weighted spawn based on game state
    const weights = {
      fish: 0.6 + (formScore / 200), // Better form = more fish
      raindrop: 0.3 - (formScore / 400), // Better form = fewer raindrops
      powerup: 0.1
    }
    
    const random = Math.random()
    let type: GameObject['type']
    
    if (random < weights.fish) {
      type = 'fish'
    } else if (random < weights.fish + weights.raindrop) {
      type = 'raindrop'
    } else {
      type = 'powerup'
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 80 + 10,
      y: 0,
      type,
      speed: 0.8 + Math.random() * 1.2,
      size: 1
    }
  }

  const spawnGameObject = () => {
    const newItem = createRandomItem()
    if (newItem) {
      setGameObjects(prev => [...prev, newItem])
    }
  }

  const handleCollision = (obj: GameObject) => {
    switch (obj.type) {
      case 'fish':
        setFishCaught(prev => prev + 1)
        const fishPoints = Math.round(15 * obj.size * (cat.powerUpActive ? 2 : 1))
        onScoreUpdate(gameScore + fishPoints)
        
        // Play success sound effect (if audio enabled)
        playCollisionSound('success')
        break
        
      case 'raindrop':
        if (!cat.powerUpActive) { // Power-up provides temporary immunity
          setCat(prev => ({ ...prev, lives: Math.max(0, prev.lives - 1) }))
          playCollisionSound('damage')
        }
        break
        
      case 'powerup':
        onScoreUpdate(gameScore + 50)
        setCat(prev => ({ 
          ...prev, 
          lives: Math.min(5, prev.lives + 1),
          powerUpActive: true
        }))
        playCollisionSound('powerup')
        break
    }
  }

  const playCollisionSound = (type: 'success' | 'damage' | 'powerup') => {
    // Simple audio feedback using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      switch (type) {
        case 'success':
          oscillator.frequency.value = 800
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
          break
        case 'damage':
          oscillator.frequency.value = 200
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          break
        case 'powerup':
          oscillator.frequency.value = 1200
          gainNode.gain.setValueAtTime(0.25, audioContext.currentTime)
          break
      }
      
      oscillator.type = 'sine'
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      // Fallback for browsers without Web Audio API
      console.log(`${type} sound would play here`)
    }
  }

  const resetGame = () => {
    setCat({ x: 50, y: 80, lives: 3, direction: 'idle', isJumping: false, powerUpActive: false })
    setGameObjects([])
    setFishCaught(0)
    setRaindropsAvoided(0)
    setGameTime(0)
    setLastRepCount(0)
    setGameSpeed(1)
    onScoreUpdate(0)
  }

  const getObjectEmoji = (obj: GameObject) => {
    const baseSize = obj.size || 1
    const style = {
      fontSize: `${baseSize * 1.2}em`,
      filter: obj.type === 'powerup' ? 'drop-shadow(0 0 8px gold)' : 'none'
    }
    
    switch (obj.type) {
      case 'fish':
        return <span style={style}>🐟</span>
      case 'raindrop':
        return <span style={style}>💧</span>
      case 'powerup':
        return <span style={style}>⭐</span>
      default:
        return <span style={style}>❓</span>
    }
  }

  const getCatEmoji = () => {
    if (cat.powerUpActive) return '😸' // Happy cat with power-up
    if (cat.isJumping) return '🙀' // Surprised jumping cat
    if (cat.direction === 'left') return '😺' // Smiling cat moving left
    if (cat.direction === 'right') return '😸' // Happy cat moving right
    return '😺' // Default happy cat
  }

  const getCurlPhaseIndicator = () => {
    switch (curlPhase) {
      case 'up':
        return { color: 'text-green-500', text: 'CURL UP', icon: '↑' }
      case 'down':
        return { color: 'text-blue-500', text: 'EXTEND', icon: '↓' }
      case 'transition':
        return { color: 'text-yellow-500', text: 'MOVING', icon: '↔' }
    }
  }

  const phaseIndicator = getCurlPhaseIndicator()

  return (
    <div className="glass-card p-4 sm:p-6 neon-border">
      {/* Enhanced Game Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
            🎮 Classic Curl Game
            <span className={`ml-2 text-sm ${phaseIndicator.color} font-mono`}>
              {phaseIndicator.icon} {phaseIndicator.text}
            </span>
          </h2>
          <p className="text-gray-600 text-sm">
            Your bicep curls control the cat in real-time! 
            <span className="text-purple-600 font-medium ml-1">
              Speed: {gameSpeed.toFixed(1)}x
            </span>
          </p>
        </div>
        
        {/* Enhanced Game Stats */}
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-1 glass-morphic px-2 py-1 rounded-lg">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-gray-800 font-medium">{fishCaught}</span>
          </div>
          <div className="flex items-center space-x-1 glass-morphic px-2 py-1 rounded-lg">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-800 font-medium">{gameScore}</span>
          </div>
          <div className="flex items-center space-x-1 glass-morphic px-2 py-1 rounded-lg">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-gray-800 font-medium">{cat.lives}</span>
          </div>
          <div className="flex items-center space-x-1 glass-morphic px-2 py-1 rounded-lg">
            <span className="text-gray-600 text-xs">Avoided:</span>
            <span className="text-gray-800 font-medium">{raindropsAvoided}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Game Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-b from-sky-300 to-blue-500 rounded-2xl overflow-hidden relative glass-morphic-strong ${
          isActive ? 'neon-glow' : ''
        }`}
        style={{ height: '350px' }}
        ref={gameAreaRef}
      >
        {/* Game Controls */}
        <div className="absolute top-2 left-2 z-10 flex space-x-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center space-x-1 px-2 py-1 glass-morphic text-gray-800 rounded-xl text-xs transition-all interactive-scale"
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
          <button
            onClick={resetGame}
            className="flex items-center space-x-1 px-2 py-1 glass-morphic text-gray-800 rounded-xl text-xs transition-all interactive-scale"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Enhanced Rep Counter with Curl Info */}
        <div className="absolute top-2 right-2 z-10 glass-morphic rounded-xl px-3 py-2">
          <div className="text-center">
            <div className="flex items-center space-x-1 text-gray-800 text-sm mb-1">
              <Zap className="w-4 h-4 text-yellow-500 neon-glow" />
              <span className="font-bold">{reps}</span>
              <span>reps</span>
            </div>
            <div className="text-xs text-gray-600">
              {currentAngle.toFixed(0)}° | {formScore}%
            </div>
          </div>
        </div>

        {/* Enhanced Cat with Power-up Effects */}
        <motion.div
          className="absolute text-2xl sm:text-3xl"
          style={{ 
            left: `${cat.x}%`, 
            top: `${cat.y}%`,
            transform: 'translate(-50%, -50%)',
            filter: cat.powerUpActive ? 'drop-shadow(0 0 10px gold)' : 'none'
          }}
          animate={{ 
            scale: cat.isJumping ? [1, 1.3, 1] : (isActive && !isPaused ? [1, 1.1, 1] : 1),
            rotate: cat.direction === 'left' ? -10 : cat.direction === 'right' ? 10 : 0,
            y: cat.isJumping ? -10 : 0
          }}
          transition={{ 
            scale: { 
              duration: cat.isJumping ? 0.3 : 0.5, 
              repeat: cat.isJumping ? 0 : (isActive && !isPaused ? Infinity : 0)
            },
            rotate: { duration: 0.3 },
            y: { duration: 0.3 }
          }}
        >
          {getCatEmoji()}
          {cat.powerUpActive && (
            <motion.div
              className="absolute -top-2 -right-2 text-sm"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ✨
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Game Objects */}
        <AnimatePresence>
          {gameObjects.map(obj => (
            <motion.div
              key={obj.id}
              className="absolute"
              style={{ 
                left: `${obj.x}%`, 
                top: `${obj.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: obj.type === 'powerup' ? 360 : 0
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                rotate: obj.type === 'powerup' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}
              }}
            >
              {getObjectEmoji(obj)}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Game State Overlays */}
        {!isActive && (
          <div className="absolute inset-0 glass-morphic-strong flex items-center justify-center">
            <div className="text-center text-gray-800 p-4">
              <h3 className="text-lg sm:text-xl font-bold mb-2">🎮 Classic Curl Game</h3>
              <p className="text-sm sm:text-base mb-3">Start your workout to control the cat with your bicep curls!</p>
              <div className="space-y-1 text-xs sm:text-sm glass-morphic p-3 rounded-lg">
                <p><strong>How it works:</strong></p>
                <p>• Your curl motion moves the cat left/right</p>
                <p>• Peak curls make the cat jump</p>
                <p>• Better form = faster gameplay</p>
                <p>• Complete reps for bonus rewards</p>
              </div>
            </div>
          </div>
        )}

        {isPaused && isActive && (
          <div className="absolute inset-0 glass-morphic-strong flex items-center justify-center">
            <div className="text-center text-gray-800">
              <h3 className="text-lg font-bold mb-2">Game Paused</h3>
              <p className="text-sm">Resume to continue the curl-controlled action</p>
            </div>
          </div>
        )}

        {cat.lives <= 0 && (
          <div className="absolute inset-0 glass-morphic-strong flex items-center justify-center">
            <div className="text-center text-gray-800 p-4">
              <h3 className="text-lg font-bold mb-2">Game Over! 😿</h3>
              <div className="space-y-1 mb-3 glass-morphic p-3 rounded-lg">
                <p className="text-sm">Fish Caught: <span className="font-bold text-yellow-600">{fishCaught}</span></p>
                <p className="text-sm">Raindrops Avoided: <span className="font-bold text-blue-600">{raindropsAvoided}</span></p>
                <p className="text-sm">Final Score: <span className="font-bold text-green-600">{gameScore}</span></p>
                <p className="text-sm">Reps Completed: <span className="font-bold text-purple-600">{reps}</span></p>
              </div>
              <button
                onClick={resetGame}
                className="px-4 py-2 neomorphic-button text-white rounded-xl text-sm transition-all interactive-scale"
              >
                🔄 Play Again
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Enhanced Game Instructions */}
      <div className="mt-4 p-3 glass-morphic rounded-2xl">
        <h4 className="text-gray-800 font-medium mb-2 text-sm flex items-center">
          <Star className="w-4 h-4 mr-1 text-yellow-500" />
          Real-Time Curl Controls
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
          <div className="space-y-1">
            <p><strong>Movement:</strong> Curl motion moves cat</p>
            <p><strong>Jump:</strong> Peak curl (angle &lt; 40&deg;)</p>
            <p><strong>Speed:</strong> Better form = faster game</p>
          </div>
          <div className="space-y-1">
            <p><strong>🐟 Fish:</strong> +15 points (x2 with power-up)</p>
            <p><strong>💧 Raindrops:</strong> -1 life (immune with power-up)</p>
            <p><strong>⭐ Power-ups:</strong> +50 points, +1 life, immunity</p>
          </div>
        </div>
      </div>
    </div>
  )
}