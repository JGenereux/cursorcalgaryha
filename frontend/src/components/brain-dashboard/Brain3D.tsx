"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { BrainDimension } from "@/types/brain-dashboard";
import { data } from "@/data/brain-paths";
import { BrainTubes } from "./BrainTubes";
import { BrainParticles } from "./BrainParticles";

// ─── Types ───

interface Brain3DProps {
  totalCookedScore: number;
  dimensions: BrainDimension[];
}

// ─── Build curves from path data ───

function createBrainCurves(): THREE.CatmullRomCurve3[] {
  const paths = data.economics[0].paths;
  const brainCurves: THREE.CatmullRomCurve3[] = [];

  paths.forEach((path) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < path.length; i += 3) {
      points.push(new THREE.Vector3(path[i], path[i + 1], path[i + 2]));
    }
    const tempCurve = new THREE.CatmullRomCurve3(points);
    brainCurves.push(tempCurve);
  });

  return brainCurves;
}

// ─── Score-to-color mapping ───

function scoreToThreeColor(totalScore: number): THREE.Color {
  if (totalScore <= 20) return new THREE.Color(0.25, 0.42, 0.28); // dull gray-green
  if (totalScore <= 40) return new THREE.Color(0.85, 0.45, 0.55); // soft pink
  if (totalScore <= 60) return new THREE.Color(0.95, 0.6, 0.15);  // orange with yellow
  if (totalScore <= 80) return new THREE.Color(0.8, 0.12, 0.12);  // deep red
  if (totalScore <= 95) return new THREE.Color(0.7, 0.15, 0.65);  // purple/magenta
  return new THREE.Color(1.0, 0.78, 0.1);                          // gold/crispy
}

function scoreToPulseColor(totalScore: number): THREE.Color {
  if (totalScore <= 20) return new THREE.Color(0.15, 0.3, 0.18);
  if (totalScore <= 40) return new THREE.Color(0.95, 0.6, 0.7);
  if (totalScore <= 60) return new THREE.Color(1.0, 0.85, 0.3);
  if (totalScore <= 80) return new THREE.Color(1.0, 0.3, 0.2);
  if (totalScore <= 95) return new THREE.Color(0.9, 0.3, 0.85);
  return new THREE.Color(1.0, 0.9, 0.4);
}

function scoreToParticleColor(totalScore: number): THREE.Color {
  if (totalScore <= 20) return new THREE.Color(0.3, 0.5, 0.35);
  if (totalScore <= 40) return new THREE.Color(1.0, 0.65, 0.75);
  if (totalScore <= 60) return new THREE.Color(1.0, 0.8, 0.3);
  if (totalScore <= 80) return new THREE.Color(1.0, 0.35, 0.25);
  if (totalScore <= 95) return new THREE.Color(0.85, 0.3, 0.9);
  return new THREE.Color(1.0, 0.85, 0.2);
}

// ─── Main exported component ───

export function Brain3D({
  totalCookedScore,
}: Brain3DProps): React.JSX.Element {
  const curves = useMemo(() => createBrainCurves(), []);
  const baseColor = useMemo(() => scoreToThreeColor(totalCookedScore), [totalCookedScore]);
  const pulseColor = useMemo(() => scoreToPulseColor(totalCookedScore), [totalCookedScore]);
  const particleColor = useMemo(() => scoreToParticleColor(totalCookedScore), [totalCookedScore]);
  const intensity = totalCookedScore / 100;

  return (
    <div className="relative h-[420px] w-full md:h-[500px]">
      <Canvas
        camera={{ position: [0, 0, 0.3], near: 0.001, far: 5 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <BrainTubes curves={curves} baseColor={baseColor} pulseColor={pulseColor} />
        <BrainParticles curves={curves} particleColor={particleColor} intensity={intensity} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8 + totalCookedScore * 0.02} />
      </Canvas>

      {/* Glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-40 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${
            totalCookedScore >= 96
              ? "rgba(251,191,36,0.5)"
              : totalCookedScore >= 81
              ? "rgba(192,38,211,0.4)"
              : totalCookedScore >= 61
              ? "rgba(220,38,38,0.35)"
              : totalCookedScore >= 41
              ? "rgba(245,158,11,0.3)"
              : "rgba(244,114,182,0.2)"
          }, transparent 70%)`,
        }}
      />
    </div>
  );
}
