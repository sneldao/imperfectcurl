import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface FormFeedbackProps {
  feedback: string
  formScore: number
  currentAngle: number
}

export function FormFeedback({ feedback, formScore, currentAngle }: FormFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle
    if (score >= 60) return AlertTriangle
    return XCircle
  }

  const ScoreIcon = getScoreIcon(formScore)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-3 sm:space-y-4"
    >
      {/* Form Score */}
      <div className="flex items-center justify-between p-3 sm:p-4 glass-morphic rounded-2xl">
        <div className="flex items-center space-x-3">
          <ScoreIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${getScoreColor(formScore)}`} />
          <div>
            <p className="text-gray-800 font-medium text-sm sm:text-base">Form Score</p>
            <p className="text-gray-500 text-xs sm:text-sm">Real-time analysis</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-xl sm:text-2xl font-bold ${getScoreColor(formScore)}`}>
            {formScore}%
          </p>
          <p className="text-gray-500 text-xs sm:text-sm">
            {currentAngle.toFixed(0)}° angle
          </p>
        </div>
      </div>

      {/* AI Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 sm:p-4 glass-card neon-glow"
        >
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 neomorphic-button flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs sm:text-sm font-bold">AI</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-purple-600 font-medium mb-1 text-sm sm:text-base">Coach Feedback</p>
              <p className="text-gray-700 text-sm sm:text-base">{feedback}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Form Guidelines - Collapsible on Mobile */}
      <div className="p-3 sm:p-4 glass-morphic rounded-2xl">
        <h3 className="text-gray-800 font-medium mb-2 sm:mb-3 text-sm sm:text-base">Perfect Form Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 neon-glow-success"></div>
              <span className="text-gray-600">Keep elbows close to body</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 neon-glow-success"></div>
              <span className="text-gray-600">Control the movement</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 neon-glow-success"></div>
              <span className="text-gray-600">Full range (30° - 160°)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 neon-glow-success"></div>
              <span className="text-gray-600">Maintain steady posture</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}