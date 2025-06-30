export interface PoseCallbacks {
  onRepDetected: () => void
  onAngleUpdate: (angle: number) => void
  onFormScoreUpdate: (score: number) => void
  onFeedbackUpdate: (feedback: string) => void
  onGameAction: () => void
}

export class PoseDetector {
  private video: HTMLVideoElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private callbacks: PoseCallbacks
  private isRunning = false
  private animationFrame?: number
  
  // MediaPipe Pose
  private pose: any
  private camera: any
  
  // Enhanced curl tracking state - matching Python implementation
  private leftFlag: 'down' | 'up' | null = null
  private rightFlag: 'down' | 'up' | null = null
  private leftCount = 0
  private rightCount = 0
  private lastAngle = 180
  private formScores: number[] = []
  private lastFeedbackTime = 0
  private angleHistory: number[] = []
  private useLeftArm = true
  
  // Enhanced visual feedback
  private repFlashTime = 0
  private formScoreHistory: number[] = []
  private smoothedAngle = 0
  private curlVelocity = 0
  private lastAngleTime = 0
  
  // Performance optimization
  private frameCount = 0
  private lastPerformanceCheck = 0
  private fps = 0

  constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement, callbacks: PoseCallbacks) {
    this.video = video
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.callbacks = callbacks
    
    // Set canvas size to match video with high DPI support
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    this.canvas.width = (video.videoWidth || 640) * dpr
    this.canvas.height = (video.videoHeight || 480) * dpr
    this.canvas.style.width = `${rect.width}px`
    this.canvas.style.height = `${rect.height}px`
    
    this.ctx.scale(dpr, dpr)
  }

  async initialize() {
    try {
      // Import MediaPipe Pose with optimized settings
      const { Pose } = await import('@mediapipe/pose')
      const { Camera } = await import('@mediapipe/camera_utils')
      
      this.pose = new Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        }
      })

      // Optimized settings for better performance and accuracy
      this.pose.setOptions({
        modelComplexity: 1, // Balance between accuracy and performance
        smoothLandmarks: true,
        enableSegmentation: false, // Disable for better performance
        smoothSegmentation: false,
        minDetectionConfidence: 0.7, // Match Python settings
        minTrackingConfidence: 0.5,  // Match Python settings
        staticImageMode: false // Enable video mode for better tracking
      })

      this.pose.onResults(this.onResults.bind(this))

      // Initialize camera with optimized settings
      this.camera = new Camera(this.video, {
        onFrame: async () => {
          if (this.isRunning) {
            await this.pose.send({ image: this.video })
          }
        },
        width: 640,
        height: 480,
        facingMode: 'user'
      })

      console.log('Enhanced MediaPipe Pose detector initialized successfully')
    } catch (error) {
      console.error('Failed to initialize MediaPipe Pose:', error)
      this.initializeFallback()
      throw error
    }
  }

  private initializeFallback() {
    console.log('Using enhanced fallback pose detection simulation')
  }

  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.frameCount = 0
    this.lastPerformanceCheck = Date.now()
    
    if (this.camera) {
      this.camera.start()
    } else {
      this.detectPose()
    }
  }

  stop() {
    this.isRunning = false
    
    if (this.camera) {
      this.camera.stop()
    }
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }

    // Clear the canvas when stopping
    this.clearCanvas()
  }

  cleanup() {
    this.stop()
    
    if (this.pose) {
      this.pose.close()
    }

    // Clear canvas and reset state
    this.clearCanvas()
    this.resetState()
  }

  private clearCanvas() {
    const width = this.canvas.width / (window.devicePixelRatio || 1)
    const height = this.canvas.height / (window.devicePixelRatio || 1)
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height)
    
    // Draw a clean state with logo/emoji
    this.drawStoppedState()
  }

  private resetState() {
    this.leftFlag = null
    this.rightFlag = null
    this.leftCount = 0
    this.rightCount = 0
    this.lastAngle = 180
    this.formScores = []
    this.lastFeedbackTime = 0
    this.angleHistory = []
    this.repFlashTime = 0
    this.formScoreHistory = []
    this.smoothedAngle = 0
    this.curlVelocity = 0
    this.lastAngleTime = 0
    this.frameCount = 0
    this.lastPerformanceCheck = 0
    this.fps = 0
  }

  private drawStoppedState() {
    const width = this.canvas.width / (window.devicePixelRatio || 1)
    const height = this.canvas.height / (window.devicePixelRatio || 1)
    
    // Draw gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, width, height)
    
    // Draw centered logo/emoji
    this.ctx.fillStyle = '#FFFFFF'
    this.ctx.font = 'bold 64px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText('🎯', width / 2, height / 2 - 20)
    
    // Draw text
    this.ctx.font = 'bold 24px Arial'
    this.ctx.fillText('Imperfect Curl', width / 2, height / 2 + 40)
    
    this.ctx.font = '16px Arial'
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    this.ctx.fillText('Ready for your next workout!', width / 2, height / 2 + 70)
  }

  private onResults(results: any) {
    if (!this.isRunning) return

    // Performance monitoring
    this.frameCount++
    const now = Date.now()
    if (now - this.lastPerformanceCheck > 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.lastPerformanceCheck = now
    }

    // Clear canvas with enhanced background
    this.ctx.clearRect(0, 0, this.canvas.width / (window.devicePixelRatio || 1), this.canvas.height / (window.devicePixelRatio || 1))
    
    // Draw subtle grid for better visual reference
    this.drawGrid()

    if (results.poseLandmarks) {
      // Enhanced pose landmark drawing
      this.drawEnhancedPoseLandmarks(results.poseLandmarks)
      
      // Calculate bicep curl angles for both arms
      this.calculateBicepCurlAngles(results.poseLandmarks)
      
      // Draw performance info
      this.drawPerformanceInfo()
    } else {
      // Draw "no pose detected" message
      this.drawNoPoseMessage()
    }
  }

  private drawGrid() {
    const width = this.canvas.width / (window.devicePixelRatio || 1)
    const height = this.canvas.height / (window.devicePixelRatio || 1)
    
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    this.ctx.lineWidth = 1
    
    // Vertical lines
    for (let x = 0; x <= width; x += width / 10) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, height)
      this.ctx.stroke()
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += height / 10) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(width, y)
      this.ctx.stroke()
    }
  }

  private drawEnhancedPoseLandmarks(landmarks: any[]) {
    const width = this.canvas.width / (window.devicePixelRatio || 1)
    const height = this.canvas.height / (window.devicePixelRatio || 1)
    
    // Enhanced connection drawing with gradient lines
    const connections = [
      { start: 11, end: 13, color: '#8B5CF6', width: 6 }, // Left shoulder to elbow
      { start: 13, end: 15, color: '#8B5CF6', width: 6 }, // Left elbow to wrist
      { start: 12, end: 14, color: '#10B981', width: 6 }, // Right shoulder to elbow
      { start: 14, end: 16, color: '#10B981', width: 6 }, // Right elbow to wrist
      { start: 11, end: 12, color: '#F59E0B', width: 4 }, // Shoulder line
      { start: 11, end: 23, color: '#6B7280', width: 3 }, // Left torso
      { start: 12, end: 24, color: '#6B7280', width: 3 }, // Right torso
      { start: 23, end: 24, color: '#6B7280', width: 3 }, // Hip line
    ]

    // Draw connections with enhanced styling
    connections.forEach(({ start, end, color, width }) => {
      const startPoint = landmarks[start]
      const endPoint = landmarks[end]
      
      if (startPoint && endPoint && startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
        const startX = startPoint.x * width
        const startY = startPoint.y * height
        const endX = endPoint.x * width
        const endY = endPoint.y * height
        
        // Create gradient line
        const gradient = this.ctx.createLinearGradient(startX, startY, endX, endY)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, color + '80') // Add transparency
        
        this.ctx.strokeStyle = gradient
        this.ctx.lineWidth = width
        this.ctx.lineCap = 'round'
        this.ctx.lineJoin = 'round'
        
        // Add glow effect
        this.ctx.shadowColor = color
        this.ctx.shadowBlur = 10
        
        this.ctx.beginPath()
        this.ctx.moveTo(startX, startY)
        this.ctx.lineTo(endX, endY)
        this.ctx.stroke()
        
        // Reset shadow
        this.ctx.shadowBlur = 0
      }
    })

    // Enhanced landmark drawing with different sizes and colors
    const landmarkStyles = [
      { indices: [11, 12], color: '#F59E0B', size: 12, label: 'SHOULDER' }, // Shoulders
      { indices: [13, 14], color: '#8B5CF6', size: 14, label: 'ELBOW' },    // Elbows
      { indices: [15, 16], color: '#10B981', size: 10, label: 'WRIST' },    // Wrists
    ]

    landmarkStyles.forEach(({ indices, color, size, label }) => {
      indices.forEach((index, i) => {
        const landmark = landmarks[index]
        if (landmark && landmark.visibility > 0.5) {
          const x = landmark.x * width
          const y = landmark.y * height
          
          // Draw outer glow
          this.ctx.fillStyle = color + '40'
          this.ctx.beginPath()
          this.ctx.arc(x, y, size + 4, 0, 2 * Math.PI)
          this.ctx.fill()
          
          // Draw main circle
          this.ctx.fillStyle = color
          this.ctx.beginPath()
          this.ctx.arc(x, y, size, 0, 2 * Math.PI)
          this.ctx.fill()
          
          // Draw inner highlight
          this.ctx.fillStyle = '#FFFFFF80'
          this.ctx.beginPath()
          this.ctx.arc(x - size/3, y - size/3, size/3, 0, 2 * Math.PI)
          this.ctx.fill()
          
          // Draw label - FIXED: No horizontal flip for text
          this.ctx.save()
          this.ctx.scale(-1, 1) // Only flip horizontally for text readability
          this.ctx.fillStyle = '#FFFFFF'
          this.ctx.font = 'bold 10px Arial'
          this.ctx.textAlign = 'center'
          this.ctx.fillText(
            `${label} ${i === 0 ? 'L' : 'R'}`, 
            -x, // Negative x because of the flip
            y - size - 8
          )
          this.ctx.restore()
        }
      })
    })
  }

  private calculateBicepCurlAngles(landmarks: any[]) {
    const width = this.canvas.width / (window.devicePixelRatio || 1)
    const height = this.canvas.height / (window.devicePixelRatio || 1)
    
    // Extract landmarks for both arms
    const leftShoulder = landmarks[11]
    const leftElbow = landmarks[13]
    const leftWrist = landmarks[15]
    const rightShoulder = landmarks[12]
    const rightElbow = landmarks[14]
    const rightWrist = landmarks[16]

    let leftAngle = 0
    let rightAngle = 0
    let leftQuality = 0
    let rightQuality = 0

    // Calculate left arm angle with quality assessment
    if (leftShoulder && leftElbow && leftWrist && 
        leftShoulder.visibility > 0.5 && leftElbow.visibility > 0.5 && leftWrist.visibility > 0.5) {
      leftAngle = this.calcAngle(leftShoulder, leftElbow, leftWrist)
      leftQuality = (leftShoulder.visibility + leftElbow.visibility + leftWrist.visibility) / 3
      
      this.drawEnhancedAngleVisualization(
        [leftElbow.x * width, leftElbow.y * height], 
        leftAngle, 
        'LEFT',
        leftQuality
      )
    }

    // Calculate right arm angle with quality assessment
    if (rightShoulder && rightElbow && rightWrist && 
        rightShoulder.visibility > 0.5 && rightElbow.visibility > 0.5 && rightWrist.visibility > 0.5) {
      rightAngle = this.calcAngle(rightShoulder, rightElbow, rightWrist)
      rightQuality = (rightShoulder.visibility + rightElbow.visibility + rightWrist.visibility) / 3
      
      this.drawEnhancedAngleVisualization(
        [rightElbow.x * width, rightElbow.y * height], 
        rightAngle, 
        'RIGHT',
        rightQuality
      )
    }

    // Process angles with enhanced logic
    this.processAnglesEnhanced(leftAngle, rightAngle, leftQuality, rightQuality)
  }

  // Exact implementation of Python calc_angle function with enhancements
  private calcAngle(a: any, b: any, c: any): number {
    const pointA = [a.x, a.y]
    const pointB = [b.x, b.y] 
    const pointC = [c.x, c.y]

    const ab = [pointA[0] - pointB[0], pointA[1] - pointB[1]]
    const bc = [pointB[0] - pointC[0], pointB[1] - pointC[1]]
    
    const dotProduct = ab[0] * bc[0] + ab[1] * bc[1]
    const magAB = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1])
    const magBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1])
    
    if (magAB === 0 || magBC === 0) return 0
    
    const cosTheta = Math.max(-1, Math.min(1, dotProduct / (magAB * magBC)))
    const theta = Math.acos(cosTheta)
    const angleDegrees = 180 - (180 * theta / Math.PI)
    
    return Math.round(angleDegrees * 100) / 100
  }

  private processAnglesEnhanced(leftAngle: number, rightAngle: number, leftQuality: number, rightQuality: number) {
    const now = Date.now()
    
    // Enhanced rep counting with quality thresholds
    const qualityThreshold = 0.7
    
    // Left arm rep counting with quality check
    if (leftQuality > qualityThreshold) {
      if (leftAngle > 160) {
        this.leftFlag = 'down'
      }
      if (leftAngle < 50 && this.leftFlag === 'down') {
        this.leftCount++
        this.leftFlag = 'up'
        this.repFlashTime = now
        console.log(`Enhanced Left Count: ${this.leftCount}, Quality: ${leftQuality.toFixed(2)}`)
        
        this.callbacks.onRepDetected()
        this.callbacks.onGameAction()
      }
    }

    // Right arm rep counting with quality check
    if (rightQuality > qualityThreshold) {
      if (rightAngle > 160) {
        this.rightFlag = 'down'
      }
      if (rightAngle < 50 && this.rightFlag === 'down') {
        this.rightCount++
        this.rightFlag = 'up'
        this.repFlashTime = now
        console.log(`Enhanced Right Count: ${this.rightCount}, Quality: ${rightQuality.toFixed(2)}`)
        
        this.callbacks.onRepDetected()
        this.callbacks.onGameAction()
      }
    }

    // Use the arm with higher quality and activity for primary tracking
    const primaryAngle = leftQuality > rightQuality ? leftAngle : rightAngle
    const activeArm = leftQuality > rightQuality ? 'left' : 'right'
    const primaryQuality = Math.max(leftQuality, rightQuality)
    
    // Calculate curl velocity
    if (this.lastAngleTime > 0) {
      const timeDiff = now - this.lastAngleTime
      const angleDiff = primaryAngle - this.lastAngle
      this.curlVelocity = Math.abs(angleDiff) / (timeDiff / 1000) // degrees per second
    }
    
    this.lastAngle = primaryAngle
    this.lastAngleTime = now
    
    // Smooth angle for better UX
    this.angleHistory.push(primaryAngle)
    if (this.angleHistory.length > 5) {
      this.angleHistory.shift()
    }
    this.smoothedAngle = this.angleHistory.reduce((sum, a) => sum + a, 0) / this.angleHistory.length
    
    this.callbacks.onAngleUpdate(this.smoothedAngle)

    // Enhanced form score calculation
    const formScore = this.calculateEnhancedFormScore(primaryAngle, primaryQuality)
    this.callbacks.onFormScoreUpdate(formScore)

    // Enhanced feedback
    this.provideEnhancedFeedback(primaryAngle, formScore, activeArm, primaryQuality)
  }

  private calculateEnhancedFormScore(angle: number, quality: number): number {
    let score = 100

    // Quality penalty
    if (quality < 0.8) {
      score -= (0.8 - quality) * 50 // Up to 50 point penalty for poor visibility
    }

    // Range of motion scoring (based on Python thresholds)
    if (angle < 40 || angle > 170) {
      score -= 15 // Outside optimal range
    } else if (angle < 50 || angle > 160) {
      score -= 8 // Slightly outside optimal range
    }

    // Velocity scoring (smooth, controlled movement)
    if (this.curlVelocity > 200) {
      score -= 20 // Too fast
    } else if (this.curlVelocity < 10) {
      score -= 10 // Too slow
    } else if (this.curlVelocity > 50 && this.curlVelocity < 150) {
      score += 5 // Optimal speed bonus
    }

    // Consistency scoring
    if (this.formScoreHistory.length > 0) {
      const avgScore = this.formScoreHistory.reduce((sum, s) => sum + s, 0) / this.formScoreHistory.length
      const deviation = Math.abs(score - avgScore)
      if (deviation > 25) {
        score -= 10 // Inconsistent form
      } else if (deviation < 10) {
        score += 5 // Consistent form bonus
      }
    }

    // Store form score
    this.formScoreHistory.push(score)
    if (this.formScoreHistory.length > 10) {
      this.formScoreHistory.shift()
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private provideEnhancedFeedback(angle: number, formScore: number, activeArm: string, quality: number) {
    const now = Date.now()
    if (now - this.lastFeedbackTime < 2500) return // Reduced throttle for more responsive feedback

    let feedback = ''

    // Quality-based feedback
    if (quality < 0.6) {
      feedback = `Move closer to camera for better ${activeArm} arm tracking.`
    } else if (formScore < 60) {
      if (angle < 40) {
        feedback = `Perfect peak curl with ${activeArm} arm! Control the descent for better form.`
      } else if (angle > 170) {
        feedback = `Extend your ${activeArm} arm more at the bottom for full range.`
      } else if (this.curlVelocity > 200) {
        feedback = `Slow down your ${activeArm} arm - smooth and controlled wins!`
      } else if (this.curlVelocity < 10) {
        feedback = `Keep your ${activeArm} arm moving! Don't pause during curls.`
      }
    } else if (formScore < 80) {
      feedback = `Good ${activeArm} arm form! Focus on consistent tempo and range.`
    } else if (formScore >= 90) {
      feedback = `Excellent ${activeArm} arm technique! Perfect form! 🔥`
    } else {
      feedback = `Great ${activeArm} arm control! Keep that smooth motion.`
    }

    if (feedback) {
      this.callbacks.onFeedbackUpdate(feedback)
      this.lastFeedbackTime = now
    }
  }

  private drawEnhancedAngleVisualization(elbowPoint: number[], angle: number, arm: string, quality: number) {
    const isLeft = arm === 'LEFT'
    const baseColor = isLeft ? '#8B5CF6' : '#10B981'
    const qualityAlpha = Math.max(0.3, quality)
    
    // Draw angle arc with quality-based styling
    this.ctx.strokeStyle = baseColor + Math.floor(qualityAlpha * 255).toString(16).padStart(2, '0')
    this.ctx.lineWidth = 4
    this.ctx.lineCap = 'round'
    
    // Add glow effect
    this.ctx.shadowColor = baseColor
    this.ctx.shadowBlur = quality * 15
    
    this.ctx.beginPath()
    this.ctx.arc(elbowPoint[0], elbowPoint[1], 40, -Math.PI/2, (angle - 90) * Math.PI / 180 - Math.PI/2)
    this.ctx.stroke()
    
    // Reset shadow
    this.ctx.shadowBlur = 0

    // Enhanced angle display - FIXED: Proper text orientation
    const textX = elbowPoint[0] + (isLeft ? 50 : -120)
    const textY = elbowPoint[1] - 30
    
    // Save context for text rendering
    this.ctx.save()
    
    // Background with rounded corners
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.roundRect(textX, textY - 25, 100, 40, 8)
    this.ctx.fill()
    
    // Border with arm color
    this.ctx.strokeStyle = baseColor
    this.ctx.lineWidth = 2
    this.roundRect(textX, textY - 25, 100, 40, 8)
    this.ctx.stroke()
    
    // FIXED: Flip text horizontally for readability
    this.ctx.scale(-1, 1)
    this.ctx.translate(-textX * 2 - 100, 0)
    
    // Angle text
    this.ctx.fillStyle = '#FFFFFF'
    this.ctx.font = 'bold 16px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(`${arm}`, textX + 50, textY - 8)
    
    // Angle value with color coding
    const angleColor = angle < 50 ? '#10B981' : angle > 160 ? '#EF4444' : '#F59E0B'
    this.ctx.fillStyle = angleColor
    this.ctx.font = 'bold 14px Arial'
    this.ctx.fillText(`${Math.round(angle)}°`, textX + 50, textY + 8)
    
    // Quality indicator
    this.ctx.fillStyle = `rgba(255, 255, 255, ${quality})`
    this.ctx.font = '10px Arial'
    this.ctx.fillText(`Q: ${Math.round(quality * 100)}%`, textX + 50, textY + 20)
    
    // Restore context
    this.ctx.restore()
  }

  private roundRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
  }

  private drawPerformanceInfo() {
    const width = this.canvas.width / (window.devicePixelRatio || 1)
    
    // Performance display
    this.ctx.save()
    
    // FIXED: Flip text for readability
    this.ctx.scale(-1, 1)
    this.ctx.translate(-width, 0)
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.roundRect(width - 120, 10, 110, 80, 8)
    this.ctx.fill()
    
    this.ctx.fillStyle = '#FFFFFF'
    this.ctx.font = 'bold 12px Arial'
    this.ctx.textAlign = 'left'
    this.ctx.fillText(`FPS: ${this.fps}`, width - 110, 30)
    this.ctx.fillText(`L: ${this.leftCount} | R: ${this.rightCount}`, width - 110, 45)
    this.ctx.fillText(`Total: ${this.leftCount + this.rightCount}`, width - 110, 60)
    this.ctx.fillText(`Velocity: ${Math.round(this.curlVelocity)}°/s`, width - 110, 75)
    
    this.ctx.restore()
    
    // Rep flash effect
    const now = Date.now()
    if (now - this.repFlashTime < 1000) {
      const flashAlpha = 1 - (now - this.repFlashTime) / 1000
      this.ctx.fillStyle = `rgba(16, 185, 129, ${flashAlpha * 0.3})`
      this.ctx.fillRect(0, 0, width, this.canvas.height / (window.devicePixelRatio || 1))
      
      // Rep celebration text - FIXED: Proper text orientation
      this.ctx.save()
      this.ctx.scale(-1, 1)
      this.ctx.translate(-width, 0)
      this.ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`
      this.ctx.font = 'bold 48px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillText('REP!', width / 2, this.canvas.height / (window.devicePixelRatio || 1) / 2)
      this.ctx.restore()
    }
  }

  private drawNoPoseMessage() {
    const width = this.canvas.width / (window.devicePixelRatio || 1)
    const height = this.canvas.height / (window.devicePixelRatio || 1)
    
    // FIXED: Proper text orientation
    this.ctx.save()
    this.ctx.scale(-1, 1)
    this.ctx.translate(-width, 0)
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    this.ctx.font = 'bold 24px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText('Position yourself in frame', width / 2, height / 2 - 20)
    
    this.ctx.font = '16px Arial'
    this.ctx.fillText('Stand back and ensure full body is visible', width / 2, height / 2 + 10)
    
    this.ctx.restore()
  }

  // Enhanced fallback simulation
  private detectPose() {
    if (!this.isRunning) return

    this.ctx.clearRect(0, 0, this.canvas.width / (window.devicePixelRatio || 1), this.canvas.height / (window.devicePixelRatio || 1))
    this.drawGrid()
    this.simulateEnhancedPoseDetection()
    this.animationFrame = requestAnimationFrame(() => this.detectPose())
  }

  private simulateEnhancedPoseDetection() {
    const time = Date.now()
    const cycleTime = 4000
    const progress = (time % cycleTime) / cycleTime
    
    // More realistic simulation with both arms
    let leftAngle: number, rightAngle: number
    
    if (progress < 0.5) {
      // Curl up phase
      leftAngle = 160 - (120 * (progress * 2)) + Math.sin(time / 200) * 5
      rightAngle = 160 - (115 * (progress * 2)) + Math.cos(time / 180) * 4
    } else {
      // Lower down phase
      leftAngle = 40 + (120 * ((progress - 0.5) * 2)) + Math.sin(time / 250) * 3
      rightAngle = 45 + (115 * ((progress - 0.5) * 2)) + Math.cos(time / 220) * 4
    }
    
    // Simulate quality variations
    const leftQuality = 0.8 + Math.sin(time / 1000) * 0.15
    const rightQuality = 0.75 + Math.cos(time / 1200) * 0.2
    
    this.processAnglesEnhanced(leftAngle, rightAngle, leftQuality, rightQuality)
    this.drawEnhancedSimulatedPose(leftAngle, rightAngle, leftQuality, rightQuality)
    this.drawPerformanceInfo()
  }

  private drawEnhancedSimulatedPose(leftAngle: number, rightAngle: number, leftQuality: number, rightQuality: number) {
    const width = this.canvas.width / (window.devicePixelRatio || 1)
    const height = this.canvas.height / (window.devicePixelRatio || 1)
    const centerX = width / 2
    const centerY = height / 2
    
    // Draw both arms with enhanced styling
    this.drawEnhancedSimulatedArm(centerX - 80, centerY, leftAngle, 'LEFT', leftQuality)
    this.drawEnhancedSimulatedArm(centerX + 80, centerY, rightAngle, 'RIGHT', rightQuality)
    
    // Draw torso
    this.ctx.strokeStyle = '#6B7280'
    this.ctx.lineWidth = 6
    this.ctx.lineCap = 'round'
    
    this.ctx.beginPath()
    this.ctx.moveTo(centerX - 80, centerY - 40) // Left shoulder
    this.ctx.lineTo(centerX + 80, centerY - 40) // Right shoulder
    this.ctx.stroke()
    
    this.ctx.beginPath()
    this.ctx.moveTo(centerX, centerY - 40) // Neck
    this.ctx.lineTo(centerX, centerY + 60) // Spine
    this.ctx.stroke()
  }

  private drawEnhancedSimulatedArm(shoulderX: number, shoulderY: number, angle: number, arm: string, quality: number) {
    const armLength = 80
    const isLeft = arm === 'LEFT'
    const baseColor = isLeft ? '#8B5CF6' : '#10B981'
    const qualityAlpha = Math.max(0.3, quality)
    
    // Shoulder
    this.ctx.fillStyle = baseColor + Math.floor(qualityAlpha * 255).toString(16).padStart(2, '0')
    this.ctx.beginPath()
    this.ctx.arc(shoulderX, shoulderY - 40, 10, 0, 2 * Math.PI)
    this.ctx.fill()

    // Elbow
    const elbowX = shoulderX
    const elbowY = shoulderY
    this.ctx.beginPath()
    this.ctx.arc(elbowX, elbowY, 8, 0, 2 * Math.PI)
    this.ctx.fill()

    // Wrist
    const wristX = elbowX + armLength * Math.cos((angle - 90) * Math.PI / 180)
    const wristY = elbowY + armLength * Math.sin((angle - 90) * Math.PI / 180)
    this.ctx.beginPath()
    this.ctx.arc(wristX, wristY, 6, 0, 2 * Math.PI)
    this.ctx.fill()

    // Enhanced arm lines with glow
    this.ctx.strokeStyle = baseColor + Math.floor(qualityAlpha * 255).toString(16).padStart(2, '0')
    this.ctx.lineWidth = 6
    this.ctx.lineCap = 'round'
    this.ctx.shadowColor = baseColor
    this.ctx.shadowBlur = quality * 10

    // Upper arm
    this.ctx.beginPath()
    this.ctx.moveTo(shoulderX, shoulderY - 40)
    this.ctx.lineTo(elbowX, elbowY)
    this.ctx.stroke()

    // Forearm
    this.ctx.beginPath()
    this.ctx.moveTo(elbowX, elbowY)
    this.ctx.lineTo(wristX, wristY)
    this.ctx.stroke()

    // Reset shadow
    this.ctx.shadowBlur = 0

    // Enhanced angle visualization
    this.drawEnhancedAngleVisualization([elbowX, elbowY], angle, arm, quality)
  }
}