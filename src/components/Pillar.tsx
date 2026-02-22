import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PillarProps {
  position?: [number, number, number]
}

export default function Pillar({ position = [0, 0, 0] }: PillarProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const edgeRef = useRef<THREE.LineSegments>(null!)

  // Create edge geometry for neon outline effect
  const edgeGeometry = useMemo(() => {
    const boxGeometry = new THREE.BoxGeometry(1.5, 20, 1)
    return new THREE.EdgesGeometry(boxGeometry)
  }, [])

  const edgeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#00d4ff') }
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec3 vPosition;

        void main() {
          float pulse = 0.7 + 0.3 * sin(time * 2.0 + vPosition.y * 0.5);
          vec3 glowColor = color * pulse;
          gl_FragColor = vec4(glowColor, 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
  }, [])

  // Inner glow material
  const innerMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color('#001020') },
        glowColor: { value: new THREE.Color('#003050') }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 glowColor;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          // Edge glow based on viewing angle
          float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          edge = pow(edge, 2.0);

          // Vertical scanning line effect
          float scanLine = sin(vPosition.y * 5.0 - time * 3.0) * 0.5 + 0.5;
          scanLine = step(0.95, scanLine) * 0.3;

          vec3 color = mix(baseColor, glowColor, edge * 0.5 + scanLine);
          gl_FragColor = vec4(color, 0.9);
        }
      `,
      transparent: true,
      side: THREE.FrontSide
    })
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    edgeMaterial.uniforms.time.value = time
    innerMaterial.uniforms.time.value = time
  })

  return (
    <group position={position}>
      {/* Main pillar body */}
      <mesh ref={meshRef} material={innerMaterial}>
        <boxGeometry args={[1.5, 20, 1]} />
      </mesh>

      {/* Neon edges */}
      <lineSegments ref={edgeRef} geometry={edgeGeometry} material={edgeMaterial} />

      {/* Top cap glow */}
      <mesh position={[0, 10, 0]}>
        <boxGeometry args={[1.7, 0.2, 1.2]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} />
      </mesh>

      {/* Bottom cap glow */}
      <mesh position={[0, -10, 0]}>
        <boxGeometry args={[1.7, 0.2, 1.2]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} />
      </mesh>

      {/* Point lights on caps for illumination */}
      <pointLight position={[0, 10, 1]} color="#00d4ff" intensity={0.5} distance={3} />
      <pointLight position={[0, -10, 1]} color="#00d4ff" intensity={0.5} distance={3} />
    </group>
  )
}
