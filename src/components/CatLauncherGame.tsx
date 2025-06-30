import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Trophy, Target, Zap, Heart, Star, Power, Volume2, VolumeX } from 'lucide-react'

interface GameObject {
  id: string
  x: number
  y: number
  type: 'fish' | 'raindrop' | 'powerup' | 'target'
  points: number
  size: number
  hit?: boolean
}

interface CatProjectile {
  id: string
  x: number
  y: number
  velocityX: number
  velocityY: number
  power: number
  trail: Array<{ x: number; y: number }>
}

interface CatLauncherGameProps {
  isActive: boolean
  reps: number
  gameScore: number
  currentAngle: number
  formScore: number
  onScoreUpdate: (score: number) => void
}

export function CatLauncherGame({ 
  isActive, 
  reps, 
  gameScore, 
  currentAngle, 
  formScore,
  onScoreUpdate 
}: CatLauncherGameProps) {
  const [powerLevel, setPowerLevel] = useState(0)
  const [isCharging, setIsCharging] = useState(false)
  const [launchAngle, setLaunchAngle] = useState(45)
  const [gameObjects, setGameObjects] = useState<GameObject[]>([])
  const [catProjectiles, setCatProjectiles] = useState<CatProjectile[]>([])
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [targetsHit, setTargetsHit] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [lastRepCount, setLastRepCount] = useState(0)
  const [curlPhase, setCurlPhase] = useState<'down' | 'up' | 'transition'>('down')
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const gameLoopRef = useRef<number>()
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const lastAngleRef = useRef(currentAngle)

  // CORE FEATURE: Bicep curl controls power charging
  useEffect(() => {
    if (!isActive) return

    const angleDiff = currentAngle - lastAngleRef.current
    lastAngleRef.current = currentAngle

    // Determine curl phase
    if (currentAngle > 140) {
      setCurlPhase('down')
    } else if (currentAngle < 50) {
      setCurlPhase('up')
    } else {
      setCurlPhase('transition')
    }

    // Power charging based on curl motion
    if (Math.abs(angleDiff) > 3) { // Active curling motion
      if (!isCharging && curlPhase === 'down') {
        // Start charging on downward motion
        setIsCharging(true)
        setPowerLevel(0)
      }
      
      if (isCharging) {
        // Increase power based on curl speed and form
        const powerIncrease = (Math.abs(angleDiff) / 10) * (formScore / 100) * 2
        setPowerLevel(prev => Math.min(100, prev + powerIncrease))
      }
    }

    // Launch on peak curl (upward motion)
    if (curlPhase === 'up' && currentAngle < 40 && isCharging && powerLevel > 20) {
      launchCat()
    }

  }, [currentAngle, formScore, isActive, curlPhase, isCharging, powerLevel])

  // Rep-based game events
  useEffect(() => {
    if (reps > lastRepCount) {
      setLastRepCount(reps)
      
      // Bonus power on rep completion
      if (isCharging) {
        setPowerLevel(prev => Math.min(100, prev + 25))
      }
      
      // Spawn bonus targets every 5 reps
      if (reps % 5 === 0) {
        spawnBonusTargets()
      }
    }
  }, [reps, lastRepCount, isCharging])

  // Game loop
  useEffect(() => {
    if (isActive && !isPaused) {
      startGameLoop()
    } else {
      stopGameLoop()
    }

    return () => stopGameLoop()
  }, [isActive, isPaused])

  // Initialize targets
  useEffect(() => {
    if (isActive && gameObjects.length === 0) {
      generateLevel()
    }
  }, [isActive])

  const startGameLoop = () => {
    const gameLoop = (currentTime: number) => {
      updateGame()
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }

  const stopGameLoop = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
  }

  const updateGame = () => {
    // Update cat projectiles
    setCatProjectiles(prev => {
      return prev.map(cat => {
        // Physics simulation
        const newX = cat.x + cat.velocityX
        const newY = cat.y + cat.velocityY
        
        // Add gravity
        const newVelocityY = cat.velocityY + 0.3
        
        // Update trail
        const newTrail = [...cat.trail, { x: cat.x, y: cat.y }].slice(-8)
        
        // Check boundaries
        if (newX < 0 || newX > 100 || newY > 100) {
          return null // Remove projectile
        }
        
        return {
          ...cat,
          x: newX,
          y: newY,
          velocityY: newVelocityY,
          trail: newTrail
        }
      }).filter(Boolean) as CatProjectile[]
    })

    // Check collisions
    setCatProjectiles(prevCats => {
      const remainingCats: CatProjectile[] = []
      
      prevCats.forEach(cat => {
        let catHit = false
        
        setGameObjects(prevObjects => {
          return prevObjects.map(obj => {
            if (obj.hit) return obj
            
            const distance = Math.sqrt(
              Math.pow(cat.x - obj.x, 2) + Math.pow(cat.y - obj.y, 2)
            )
            
            if (distance < 8) {
              catHit = true
              handleCollision(obj, cat.power)
              return { ...obj, hit: true }
            }
            
            return obj
          })
        })
        
        if (!catHit) {
          remainingCats.push(cat)
        }
      })
      
      return remainingCats
    })

    // Remove hit objects after delay
    setTimeout(() => {
      setGameObjects(prev => prev.filter(obj => !obj.hit))
    }, 500)

    // Check level completion
    const activeTargets = gameObjects.filter(obj => obj.type === 'target' && !obj.hit)
    if (activeTargets.length === 0 && gameObjects.length > 0) {
      setTimeout(() => {
        nextLevel()
      }, 1000)
    }
  }

  const launchCat = () => {
    if (powerLevel < 20) return

    const power = powerLevel / 100
    const angleRad = (launchAngle * Math.PI) / 180
    
    const velocityX = Math.cos(angleRad) * power * 8
    const velocityY = -Math.sin(angleRad) * power * 8

    const newCat: CatProjectile = {
      id: `cat-${Date.now()}`,
      x: 10, // Launch from bottom left
      y: 90,
      velocityX,
      velocityY,
      power: powerLevel,
      trail: []
    }

    setCatProjectiles(prev => [...prev, newCat])
    setIsCharging(false)
    setPowerLevel(0)

    // Play launch sound
    if (soundEnabled) {
      playSound('launch', power)
    }
  }

  const handleCollision = (obj: GameObject, catPower: number) => {
    const basePoints = obj.points
    const powerBonus = Math.floor(catPower / 20) // Bonus for high power shots
    const totalPoints = basePoints + powerBonus

    switch (obj.type) {
      case 'target':
      case 'fish':
        onScoreUpdate(gameScore + totalPoints)
        setTargetsHit(prev => prev + 1)
        if (soundEnabled) {
          playSound('success', catPower / 100)
        }
        break
        
      case 'raindrop':
        setLives(prev => Math.max(0, prev - 1))
        if (soundEnabled) {
          playSound('damage', 0.5)
        }
        break
        
      case 'powerup':
        onScoreUpdate(gameScore + totalPoints)
        setLives(prev => Math.min(5, prev + 1))
        if (soundEnabled) {
          playSound('powerup', 0.8)
        }
        break
    }
  }

  const generateLevel = () => {
    const newObjects: GameObject[] = []
    
    // Generate targets based on level
    const targetCount = 3 + level
    for (let i = 0; i < targetCount; i++) {
      newObjects.push({
        id: `target-${i}`,
        x: 30 + Math.random() * 60,
        y: 20 + Math.random() * 40,
        type: 'target',
        points: 50,
        size: 1
      })
    }
    
    // Add some obstacles
    const obstacleCount = Math.floor(level / 2)
    for (let i = 0; i < obstacleCount; i++) {
      newObjects.push({
        id: `obstacle-${i}`,
        x: 20 + Math.random() * 70,
        y: 30 + Math.random() * 50,
        type: 'raindrop',
        points: -25,
        size: 1
      })
    }
    
    // Add power-ups
    if (level > 2) {
      newObjects.push({
        id: `powerup-${level}`,
        x: 40 + Math.random() * 40,
        y: 15 + Math.random() * 30,
        type: 'powerup',
        points: 100,
        size: 1.2
      })
    }
    
    setGameObjects(newObjects)
  }

  const spawnBonusTargets = () => {
    const bonusTargets: GameObject[] = []
    for (let i = 0; i < 2; i++) {
      bonusTargets.push({
        id: `bonus-${Date.now()}-${i}`,
        x: 50 + (Math.random() - 0.5) * 40,
        y: 10 + Math.random() * 20,
        type: 'fish',
        points: 75,
        size: 1.3
      })
    }
    setGameObjects(prev => [...prev, ...bonusTargets])
  }

  const nextLevel = () => {
    setLevel(prev => prev + 1)
    setLives(prev => Math.min(5, prev + 1)) // Bonus life each level
    generateLevel()
  }

  const resetGame = () => {
    setLevel(1)
    setLives(3)
    setTargetsHit(0)
    setPowerLevel(0)
    setIsCharging(false)
    setCatProjectiles([])
    setGameObjects([])
    onScoreUpdate(0)
    generateLevel()
  }

  const playSound = (type: 'launch' | 'success' | 'damage' | 'powerup', intensity: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      switch (type) {
        case 'launch':
          oscillator.frequency.value = 200 + (intensity * 400)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          break
        case 'success':
          oscillator.frequency.value = 800 + (intensity * 400)
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
          break
        case 'damage':
          oscillator.frequency.value = 150
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          break
        case 'powerup':
          oscillator.frequency.value = 1000
          gainNode.gain.setValueAtTime(0.25, audioContext.currentTime)
          break
      }
      
      oscillator.type = 'sine'
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log(`${type} sound would play here`)
    }
  }

  const getObjectEmoji = (obj: GameObject) => {
    const style = {
      fontSize: `${obj.size * 1.5}em`,
      filter: obj.hit ? 'brightness(0.5) blur(2px)' : 
              obj.type === 'powerup' ? 'drop-shadow(0 0 8px gold)' : 'none',
      transform: obj.hit ? 'scale(1.5)' : 'scale(1)',
      transition: 'all 0.3s ease'
    }
    
    switch (obj.type) {
      case 'target':
        return <span style={style}>🎯</span>
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

  const getCurlPhaseIndicator = () => {
    switch (curlPhase) {
      case 'up':
        return { color: 'text-green-600', text: 'LAUNCH!', icon: '🚀' }
      case 'down':
        return { color: 'text-blue-600', text: 'CHARGE', icon: '⚡' }
      case 'transition':
        return { color: 'text-yellow-600', text: 'READY', icon: '🎯' }
    }
  }

  const phaseIndicator = getCurlPhaseIndicator()

  return (
    <div className="glass-card p-4 sm:p-6 neon-border h-full">
      {/* Compact Game Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="game-title text-gray-900 mb-1 text-lg">
            🎯 Cat Launcher
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold ${phaseIndicator.color}`}>
              {phaseIndicator.icon} {phaseIndicator.text}
            </span>
            <div className="text-xs text-gray-600">
              Level {level} • {gameObjects.filter(obj => obj.type === 'target' && !obj.hit).length} targets
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 glass-morphic rounded-lg interactive-scale"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 glass-morphic rounded-lg interactive-scale"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={resetGame}
            className="p-2 glass-morphic rounded-lg interactive-scale"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center bg-white/10 rounded-lg p-2">
          <div className="text-lg font-bold text-blue-600">{targetsHit}</div>
          <div className="text-xs text-gray-600">Hits</div>
        </div>
        <div className="text-center bg-white/10 rounded-lg p-2">
          <div className="text-lg font-bold text-green-600">{gameScore}</div>
          <div className="text-xs text-gray-600">Score</div>
        </div>
        <div className="text-center bg-white/10 rounded-lg p-2">
          <div className="text-lg font-bold text-red-600">{lives}</div>
          <div className="text-xs text-gray-600">Lives</div>
        </div>
      </div>

      {/* Game Area - Optimized for Side Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-b from-sky-300 to-blue-500 rounded-2xl overflow-hidden relative glass-morphic-strong ${
          isActive ? 'neon-glow' : ''
        }`}
        style={{ height: '300px' }}
        ref={gameAreaRef}
      >
        {/* Power Meter - Compact */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-black/60 backdrop-blur-sm border border-white/30 rounded-lg p-2 min-w-[100px]">
            <div className="flex items-center space-x-1 mb-1">
              <Power className="w-3 h-3 text-yellow-400" />
              <span className="text-white text-xs font-bold">Power</span>
            </div>
            <div className="w-full bg-gray-800 border border-gray-600 rounded-full h-2 mb-1">
              <motion.div
                className={`h-2 rounded-full ${
                  powerLevel > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                  powerLevel > 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-green-500 to-yellow-500'
                }`}
                style={{ width: `${powerLevel}%` }}
                animate={{ 
                  boxShadow: isCharging ? '0 0 10px rgba(255, 255, 0, 0.8)' : 'none'
                }}
              />
            </div>
            <div className="text-center">
              <span className="text-white text-sm font-bold">{Math.round(powerLevel)}%</span>
            </div>
          </div>
        </div>

        {/* Angle Control - Compact */}
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-black/60 backdrop-blur-sm border border-white/30 rounded-lg p-2">
            <div className="flex items-center space-x-1 mb-1">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="text-white text-xs font-bold">Angle</span>
            </div>
            <input
              type="range"
              min="15"
              max="75"
              value={launchAngle}
              onChange={(e) => setLaunchAngle(Number(e.target.value))}
              className="w-16 h-1 bg-gray-800 border border-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-1">
              <span className="text-white text-xs font-bold">{launchAngle}°</span>
            </div>
          </div>
        </div>

        {/* Game Objects */}
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
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: obj.hit ? 0.3 : 1, 
                scale: obj.hit ? 1.5 : 1,
                rotate: obj.hit ? 360 : 0
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              {getObjectEmoji(obj)}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Cat Projectiles */}
        <AnimatePresence>
          {catProjectiles.map(cat => (
            <motion.div
              key={cat.id}
              className="absolute"
              style={{ 
                left: `${cat.x}%`, 
                top: `${cat.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              {/* Cat projectile */}
              <div className="relative">
                <span className="text-xl filter drop-shadow-lg">😸</span>
                
                {/* Power trail */}
                {cat.trail.map((point, index) => (
                  <div
                    key={index}
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                    style={{
                      left: `${(point.x - cat.x) * 10}px`,
                      top: `${(point.y - cat.y) * 10}px`,
                      opacity: index / cat.trail.length,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Launcher */}
        <div className="absolute bottom-2 left-4">
          <motion.div
            className="text-2xl filter drop-shadow-lg"
            animate={{ 
              rotate: -launchAngle,
              scale: isCharging ? [1, 1.2, 1] : 1
            }}
            transition={{ 
              scale: { duration: 0.5, repeat: isCharging ? Infinity : 0 }
            }}
          >
            🏹
          </motion.div>
        </div>

        {/* Game State Overlays */}
        {!isActive && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white p-4">
              <h3 className="text-lg font-bold mb-2">🎯 Ready to Launch!</h3>
              <p className="text-sm mb-3">Click "Launch Game!" to start playing</p>
              <div className="space-y-1 text-xs bg-black/60 border border-white/30 p-3 rounded-lg">
                <p className="font-bold text-yellow-400">How to play:</p>
                <p>• Curl to charge power meter</p>
                <p>• Peak curl launches the cat</p>
                <p>• Hit targets, avoid obstacles</p>
              </div>
            </div>
          </div>
        )}

        {isPaused && isActive && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-lg font-bold mb-2">Game Paused</h3>
              <p className="text-sm">Click play to continue</p>
            </div>
          </div>
        )}

        {lives <= 0 && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white p-4">
              <h3 className="text-lg font-bold mb-2">Game Over! 😿</h3>
              <div className="space-y-1 mb-3 bg-black/60 border border-white/30 p-3 rounded-lg text-sm">
                <p>Level: <span className="font-bold text-yellow-400">{level}</span></p>
                <p>Hits: <span className="font-bold text-blue-400">{targetsHit}</span></p>
                <p>Score: <span className="font-bold text-green-400">{gameScore}</span></p>
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

      {/* Compact Instructions */}
      <div className="mt-4 p-3 bg-white/10 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
          <div>
            <p><strong>🎯 Targets:</strong> +50 pts</p>
            <p><strong>🐟 Fish:</strong> +75 pts</p>
          </div>
          <div>
            <p><strong>💧 Avoid:</strong> -1 life</p>
            <p><strong>⭐ Power-up:</strong> +life</p>
          </div>
        </div>
      </div>
    </div>
  )
}