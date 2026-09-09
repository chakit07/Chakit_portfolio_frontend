'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import HeroFramedImage from './HeroFramedImage';

// --- Preset 1: Stylized Developer Laptop ---
function LaptopScene({ accentColor = '#6366f1', intensity = 1 }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * 0.5 * intensity;
    const mouseX = state.pointer.x * 0.2;
    const mouseY = state.pointer.y * 0.2;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX + Math.sin(t * 0.8) * 0.1, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouseY + Math.cos(t * 0.6) * 0.05, 0.05);
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} scale={1.1}>
      {/* Laptop Base */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[2.2, 0.08, 1.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Trackpad */}
      <mesh position={[0, -0.038, 0.45]}>
        <boxGeometry args={[0.7, 0.005, 0.45]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Keyboard Area */}
      <mesh position={[0, -0.038, -0.15]}>
        <boxGeometry args={[1.9, 0.005, 0.7]} />
        <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Keyboard Accent Underglow */}
      <mesh position={[0, -0.035, -0.15]}>
        <planeGeometry args={[1.8, 0.6]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.35} />
      </mesh>

      {/* Screen Hinge & Lid */}
      <group position={[0, -0.04, -0.72]} rotation={[-0.35, 0, 0]}>
        {/* Screen Bezel / Back */}
        <mesh position={[0, 0.72, -0.04]}>
          <boxGeometry args={[2.2, 1.44, 0.06]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Screen Display Glowing Face */}
        <mesh position={[0, 0.72, -0.005]}>
          <planeGeometry args={[2.08, 1.32]} />
          <meshStandardMaterial
            color="#090d16"
            emissive={accentColor}
            emissiveIntensity={0.35 * intensity}
            roughness={0.1}
          />
        </mesh>
        {/* Code aesthetic lines on screen */}
        <mesh position={[-0.4, 0.85, 0.001]}>
          <planeGeometry args={[1.0, 0.06]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
        <mesh position={[-0.2, 0.7, 0.001]}>
          <planeGeometry args={[1.4, 0.04]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[-0.3, 0.55, 0.001]}>
          <planeGeometry args={[1.2, 0.04]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
        <mesh position={[-0.5, 0.4, 0.001]}>
          <planeGeometry args={[0.8, 0.04]} />
          <meshBasicMaterial color="#34d399" />
        </mesh>
      </group>

      {/* Floating Accent Orbit Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.9, 0.015, 16, 64]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// --- Preset 2: Floating Abstract Geometric Shapes ---
function GeometryScene({ accentColor = '#6366f1', intensity = 1 }) {
  const mainRef = useRef();
  const ringRef = useRef();
  const smallRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * intensity;
    const mouseX = state.pointer.x * 0.3;
    const mouseY = state.pointer.y * 0.3;

    if (mainRef.current) {
      mainRef.current.rotation.x = t * 0.2 + mouseY;
      mainRef.current.rotation.y = t * 0.3 + mouseX;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.15;
      ringRef.current.rotation.x = Math.PI / 4 + mouseY * 0.5;
    }
    if (smallRef.current) {
      smallRef.current.position.y = Math.sin(t * 1.2) * 0.4;
      smallRef.current.rotation.y = -t * 0.5;
    }
  });

  return (
    <group scale={1.2}>
      {/* Central Icosahedron */}
      <mesh ref={mainRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color={accentColor}
          wireframe
          wireframeLinewidth={2}
          emissive={accentColor}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Outer Orbit Torus */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.8, 0.03, 16, 100]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
      </mesh>

      {/* Orbiting Octahedron */}
      <mesh ref={smallRef} position={[1.6, 0, 0]}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#a855f7" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// --- Orbiting Subtle Particle Field ---
function OrbitingParticles({ count = 80, accentColor = '#6366f1', intensity = 1 }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorObj = new THREE.Color(accentColor);

    for (let i = 0; i < count; i++) {
      const radius = 2.0 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      col[i * 3] = colorObj.r;
      col[i * 3 + 1] = colorObj.g;
      col[i * 3 + 2] = colorObj.b;
    }

    return [pos, col];
  }, [count, accentColor]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05 * intensity;
    pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.03) * 0.1;
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors}>
      <PointMaterial
        transparent
        vertexColors
        size={0.06}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

// --- Preset 4: 3D Photo Hologram Badge ---
function HologramScene({ imageUrl, accentColor = '#6366f1', intensity = 1 }) {
  const groupRef = useRef();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const src = imageUrl;
    if (!src) return;

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (!isMounted) return;
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      setTexture(tex);
    };

    img.onerror = () => {
      // Fallback with cache-buster to bypass browser CORS cache collision
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        if (!isMounted) return;
        const tex = new THREE.Texture(fallbackImg);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        setTexture(tex);
      };
      const cacheBustSrc = src.includes('?') ? `${src}&t=${Date.now()}` : `${src}?t=${Date.now()}`;
      fallbackImg.src = cacheBustSrc;
    };

    img.src = src;

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const mouseX = state.pointer.x * 0.45;
    const mouseY = state.pointer.y * 0.45;

    // Smooth spring physics tilting toward cursor
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX + Math.sin(t * 0.6 * intensity) * 0.04, 0.08);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouseY + Math.cos(t * 0.5 * intensity) * 0.03, 0.08);
  });

  return (
    <group ref={groupRef} scale={1.15}>
      {/* 1. Ambient Radial Back-glow behind card (soft aura) */}
      <mesh position={[0, 0, -0.12]}>
        <planeGeometry args={[2.8, 3.3]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2. Main Badge Backing (Dark Cyber Titanium) */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[2.0, 2.5, 0.04]} />
        <meshStandardMaterial
          color="#0a0f1d"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* 3. Sleek Beveled Metallic Neon Border */}
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[2.04, 2.54, 0.02]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.45 * intensity}
          roughness={0.25}
          metalness={0.8}
        />
      </mesh>

      {/* 4. Photo Plane (User portrait texture) */}
      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[1.94, 2.44]} />
        {texture ? (
          <meshBasicMaterial
            key={texture.uuid}
            map={texture}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial
            color="#131d31"
            emissive={accentColor}
            emissiveIntensity={0.2}
            roughness={0.4}
          />
        )}
      </mesh>

      {/* 4b. Holographic Wireframe Avatar Placeholder (shown while loading or if no photo) */}
      {!texture && (
        <group position={[0, 0, 0.02]}>
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.38, 20, 20]} />
            <meshStandardMaterial color={accentColor} wireframe emissive={accentColor} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, -0.38, 0]}>
            <cylinderGeometry args={[0.32, 0.65, 0.68, 16, 1, true]} />
            <meshStandardMaterial color={accentColor} wireframe emissive={accentColor} emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}

      {/* 5. Clean Protective Glass Sheen */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[1.94, 2.44]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.08}
          roughness={0.06}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          reflectivity={0.85}
        />
      </mesh>
    </group>
  );
}

// --- Main 3D Hero Canvas Component ---
export default function ThreeHeroCanvas({
  preset = 'laptop',
  accentColor = '#6366f1',
  intensity = 1.0,
  particles = true,
  fallbackImage = '',
  imageUrl = '',
  enableOnMobile = false
}) {
  const containerRef = useRef(null);
  const [isInViewport, setIsInViewport] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    // Viewport intersection observer: pause rendering when outside view
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkMobile);
      observer.disconnect();
    };
  }, []);

  // If user prefers reduced motion or WebGL is unavailable or mobile is disabled
  const shouldRenderStatic = prefersReducedMotion || !hasWebGL || (isMobile && !enableOnMobile);

  if (shouldRenderStatic) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center relative select-none"
      >
        {fallbackImage ? (
          <HeroFramedImage
            src={fallbackImage}
            alt="Hero Visual"
            accentColor={accentColor}
            cardTilt={true}
          />
        ) : (
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent border border-primary/20 backdrop-blur-sm">
            <div className="w-3/4 h-3/4 rounded-full border border-primary/30 border-dashed animate-[spin_40s_linear_infinite]" />
            <div className="absolute w-1/2 h-1/2 rounded-full bg-primary/10 blur-xl" />
            <div className="absolute text-primary/40 font-mono text-xs tracking-widest uppercase">
              {preset}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'pan-y' }} // Allows touch page scrolling over the canvas without blocking!
    >
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        dpr={[1, 1.5]} // capped DPR for high performance
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        frameloop={isInViewport ? 'always' : 'never'} // Pauses rendering loop when off-screen!
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <pointLight position={[-4, -2, -2]} color={accentColor} intensity={1.5} />
        <pointLight position={[3, 3, 2]} color="#38bdf8" intensity={1} />

        <Float speed={1.5 * intensity} rotationIntensity={0.3 * intensity} floatIntensity={0.5 * intensity}>
          {preset === 'laptop' && <LaptopScene accentColor={accentColor} intensity={intensity} />}
          {preset === 'geometry' && <GeometryScene accentColor={accentColor} intensity={intensity} />}
          {preset === 'particles' && (
            <group scale={1.3}>
              <mesh>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial color={accentColor} wireframe emissive={accentColor} emissiveIntensity={0.4} />
              </mesh>
            </group>
          )}
          {preset === 'hologram' && (
            <HologramScene
              imageUrl={imageUrl || fallbackImage}
              accentColor={accentColor}
              intensity={intensity}
            />
          )}
        </Float>

        {particles && (
          <OrbitingParticles count={70} accentColor={accentColor} intensity={intensity} />
        )}
      </Canvas>
    </div>
  );
}
