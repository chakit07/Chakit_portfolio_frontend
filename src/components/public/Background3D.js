'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 3D Background Animation Engine
 * Features 5 distinct WebGL presets, each specially tuned for high contrast,
 * vivid beauty, and fluid motion in BOTH Dark Mode and Light Mode.
 */
export default function Background3D({
  preset = 'constellation',
  theme = 'dark',
  accentColor = '#3b82f6',
  speed = 1.0
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 28;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
    } catch {
      return; // WebGL not supported
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    // Set background color for renderer: deep midnight in dark mode, pristine soft pearl in light mode
    renderer.setClearColor(isDark ? 0x030712 : 0xf8fafc, 1);

    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.pointerEvents = 'none';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    let animationFrameId;
    const clock = new THREE.Clock();

    // Mouse tracking for parallax tilt
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // PRESET 1: CONSTELLATION (3D Neural Galaxy & Connected Starfield)
    // =========================================================================
    const initConstellation = () => {
      const group = new THREE.Group();
      scene.add(group);

      const PARTICLE_COUNT = 140;
      const MAX_DISTANCE = 9.0;
      const BOUNDS = { x: 38, y: 24, z: 20 };

      const particlesData = [];
      const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
      const particleColors = new Float32Array(PARTICLE_COUNT * 3);

      // Dark mode: luminous electric neon stars
      const darkPalette = [
        new THREE.Color('#38bdf8'), // cyan
        new THREE.Color('#818cf8'), // indigo
        new THREE.Color('#c084fc'), // purple
        new THREE.Color('#34d399')  // emerald
      ];

      // Light mode: rich, high-contrast, bold jewel nodes
      const lightPalette = [
        new THREE.Color('#1d4ed8'), // royal blue
        new THREE.Color('#4338ca'), // deep indigo
        new THREE.Color('#7c3aed'), // purple
        new THREE.Color('#0284c7')  // dark sky
      ];

      const palette = isDark ? darkPalette : lightPalette;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = (Math.random() - 0.5) * BOUNDS.x * 2;
        const y = (Math.random() - 0.5) * BOUNDS.y * 2;
        const z = (Math.random() - 0.5) * BOUNDS.z * 2;

        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;

        const color = palette[Math.floor(Math.random() * palette.length)];
        particleColors[i * 3] = color.r;
        particleColors[i * 3 + 1] = color.g;
        particleColors[i * 3 + 2] = color.b;

        particlesData.push({
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.045 * speed,
            (Math.random() - 0.5) * 0.045 * speed,
            (Math.random() - 0.5) * 0.035 * speed
          ),
          baseColor: color
        });
      }

      // Point Cloud
      const pointGeo = new THREE.BufferGeometry();
      pointGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      pointGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

      // Crisp circular disc texture
      const createParticleTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
        gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
      };

      const pointMat = new THREE.PointsMaterial({
        size: isDark ? 1.6 : 2.2, // larger and bolder in light mode for great contrast
        vertexColors: true,
        map: createParticleTexture(),
        transparent: true,
        opacity: isDark ? 0.9 : 0.85,
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: false
      });

      const points = new THREE.Points(pointGeo, pointMat);
      group.add(points);

      // Connecting Lines
      const MAX_LINES = PARTICLE_COUNT * 6;
      const linePositions = new Float32Array(MAX_LINES * 6);
      const lineColors = new Float32Array(MAX_LINES * 6);

      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
      lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: isDark ? 0.5 : 0.4,
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: false
      });

      const lines = new THREE.LineSegments(lineGeo, lineMat);
      group.add(lines);

      return {
        update: (time) => {
          let lineVertexIndex = 0;
          let colorVertexIndex = 0;
          let connectionCount = 0;

          const positions = pointGeo.attributes.position.array;

          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const data = particlesData[i];

            positions[i * 3] += data.velocity.x;
            positions[i * 3 + 1] += data.velocity.y;
            positions[i * 3 + 2] += data.velocity.z;

            // Bounce within bounds
            if (positions[i * 3] < -BOUNDS.x || positions[i * 3] > BOUNDS.x) data.velocity.x *= -1;
            if (positions[i * 3 + 1] < -BOUNDS.y || positions[i * 3 + 1] > BOUNDS.y) data.velocity.y *= -1;
            if (positions[i * 3 + 2] < -BOUNDS.z || positions[i * 3 + 2] > BOUNDS.z) data.velocity.z *= -1;

            // Connect nearby points
            for (let j = i + 1; j < PARTICLE_COUNT; j++) {
              const dx = positions[i * 3] - positions[j * 3];
              const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
              const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

              if (dist < MAX_DISTANCE && connectionCount < MAX_LINES) {
                const alpha = Math.max(0, 1 - dist / MAX_DISTANCE);

                linePositions[lineVertexIndex++] = positions[i * 3];
                linePositions[lineVertexIndex++] = positions[i * 3 + 1];
                linePositions[lineVertexIndex++] = positions[i * 3 + 2];

                linePositions[lineVertexIndex++] = positions[j * 3];
                linePositions[lineVertexIndex++] = positions[j * 3 + 1];
                linePositions[lineVertexIndex++] = positions[j * 3 + 2];

                // Factor alpha for smooth fade
                const cR = particleColors[i * 3] * (isDark ? alpha : 1);
                const cG = particleColors[i * 3 + 1] * (isDark ? alpha : 1);
                const cB = particleColors[i * 3 + 2] * (isDark ? alpha : 1);

                lineColors[colorVertexIndex++] = cR;
                lineColors[colorVertexIndex++] = cG;
                lineColors[colorVertexIndex++] = cB;

                lineColors[colorVertexIndex++] = cR;
                lineColors[colorVertexIndex++] = cG;
                lineColors[colorVertexIndex++] = cB;

                connectionCount++;
              }
            }
          }

          pointGeo.attributes.position.needsUpdate = true;
          lineGeo.setDrawRange(0, connectionCount * 2);
          lineGeo.attributes.position.needsUpdate = true;
          lineGeo.attributes.color.needsUpdate = true;

          group.rotation.y = time * 0.02 * speed;
        },
        destroy: () => {
          scene.remove(group);
          pointGeo.dispose();
          pointMat.dispose();
          lineGeo.dispose();
          lineMat.dispose();
        }
      };
    };

    // =========================================================================
    // PRESET 2: CYBER WAVES (3D Synthwave Mesh / Terrain Grid)
    // =========================================================================
    const initCyberWaves = () => {
      const group = new THREE.Group();
      scene.add(group);

      const WIDTH = 68;
      const DEPTH = 52;
      const SEG_X = 55;
      const SEG_Y = 42;

      const geometry = new THREE.PlaneGeometry(WIDTH, DEPTH, SEG_X, SEG_Y);
      geometry.rotateX(-Math.PI / 2.3);
      group.position.set(0, -6, 0);

      const origPositions = Float32Array.from(geometry.attributes.position.array);

      const wireframeMat = new THREE.MeshBasicMaterial({
        color: isDark ? new THREE.Color('#38bdf8') : new THREE.Color('#2563eb'),
        wireframe: true,
        transparent: true,
        opacity: isDark ? 0.55 : 0.65 // bold, crisp lines in light mode
      });

      const plane = new THREE.Mesh(geometry, wireframeMat);
      group.add(plane);

      // Glowing horizon accent line
      const horizonGeo = new THREE.PlaneGeometry(WIDTH * 1.2, 0.5);
      const horizonMat = new THREE.MeshBasicMaterial({
        color: isDark ? new THREE.Color('#818cf8') : new THREE.Color('#1d4ed8'),
        transparent: true,
        opacity: isDark ? 0.7 : 0.6
      });
      const horizonLine = new THREE.Mesh(horizonGeo, horizonMat);
      horizonLine.position.set(0, 1.2, -22);
      group.add(horizonLine);

      // Ambient Fog for gentle horizon fade
      scene.fog = new THREE.FogExp2(isDark ? 0x030712 : 0xf8fafc, 0.016);

      return {
        update: (time) => {
          const pos = geometry.attributes.position.array;
          const count = geometry.attributes.position.count;
          const t = time * 1.3 * speed;

          for (let i = 0; i < count; i++) {
            const ox = origPositions[i * 3];
            const oz = origPositions[i * 3 + 2];

            const wave1 = Math.sin(ox * 0.18 + t * 0.8) * Math.cos(oz * 0.15 + t * 0.5) * 2.4;
            const wave2 = Math.sin((ox + oz) * 0.1 + t) * 1.3;
            const wave3 = Math.cos(ox * 0.08 - t * 0.4) * 0.8;

            pos[i * 3 + 1] = origPositions[i * 3 + 1] + wave1 + wave2 + wave3;
          }

          geometry.attributes.position.needsUpdate = true;
          group.rotation.z = Math.sin(time * 0.25) * 0.025;
        },
        destroy: () => {
          scene.remove(group);
          scene.fog = null;
          geometry.dispose();
          wireframeMat.dispose();
          horizonGeo.dispose();
          horizonMat.dispose();
        }
      };
    };

    // =========================================================================
    // PRESET 3: PRISM CRYSTALS (3D Floating Geometric Polyhedra)
    // =========================================================================
    const initPrismCrystals = () => {
      const group = new THREE.Group();
      scene.add(group);

      const crystals = [];
      const geometries = [
        new THREE.IcosahedronGeometry(1.5, 0),
        new THREE.OctahedronGeometry(1.7, 0),
        new THREE.TetrahedronGeometry(1.6, 0),
        new THREE.DodecahedronGeometry(1.4, 0)
      ];

      // Lights for 3D facets
      const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.4);
      group.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(isDark ? 0x38bdf8 : 0x2563eb, isDark ? 2.5 : 2.0);
      dirLight1.position.set(10, 15, 10);
      group.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(isDark ? 0xa855f7 : 0x7c3aed, isDark ? 2.0 : 1.6);
      dirLight2.position.set(-10, -10, -5);
      group.add(dirLight2);

      const CRYSTAL_COUNT = 18;
      const jewelColorsLight = [
        0x3b82f6, // sapphire
        0x8b5cf6, // amethyst
        0x10b981, // emerald
        0xf43f5e, // ruby
        0x0ea5e9, // cyan
        0x6366f1  // indigo
      ];

      for (let i = 0; i < CRYSTAL_COUNT; i++) {
        const geo = geometries[i % geometries.length];

        const faceColor = isDark
          ? (i % 2 === 0 ? 0x0f172a : 0x1e1b4b)
          : jewelColorsLight[i % jewelColorsLight.length];

        const mat = new THREE.MeshStandardMaterial({
          color: faceColor,
          roughness: 0.15,
          metalness: isDark ? 0.8 : 0.35,
          transparent: true,
          opacity: isDark ? 0.8 : 0.7 // rich translucent jewel look in light mode
        });

        const mesh = new THREE.Mesh(geo, mat);

        // Bold wireframe facets
        const wireGeo = new THREE.WireframeGeometry(geo);
        const wireColor = isDark
          ? (i % 2 === 0 ? 0x38bdf8 : 0xc084fc)
          : (i % 2 === 0 ? 0x1d4ed8 : 0x6d28d9);

        const wireMat = new THREE.LineBasicMaterial({
          color: wireColor,
          transparent: true,
          opacity: isDark ? 0.8 : 0.85
        });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        mesh.add(wire);

        mesh.position.set(
          (Math.random() - 0.5) * 44,
          (Math.random() - 0.5) * 26,
          (Math.random() - 0.5) * 18
        );

        const scale = 0.65 + Math.random() * 0.9;
        mesh.scale.set(scale, scale, scale);

        group.add(mesh);

        crystals.push({
          mesh,
          rotX: (Math.random() - 0.5) * 0.018 * speed,
          rotY: (Math.random() - 0.5) * 0.024 * speed,
          rotZ: (Math.random() - 0.5) * 0.018 * speed,
          baseY: mesh.position.y,
          floatSpeed: (0.4 + Math.random() * 0.6) * speed,
          floatAmp: 0.8 + Math.random() * 1.2
        });
      }

      return {
        update: (time) => {
          crystals.forEach((c) => {
            c.mesh.rotation.x += c.rotX;
            c.mesh.rotation.y += c.rotY;
            c.mesh.rotation.z += c.rotZ;
            c.mesh.position.y = c.baseY + Math.sin(time * c.floatSpeed) * c.floatAmp;
          });
        },
        destroy: () => {
          scene.remove(group);
          geometries.forEach((g) => g.dispose());
        }
      };
    };

    // =========================================================================
    // PRESET 4: ENERGY HELIX (3D Dual Spiral Vortex)
    // =========================================================================
    const initEnergyHelix = () => {
      const group = new THREE.Group();
      scene.add(group);

      const STRAND_POINTS = 220;
      const RADIUS = 8.0;
      const HEIGHT = 44;
      const TURNS = 4.5;

      const createStrand = (offsetPhase, colorHex) => {
        const positions = new Float32Array(STRAND_POINTS * 3);
        const colors = new Float32Array(STRAND_POINTS * 3);
        const baseColor = new THREE.Color(colorHex);

        for (let i = 0; i < STRAND_POINTS; i++) {
          const t = (i / STRAND_POINTS) * Math.PI * 2 * TURNS + offsetPhase;
          const y = (i / STRAND_POINTS - 0.5) * HEIGHT;
          const r = RADIUS + Math.sin(i * 0.1) * 0.9;

          positions[i * 3] = Math.cos(t) * r;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = Math.sin(t) * r;

          colors[i * 3] = baseColor.r;
          colors[i * 3 + 1] = baseColor.g;
          colors[i * 3 + 2] = baseColor.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
          size: isDark ? 1.8 : 2.4,
          vertexColors: true,
          transparent: true,
          opacity: isDark ? 0.9 : 0.85,
          blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
          depthWrite: false
        });

        const points = new THREE.Points(geo, mat);
        group.add(points);

        // Ribbon curve
        const lineMat = new THREE.LineBasicMaterial({
          color: baseColor,
          transparent: true,
          opacity: isDark ? 0.5 : 0.55,
          blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending
        });
        const line = new THREE.Line(geo, lineMat);
        group.add(line);

        return { points, line, geo, mat, lineMat, offsetPhase };
      };

      const strand1 = createStrand(0, isDark ? '#38bdf8' : '#1d4ed8');
      const strand2 = createStrand(Math.PI, isDark ? '#c084fc' : '#7c3aed');

      // Core revolving ring
      const ringGeo = new THREE.TorusGeometry(RADIUS * 1.35, 0.08, 16, 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isDark ? 0x818cf8 : 0x2563eb,
        transparent: true,
        opacity: isDark ? 0.5 : 0.45
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      group.rotation.z = 0.25;

      return {
        update: (time) => {
          group.rotation.y = time * 0.45 * speed;
          ring.rotation.z = -time * 0.25 * speed;
        },
        destroy: () => {
          scene.remove(group);
          strand1.geo.dispose();
          strand1.mat.dispose();
          strand1.lineMat.dispose();
          strand2.geo.dispose();
          strand2.mat.dispose();
          strand2.lineMat.dispose();
          ringGeo.dispose();
          ringMat.dispose();
        }
      };
    };

    // =========================================================================
    // PRESET 5: FLOATING ORBS (3D Ambient Spheres)
    // =========================================================================
    const initFloatingOrbs = () => {
      const group = new THREE.Group();
      scene.add(group);

      const orbs = [];
      const ORB_COUNT = 9;

      const darkOrbColors = [
        0x38bdf8, 0x6366f1, 0xa855f7, 0xec4899, 0x10b981
      ];
      const lightOrbColors = [
        0x3b82f6, 0x6366f1, 0x8b5cf6, 0xec4899, 0x059669
      ];

      const colors = isDark ? darkOrbColors : lightOrbColors;

      const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.0 : 1.5);
      group.add(ambientLight);

      const pointLight = new THREE.PointLight(isDark ? 0x6366f1 : 0x2563eb, isDark ? 3.0 : 2.5, 80);
      pointLight.position.set(0, 5, 10);
      group.add(pointLight);

      for (let i = 0; i < ORB_COUNT; i++) {
        const radius = 2.0 + Math.random() * 2.8;
        const geo = new THREE.SphereGeometry(radius, 32, 32);

        const color = colors[i % colors.length];
        const mat = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: isDark ? 0.35 : 0.25,
          roughness: 0.15,
          metalness: isDark ? 0.6 : 0.35,
          transparent: true,
          opacity: isDark ? 0.65 : 0.7 // fully visible, soft glossy globes
        });

        const mesh = new THREE.Mesh(geo, mat);

        const initialX = (Math.random() - 0.5) * 36;
        const initialY = (Math.random() - 0.5) * 22;
        const initialZ = (Math.random() - 0.5) * 16 - 2;

        mesh.position.set(initialX, initialY, initialZ);
        group.add(mesh);

        orbs.push({
          mesh,
          geo,
          mat,
          initialX,
          initialY,
          initialZ,
          freqX: 0.3 + Math.random() * 0.4,
          freqY: 0.3 + Math.random() * 0.4,
          ampX: 2.5 + Math.random() * 3.5,
          ampY: 2.0 + Math.random() * 3.0,
          phase: Math.random() * Math.PI * 2
        });
      }

      return {
        update: (time) => {
          const t = time * speed;
          orbs.forEach((orb) => {
            orb.mesh.position.x = orb.initialX + Math.sin(t * orb.freqX + orb.phase) * orb.ampX;
            orb.mesh.position.y = orb.initialY + Math.cos(t * orb.freqY + orb.phase) * orb.ampY;
            const pulse = 1 + Math.sin(t * 0.8 + orb.phase) * 0.08;
            orb.mesh.scale.set(pulse, pulse, pulse);
          });
        },
        destroy: () => {
          scene.remove(group);
          orbs.forEach((orb) => {
            orb.geo.dispose();
            orb.mat.dispose();
          });
        }
      };
    };

    // Instantiate chosen preset
    let activeScene;
    switch (preset) {
      case 'cyber-waves':
        activeScene = initCyberWaves();
        break;
      case 'prism-crystals':
        activeScene = initPrismCrystals();
        break;
      case 'energy-helix':
        activeScene = initEnergyHelix();
        break;
      case 'floating-orbs':
        activeScene = initFloatingOrbs();
        break;
      case 'constellation':
      default:
        activeScene = initConstellation();
        break;
    }

    // Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth mouse parallax interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      camera.position.x = mouse.x * 2.5;
      camera.position.y = mouse.y * 2.5;
      camera.lookAt(0, 0, 0);

      const elapsedTime = clock.getElapsedTime();
      if (activeScene && activeScene.update) {
        activeScene.update(elapsedTime);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup when preset or theme changes
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      if (activeScene && activeScene.destroy) {
        activeScene.destroy();
      }

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [preset, theme, accentColor, speed]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    />
  );
}
