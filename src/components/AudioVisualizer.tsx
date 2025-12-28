import { motion } from "motion/react"

interface AudioVisualizerProps {
  isAnimating: boolean
}

const bars = [
  { idle: 10, active: 24, delay: 0 },
  { idle: 14, active: 32, delay: 0.1 },
  { idle: 18, active: 40, delay: 0.2 },
  { idle: 14, active: 32, delay: 0.3 },
  { idle: 12, active: 28, delay: 0.4 },
  { idle: 16, active: 36, delay: 0.5 },
]

export function AudioVisualizer({ isAnimating }: AudioVisualizerProps) {
  return (
    <div className="flex items-center gap-1">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-0.75 bg-white rounded-sm"
          animate={{
            height: isAnimating ? [bar.idle, bar.active, bar.idle] : bar.idle,
          }}
          transition={{
            duration: 0.6,
            repeat: isAnimating ? Infinity : 1,
            ease: "easeInOut",
            delay: bar.delay,
          }}
        />
      ))}
    </div>
  )
}