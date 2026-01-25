import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Animation phases
const PHASES = {
    ATOM: 0,      // 0-1.5s: Small atom with orbiting electrons
    BURST: 1,     // 1.5-2.5s: Electrons disperse, nucleus expands
    GLOBE: 2,     // 2.5-4.5s: Particles form globe, camera pulls back
    COMPLETE: 3   // Animation done
};

// Timeline constants - CINEMATIC TIMING
const ATOM_DURATION = 2.5;   // Extended for drama
const BURST_DURATION = 1.5;  // Longer burst transition
const GLOBE_DURATION = 2.0;
const TOTAL_DURATION = ATOM_DURATION + BURST_DURATION + GLOBE_DURATION;

// Easing functions
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

// Cinematic camera controller synchronized with animation
function CinematicCamera({ animationProgress, introComplete, setIntroComplete }) {
    const { camera } = useThree();

    useEffect(() => {
        // Start centered on atom
        camera.position.set(0, 0, 3);
        camera.lookAt(0, 0, 0);
    }, [camera]);

    useFrame(() => {
        // Camera stays close during atom phase, pulls back during globe phase
        const globeStart = (ATOM_DURATION + BURST_DURATION) / TOTAL_DURATION;

        if (animationProgress < globeStart) {
            // Atom and burst phases: stay close
            camera.position.set(0, 0, 3);
            camera.lookAt(0, 0, 0);
        } else {
            // Globe phase: pull back smoothly
            const globeProgress = (animationProgress - globeStart) / (1 - globeStart);
            const easedProgress = easeOutQuart(Math.min(globeProgress, 1));

            const startZ = 3;
            const endZ = 5.5;
            camera.position.z = THREE.MathUtils.lerp(startZ, endZ, easedProgress);
            camera.lookAt(0, 0, 0);
        }

        if (animationProgress >= 1 && !introComplete) {
            setIntroComplete(true);
        }
    });

    return null;
}

// Unified color palette - ELEGANT WHITE & GOLD THEME
const COLORS = {
    // Core nucleus - warm white to gold gradient
    core: '#fffef8',          // Warm white core
    coreGlow: '#ffd700',      // Pure gold glow
    midGlow: '#e8c547',       // Champagne gold
    outerGlow: '#c9a227',     // Deep amber gold

    // Electrons - brilliant white with gold trails
    electron: '#ffffff',      // Pure white electrons
    electronGlow: '#fff4d6',  // Soft cream glow
    electronTrail: '#ffd54f', // Gold trail

    // Orbit rings - subtle gold
    orbit: '#b8860b',         // Dark goldenrod orbits
    orbitGlow: '#daa520',     // Goldenrod

    // Globe particles - white to gold spectrum
    particle: '#fffef5',      // Warm white particles
    particleGold: '#ffeaa7',  // Light gold particles
    particleDeep: '#f5d061',  // Deeper gold accent

    // Ambient atmosphere
    atmosphere: '#2a2015',    // Dark warm ambient
    atmosphereGlow: '#3d2e1c',// Warm brown-gold ambient
};

// REALISTIC CLUSTERED NUCLEUS - Like protons/neutrons
function Nucleus({ scale, opacity }) {
    const groupRef = useRef(null);
    const particlesRef = useRef([]);

    // Generate clustered nucleon positions (protons + neutrons arrangement)
    const nucleons = useMemo(() => {
        const particles = [];
        // Central particle
        particles.push({ x: 0, y: 0, z: 0, size: 0.045 });
        // Inner shell (6 particles)
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const r = 0.055;
            particles.push({
                x: Math.cos(angle) * r,
                y: Math.sin(angle) * r * 0.7,
                z: Math.sin(angle + Math.PI / 4) * r * 0.5,
                size: 0.038 + Math.random() * 0.008
            });
        }
        // Outer shell (8 particles)
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + 0.3;
            const r = 0.095;
            const yOffset = (i % 2 === 0) ? 0.03 : -0.03;
            particles.push({
                x: Math.cos(angle) * r,
                y: yOffset + Math.sin(angle * 2) * 0.02,
                z: Math.sin(angle) * r,
                size: 0.032 + Math.random() * 0.01
            });
        }
        return particles;
    }, []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        if (groupRef.current) {
            // Slow, majestic rotation
            groupRef.current.rotation.y = time * 0.4;
            groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.15;
            groupRef.current.rotation.z = Math.cos(time * 0.25) * 0.1;
        }

        // Subtle individual particle oscillation
        particlesRef.current.forEach((mesh, i) => {
            if (mesh) {
                const offset = i * 0.5;
                const pulse = 1 + Math.sin(time * 2 + offset) * 0.08;
                mesh.scale.setScalar(pulse);
            }
        });
    });

    return (
        <group ref={groupRef} scale={scale}>
            {/* Individual nucleon particles - white and gold alternating */}
            {nucleons.map((nucleon, i) => (
                <mesh
                    key={i}
                    ref={el => particlesRef.current[i] = el}
                    position={[nucleon.x, nucleon.y, nucleon.z]}
                >
                    <sphereGeometry args={[nucleon.size, 16, 16]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? COLORS.core : COLORS.coreGlow}
                        transparent
                        opacity={opacity * 0.95}
                    />
                </mesh>
            ))}

            {/* Central energy glow - pure white */}
            <mesh>
                <sphereGeometry args={[0.08, 24, 24]} />
                <meshBasicMaterial
                    color={COLORS.core}
                    transparent
                    opacity={opacity * 0.8}
                />
            </mesh>

            {/* Inner gold glow - warm and brilliant */}
            <mesh scale={1.8}>
                <sphereGeometry args={[0.1, 20, 20]} />
                <meshBasicMaterial
                    color={COLORS.coreGlow}
                    transparent
                    opacity={opacity * 0.5}
                />
            </mesh>

            {/* Mid glow layer - champagne gold */}
            <mesh scale={3}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial
                    color={COLORS.midGlow}
                    transparent
                    opacity={opacity * 0.3}
                />
            </mesh>

            {/* Outer atmospheric glow - deep amber */}
            <mesh scale={5}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial
                    color={COLORS.outerGlow}
                    transparent
                    opacity={opacity * 0.15}
                />
            </mesh>

            {/* Soft golden corona */}
            <mesh scale={8}>
                <sphereGeometry args={[0.1, 12, 12]} />
                <meshBasicMaterial
                    color={COLORS.atmosphere}
                    transparent
                    opacity={opacity * 0.08}
                />
            </mesh>
        </group>
    );
}

// CINEMATIC ELECTRONS with glowing trails
function Electrons({ animationProgress, burstProgress }) {
    const electronsRef = useRef([]);
    const glowRefs = useRef([]);
    const outerGlowRefs = useRef([]);
    const orbitRefs = useRef([]);

    // 5 electrons on elegant intersecting orbital planes - white/gold spectrum
    const orbits = useMemo(() => [
        { radius: 0.5, speed: 1.8, tiltX: 0, tiltZ: 0, phase: 0, color: COLORS.electron },
        { radius: 0.62, speed: -1.5, tiltX: Math.PI / 3, tiltZ: Math.PI / 8, phase: Math.PI * 0.4, color: COLORS.particle },
        { radius: 0.55, speed: 1.6, tiltX: -Math.PI / 4, tiltZ: -Math.PI / 6, phase: Math.PI * 0.8, color: COLORS.particleGold },
        { radius: 0.68, speed: -1.3, tiltX: Math.PI / 6, tiltZ: Math.PI / 3, phase: Math.PI * 1.2, color: COLORS.electron },
        { radius: 0.58, speed: 1.4, tiltX: -Math.PI / 5, tiltZ: Math.PI / 4, phase: Math.PI * 1.6, color: COLORS.particle },
    ], []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        orbits.forEach((orbit, i) => {
            // Speed increases smoothly before burst
            const speedMultiplier = 1 + burstProgress * 4;
            const angle = time * orbit.speed * speedMultiplier + orbit.phase;

            // During burst, electrons spiral outward dramatically
            const burstRadius = orbit.radius + burstProgress * 8;

            // 3D orbital calculation
            const baseX = Math.cos(angle) * burstRadius;
            const baseY = Math.sin(angle) * burstRadius;

            // Apply orbital tilts
            const cosX = Math.cos(orbit.tiltX);
            const sinX = Math.sin(orbit.tiltX);
            const cosZ = Math.cos(orbit.tiltZ);
            const sinZ = Math.sin(orbit.tiltZ);

            const x = baseX * cosZ - baseY * sinZ * cosX;
            const y = baseX * sinZ + baseY * cosZ * cosX;
            const z = baseY * sinX;

            // Update electron core position
            if (electronsRef.current[i]) {
                electronsRef.current[i].position.set(x, y, z);
                const electronOpacity = Math.max(0, 1 - burstProgress * 1.1);
                electronsRef.current[i].material.opacity = electronOpacity;
            }

            // Update inner glow
            if (glowRefs.current[i]) {
                glowRefs.current[i].position.set(x, y, z);
                glowRefs.current[i].material.opacity = Math.max(0, 0.6 - burstProgress * 0.7);
            }

            // Update outer glow
            if (outerGlowRefs.current[i]) {
                outerGlowRefs.current[i].position.set(x, y, z);
                outerGlowRefs.current[i].material.opacity = Math.max(0, 0.3 - burstProgress * 0.5);
            }

            // Orbit rings fade out elegantly
            if (orbitRefs.current[i]) {
                orbitRefs.current[i].rotation.x = orbit.tiltX;
                orbitRefs.current[i].rotation.z = orbit.tiltZ;
                const ringOpacity = Math.max(0, 0.2 - burstProgress * 0.35);
                orbitRefs.current[i].material.opacity = ringOpacity;
            }
        });
    });

    return (
        <group>
            {orbits.map((orbit, i) => (
                <group key={i}>
                    {/* Electron core - brilliant white/gold point */}
                    <mesh ref={el => electronsRef.current[i] = el}>
                        <sphereGeometry args={[0.035, 16, 16]} />
                        <meshBasicMaterial
                            color={orbit.color}
                            transparent
                            opacity={1}
                        />
                    </mesh>

                    {/* Inner glow - warm cream halo */}
                    <mesh ref={el => glowRefs.current[i] = el}>
                        <sphereGeometry args={[0.07, 12, 12]} />
                        <meshBasicMaterial
                            color={COLORS.electronGlow}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>

                    {/* Outer glow - soft gold atmosphere */}
                    <mesh ref={el => outerGlowRefs.current[i] = el}>
                        <sphereGeometry args={[0.12, 10, 10]} />
                        <meshBasicMaterial
                            color={COLORS.particleDeep}
                            transparent
                            opacity={0.3}
                        />
                    </mesh>

                    {/* Orbit path - elegant goldenrod ring */}
                    <mesh ref={el => orbitRefs.current[i] = el}>
                        <torusGeometry args={[orbit.radius, 0.002, 8, 120]} />
                        <meshBasicMaterial
                            color={COLORS.orbit}
                            transparent
                            opacity={0.2}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Particle globe that forms from atom
function ParticleGlobe({ mousePosition, introComplete, animationProgress }) {
    const pointsRef = useRef(null);
    const wireframeRef = useRef(null);
    const glowRef = useRef(null);

    // Calculate phase-based progress
    const atomEnd = ATOM_DURATION / TOTAL_DURATION;
    const burstEnd = (ATOM_DURATION + BURST_DURATION) / TOTAL_DURATION;

    // Formation progress (0 = atom size, 1 = full globe)
    const formationProgress = useMemo(() => {
        if (animationProgress < atomEnd) return 0;
        if (animationProgress > burstEnd) {
            const globeProgress = (animationProgress - burstEnd) / (1 - burstEnd);
            return Math.min(easeOutExpo(globeProgress), 1);
        }
        // During burst phase
        const burstProgress = (animationProgress - atomEnd) / (burstEnd - atomEnd);
        return easeInOutCubic(burstProgress) * 0.3;
    }, [animationProgress, atomEnd, burstEnd]);

    // Create particles that can animate from center to sphere positions
    const particleData = useMemo(() => {
        const count = 4000;
        const positions = new Float32Array(count * 3);
        const targetPositions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Fibonacci sphere distribution for final globe
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;

            const radius = 2;
            const tx = radius * Math.cos(theta) * Math.sin(phi);
            const ty = radius * Math.sin(theta) * Math.sin(phi);
            const tz = radius * Math.cos(phi);

            targetPositions[i * 3] = tx;
            targetPositions[i * 3 + 1] = ty;
            targetPositions[i * 3 + 2] = tz;

            // Start clustered around center (atom nucleus)
            const startRadius = 0.2;
            const sx = (Math.random() - 0.5) * startRadius;
            const sy = (Math.random() - 0.5) * startRadius;
            const sz = (Math.random() - 0.5) * startRadius;

            positions[i * 3] = sx;
            positions[i * 3 + 1] = sy;
            positions[i * 3 + 2] = sz;

            // Colors - WHITE to GOLD gradient for stunning gold theme
            const heightFactor = (ty + radius) / (radius * 2);
            const intensity = 0.75 + Math.random() * 0.25;
            // White-gold gradient: warm white at top, golden at bottom
            colors[i * 3] = intensity * (0.95 + heightFactor * 0.05);       // High red (warm)
            colors[i * 3 + 1] = intensity * (0.85 + heightFactor * 0.10);   // Med-high green (gold tone)
            colors[i * 3 + 2] = intensity * (0.60 + heightFactor * 0.20);   // Lower blue (warm gold)
        }

        return { positions, targetPositions, colors };
    }, []);

    // Animate particles from atom to globe
    useFrame((state, delta) => {
        if (pointsRef.current) {
            const positionAttr = pointsRef.current.geometry.attributes.position;
            const { positions, targetPositions } = particleData;

            for (let i = 0; i < positionAttr.count; i++) {
                const startX = positions[i * 3];
                const startY = positions[i * 3 + 1];
                const startZ = positions[i * 3 + 2];

                const targetX = targetPositions[i * 3];
                const targetY = targetPositions[i * 3 + 1];
                const targetZ = targetPositions[i * 3 + 2];

                // Lerp from atom cluster to globe positions
                positionAttr.setXYZ(
                    i,
                    THREE.MathUtils.lerp(startX, targetX, formationProgress),
                    THREE.MathUtils.lerp(startY, targetY, formationProgress),
                    THREE.MathUtils.lerp(startZ, targetZ, formationProgress)
                );
            }
            positionAttr.needsUpdate = true;

            // Rotation
            pointsRef.current.rotation.y += delta * 0.05;

            if (introComplete && mousePosition) {
                pointsRef.current.rotation.x = THREE.MathUtils.lerp(
                    pointsRef.current.rotation.x,
                    mousePosition.y * 0.08,
                    0.02
                );
            }
        }

        if (wireframeRef.current) {
            wireframeRef.current.rotation.y += delta * 0.05;
            // Fade in wireframe as globe forms
            wireframeRef.current.material.opacity = Math.min(formationProgress * 0.15, 0.12);
            wireframeRef.current.scale.setScalar(formationProgress * 2 || 0.01);

            if (introComplete && mousePosition) {
                wireframeRef.current.rotation.x = THREE.MathUtils.lerp(
                    wireframeRef.current.rotation.x,
                    mousePosition.y * 0.08,
                    0.02
                );
            }
        }

        if (glowRef.current) {
            const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 0.95;
            glowRef.current.scale.setScalar(formationProgress * 1.95 * pulse || 0.01);
            glowRef.current.material.opacity = formationProgress * 0.4;
        }
    });

    // Particle opacity based on animation phase
    const particleOpacity = animationProgress < atomEnd ? 0.4 :
        Math.min(0.4 + (animationProgress - atomEnd) * 1.5, 0.9);

    return (
        <group>
            {/* Particle dots */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleData.positions.length / 3}
                        array={new Float32Array(particleData.positions)}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={particleData.colors.length / 3}
                        array={particleData.colors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.018}
                    vertexColors
                    transparent
                    opacity={particleOpacity}
                    sizeAttenuation
                    depthWrite={false}
                />
            </points>

            {/* Wireframe sphere (fades in) */}
            <mesh ref={wireframeRef}>
                <sphereGeometry args={[1, 48, 48]} />
                <meshBasicMaterial
                    color={COLORS.orbit}
                    wireframe
                    transparent
                    opacity={0}
                />
            </mesh>

            {/* Inner atmosphere glow (fades in) */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color={COLORS.outerGlow}
                    transparent
                    opacity={0}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Outer glow ring (fades in) */}
            {formationProgress > 0.5 && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[2.1, 2.5, 64]} />
                    <meshBasicMaterial
                        color={COLORS.midGlow}
                        transparent
                        opacity={(formationProgress - 0.5) * 0.16}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </group>
    );
}

// Floating ambient particles
function FloatingParticles({ animationProgress }) {
    const pointsRef = useRef(null);

    const particles = useMemo(() => {
        const count = 200;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
        }

        return positions;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
        }
    });

    // Fade in ambient particles during globe phase
    const opacity = Math.min(animationProgress * 0.5, 0.3);

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.02}
                color="#3a6090"
                transparent
                opacity={opacity}
                sizeAttenuation
            />
        </points>
    );
}

// Main scene with all elements
function Scene({ mousePosition, introComplete, setIntroComplete }) {
    const [animationProgress, setAnimationProgress] = useState(0);
    const startTime = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            startTime.current = Date.now();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useFrame(() => {
        if (!startTime.current) return;

        const elapsed = (Date.now() - startTime.current) / 1000;
        const progress = Math.min(elapsed / TOTAL_DURATION, 1);
        setAnimationProgress(progress);
    });

    // Calculate phase-specific progress values
    const atomEnd = ATOM_DURATION / TOTAL_DURATION;
    const burstEnd = (ATOM_DURATION + BURST_DURATION) / TOTAL_DURATION;

    const burstProgress = animationProgress > atomEnd
        ? Math.min((animationProgress - atomEnd) / (burstEnd - atomEnd), 1)
        : 0;

    // Nucleus visibility (fades during burst)
    const nucleusScale = 1 - burstProgress * 0.5;
    const nucleusOpacity = Math.max(0, 1 - burstProgress * 1.5);

    return (
        <>
            <CinematicCamera
                animationProgress={animationProgress}
                introComplete={introComplete}
                setIntroComplete={setIntroComplete}
            />
            <ambientLight intensity={0.2} color="#fff8e0" />
            <pointLight position={[10, 10, 10]} intensity={0.3} color="#ffd700" />
            <pointLight position={[-10, -10, -10]} intensity={0.15} color="#c9a227" />

            {/* Atom components (visible during atom & burst phases) */}
            {nucleusOpacity > 0 && (
                <>
                    <Nucleus scale={nucleusScale} opacity={nucleusOpacity} />
                    <Electrons
                        animationProgress={animationProgress}
                        burstProgress={burstProgress}
                    />
                </>
            )}

            {/* Globe particles (always present, animate from center) */}
            <ParticleGlobe
                mousePosition={mousePosition}
                introComplete={introComplete}
                animationProgress={animationProgress}
            />

            {/* Ambient floating particles */}
            <FloatingParticles animationProgress={animationProgress} />
        </>
    );
}

// Exported component with canvas wrapper
export default function GlobeScene({ onIntroComplete }) {
    const containerRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [introComplete, setIntroComplete] = useState(false);

    useEffect(() => {
        if (introComplete && onIntroComplete) {
            onIntroComplete();
        }
    }, [introComplete, onIntroComplete]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (containerRef.current && introComplete) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePosition({
                    x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
                    y: -((e.clientY - rect.top) / rect.height) * 2 + 1
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [introComplete]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0"
            style={{
                background: 'radial-gradient(ellipse at 50% 30%, #1a1408 0%, #0d0a04 50%, #050402 100%)'
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 3], fov: 50 }}
                style={{ width: '100%', height: '100%' }}
                dpr={Math.min(window.devicePixelRatio, 3)} // Support up to 4K displays
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                }}
                onCreated={({ gl }) => {
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                    gl.toneMappingExposure = 1.2;
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                }}
            >
                <Scene
                    mousePosition={mousePosition}
                    introComplete={introComplete}
                    setIntroComplete={setIntroComplete}
                />
            </Canvas>

            {/* Cinematic letterbox bars */}
            <div
                className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)'
                }}
            />
            <div
                className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)'
                }}
            />

            {/* Ambient golden glow effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 35%, rgba(255, 200, 100, 0.08) 0%, transparent 45%)'
                }}
            />
        </div>
    );
}
