import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null!)
  const particleCount = 300

  const { positions, speeds, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const speeds = new Float32Array(particleCount)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      // Spread particles across the scene
      positions[i * 3] = (Math.random() - 0.5) * 60 // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30 // y
      positions[i * 3 + 2] = -5 - Math.random() * 20 // z (behind the gameplay)

      speeds[i] = 0.5 + Math.random() * 1.5
      sizes[i] = 0.5 + Math.random() * 1.5
    }

    return { positions, speeds, sizes }
  }, [])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#00d4ff') }
      },
      vertexShader: `
        attribute float size;
        varying float vSize;
        void main() {
          vSize = size;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vSize;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float alpha = (1.0 - dist * 2.0) * 0.4;
          float glow = exp(-dist * 4.0) * 0.8;

          vec3 finalColor = color * (1.0 + glow);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current) return

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < particleCount; i++) {
      // Move particles to the left (parallax with game movement)
      positions[i * 3] -= speeds[i] * delta * 2

      // Reset particles that go off screen
      if (positions[i * 3] < -30) {
        positions[i * 3] = 30
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    material.uniforms.time.value = state.clock.elapsedTime
  })

  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  )
}
