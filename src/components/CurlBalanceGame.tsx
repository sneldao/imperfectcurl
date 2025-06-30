import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Settings,
  Trophy,
  Target,
  Clock,
  Zap,
  Lightbulb,
} from 'lucide-react'
import { BalanceBeamScene } from './BalanceBeamScene'
import {
  getTodaysObject,
  calculateAccuracy,
  getAccuracyGrade,
} from '../utils/weightDatabase'
import { useUserProfile } from '../hooks/useUserProfile'
import { generateHints, getUnlockedHints, GameHint } from '../utils/gameLogic'

type GamePhase = 'reveal' | 'setWeight' | 'curl' | 'result'

interface CurlBalanceGameProps {
  isActive: boolean
  reps: number
  currentAngle: number
  formScore: number
  onComplete: () => void
}

export function CurlBalanceGame({
  isActive,
  reps,
  currentAngle,
  formScore,
  onComplete,
}: CurlBalanceGameProps) {
  const { profile, updateWeightPerRep, recordSession } = useUserProfile()
  const [phase, setPhase] = useState<GamePhase>('reveal')
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [userWeight, setUserWeight] = useState(profile.weightPerRep)
  const [sessionStartReps, setSessionStartReps] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [timerStarted, setTimerStarted] = useState(false)
  const [hintsUnlocked, setHintsUnlocked] = useState<GameHint[]>([])

  const object = getTodaysObject(profile.skillLevel)
  const sessionReps = reps - sessionStartReps
  const liftedWeight = sessionReps * userWeight
  const accuracy = calculateAccuracy(object.weight, liftedWeight)
  const grade = getAccuracyGrade(accuracy)

  // Phase transitions
  useEffect(() => {
    if (phase === 'reveal') {
      const timer = setTimeout(() => setPhase('setWeight'), 4000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // Curl phase countdown - starts after first rep
  useEffect(() => {
    if (phase === 'curl' && isActive && timerStarted) {
      setTimeLeft(120) // 2 minutes
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setPhase('result')
            recordSession(accuracy, sessionReps)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [phase, isActive, timerStarted])

  // Detect first rep to start timer
  useEffect(() => {
    if (phase === 'curl' && !timerStarted && sessionReps > 0) {
      setTimerStarted(true)
    }
  }, [phase, sessionReps, timerStarted])

  // Update hints based on reps
  useEffect(() => {
    if (phase === 'curl') {
      const hints = getUnlockedHints(generateHints(object), sessionReps)
      setHintsUnlocked(hints)
    }
  }, [phase, sessionReps, object])

  const handleStartCurling = () => {
    updateWeightPerRep(userWeight)
    setSessionStartReps(reps)
    setPhase('curl')
  }

  const handleRestart = () => {
    setPhase('reveal')
    setSessionStartReps(0)
    setTimeLeft(15)
  }

  return (
    <div className="curl-balance-game h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-t-2xl">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            ⚖️ Curl Balance Challenge
          </h2>
          <p className="text-sm text-gray-600">
            Match the mystery weight with your curls!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 glass-morphic rounded-lg interactive-scale"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="text-right text-sm">
            <div className="text-gray-800 font-medium">
              Best: {profile.bestAccuracy}%
            </div>
            <div className="text-gray-600">Avg: {profile.averageAccuracy}%</div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/20 backdrop-blur-sm p-4 border-b border-white/20"
          >
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-800">
                Weight per rep:
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={userWeight}
                onChange={(e) => setUserWeight(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded border border-gray-300 text-center"
              />
              <span className="text-sm text-gray-600">lbs</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance Scene */}
      <div className="flex-1 relative">
        <BalanceBeamScene
          object={object}
          userWeight={userWeight}
          reps={sessionReps}
          phase={phase}
          currentAngle={currentAngle}
        />

        {/* Phase Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence mode="wait">
            {phase === 'reveal' && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              >
                <div className="text-center text-white p-6 glass-morphic rounded-2xl max-w-md">
                  <h3 className="text-2xl font-bold mb-2">🔍 Mystery Object</h3>
                  <p className="text-lg mb-4">Can you guess the weight?</p>
                  <div className="text-6xl mb-4">{object.emoji}</div>
                  <p className="text-sm opacity-80">{object.description}</p>
                </div>
              </motion.div>
            )}

            {phase === 'setWeight' && (
              <motion.div
                key="setWeight"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto"
              >
                <div className="text-center text-white p-6 glass-morphic rounded-2xl max-w-md">
                  <h3 className="text-xl font-bold mb-4">⚖️ Set Your Weight</h3>
                  <p className="mb-4">
                    How much weight are you curling per rep?
                  </p>

                  <div className="flex items-center justify-center gap-2 mb-6">
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={userWeight}
                      onChange={(e) => setUserWeight(Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-lg text-center text-black font-bold text-lg"
                    />
                    <span className="text-lg font-medium">lbs per rep</span>
                  </div>

                  <button
                    onClick={handleStartCurling}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start 15s Challenge
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'curl' && (
              <motion.div
                key="curl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-4 right-4"
              >
                <div className="flex items-center justify-between">
                  <div className="glass-morphic px-4 py-2 rounded-xl text-white">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-2xl font-bold">{timeLeft}s</span>
                    </div>
                  </div>

                  <div className="glass-morphic px-4 py-2 rounded-xl text-white">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span className="text-lg font-bold">
                        {sessionReps} reps
                      </span>
                    </div>
                  </div>

                  <div className="glass-morphic px-4 py-2 rounded-xl text-white">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      <span className="text-lg font-bold">
                        {liftedWeight} lbs
                      </span>
                    </div>
                  </div>

                  {hintsUnlocked.length > 0 && (
                    <div className="glass-morphic px-4 py-2 rounded-xl text-white max-w-xs">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-300" />
                        <span className="text-sm font-medium">
                          {hintsUnlocked[hintsUnlocked.length - 1].message}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto"
              >
                <div className="text-center text-white p-6 glass-morphic rounded-2xl max-w-md">
                  <div className="text-6xl mb-4">
                    {accuracy >= 90 ? '🎉' : accuracy >= 75 ? '👏' : '💪'}
                  </div>

                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: grade.color }}
                  >
                    {grade.grade}
                  </h3>

                  <p className="text-lg mb-4">{grade.message}</p>

                  <div className="space-y-2 mb-6 text-left bg-black/20 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span>Target Weight:</span>
                      <span className="font-bold">{object.weight} lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Weight:</span>
                      <span className="font-bold">{liftedWeight} lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reps Completed:</span>
                      <span className="font-bold">{sessionReps}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-2">
                      <span>Accuracy:</span>
                      <span
                        className="font-bold text-xl"
                        style={{ color: grade.color }}
                      >
                        {accuracy}%
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleRestart}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onComplete}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Game Stats */}
      <div className="p-3 bg-white/10 backdrop-blur-sm rounded-b-2xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-700">
                Sessions: {profile.totalSessions}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700">Form: {formScore}%</span>
            </div>
          </div>

          <div className="text-gray-600">Today's Challenge: {object.name}</div>
        </div>
      </div>
    </div>
  )
}
