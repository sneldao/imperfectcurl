import { motion } from 'framer-motion'
import { GameObject } from '../utils/weightDatabase'
import { getBeamState } from '../utils/beamPhysics'

interface BalanceBeamSceneProps {
  object: GameObject
  userWeight: number
  reps: number
  phase: 'reveal' | 'setWeight' | 'curl' | 'result'
  currentAngle: number
}

export function BalanceBeamScene({
  object,
  userWeight,
  reps,
  phase,
}: BalanceBeamSceneProps) {
  const leftWeight = object.weight
  const rightWeight = reps * userWeight
  const beamState = getBeamState(leftWeight, rightWeight)

  // Convert radians to degrees for CSS transform
  const rotationDegrees = (beamState.rotation * 180) / Math.PI

  return (
    <div className="balance-beam-container relative w-full h-full bg-gradient-to-b from-sky-200 to-blue-400 rounded-2xl overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        {/* Clouds */}
        <div className="absolute top-4 left-8 text-white/60 text-2xl">☁️</div>
        <div className="absolute top-8 right-12 text-white/60 text-xl">☁️</div>
        <div className="absolute top-12 left-1/3 text-white/60 text-lg">☁️</div>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-400 to-green-300 rounded-b-2xl"></div>
      </div>

      {/* Balance Beam Setup */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-full max-w-md">
        {/* Base Stand */}
        <div className="relative">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg"></div>
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-gradient-to-t from-amber-900 to-amber-700 rounded-lg"></div>
        </div>

        {/* Balance Beam (rotates) */}
        <motion.div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 origin-center"
          animate={{ rotate: rotationDegrees }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          {/* Main Beam */}
          <div className="relative w-80 h-3 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 rounded-full shadow-lg">
            {/* Fulcrum indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-600 rounded-full"></div>
          </div>

          {/* Left Plate */}
          <div className="absolute -top-2 left-4 transform -translate-x-1/2">
            <div className="w-16 h-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow-lg border-2 border-gray-500 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-1">{object.emoji}</div>
                {phase === 'result' && (
                  <div className="text-xs font-bold text-gray-700">
                    {object.weight}lb
                  </div>
                )}
              </div>
            </div>
            {phase !== 'result' && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 bg-white/80 px-2 py-1 rounded">
                ???
              </div>
            )}
          </div>

          {/* Right Plate */}
          <div className="absolute -top-2 right-4 transform translate-x-1/2">
            <div className="w-16 h-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow-lg border-2 border-gray-500 flex items-center justify-center">
              <div className="text-center">
                {/* Weight stack visualization */}
                <div className="flex flex-col items-center">
                  {Array.from(
                    { length: Math.min(Math.max(reps, 1), 5) },
                    (_, i) => (
                      <div
                        key={i}
                        className="w-8 h-2 bg-gradient-to-b from-gray-600 to-gray-800 rounded-sm mb-0.5 shadow-sm"
                        style={{
                          transform: `translateY(${-i * 2}px)`,
                          zIndex: 5 - i,
                        }}
                      />
                    ),
                  )}
                  {reps > 5 && (
                    <div className="text-xs font-bold text-gray-700 mt-1">
                      +{reps - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 bg-white/80 px-2 py-1 rounded">
              {rightWeight}lb
            </div>
          </div>
        </motion.div>
      </div>

      {/* Balance Status */}
      {(phase === 'curl' || phase === 'result') && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 left-1/2 transform -translate-x-1/2"
        >
          <div
            className={`px-4 py-2 rounded-xl font-bold text-white shadow-lg ${
              beamState.isBalanced
                ? 'bg-green-500 neon-glow-success'
                : 'bg-orange-500 neon-glow-warning'
            }`}
          >
            {beamState.isBalanced ? (
              <span className="flex items-center gap-2">
                ⚖️ PERFECTLY BALANCED!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                📊 {beamState.balanceAccuracy.toFixed(1)}% Match
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Phase-specific decorations */}
      {phase === 'reveal' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl"
        >
          🔍
        </motion.div>
      )}

      {phase === 'result' && beamState.balanceAccuracy > 90 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Celebration particles */}
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -50, -100],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            >
              {['🎉', '✨', '🌟', '💫'][Math.floor(Math.random() * 4)]}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
