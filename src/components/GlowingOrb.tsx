import { forwardRef, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GlowingOrbProps {
  position?: [number, number, number]
}

const GlowingOrb = forwardRef<THREE.Group, GlowingOrbProps>(
  ({ position = [0, 0, 0] }, ref) => {
    const innerRef = useRef<THREE.Mesh>(null!)
    const glowRef = useRef<THREE.Mesh>(null!)
    const outerGlowRef = useRef<THREE.Mesh>(null!)
    const particlesRef = useRef<THREE.Points>(null!)

    // Particle system for trailing effect
    const particleCount = 50
    const particleData = useMemo(() => {
      const positions = new Float32Array(particleCount * 3)
      const sizes = new Float32Array(particleCount)
      const opacities = new Float32Array(particleCount)

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 0
        sizes[i] = Math.random() * 0.1 + 0.05
        opacities[i] = Math.random()
      }

      return { positions, sizes, opacities }
    }, [])

    // Shader for the glow effect
    const glowMaterial = useMemo(() => {
      return new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color('#00d4ff') }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            float pulse = 0.8 + 0.2 * sin(time * 3.0);
            vec3 glow = color * intensity * pulse * 1.5;
            gl_FragColor = vec4(glow, intensity * 0.8);
          }
        `,
        transparent: true,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    }, [])

    const outerGlowMaterial = useMemo(() => {
      return new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color('#00a0ff') }
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          varying vec3 vNormal;

          void main() {
            float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            float pulse = 0.7 + 0.3 * sin(time * 2.0 + 1.0);
            vec3 glow = color * intensity * pulse;
            gl_FragColor = vec4(glow, intensity * 0.4);
          }
        `,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    }, [])

    const particleMaterial = useMemo(() => {
      return new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color('#00d4ff') }
        },
        vertexShader: `
          attribute float size;
          attribute float opacity;
          varying float vOpacity;
          void main() {
            vOpacity = opacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying float vOpacity;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = (1.0 - dist * 2.0) * vOpacity;
            gl_FragColor = vec4(color, alpha * 0.6);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    }, [])

    useFrame((state) => {
      const time = state.clock.elapsedTime

      // Update glow materials
      glowMaterial.uniforms.time.value = time
      outerGlowMaterial.uniforms.time.value = time

      // Pulse the inner orb
      if (innerRef.current) {
        const scale = 1 + Math.sin(time * 4) * 0.05
        innerRef.current.scale.setScalar(scale)
      }

      // Update particle trail
      if (particlesRef.current && ref && typeof ref !== 'function' && ref.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const opacities = particlesRef.current.geometry.attributes.opacity.array as Float32Array

        // Shift particles back
        for (let i = particleCount - 1; i > 0; i--) {
          positions[i * 3] = positions[(i - 1) * 3] + (Math.random() - 0.5) * 0.05
          positions[i * 3 + 1] = positions[(i - 1) * 3 + 1] + (Math.random() - 0.5) * 0.05
          positions[i * 3 + 2] = positions[(i - 1) * 3 + 2]
          opacities[i] = opacities[i - 1] * 0.95
        }

        // New particle at orb position
        positions[0] = 0.3 + Math.random() * 0.2
        positions[1] = (Math.random() - 0.5) * 0.3
        positions[2] = (Math.random() - 0.5) * 0.2
        opacities[0] = 1

        particlesRef.current.geometry.attributes.position.needsUpdate = true
        particlesRef.current.geometry.attributes.opacity.needsUpdate = true
      }
    })

    return (
      <group ref={ref} position={position}>
        {/* Core orb */}
        <mesh ref={innerRef}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00d4ff"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>

        {/* Inner glow */}
        <mesh ref={glowRef} material={glowMaterial}>
          <sphereGeometry args={[0.5, 32, 32]} />
        </mesh>

        {/* Outer glow */}
        <mesh ref={outerGlowRef} material={outerGlowMaterial}>
          <sphereGeometry args={[0.8, 32, 32]} />
        </mesh>

        {/* Point light for scene illumination */}
        <pointLight color="#00d4ff" intensity={2} distance={8} decay={2} />

        {/* Particle trail */}
        <points ref={particlesRef} material={particleMaterial}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={particleData.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={particleCount}
              array={particleData.sizes}
              itemSize={1}
            />
            <bufferAttribute
              attach="attributes-opacity"
              count={particleCount}
              array={particleData.opacities}
              itemSize={1}
            />
          </bufferGeometry>
        </points>
      </group>
    )
  }
)

GlowingOrb.displayName = 'GlowingOrb'

export default GlowingOrb
