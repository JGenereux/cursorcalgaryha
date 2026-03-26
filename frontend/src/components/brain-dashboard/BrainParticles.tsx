"use client";

import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

// ─── Types ───

interface BrainParticlesProps {
  curves: THREE.CatmullRomCurve3[];
  particleColor: THREE.Color;
  intensity: number;
}

interface ParticlePoint {
  currentOffset: number;
  speed: number;
  curve: THREE.CatmullRomCurve3;
  curPosition: number;
}

// ─── Helpers ───

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// ─── Particle shader material (adapted from reference) ───

export const BrainParticleMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color(0.1, 0.3, 0.6) },
  // vertex shader
  /*glsl*/ `
    varying vec2 vUv;
    uniform float time;
    varying float vProgress;
    attribute float randoms;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = randoms * 2.0 * (1.0 / -mvPosition.z);
    }
  `,
  // fragment shader
  /*glsl*/ `
    uniform float time;
    uniform vec3 color;
    void main() {
      float disc = length(gl_PointCoord.xy - vec2(0.5));
      float opacity = 0.3 * smoothstep(0.5, 0.4, disc);
      gl_FragColor = vec4(color * opacity + vec3(opacity), 1.0);
    }
  `
);

extend({ BrainParticleMaterial });

// ─── Particles flowing along brain curves ───

export function BrainParticles({
  curves,
  particleColor,
  intensity,
}: BrainParticlesProps): React.JSX.Element {
  const density = 10;
  const numberOfPoints = density * curves.length;
  const myPoints = useRef<ParticlePoint[]>([]);
  const brainGeo = useRef<THREE.BufferGeometry>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const positions = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < numberOfPoints; i++) {
      arr.push(randomRange(-1, 1), randomRange(-1, 1), randomRange(-1, 1));
    }
    return new Float32Array(arr);
  }, [numberOfPoints]);

  const randoms = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < numberOfPoints; i++) {
      arr.push(randomRange(0.3, 1.0));
    }
    return new Float32Array(arr);
  }, [numberOfPoints]);

  useEffect(() => {
    myPoints.current = [];
    for (let i = 0; i < curves.length; i++) {
      for (let j = 0; j < density; j++) {
        myPoints.current.push({
          currentOffset: Math.random(),
          speed: Math.random() * 0.01,
          curve: curves[i],
          curPosition: Math.random(),
        });
      }
    }
  }, [curves]);

  useFrame(() => {
    if (!brainGeo.current) return;
    const posArray = brainGeo.current.attributes.position
      .array as Float32Array;

    for (let i = 0; i < myPoints.current.length; i++) {
      myPoints.current[i].curPosition += myPoints.current[i].speed;
      myPoints.current[i].curPosition = myPoints.current[i].curPosition % 1;

      const curPosition = myPoints.current[i].curve.getPointAt(
        myPoints.current[i].curPosition
      );
      posArray[i * 3] = curPosition.x;
      posArray[i * 3 + 1] = curPosition.y;
      posArray[i * 3 + 2] = curPosition.z;
    }

    brainGeo.current.attributes.position.needsUpdate = true;

    // Update color uniform
    if (matRef.current) {
      matRef.current.uniforms.color.value = particleColor;
    }
  });

  return (
    <points>
      <bufferGeometry attach="geometry" ref={brainGeo}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-randoms"
          args={[randoms, 1]}
          count={randoms.length}
          itemSize={1}
        />
      </bufferGeometry>
      {/* @ts-expect-error custom shader material JSX */}
      <brainParticleMaterial
        ref={matRef}
        attach="material"
        depthTest={false}
        depthWrite={false}
        transparent
        blending={THREE.AdditiveBlending}
        opacity={0.4 + intensity * 0.6}
      />
    </points>
  );
}
