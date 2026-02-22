import { useEffect, useState } from 'react'

interface StartScreenProps {
  onStart: () => void
  highScore: number
}

export default function StartScreen({ onStart, highScore }: StartScreenProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-auto"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0, 30, 60, 0.9) 0%, rgba(3, 8, 16, 0.95) 100%)'
      }}
    >
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}
      />

      {/* Glowing orb decoration */}
      <div
        className={`relative mb-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ transitionDelay: '100ms' }}
      >
        <div
          className="w-24 h-24 md:w-32 md:h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, #00e5ff 0%, #0080ff 50%, transparent 70%)',
            boxShadow: '0 0 60px rgba(0, 212, 255, 0.8), 0 0 120px rgba(0, 212, 255, 0.5), 0 0 180px rgba(0, 212, 255, 0.3)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%)'
          }}
        />
      </div>

      {/* Title */}
      <h1
        className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider mb-2 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{
          fontFamily: 'Orbitron, sans-serif',
          color: '#00d4ff',
          textShadow: '0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(0, 212, 255, 0.5)',
          transitionDelay: '200ms'
        }}
      >
        VOID FLAP
      </h1>

      <p
        className={`text-sm md:text-base tracking-[0.3em] uppercase mb-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{
          fontFamily: 'Orbitron, sans-serif',
          color: 'rgba(0, 212, 255, 0.6)',
          transitionDelay: '300ms'
        }}
      >
        Navigate the digital void
      </p>

      {/* High score */}
      {highScore > 0 && (
        <div
          className={`mb-8 text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '350ms' }}
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
            className="text-2xl md:text-3xl font-bold"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              color: '#00d4ff',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.6)'
            }}
          >
            {highScore}
          </p>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={onStart}
        className={`group relative px-8 py-4 md:px-12 md:py-5 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
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
          Enter
        </span>
      </button>

      {/* Instructions */}
      <div
        className={`mt-12 text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ transitionDelay: '500ms' }}
      >
        <p
          className="text-xs md:text-sm tracking-wider"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: 'rgba(0, 212, 255, 0.4)'
          }}
        >
          Press <span className="text-cyan-400">SPACE</span> or <span className="text-cyan-400">TAP</span> to fly
        </p>
      </div>

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)'
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  )
}
