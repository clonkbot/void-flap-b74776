import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import * as THREE from 'three'
import { GameState } from '../App'
import GlowingOrb from './GlowingOrb'
import Pillar from './Pillar'
import ParticleField from './ParticleField'

interface GameProps {
  gameState: GameState
  onGameOver: (score: number) => void
  onScoreUpdate: (score: number) => void
}

interface PillarData {
  id: number
  x: number
  gapY: number
  passed: boolean
}

const GRAVITY = -25
const JUMP_VELOCITY = 8
const GAME_SPEED = 5
const PILLAR_SPACING = 6
const GAP_SIZE = 4
const PILLAR_WIDTH = 1.5

export default function Game({ gameState, onGameOver, onScoreUpdate }: GameProps) {
  const orbRef = useRef<THREE.Group>(null!)
  const velocityRef = useRef(0)
  const pillarsRef = useRef<PillarData[]>([])
  const nextPillarIdRef = useRef(0)
  const scoreRef = useRef(0)
  const { viewport } = useThree()

  // Initialize/reset game
  useEffect(() => {
    if (gameState === 'playing') {
      velocityRef.current = 0
      scoreRef.current = 0
      pillarsRef.current = []
      nextPillarIdRef.current = 0

      // Create initial pillars
      for (let i = 0; i < 5; i++) {
        pillarsRef.current.push({
          id: nextPillarIdRef.current++,
          x: 8 + i * PILLAR_SPACING,
          gapY: (Math.random() - 0.5) * 4,
          passed: false
        })
      }

      if (orbRef.current) {
        orbRef.current.position.set(-2, 0, 0)
      }
    }
  }, [gameState])

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      velocityRef.current = JUMP_VELOCITY
    }
  }, [gameState])

  // Handle input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault()
      jump()
    }

    const handleClick = () => {
      jump()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouch, { passive: false })
    window.addEventListener('mousedown', handleClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouch)
      window.removeEventListener('mousedown', handleClick)
    }
  }, [jump])

  // Game loop
  useFrame((_, delta) => {
    if (gameState !== 'playing' || !orbRef.current) return

    // Update orb position
    velocityRef.current += GRAVITY * delta
    orbRef.current.position.y += velocityRef.current * delta

    // Rotate orb based on velocity
    orbRef.current.rotation.z = THREE.MathUtils.lerp(
      orbRef.current.rotation.z,
      velocityRef.current * 0.05,
      0.1
    )

    const orbY = orbRef.current.position.y
    const orbX = orbRef.current.position.x
    const orbRadius = 0.5

    // Check bounds
    if (orbY < -viewport.height / 2 - 1 || orbY > viewport.height / 2 + 1) {
      onGameOver(scoreRef.current)
      return
    }

    // Update pillars
    const activePillars: PillarData[] = []
    for (const pillar of pillarsRef.current) {
      pillar.x -= GAME_SPEED * delta

      // Check collision
      const pillarLeft = pillar.x - PILLAR_WIDTH / 2
      const pillarRight = pillar.x + PILLAR_WIDTH / 2

      if (orbX + orbRadius > pillarLeft && orbX - orbRadius < pillarRight) {
        const gapTop = pillar.gapY + GAP_SIZE / 2
        const gapBottom = pillar.gapY - GAP_SIZE / 2

        if (orbY + orbRadius > gapTop || orbY - orbRadius < gapBottom) {
          onGameOver(scoreRef.current)
          return
        }
      }

      // Check if passed
      if (!pillar.passed && pillar.x < orbX - PILLAR_WIDTH / 2) {
        pillar.passed = true
        scoreRef.current++
        onScoreUpdate(scoreRef.current)
      }

      // Keep pillar if still visible
      if (pillar.x > -15) {
        activePillars.push(pillar)
      }
    }

    // Add new pillars
    const lastPillar = activePillars[activePillars.length - 1]
    if (!lastPillar || lastPillar.x < 12) {
      activePillars.push({
        id: nextPillarIdRef.current++,
        x: (lastPillar?.x ?? 8) + PILLAR_SPACING,
        gapY: (Math.random() - 0.5) * 4,
        passed: false
      })
    }

    pillarsRef.current = activePillars
  })

  // Pillars state for rendering
  const pillarsState = useMemo(() => pillarsRef.current, [])

  return (
    <>
      {/* Ambient and directional lights */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} color="#00d4ff" />

      {/* Environment for reflections */}
      <Environment preset="night" />

      {/* Particle background */}
      <ParticleField />

      {/* The glowing orb */}
      {gameState === 'start' ? (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <GlowingOrb ref={orbRef} position={[-2, 0, 0]} />
        </Float>
      ) : (
        <GlowingOrb ref={orbRef} position={[-2, 0, 0]} />
      )}

      {/* Render pillars */}
      {gameState === 'playing' && (
        <PillarsRenderer pillarsRef={pillarsRef} gapSize={GAP_SIZE} />
      )}

      {/* Ground line effect */}
      <mesh position={[0, -viewport.height / 2, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 20]} />
        <meshBasicMaterial color="#00d4ff" opacity={0.03} transparent />
      </mesh>
    </>
  )
}

// Separate component for pillars to avoid recreation
function PillarsRenderer({
  pillarsRef,
  gapSize
}: {
  pillarsRef: React.MutableRefObject<PillarData[]>
  gapSize: number
}) {
  const pillarsGroupRef = useRef<THREE.Group>(null!)

  useFrame(() => {
    if (!pillarsGroupRef.current) return

    const children = pillarsGroupRef.current.children
    const pillars = pillarsRef.current

    // Update existing or add new
    for (let i = 0; i < Math.max(children.length, pillars.length * 2); i++) {
      const pillarIndex = Math.floor(i / 2)
      const isTop = i % 2 === 0

      if (pillarIndex >= pillars.length) {
        if (children[i]) {
          (children[i] as THREE.Mesh).visible = false
        }
        continue
      }

      const pillar = pillars[pillarIndex]

      if (!children[i]) continue

      const mesh = children[i] as THREE.Mesh
      mesh.visible = true
      mesh.position.x = pillar.x

      if (isTop) {
        mesh.position.y = pillar.gapY + gapSize / 2 + 10
      } else {
        mesh.position.y = pillar.gapY - gapSize / 2 - 10
      }
    }
  })

  // Pre-create enough pillar meshes
  const pillarMeshes = useMemo(() => {
    const meshes = []
    for (let i = 0; i < 20; i++) {
      meshes.push(
        <Pillar
          key={i}
          position={[100, 0, 0]}
        />
      )
    }
    return meshes
  }, [])

  return <group ref={pillarsGroupRef}>{pillarMeshes}</group>
}
