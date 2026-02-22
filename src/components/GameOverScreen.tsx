import { useEffect, useState } from 'react'

interface GameOverScreenProps {
  score: number
  highScore: number
  onRestart: () => void
}

export default function GameOverScreen({ score, highScore, onRestart }: GameOverScreenProps) {
  const [visible, setVisible] = useState(false)
  const isNewHighScore = score >= highScore && score > 0

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-auto"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(30, 0, 0, 0.9) 0%, rgba(10, 3, 16, 0.95) 100%)'
      }}
    >
      {/* Glitch effect background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 50, 50, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 50, 50, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Broken orb decoration */}
      <div
        className={`relative mb-6 transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
      >
        <div
          className="w-20 h-20 md:w-24 md:h-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, #ff4444 0%, #aa0000 50%, transparent 70%)',
            boxShadow: '0 0 40px rgba(255, 68, 68, 0.6), 0 0 80px rgba(255, 68, 68, 0.3)',
            animation: 'flicker 0.15s infinite alternate'
          }}
        />
      </div>

      {/* Game Over text */}
      <h2
        className={`text-3xl md:text-5xl font-bold tracking-wider mb-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{
          fontFamily: 'Orbitron, sans-serif',
          color: '#ff4444',
          textShadow: '0 0 20px rgba(255, 68, 68, 0.8), 0 0 40px rgba(255, 68, 68, 0.5)',
          transitionDelay: '100ms',
          animation: 'textGlitch 3s infinite'
        }}
      >
        SIGNAL LOST
      </h2>

      {/* Score display */}
      <div
        className={`text-center mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ transitionDelay: '200ms' }}
      >
        <p
          className="text-xs tracking-widest uppercase mb-2"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: 'rgba(255, 68, 68, 0.5)'
          }}
        >
          Distance Traveled
        </p>
        <p
          className="text-5xl md:text-7xl font-bold"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: isNewHighScore ? '#00d4ff' : '#ff6666',
            textShadow: isNewHighScore
              ? '0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(0, 212, 255, 0.5)'
              : '0 0 20px rgba(255, 102, 102, 0.6)'
          }}
        >
          {score}
        </p>

        {isNewHighScore && (
          <p
            className="mt-3 text-sm tracking-[0.3em] uppercase animate-pulse"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              color: '#00d4ff',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.8)'
            }}
          >
            New Record!
          </p>
        )}
      </div>

      {/* High score */}
      <div
        className={`mb-8 text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ transitionDelay: '300ms' }}
      >
        <p
          className="text-xs tracking-widest uppercase mb-1"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: 'rgba(0, 212, 255, 0.4)'
          }}
        >
          Best Run
        </p>
        <p
          className="text-xl md:text-2xl font-bold"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: 'rgba(0, 212, 255, 0.7)'
          }}
        >
          {highScore}
        </p>
      </div>

      {/* Restart button */}
      <button
        onClick={onRestart}
        className={`group relative px-8 py-4 md:px-12 md:py-5 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{
          fontFamily: 'Orbitron, sans-serif',
          transitionDelay: '400ms'
        }}
      >
        {/* Button background */}
        <div
          className="absolute inset-0 rounded transition-all duration-300 group-hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 100, 200, 0.3) 100%)',
            border: '1px solid rgba(0, 212, 255, 0.5)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.1)'
          }}
        />

        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: '0 0 40px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.3)'
          }}
        />

        <span
          className="relative text-lg md:text-xl tracking-widest uppercase"
          style={{
            color: '#00d4ff',
            textShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
          }}
        >
          Retry
        </span>
      </button>

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.5) 2px, rgba(0, 0, 0, 0.5) 4px)'
        }}
      />

      <style>{`
        @keyframes flicker {
          0% { opacity: 0.8; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes textGlitch {
          0%, 90%, 100% { transform: translate(0); }
          92% { transform: translate(-2px, 1px); }
          94% { transform: translate(2px, -1px); }
          96% { transform: translate(-1px, -1px); }
          98% { transform: translate(1px, 1px); }
        }
      `}</style>
    </div>
  )
}
