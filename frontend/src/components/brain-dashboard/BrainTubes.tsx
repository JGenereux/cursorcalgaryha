"use client";

import { useRef } from "react";
import * as THREE from "three";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

// ─── Types ───

interface TubeProps {
  curve: THREE.CatmullRomCurve3;
  baseColor: THREE.Color;
  pulseColor: THREE.Color;
}

interface BrainTubesProps {
  curves: THREE.CatmullRomCurve3[];
  baseColor: THREE.Color;
  pulseColor: THREE.Color;
}

// ─── Shader material (adapted from reference) ───

export const BrainMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.1, 0.3, 0.6),
    mouse: new THREE.Vector3(0, 0, 0),
  },
  // vertex shader
  /*glsl*/ `
    varying vec2 vUv;
    uniform float time;
    uniform vec3 mouse;
    varying float vProgress;
    void main() {
      vUv = uv;
      vProgress = smoothstep(-1., 1., sin(vUv.x * 8. + time * 3.));

      vec3 p = position;
      float maxDist = 0.05;
      float dist = length(mouse - p);
      if (dist < maxDist) {
        vec3 dir = normalize(mouse - p);
        dir *= 1. - dist / maxDist;
        p -= dir * 0.03;
      }

      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  // fragment shader
  /*glsl*/ `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    varying float vProgress;
    void main() {
      float hideCorners1 = smoothstep(1., 0.9, vUv.x);
      float hideCorners2 = smoothstep(0., 0.1, vUv.x);
      vec3 finalColor = mix(color, color * 0.25, vProgress);
      gl_FragColor.rgba = vec4(finalColor, hideCorners1 * hideCorners2);
    }
  `
);

extend({ BrainMaterial });

// ─── Single tube ───

function Tube({ curve, baseColor }: TubeProps): React.JSX.Element {
  const brainMat = useRef<THREE.ShaderMaterial>(null!);
  const { viewport } = useThree();

  useFrame(({ clock, pointer }) => {
    brainMat.current.uniforms.time.value = clock.getElapsedTime();
    brainMat.current.uniforms.mouse.value = new THREE.Vector3(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      0
    );
    brainMat.current.uniforms.color.value = baseColor;
  });

  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.001, 2, false]} />
      {/* @ts-expect-error custom shader material JSX */}
      <brainMaterial
        ref={brainMat}
        side={THREE.DoubleSide}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── All tubes ───

export function BrainTubes({
  curves,
  baseColor,
  pulseColor,
}: BrainTubesProps): React.JSX.Element {
  return (
    <>
      {curves.map((curve, index) => (
        <Tube key={index} curve={curve} baseColor={baseColor} pulseColor={pulseColor} />
      ))}
    </>
  );
}
