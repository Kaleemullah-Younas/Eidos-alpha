'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Drawing3D } from '@/lib/lectureStorage';
import { ScenePreset } from '@/lib/scenePresets';
import styles from './Scene3D.module.css';

interface Scene3DProps {
    drawings: Drawing3D[];
    elapsedTime: number;
    isPlaying: boolean;
    particleType?: ScenePreset['particleType'];
    topic?: string;
}

// ============================================================
// INDIVIDUAL 3D SHAPE COMPONENT
// ============================================================
function Shape3D({
    drawing,
    progress,
}: {
    drawing: Drawing3D;
    progress: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Animated rotation
    useFrame((_, delta) => {
        if (meshRef.current && drawing.rotationSpeed) {
            meshRef.current.rotation.x += drawing.rotationSpeed.x * delta;
            meshRef.current.rotation.y += drawing.rotationSpeed.y * delta;
            meshRef.current.rotation.z += drawing.rotationSpeed.z * delta;
        }
    });

    // Calculate scale based on progress with bounce effect
    const scale = useMemo(() => {
        const t = Math.min(1, progress * 2);
        // Elastic easing for "pop" effect
        const elastic = t === 1 ? 1 : 1 - Math.pow(2, -10 * t) * Math.cos((t * 10 - 0.75) * ((2 * Math.PI) / 3));
        const s = Math.max(0, Math.min(1.1, elastic));
        return [s, s, s] as [number, number, number];
    }, [progress]);

    // Initial rotation
    const rotation = useMemo(() => {
        if (drawing.rotation) {
            return [
                drawing.rotation.x * (Math.PI / 180),
                drawing.rotation.y * (Math.PI / 180),
                drawing.rotation.z * (Math.PI / 180),
            ] as [number, number, number];
        }
        return [0, 0, 0] as [number, number, number];
    }, [drawing.rotation]);

    // Convert position from canvas coordinates (800x500) to 3D space
    const position = useMemo(() => {
        const x = ((drawing.position.x - 400) / 400) * 5;
        const y = (-(drawing.position.y - 250) / 250) * 3;
        const z = drawing.position.z || 0;
        return [x, y, z] as [number, number, number];
    }, [drawing.position]);

    const opacity = (drawing.opacity ?? 1) * Math.min(1, progress * 3);

    // Create geometry based on type
    const geometry = useMemo(() => {
        const size = drawing.size / 80; // Scale for 3D space
        switch (drawing.type) {
            case 'cube':
                return <boxGeometry args={[size, size, size]} />;
            case 'sphere':
                return <sphereGeometry args={[size / 2, 32, 32]} />;
            case 'cylinder':
                return <cylinderGeometry args={[size / 2, size / 2, size, 32]} />;
            case 'pyramid':
                return <coneGeometry args={[size / 2, size, 4]} />;
            case 'cone':
                return <coneGeometry args={[size / 2, size, 32]} />;
            case 'torus':
                return <torusGeometry args={[size / 2, size / 6, 16, 100]} />;
            default:
                return <boxGeometry args={[size, size, size]} />;
        }
    }, [drawing.type, drawing.size]);

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
            <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
                {geometry}
                <meshStandardMaterial
                    color={drawing.color}
                    wireframe={drawing.wireframe ?? false}
                    transparent
                    opacity={opacity}
                    emissive={drawing.color}
                    emissiveIntensity={0.3}
                    metalness={0.3}
                    roughness={0.4}
                />
            </mesh>
        </Float>
    );
}

// ============================================================
// PARTICLE SYSTEMS
// ============================================================

// Stars for astronomy
function StarField() {
    return <Stars radius={50} depth={50} count={1000} factor={3} saturation={0} fade speed={0.5} />;
}

// Electrons (fast orbiting particles)
function ElectronParticles() {
    const groupRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Points>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(50 * 3);
        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 2;
            const radius = 3 + Math.random() * 2;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, []);

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.5;
            groupRef.current.rotation.x += delta * 0.2;
        }
    });

    return (
        <group ref={groupRef}>
            <points ref={particlesRef} geometry={geometry}>
                <pointsMaterial size={0.1} color="#22c55e" transparent opacity={0.8} sizeAttenuation />
            </points>
        </group>
    );
}

// Data flow particles (for tech)
function DataParticles() {
    const particlesRef = useRef<THREE.Points>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(80 * 3);
        for (let i = 0; i < 80; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 3;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, []);

    useFrame((state) => {
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < 80; i++) {
                positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={particlesRef} geometry={geometry}>
            <pointsMaterial size={0.08} color="#60a5fa" transparent opacity={0.6} sizeAttenuation />
        </points>
    );
}

// Energy particles (for physics)
function EnergyParticles() {
    const groupRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Points>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(60 * 3);
        for (let i = 0; i < 60; i++) {
            const t = i / 60;
            positions[i * 3] = (t - 0.5) * 15;
            positions[i * 3 + 1] = Math.sin(t * Math.PI * 4) * 2;
            positions[i * 3 + 2] = -2;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, []);

    useFrame((state) => {
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < 60; i++) {
                const t = i / 60;
                positions[i * 3 + 1] = Math.sin((t + state.clock.elapsedTime * 0.5) * Math.PI * 4) * 2;
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <group ref={groupRef}>
            <points ref={particlesRef} geometry={geometry}>
                <pointsMaterial size={0.12} color="#fbbf24" transparent opacity={0.9} sizeAttenuation />
            </points>
        </group>
    );
}

// Bubbles (for chemistry)
function BubbleParticles() {
    const particlesRef = useRef<THREE.Points>(null);
    const velocities = useRef<Float32Array>(new Float32Array(40 * 3));

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(40 * 3);
        for (let i = 0; i < 40; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
            velocities.current[i * 3 + 1] = 0.02 + Math.random() * 0.03;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, []);

    useFrame(() => {
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < 40; i++) {
                positions[i * 3 + 1] += velocities.current[i * 3 + 1];
                if (positions[i * 3 + 1] > 4) {
                    positions[i * 3 + 1] = -4;
                    positions[i * 3] = (Math.random() - 0.5) * 10;
                }
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={particlesRef} geometry={geometry}>
            <pointsMaterial size={0.15} color="#06b6d4" transparent opacity={0.5} sizeAttenuation />
        </points>
    );
}

// Sparkles (generic)
function SparkleParticles() {
    const particlesRef = useRef<THREE.Points>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(100 * 3);
        for (let i = 0; i < 100; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, []);

    useFrame((_, delta) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y += delta * 0.02;
        }
    });

    return (
        <points ref={particlesRef} geometry={geometry}>
            <pointsMaterial size={0.05} color="#a78bfa" transparent opacity={0.5} sizeAttenuation />
        </points>
    );
}

// Particle system selector
function ParticleSystem({ type }: { type?: ScenePreset['particleType'] }) {
    switch (type) {
        case 'stars':
            return <StarField />;
        case 'electrons':
            return <ElectronParticles />;
        case 'data':
            return <DataParticles />;
        case 'energy':
            return <EnergyParticles />;
        case 'bubbles':
            return <BubbleParticles />;
        case 'sparkles':
        default:
            return <SparkleParticles />;
    }
}

// ============================================================
// GRID FLOOR
// ============================================================
function GridFloor() {
    return (
        <gridHelper
            args={[20, 40, '#1e3a5f', '#0f1f35']}
            position={[0, -3.5, 0]}
        />
    );
}

// ============================================================
// CAMERA CONTROLLER
// ============================================================
function CameraController({ isPlaying }: { isPlaying: boolean }) {
    const { camera } = useThree();

    useFrame((state) => {
        if (isPlaying) {
            // Subtle camera movement when playing
            camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.3;
            camera.position.y = Math.cos(state.clock.elapsedTime * 0.08) * 0.2;
            camera.lookAt(0, 0, 0);
        }
    });

    return null;
}

// ============================================================
// MAIN SCENE COMPONENT
// ============================================================
export default function Scene3D({
    drawings,
    elapsedTime,
    isPlaying,
    particleType = 'sparkles',
}: Scene3DProps) {
    // Filter and calculate progress for each drawing
    const activeDrawings = useMemo(() => {
        return drawings
            .filter((d) => elapsedTime >= d.timestamp)
            .map((d) => ({
                drawing: d,
                progress: Math.min(1, (elapsedTime - d.timestamp) / Math.max(0.1, d.duration)),
            }));
    }, [drawings, elapsedTime]);

    // Always render scene (even without explicit drawings) for ambient effects
    const hasContent = drawings.length > 0 || particleType;

    if (!hasContent) {
        return null;
    }

    return (
        <div className={styles.scene3dContainer}>
            <Canvas>
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                    <CameraController isPlaying={isPlaying} />

                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
                    <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#60a5fa" />
                    <pointLight position={[0, 2, 4]} intensity={0.6} color="#a78bfa" />
                    <pointLight position={[0, -2, -4]} intensity={0.3} color="#22c55e" />

                    {/* Particle System */}
                    <ParticleSystem type={particleType} />

                    {/* Grid Floor */}
                    <GridFloor />

                    {/* 3D Shapes */}
                    {activeDrawings.map(({ drawing, progress }, index) => (
                        <Shape3D key={`${drawing.type}-${index}-${drawing.timestamp}`} drawing={drawing} progress={progress} />
                    ))}

                    {/* Interactive controls when paused */}
                    {!isPlaying && (
                        <OrbitControls
                            enableZoom={true}
                            enablePan={false}
                            autoRotate={true}
                            autoRotateSpeed={0.3}
                            maxDistance={15}
                            minDistance={4}
                            maxPolarAngle={Math.PI / 1.5}
                            minPolarAngle={Math.PI / 4}
                        />
                    )}
                </Suspense>
            </Canvas>
        </div>
    );
}
