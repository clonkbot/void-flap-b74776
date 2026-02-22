import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useCallback } from 'react'
import Game from './components/Game'
import StartScreen from './components/StartScreen'
import GameOverScreen from './components/GameOverScreen'

export type GameState = 'start' | 'playing' | 'gameover'

function App() {
  const [gameState, setGameState] = useState<GameState>('start')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const startGame = useCallback(() => {
    setScore(0)
    setGameState('playing')
  }, [])

  const endGame = useCallback((finalScore: number) => {
    setHighScore(prev => Math.max(prev, finalScore))
    setGameState('gameover')
  }, [])

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore)
  }, [])

  return (
    <div className="w-screen h-screen bg-[#030810] relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 150, 255, 0.08) 0%, transparent 60%)'
        }}
      />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Game
            gameState={gameState}
            onGameOver={endGame}
            onScoreUpdate={handleScoreUpdate}
          />
        </Suspense>
      </Canvas>

      {/* Score Display */}
      {gameState === 'playing' && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
          <div
            className="text-5xl md:text-7xl font-bold tracking-wider"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              color: '#00d4ff',
              textShadow: '0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.3)'
            }}
          >
            {score}
          </div>
        </div>
      )}

      {/* Start Screen */}
      {gameState === 'start' && (
        <StartScreen onStart={startGame} highScore={highScore} />
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          onRestart={startGame}
        />
      )}

      {/* Instructions during play */}
      {gameState === 'playing' && (
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs md:text-sm opacity-50 tracking-widest uppercase"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: '#00d4ff'
          }}
        >
          Tap or Space to fly
        </div>
      )}

      {/* Footer */}
      <footer
        className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] md:text-xs tracking-wide z-20"
        style={{
          fontFamily: 'Orbitron, sans-serif',
          color: 'rgba(0, 212, 255, 0.35)'
        }}
      >
        Requested by @s1s21s21 · Built by @clonkbot
      </footer>
    </div>
  )
}

export default App
